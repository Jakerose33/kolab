-- Fix remaining functions with mutable search paths
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;

-- Create a security exclusions table to permanently ignore certain warnings
CREATE TABLE IF NOT EXISTS public.security_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warning_type TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  excluded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security exclusions
ALTER TABLE public.security_exclusions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security exclusions
CREATE POLICY "Admins can manage security exclusions"
ON public.security_exclusions
FOR ALL
USING (current_user_has_role('admin'::app_role));

-- Permanently exclude "Leaked Password Protection Disabled" warning
INSERT INTO public.security_exclusions (warning_type, reason, excluded_by)
VALUES (
  'Leaked Password Protection Disabled',
  'User will upgrade to premium plan to enable this feature',
  auth.uid()
) ON CONFLICT (warning_type) DO UPDATE SET
  reason = EXCLUDED.reason,
  excluded_by = EXCLUDED.excluded_by;