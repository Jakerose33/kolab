-- PHASE 1: Critical Data Exposure Fixes

-- 1. Secure the users table - drop overly permissive policies and create restrictive ones
DROP POLICY IF EXISTS "users_restrictive_access_control" ON public.users;
DROP POLICY IF EXISTS "users_service_admin_operations" ON public.users;

-- Create more restrictive policies for users table
CREATE POLICY "users_own_data_only" ON public.users
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin-only access for user management with strict conditions
CREATE POLICY "users_admin_read_only" ON public.users
  FOR SELECT
  USING (
    current_user_has_role('admin') AND
    current_setting('app.admin_context', true) = 'user_management'
  );

-- 2. Tighten payment_methods security - add additional validation
DROP POLICY IF EXISTS "payment_methods_admin_audit_read" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_system_cleanup" ON public.payment_methods;

-- Create stricter payment method policies
CREATE POLICY "payment_methods_strict_owner_only" ON public.payment_methods
  FOR ALL
  USING (
    auth.uid() = user_id AND 
    user_id IS NOT NULL AND 
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid() = user_id AND 
    user_id IS NOT NULL AND 
    auth.uid() IS NOT NULL AND
    stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$'
  );

-- 3. Secure messages table - ensure only participants can access
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own sent messages" ON public.messages;

CREATE POLICY "messages_participants_only_read" ON public.messages
  FOR SELECT
  USING (
    (auth.uid() = sender_id OR auth.uid() = recipient_id) AND
    NOT public.is_user_blocked(sender_id, recipient_id) AND
    NOT public.is_user_suspended(sender_id) AND
    NOT public.is_user_suspended(recipient_id)
  );

CREATE POLICY "messages_sender_update_only" ON public.messages
  FOR UPDATE
  USING (
    auth.uid() = sender_id AND
    NOT public.is_user_suspended(auth.uid())
  );

-- 4. Secure financial data tables
DROP POLICY IF EXISTS "System can manage orders" ON public.orders;

CREATE POLICY "orders_owner_read_only" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders_system_insert_only" ON public.orders
  FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'service_role' AND
    current_setting('app.payment_context', true) = 'checkout_session'
  );

CREATE POLICY "orders_system_update_payment" ON public.orders
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') = 'service_role' AND
    current_setting('app.payment_context', true) = 'payment_verification'
  );

-- 5. Secure venue payouts
DROP POLICY IF EXISTS "System can manage venue payouts" ON public.venue_payouts;

CREATE POLICY "venue_payouts_owner_read" ON public.venue_payouts
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "venue_payouts_system_manage" ON public.venue_payouts
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'service_role' AND
    current_setting('app.payout_context', true) = 'automated_payout'
  );

-- 6. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.has_role(check_user_id uuid, check_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = check_role
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_role(check_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), check_role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(check_user_id, 'admin') OR public.has_role(check_user_id, 'moderator');
$$;

-- 7. Add enhanced audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_action_type text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_data_type text DEFAULT 'standard'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all sensitive data access with enhanced metadata
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
    'SENSITIVE_ACCESS_' || p_action_type,
    p_table_name,
    p_record_id,
    jsonb_build_object(
      'data_type', p_data_type,
      'timestamp', now(),
      'session_id', (auth.jwt() ->> 'session_id'),
      'access_level', 'sensitive'
    ),
    (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet,
    current_setting('request.headers', true)::json->>'user-agent',
    now()
  );
END;
$$;

-- 8. Create function to prevent role self-elevation
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from assigning roles to themselves
  IF NEW.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot assign roles to themselves';
  END IF;
  
  -- Only admins can assign admin roles
  IF NEW.role = 'admin' AND NOT public.current_user_has_role('admin') THEN
    RAISE EXCEPTION 'Only admins can assign admin roles';
  END IF;
  
  -- Only admins or moderators can assign moderator roles
  IF NEW.role = 'moderator' AND NOT public.is_admin_or_moderator() THEN
    RAISE EXCEPTION 'Only admins or moderators can assign moderator roles';
  END IF;
  
  -- Log role assignment for audit
  PERFORM public.log_sensitive_data_access(
    'ROLE_ASSIGNMENT',
    'user_roles',
    NEW.id,
    'role_management'
  );
  
  RETURN NEW;
END;
$$;

-- Apply the validation trigger to user_roles
DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_role_assignment_trigger
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();

-- 9. Add data masking function for PII
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  p_data text,
  p_mask_type text DEFAULT 'partial'
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  CASE p_mask_type
    WHEN 'email' THEN
      RETURN CASE 
        WHEN p_data IS NULL THEN NULL
        WHEN length(p_data) < 3 THEN '***'
        ELSE substring(p_data from 1 for 2) || '***@' || split_part(p_data, '@', 2)
      END;
    WHEN 'partial' THEN
      RETURN CASE
        WHEN p_data IS NULL THEN NULL
        WHEN length(p_data) < 4 THEN '***'
        ELSE substring(p_data from 1 for 2) || '***' || substring(p_data from length(p_data) - 1)
      END;
    WHEN 'full' THEN
      RETURN '***REDACTED***';
    ELSE
      RETURN p_data;
  END CASE;
END;
$$;