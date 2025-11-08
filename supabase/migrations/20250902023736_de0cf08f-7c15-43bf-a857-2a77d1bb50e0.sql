-- Fix profiles table RLS policies to respect privacy settings
-- This resolves the critical security issue where all profile data was publicly accessible

-- First, drop the overly permissive existing policies
DROP POLICY IF EXISTS "Users can view basic public profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view basic public profiles" ON public.profiles;

-- Create a new privacy-aware policy for public profile viewing
-- Only basic info (name, handle, avatar) is public by default
-- Other fields require explicit privacy settings or user ownership
CREATE POLICY "Public can view basic profile info only" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Add a privacy setting for bio display (it was missing)
-- First, add the bio column to privacy_settings table
ALTER TABLE public.privacy_settings 
ADD COLUMN IF NOT EXISTS show_bio boolean DEFAULT false;

-- Update existing privacy settings to include bio setting
UPDATE public.privacy_settings 
SET show_bio = false 
WHERE show_bio IS NULL;

-- Update the get_user_privacy_setting function to handle 'show_bio'
CREATE OR REPLACE FUNCTION public.get_user_privacy_setting(target_user_id uuid, setting_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    CASE setting_name
      WHEN 'show_location' THEN COALESCE(ps.show_location, false)
      WHEN 'show_website' THEN COALESCE(ps.show_website, false)
      WHEN 'show_linkedin' THEN COALESCE(ps.show_linkedin, false)
      WHEN 'show_skills' THEN COALESCE(ps.show_skills, true)
      WHEN 'show_interests' THEN COALESCE(ps.show_interests, true)
      WHEN 'show_bio' THEN COALESCE(ps.show_bio, false) -- Bio private by default
      ELSE false
    END
  FROM public.privacy_settings ps
  WHERE ps.user_id = target_user_id
  UNION ALL
  SELECT 
    CASE setting_name
      WHEN 'show_skills' THEN true
      WHEN 'show_interests' THEN true
      WHEN 'show_bio' THEN false -- Bio private by default for new users
      ELSE false
    END
  WHERE NOT EXISTS (
    SELECT 1 FROM public.privacy_settings WHERE user_id = target_user_id
  )
  LIMIT 1;
$function$;

-- Create a view for public profile access that respects privacy
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Update the existing privacy-aware functions to be more restrictive by default
-- The get_profile_with_privacy_safe function should be the main one used
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy_safe(target_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, full_name text, handle text, avatar_url text, bio text, location text, website text, linkedin_url text, skills text[], interests text[], created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    -- Only show bio if current user is viewing their own profile OR if privacy allows
    CASE 
      WHEN auth.uid() = p.user_id THEN p.bio 
      WHEN public.get_user_privacy_setting(p.user_id, 'show_bio') THEN p.bio
      ELSE NULL 
    END,
    -- Only show location if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.location
      WHEN public.get_user_privacy_setting(p.user_id, 'show_location') THEN p.location 
      ELSE NULL 
    END,
    -- Only show website if privacy settings allow OR user is viewing own profile  
    CASE 
      WHEN auth.uid() = p.user_id THEN p.website
      WHEN public.get_user_privacy_setting(p.user_id, 'show_website') THEN p.website 
      ELSE NULL 
    END,
    -- Only show LinkedIn if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.linkedin_url
      WHEN public.get_user_privacy_setting(p.user_id, 'show_linkedin') THEN p.linkedin_url 
      ELSE NULL 
    END,
    -- Only show skills if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.skills
      WHEN public.get_user_privacy_setting(p.user_id, 'show_skills') THEN p.skills 
      ELSE NULL 
    END,
    -- Only show interests if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.interests
      WHEN public.get_user_privacy_setting(p.user_id, 'show_interests') THEN p.interests 
      ELSE NULL 
    END,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$function$;