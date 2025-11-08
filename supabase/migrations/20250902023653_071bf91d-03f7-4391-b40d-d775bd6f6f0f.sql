-- Fix the security definer view warning by recreating the view without SECURITY DEFINER
-- Views should not use SECURITY DEFINER as they can bypass RLS

-- Drop the view and recreate it as a regular view
DROP VIEW IF EXISTS public.public_profiles;

-- Create a regular view (not SECURITY DEFINER) for public profile access
-- The privacy logic is handled by the functions which are properly secured
CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.handle,
  p.avatar_url,
  p.created_at,
  -- Only show bio if user allows it (bio is considered sensitive)
  CASE 
    WHEN public.get_user_privacy_setting(p.user_id, 'show_bio') THEN p.bio 
    ELSE NULL 
  END as bio,
  -- Conditionally show other fields based on privacy settings
  CASE 
    WHEN public.get_user_privacy_setting(p.user_id, 'show_location') THEN p.location 
    ELSE NULL 
  END as location,
  CASE 
    WHEN public.get_user_privacy_setting(p.user_id, 'show_website') THEN p.website 
    ELSE NULL 
  END as website,
  CASE 
    WHEN public.get_user_privacy_setting(p.user_id, 'show_linkedin') THEN p.linkedin_url 
    ELSE NULL 
  END as linkedin_url,
  CASE 
    WHEN public.get_user_privacy_setting(p.user_id, 'show_skills') THEN p.skills 
    ELSE NULL 
  END as skills,
  CASE 
    WHEN public.get_user_privacy_setting(p.user_id, 'show_interests') THEN p.interests 
    ELSE NULL 
  END as interests,
  -- Mentor info should also respect privacy
  CASE 
    WHEN p.is_mentor = true AND public.get_user_privacy_setting(p.user_id, 'show_skills') THEN p.mentor_bio 
    ELSE NULL 
  END as mentor_bio,
  CASE 
    WHEN p.is_mentor = true AND public.get_user_privacy_setting(p.user_id, 'show_skills') THEN p.mentor_expertise 
    ELSE NULL 
  END as mentor_expertise,
  p.is_mentor
FROM public.profiles p;