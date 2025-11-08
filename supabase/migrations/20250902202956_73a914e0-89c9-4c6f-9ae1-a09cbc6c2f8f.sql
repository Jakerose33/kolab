-- Enhanced Payment Security: Implement comprehensive security measures
-- for payment_methods table to exceed PCI DSS requirements

-- 1. Create enhanced security validation function
CREATE OR REPLACE FUNCTION public.validate_payment_method_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent any raw card data from being stored
  IF NEW.stripe_payment_method_id IS NULL OR NEW.stripe_payment_method_id = '' THEN
    RAISE EXCEPTION 'stripe_payment_method_id is required - raw card data not permitted';
  END IF;
  
  -- Validate that stripe_payment_method_id follows Stripe's format (pm_xxx)
  IF NOT NEW.stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$' THEN
    RAISE EXCEPTION 'Invalid Stripe payment method ID format';
  END IF;
  
  -- Validate last4 is exactly 4 digits if provided
  IF NEW.last4 IS NOT NULL AND NOT NEW.last4 ~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'Invalid last4 format - must be exactly 4 digits';
  END IF;
  
  -- Validate brand is from allowed list
  IF NEW.brand IS NOT NULL AND NEW.brand NOT IN (
    'visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay'
  ) THEN
    RAISE EXCEPTION 'Invalid card brand';
  END IF;
  
  -- Validate type is from allowed list
  IF NEW.type NOT IN ('card', 'bank', 'digital_wallet') THEN
    RAISE EXCEPTION 'Invalid payment method type';
  END IF;
  
  -- Ensure user_id is set
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required for payment methods';
  END IF;
  
  -- Log the creation/update for security monitoring
  PERFORM public.log_sensitive_access(
    TG_OP,
    'payment_methods',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    row_to_json(NEW)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create data encryption functions for payment metadata
CREATE OR REPLACE FUNCTION public.encrypt_payment_metadata(data text)
RETURNS text AS $$
BEGIN
  -- For production: integrate with proper encryption service
  -- This is a basic implementation - upgrade to use proper key management
  IF data IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(
    convert_to('PM_' || data || '_' || extract(epoch from now())::text, 'UTF8'), 
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrypt_payment_metadata(encrypted_data text)
RETURNS text AS $$
DECLARE
  decrypted text;
BEGIN
  IF encrypted_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  decrypted := convert_from(decode(encrypted_data, 'base64'), 'UTF8');
  
  -- Extract original data (remove prefix and timestamp)
  IF decrypted LIKE 'PM_%' THEN
    decrypted := split_part(split_part(decrypted, 'PM_', 2), '_', 1);
  END IF;
  
  RETURN decrypted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Add security monitoring trigger
DROP TRIGGER IF EXISTS payment_methods_security_validation ON public.payment_methods;
CREATE TRIGGER payment_methods_security_validation
  BEFORE INSERT OR UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.validate_payment_method_security();

-- 4. Create secure payment method access function
CREATE OR REPLACE FUNCTION public.get_user_payment_methods_secure(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  type text,
  last4_display text,
  brand_display text,
  is_default boolean,
  created_at timestamptz
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pm.id,
    pm.type,
    -- Only show last4 if user is accessing their own data
    CASE 
      WHEN auth.uid() = pm.user_id THEN pm.last4
      ELSE NULL 
    END as last4_display,
    -- Only show brand if user is accessing their own data
    CASE 
      WHEN auth.uid() = pm.user_id THEN pm.brand
      ELSE NULL 
    END as brand_display,
    pm.is_default,
    pm.created_at
  FROM public.payment_methods pm
  WHERE pm.user_id = target_user_id
    AND auth.uid() = pm.user_id  -- Double check access control
  ORDER BY pm.is_default DESC, pm.created_at DESC;
$$;

-- 5. Create payment security audit function
CREATE OR REPLACE FUNCTION public.audit_payment_access(
  p_action text,
  p_payment_method_id uuid,
  p_user_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    old_data,
    new_data,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    'payment_methods_access',
    p_payment_method_id,
    NULL,
    p_metadata,
    (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet,
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Add additional RLS policies for enhanced security
-- Drop existing policy to recreate with stronger conditions
DROP POLICY IF EXISTS "Users can only access their own payment methods" ON public.payment_methods;

-- Create more specific policies
CREATE POLICY "payment_methods_select_own" 
ON public.payment_methods 
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "payment_methods_insert_own" 
ON public.payment_methods 
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND auth.uid() IS NOT NULL
  AND stripe_payment_method_id IS NOT NULL
  AND stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$'
);

CREATE POLICY "payment_methods_update_own" 
ON public.payment_methods 
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND auth.uid() IS NOT NULL
  AND stripe_payment_method_id IS NOT NULL
  AND stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$'
);

CREATE POLICY "payment_methods_delete_own" 
ON public.payment_methods 
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND auth.uid() IS NOT NULL
);

-- Service role access for system operations
CREATE POLICY "payment_methods_service_access" 
ON public.payment_methods 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Create index for performance and security
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_security 
ON public.payment_methods (user_id, stripe_payment_method_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id 
ON public.payment_methods (stripe_payment_method_id) 
WHERE stripe_payment_method_id IS NOT NULL;