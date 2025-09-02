-- Fix Payment Methods Security Issue
-- Remove overly broad service operations policy and implement secure alternatives

-- First, drop the problematic broad service operations policy
DROP POLICY IF EXISTS "payment_methods_service_operations" ON public.payment_methods;

-- Create specific, restricted policies for legitimate system operations

-- Policy for webhook processing (very restricted)
CREATE POLICY "payment_methods_webhook_processing" ON public.payment_methods
FOR UPDATE 
USING (
  (auth.jwt() ->> 'role')::text = 'service_role' AND
  current_setting('app.webhook_context', true) = 'stripe_webhook' AND
  stripe_payment_method_id IS NOT NULL
)
WITH CHECK (
  stripe_payment_method_id IS NOT NULL AND
  stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$' AND
  user_id IS NOT NULL
);

-- Policy for admin audit operations (read-only and very restricted)
CREATE POLICY "payment_methods_admin_audit_read" ON public.payment_methods
FOR SELECT 
USING (
  (auth.jwt() ->> 'role')::text = 'service_role' AND
  current_setting('app.admin_audit_context', true) = 'compliance_check' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Policy for system cleanup (DELETE only, very restricted)
CREATE POLICY "payment_methods_system_cleanup" ON public.payment_methods
FOR DELETE 
USING (
  (auth.jwt() ->> 'role')::text = 'service_role' AND
  current_setting('app.cleanup_context', true) = 'orphaned_payment_methods' AND
  -- Only allow deletion of payment methods for deleted users
  NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id)
);

-- Add additional security function to validate payment method ownership
CREATE OR REPLACE FUNCTION public.validate_payment_method_ownership(
  p_payment_method_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Ensure the payment method belongs to the specified user
  RETURN EXISTS (
    SELECT 1 FROM public.payment_methods 
    WHERE id = p_payment_method_id 
    AND user_id = p_user_id
    AND user_id = auth.uid()  -- Double check current user
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enhanced audit function for payment method access
CREATE OR REPLACE FUNCTION public.audit_payment_method_access(
  p_operation TEXT,
  p_payment_method_id UUID,
  p_context JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  -- Only allow auditing for authenticated users accessing their own data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized audit attempt - no authenticated user';
  END IF;

  -- Log the access
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_data,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    'PAYMENT_METHOD_' || p_operation,
    'payment_methods',
    p_payment_method_id,
    jsonb_build_object(
      'operation', p_operation,
      'timestamp', now(),
      'context', p_context,
      'security_validated', true
    ),
    (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet,
    current_setting('request.headers', true)::json->>'user-agent',
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create secure function to get payment methods with proper access control
CREATE OR REPLACE FUNCTION public.get_user_payment_methods_secure_v2(
  target_user_id UUID DEFAULT auth.uid()
) RETURNS TABLE(
  id UUID,
  type TEXT,
  last4_masked TEXT,
  brand_display TEXT,
  is_default BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Ensure user can only access their own payment methods
  IF target_user_id IS NULL OR target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied - can only view own payment methods';
  END IF;

  -- Audit the access
  PERFORM public.audit_payment_method_access(
    'SECURE_VIEW',
    NULL,
    jsonb_build_object('user_id', target_user_id)
  );

  RETURN QUERY
  SELECT 
    pm.id,
    pm.type,
    -- Always mask the last4 for additional security
    CASE 
      WHEN pm.last4 IS NOT NULL THEN '••' || right(pm.last4, 2)
      ELSE '••••'
    END as last4_masked,
    COALESCE(pm.brand, 'Card') as brand_display,
    pm.is_default,
    pm.created_at
  FROM public.payment_methods pm
  WHERE pm.user_id = target_user_id
  ORDER BY pm.is_default DESC, pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add constraint to prevent duplicate default payment methods per user
ALTER TABLE public.payment_methods 
ADD CONSTRAINT unique_default_per_user 
EXCLUDE (user_id WITH =) WHERE (is_default = true);

-- Create index for better performance and security
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_security 
ON public.payment_methods (user_id, stripe_payment_method_id) 
WHERE user_id IS NOT NULL;

-- Add trigger to automatically audit payment method operations
CREATE OR REPLACE FUNCTION public.payment_methods_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Audit all operations on payment methods
  IF TG_OP = 'INSERT' THEN
    PERFORM public.audit_payment_method_access(
      'INSERT',
      NEW.id,
      jsonb_build_object('stripe_pm_id', NEW.stripe_payment_method_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.audit_payment_method_access(
      'UPDATE',
      NEW.id,
      jsonb_build_object(
        'old_default', OLD.is_default,
        'new_default', NEW.is_default
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.audit_payment_method_access(
      'DELETE',
      OLD.id,
      jsonb_build_object('stripe_pm_id', OLD.stripe_payment_method_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the audit trigger
DROP TRIGGER IF EXISTS payment_methods_audit_trigger ON public.payment_methods;
CREATE TRIGGER payment_methods_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.payment_methods_audit_trigger();

-- Add additional security validation to existing policies
-- Update the select policy to be more restrictive
DROP POLICY IF EXISTS "payment_methods_select_own" ON public.payment_methods;
CREATE POLICY "payment_methods_select_own" ON public.payment_methods
FOR SELECT 
USING (
  auth.uid() = user_id AND 
  user_id IS NOT NULL AND 
  auth.uid() IS NOT NULL AND
  -- Additional validation: ensure Stripe token format
  stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$'
);

-- Update insert policy to be more restrictive  
DROP POLICY IF EXISTS "payment_methods_insert_own" ON public.payment_methods;
CREATE POLICY "payment_methods_insert_own" ON public.payment_methods
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  user_id IS NOT NULL AND 
  auth.uid() IS NOT NULL AND
  stripe_payment_method_id IS NOT NULL AND
  stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$' AND
  type IN ('card', 'bank', 'digital_wallet') AND
  -- Ensure last4 is properly formatted if provided
  (last4 IS NULL OR last4 ~ '^[0-9]{4}$') AND
  -- Ensure brand is from allowed list if provided
  (brand IS NULL OR brand IN ('visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay'))
);

-- Update update policy to be more restrictive
DROP POLICY IF EXISTS "payment_methods_update_own" ON public.payment_methods;
CREATE POLICY "payment_methods_update_own" ON public.payment_methods
FOR UPDATE 
USING (
  auth.uid() = user_id AND 
  user_id IS NOT NULL AND 
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id AND 
  user_id IS NOT NULL AND 
  auth.uid() IS NOT NULL AND
  stripe_payment_method_id IS NOT NULL AND
  stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$' AND
  type IN ('card', 'bank', 'digital_wallet') AND
  (last4 IS NULL OR last4 ~ '^[0-9]{4}$') AND
  (brand IS NULL OR brand IN ('visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay'))
);

-- Update delete policy to be more restrictive
DROP POLICY IF EXISTS "payment_methods_delete_own" ON public.payment_methods;
CREATE POLICY "payment_methods_delete_own" ON public.payment_methods
FOR DELETE 
USING (
  auth.uid() = user_id AND 
  user_id IS NOT NULL AND 
  auth.uid() IS NOT NULL AND
  -- Don't allow deletion of default payment method unless it's the only one
  (NOT is_default OR (
    SELECT COUNT(*) FROM public.payment_methods 
    WHERE user_id = auth.uid()
  ) = 1)
);