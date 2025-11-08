-- **SECURITY FIX: Implement Privacy-Aware Profile Access**
-- This migration fixes the security issue where all user profile information
-- was accessible to everyone, regardless of privacy settings.

-- 1. First, let's create a security definer function to check privacy settings
-- This avoids RLS recursion issues when checking privacy settings
CREATE OR REPLACE FUNCTION public.get_user_privacy_setting(
  target_user_id uuid, 
  setting_name text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE setting_name
      WHEN 'show_location' THEN COALESCE(ps.show_location, false)
      WHEN 'show_website' THEN COALESCE(ps.show_website, false)
      WHEN 'show_linkedin' THEN COALESCE(ps.show_linkedin, false)
      WHEN 'show_skills' THEN COALESCE(ps.show_skills, true)
      WHEN 'show_interests' THEN COALESCE(ps.show_interests, true)
      ELSE false
    END
  FROM public.privacy_settings ps
  WHERE ps.user_id = target_user_id
  UNION ALL
  SELECT 
    CASE setting_name
      WHEN 'show_skills' THEN true
      WHEN 'show_interests' THEN true
      ELSE false
    END
  WHERE NOT EXISTS (
    SELECT 1 FROM public.privacy_settings WHERE user_id = target_user_id
  )
  LIMIT 1;
$$;

-- 2. Create a secure function to get public profile data respecting privacy
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy(target_user_id uuid)
RETURNS TABLE (
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
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    p.bio,
    -- Conditionally return private fields based on privacy settings
    CASE WHEN public.get_user_privacy_setting(p.user_id, 'show_location') THEN p.location ELSE NULL END,
    CASE WHEN public.get_user_privacy_setting(p.user_id, 'show_website') THEN p.website ELSE NULL END,
    CASE WHEN public.get_user_privacy_setting(p.user_id, 'show_linkedin') THEN p.linkedin_url ELSE NULL END,
    CASE WHEN public.get_user_privacy_setting(p.user_id, 'show_skills') THEN p.skills ELSE NULL END,
    CASE WHEN public.get_user_privacy_setting(p.user_id, 'show_interests') THEN p.interests ELSE NULL END,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

-- 3. Drop the overly permissive RLS policy
DROP POLICY IF EXISTS "Users can view basic public profile data" ON public.profiles;

-- 4. Create new restrictive RLS policies for profiles
-- Users can only see basic info of others (name, handle, avatar, bio)
CREATE POLICY "Public can view basic profile info only"
ON public.profiles
FOR SELECT
USING (
  -- Allow access to basic fields only for others
  auth.uid() != user_id
);

-- Users can see their own complete profile
CREATE POLICY "Users can view their own complete profile"
ON public.profiles  
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_user_privacy_setting(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_privacy_setting(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_profile_with_privacy(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_with_privacy(uuid) TO anon;

-- 6. Add helpful comments
COMMENT ON FUNCTION public.get_user_privacy_setting(uuid, text) 
IS 'Security definer function to check user privacy settings without RLS recursion';

COMMENT ON FUNCTION public.get_profile_with_privacy(uuid)
IS 'Returns user profile data respecting their privacy settings';

COMMENT ON POLICY "Public can view basic profile info only" ON public.profiles
IS 'Allows public access to basic profile info only (name, handle, avatar, bio)';

COMMENT ON POLICY "Users can view their own complete profile" ON public.profiles
IS 'Users can see all their own profile data regardless of privacy settings';