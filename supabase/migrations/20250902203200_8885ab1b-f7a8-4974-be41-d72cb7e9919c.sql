-- Fix overly permissive service role policies identified in security scan

-- 1. Replace overly permissive payment_methods service role policy
DROP POLICY IF EXISTS "payment_methods_service_access" ON public.payment_methods;

CREATE POLICY "payment_methods_service_operations" 
ON public.payment_methods 
FOR ALL
TO service_role
USING (
  -- Only allow service role for legitimate payment operations
  current_setting('app.current_operation', true) IN (
    'payment_processing', 'webhook_handling', 'admin_audit', 'system_cleanup'
  )
)
WITH CHECK (
  -- Service role can only insert/update with valid Stripe tokens
  stripe_payment_method_id IS NOT NULL 
  AND stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$'
  AND user_id IS NOT NULL
);

-- 2. Replace overly permissive users service role policy  
DROP POLICY IF EXISTS "users_service_role_access" ON public.users;

CREATE POLICY "users_service_admin_operations" 
ON public.users 
FOR ALL
TO service_role
USING (
  -- Only allow service role for specific admin operations
  current_setting('app.current_operation', true) IN (
    'user_cleanup', 'audit_processing', 'data_migration', 'compliance_check'
  )
)
WITH CHECK (
  -- Service role can only modify users under specific conditions
  current_setting('app.current_operation', true) IN (
    'user_cleanup', 'audit_processing', 'data_migration', 'compliance_check'
  )
);

-- 3. Create secure payment method validation with additional constraints
CREATE OR REPLACE FUNCTION public.validate_payment_method_data(
  p_stripe_payment_method_id text,
  p_user_id uuid,
  p_last4 text DEFAULT NULL,
  p_brand text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  -- Validate Stripe token format
  IF p_stripe_payment_method_id IS NULL OR 
     NOT p_stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$' THEN
    RETURN false;
  END IF;
  
  -- Validate user ID exists and matches current user
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RETURN false;
  END IF;
  
  -- Validate last4 format if provided
  IF p_last4 IS NOT NULL AND NOT p_last4 ~ '^[0-9]{4}$' THEN
    RETURN false;
  END IF;
  
  -- Validate brand if provided
  IF p_brand IS NOT NULL AND p_brand NOT IN (
    'visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay'
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create restricted data access function for payment methods
CREATE OR REPLACE FUNCTION public.get_payment_method_display_only(
  p_payment_method_id uuid
)
RETURNS TABLE(
  id uuid,
  type text,
  last4_masked text,
  brand_display text,
  is_default boolean
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pm.id,
    pm.type,
    -- Always mask last4 for additional security
    CASE 
      WHEN pm.last4 IS NOT NULL THEN '••' || right(pm.last4, 2)
      ELSE '••••'
    END as last4_masked,
    COALESCE(pm.brand, 'Card') as brand_display,
    pm.is_default
  FROM public.payment_methods pm
  WHERE pm.id = p_payment_method_id
    AND pm.user_id = auth.uid()  -- Ensure user owns this payment method
  LIMIT 1;
$$;

-- 5. Create secure audit function for payment operations
CREATE OR REPLACE FUNCTION public.secure_payment_audit(
  p_operation text,
  p_user_id uuid,
  p_payment_method_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  -- Only allow auditing for authenticated users and their own operations
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized audit attempt';
  END IF;
  
  -- Log the secure audit entry
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_data,
    created_at
  ) VALUES (
    p_user_id,
    'SECURE_PAYMENT_' || p_operation,
    'payment_security',
    p_payment_method_id,
    jsonb_build_object(
      'operation', p_operation,
      'timestamp', now(),
      'ip_hash', md5((current_setting('request.headers', true)::json->>'x-forwarded-for')::text),
      'details', p_details
    ),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Add constraint to prevent duplicate default payment methods per user
ALTER TABLE public.payment_methods 
ADD CONSTRAINT unique_default_per_user 
UNIQUE (user_id, is_default) DEFERRABLE INITIALLY DEFERRED;