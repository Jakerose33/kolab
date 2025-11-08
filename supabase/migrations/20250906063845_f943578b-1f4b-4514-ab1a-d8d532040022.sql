-- Fix Function Search Path Mutable by updating all functions to have SET search_path
-- This addresses Warning 1: Function Search Path Mutable

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, handle)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'handle', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$;

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.create_activity_entry(p_user_id uuid, p_actor_id uuid, p_action_type text, p_target_type text, p_target_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activity_feed (
    user_id, actor_id, action_type, target_type, target_id, metadata
  ) VALUES (
    p_user_id, p_actor_id, p_action_type, p_target_type, p_target_id, p_metadata
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;

-- Update mask_sensitive_data function
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(p_data text, p_mask_type text DEFAULT 'partial'::text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $function$
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
$function$;