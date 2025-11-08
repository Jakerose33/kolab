-- Fix the SQL syntax error - cannot use AFTER SELECT trigger

-- Add security enhancement trigger for data access monitoring (excluding SELECT)
CREATE OR REPLACE FUNCTION public.secure_data_access_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive tables for monitoring (INSERT, UPDATE, DELETE only)
  IF TG_TABLE_NAME IN ('payment_methods', 'orders', 'venue_payouts', 'messages', 'user_roles') THEN
    PERFORM public.log_sensitive_data_access(
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      'automated_access_log'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply security logging triggers to sensitive tables (INSERT, UPDATE, DELETE only)
DROP TRIGGER IF EXISTS secure_payment_methods_log ON public.payment_methods;
CREATE TRIGGER secure_payment_methods_log
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.secure_data_access_log();

DROP TRIGGER IF EXISTS secure_orders_log ON public.orders;
CREATE TRIGGER secure_orders_log
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.secure_data_access_log();

DROP TRIGGER IF EXISTS secure_messages_log ON public.messages;
CREATE TRIGGER secure_messages_log
  AFTER INSERT OR UPDATE OR DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.secure_data_access_log();

-- Add security function to sanitize user inputs more aggressively
CREATE OR REPLACE FUNCTION public.deep_sanitize_user_input(
  p_input text,
  p_max_length integer DEFAULT 5000
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  sanitized_input text;
BEGIN
  IF p_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potentially dangerous content
  sanitized_input := p_input;
  
  -- Remove script tags and javascript
  sanitized_input := regexp_replace(sanitized_input, '<script[^>]*>.*?</script>', '', 'gi');
  sanitized_input := regexp_replace(sanitized_input, 'javascript:', '', 'gi');
  sanitized_input := regexp_replace(sanitized_input, 'on\w+\s*=', '', 'gi');
  
  -- Remove common SQL injection patterns
  sanitized_input := regexp_replace(sanitized_input, '(union|select|insert|update|delete|drop|create|alter|exec|execute)\s', '', 'gi');
  
  -- Remove dangerous HTML attributes
  sanitized_input := regexp_replace(sanitized_input, 'onclick|onload|onerror|onmouseover', '', 'gi');
  
  -- Limit length
  IF length(sanitized_input) > p_max_length THEN
    sanitized_input := substring(sanitized_input from 1 for p_max_length);
  END IF;
  
  RETURN trim(sanitized_input);
END;
$$;