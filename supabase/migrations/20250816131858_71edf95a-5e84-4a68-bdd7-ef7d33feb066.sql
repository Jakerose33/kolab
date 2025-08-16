-- Fix function search path issues
-- Update existing functions to have proper search_path settings

-- Update the is_user_suspended function (already has proper search_path)
-- Update the is_user_blocked function (already has proper search_path)  
-- Update the update_updated_at_column function (already has proper search_path)
-- Update the handle_new_user function (already has proper search_path)
-- Update the calculate_daily_metrics function (already has proper search_path)
-- Update the create_activity_entry function (already has proper search_path)
-- Update the create_notification_with_activity function (already has proper search_path)
-- Update the process_offline_action function (already has proper search_path)

-- Update calculate_engagement_score to have proper search_path
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(p_views integer, p_rsvps integer, p_shares integer, p_comments integer DEFAULT 0)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
DECLARE
  score DECIMAL(5,2);
  view_weight DECIMAL(3,2) := 0.1;
  rsvp_weight DECIMAL(3,2) := 0.5;
  share_weight DECIMAL(3,2) := 0.3;
  comment_weight DECIMAL(3,2) := 0.1;
BEGIN
  -- Calculate weighted engagement score
  score := (p_views * view_weight) + 
           (p_rsvps * rsvp_weight) + 
           (p_shares * share_weight) + 
           (p_comments * comment_weight);
  
  -- Normalize to 0-100 scale
  score := LEAST(100, score);
  
  RETURN score;
END;
$function$;

-- Update track_event_view function (already has proper search_path)

-- Check for any views that might be using SECURITY DEFINER
-- The public_profiles view should not have SECURITY DEFINER
-- Let's verify by dropping and recreating it properly
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate without any SECURITY DEFINER properties
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  handle,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- Grant proper access
GRANT SELECT ON public.public_profiles TO authenticated, anon;