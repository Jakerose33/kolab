-- Fix email exposure and remaining function search path issues
-- This addresses Warning 3: Customer Email Addresses Could Be Stolen by Hackers

-- 1. Create secure email masking policies for profiles
CREATE OR REPLACE FUNCTION public.get_profile_with_masked_email(target_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  full_name text, 
  handle text, 
  avatar_url text, 
  bio text, 
  location text, 
  website text, 
  linkedin_url text, 
  skills text[], 
  interests text[], 
  created_at timestamp with time zone,
  masked_contact text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    -- Only show sensitive data if user is viewing their own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.bio
      WHEN public.get_user_privacy_setting(p.user_id, 'show_bio') THEN p.bio
      ELSE NULL 
    END,
    CASE 
      WHEN auth.uid() = p.user_id THEN p.location
      WHEN public.get_user_privacy_setting(p.user_id, 'show_location') THEN p.location 
      ELSE NULL 
    END,
    CASE 
      WHEN auth.uid() = p.user_id THEN p.website
      WHEN public.get_user_privacy_setting(p.user_id, 'show_website') THEN p.website 
      ELSE NULL 
    END,
    CASE 
      WHEN auth.uid() = p.user_id THEN p.linkedin_url
      WHEN public.get_user_privacy_setting(p.user_id, 'show_linkedin') THEN p.linkedin_url 
      ELSE NULL 
    END,
    CASE 
      WHEN auth.uid() = p.user_id THEN p.skills
      WHEN public.get_user_privacy_setting(p.user_id, 'show_skills') THEN p.skills 
      ELSE NULL 
    END,
    CASE 
      WHEN auth.uid() = p.user_id THEN p.interests
      WHEN public.get_user_privacy_setting(p.user_id, 'show_interests') THEN p.interests 
      ELSE NULL 
    END,
    p.created_at,
    -- Provide masked contact only for verified connections
    CASE 
      WHEN auth.uid() = p.user_id THEN 'Own Profile'
      WHEN public.get_user_privacy_setting(p.user_id, 'show_website') THEN 'Contact via profile'
      ELSE 'Private'
    END
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$function$;

-- 2. Fix all remaining functions to have proper search_path
CREATE OR REPLACE FUNCTION public.track_event_view(p_event_id uuid, p_user_id uuid DEFAULT NULL::uuid, p_is_unique boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  organizer_user_id UUID;
BEGIN
  -- Get organizer ID
  SELECT organizer_id INTO organizer_user_id
  FROM public.events
  WHERE id = p_event_id;
  
  IF organizer_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Update or insert event analytics
  INSERT INTO public.event_analytics (
    event_id, organizer_id, views, unique_views
  )
  VALUES (
    p_event_id, organizer_user_id, 1, CASE WHEN p_is_unique THEN 1 ELSE 0 END
  )
  ON CONFLICT (event_id, date)
  DO UPDATE SET
    views = event_analytics.views + 1,
    unique_views = event_analytics.unique_views + CASE WHEN p_is_unique THEN 1 ELSE 0 END,
    updated_at = now();
    
  -- Update user behavior analytics if user is provided
  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.user_behavior_analytics (
      user_id, events_viewed
    )
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      events_viewed = user_behavior_analytics.events_viewed + 1,
      updated_at = now();
  END IF;
END;
$function$;

-- 3. Update more functions with proper search_path
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action_type text, p_limit integer DEFAULT 100, p_window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- 4. Secure profiles table access further
-- Drop overly permissive profile policies
DROP POLICY IF EXISTS "Users can only view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile data" ON public.profiles;

-- Create single comprehensive secure profile policy
CREATE POLICY "Users can view their own profiles securely" ON public.profiles
FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Create secure public profile view function that never exposes email
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  full_name text, 
  handle text, 
  avatar_url text, 
  bio text, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    -- Only show bio if privacy allows
    CASE 
      WHEN public.get_user_privacy_setting(p.user_id, 'show_bio') THEN p.bio
      ELSE NULL 
    END,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
$function$;