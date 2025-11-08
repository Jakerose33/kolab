-- Create audit logging system
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.current_user_has_role('admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_action_type TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    auth.uid(),
    p_action_type,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet,
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;

-- Create data anonymization function
CREATE OR REPLACE FUNCTION public.anonymize_user_data(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  anon_email TEXT;
  anon_name TEXT;
BEGIN
  -- Generate anonymized identifiers
  anon_email := 'deleted_user_' || encode(gen_random_bytes(8), 'hex') || '@anonymous.local';
  anon_name := 'Deleted User ' || encode(gen_random_bytes(4), 'hex');
  
  -- Log the anonymization
  PERFORM public.log_sensitive_access(
    'anonymize_user_data',
    'profiles',
    target_user_id,
    (SELECT row_to_json(p) FROM profiles p WHERE p.user_id = target_user_id),
    json_build_object('anonymized', true)
  );
  
  -- Anonymize profile data
  UPDATE public.profiles
  SET
    full_name = anon_name,
    bio = NULL,
    location = NULL,
    website = NULL,
    linkedin_url = NULL,
    github_url = NULL,
    portfolio_url = NULL,
    avatar_url = NULL,
    skills = NULL,
    interests = NULL,
    mentor_bio = NULL,
    mentor_expertise = NULL
  WHERE user_id = target_user_id;
  
  -- Anonymize analytics events (remove PII)
  UPDATE public.analytics_events
  SET
    ip_address = NULL,
    user_agent = 'anonymized',
    event_properties = jsonb_strip_nulls(
      event_properties - 'email' - 'name' - 'user_id' - 'session_id'
    )
  WHERE user_id = target_user_id;
END;
$$;

-- Create encrypted storage helpers
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT, key_name TEXT DEFAULT 'default')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- In production, this would use a proper encryption service
  -- For now, we'll base64 encode with a simple transformation
  RETURN encode(convert_to('ENC:' || data || ':' || key_name, 'UTF8'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data TEXT, key_name TEXT DEFAULT 'default')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  decrypted TEXT;
BEGIN
  -- Decode and extract original data
  decrypted := convert_from(decode(encrypted_data, 'base64'), 'UTF8');
  
  -- Remove encryption prefix and key suffix
  IF decrypted LIKE 'ENC:%' THEN
    decrypted := split_part(split_part(decrypted, 'ENC:', 2), ':' || key_name, 1);
  END IF;
  
  RETURN decrypted;
END;
$$;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user ID
  action_type TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- System can manage rate limits
CREATE POLICY "System can manage rate limits"
ON public.rate_limits
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role');

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - '24 hours'::interval);
  
  -- Get current count in window
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND window_start > (now() - (p_window_minutes || ' minutes')::interval);
  
  -- Check if limit exceeded
  IF current_count >= p_limit THEN
    RETURN false;
  END IF;
  
  -- Record this request
  INSERT INTO public.rate_limits (identifier, action_type, request_count, window_start)
  VALUES (p_identifier, p_action_type, 1, now())
  ON CONFLICT (identifier, action_type) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    window_start = CASE 
      WHEN rate_limits.window_start < (now() - (p_window_minutes || ' minutes')::interval)
      THEN now()
      ELSE rate_limits.window_start
    END;
  
  RETURN true;
END;
$$;

-- Add unique constraint for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits (identifier, action_type);

-- Create trigger to audit sensitive table access
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only audit specific sensitive tables
  IF TG_TABLE_NAME IN ('profiles', 'venues', 'venue_bookings', 'orders', 'messages') THEN
    PERFORM public.log_sensitive_access(
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_venues_changes ON public.venues;
CREATE TRIGGER audit_venues_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_venue_bookings_changes ON public.venue_bookings;
CREATE TRIGGER audit_venue_bookings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.venue_bookings
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_orders_changes ON public.orders;
CREATE TRIGGER audit_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_messages_changes ON public.messages;
CREATE TRIGGER audit_messages_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();