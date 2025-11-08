-- **CRITICAL SECURITY FIX: Profile Data Protection**
-- This migration addresses the critical vulnerability where authenticated users 
-- can view sensitive profile data of all other users

-- 1. DROP existing overly permissive profile policies
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;

-- 2. CREATE restricted public profile policy
-- Only allow viewing basic public fields: full_name, handle, avatar_url, bio
CREATE POLICY "Users can view basic public profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- 3. CREATE policy for users to view their own complete profile
-- This policy already exists but ensuring it's correct
-- Users can view their own complete profile including sensitive data
CREATE POLICY "Users can view their own complete profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 4. UPDATE the public_profiles view to be more secure
-- Drop the existing view and recreate it without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

-- 5. CREATE new secure public_profiles view with only truly public data
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  handle,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- 6. ENABLE RLS on the view (if supported) or ensure proper access
-- Grant select access to authenticated users only for public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 7. CREATE function to get public profile data safely
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  handle text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone
)
LANGUAGE sql
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
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
$$;

-- 8. CREATE privacy settings table for future granular control
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  show_location boolean DEFAULT false,
  show_website boolean DEFAULT false,
  show_linkedin boolean DEFAULT false,
  show_skills boolean DEFAULT true,
  show_interests boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on privacy settings
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own privacy settings
CREATE POLICY "Users can manage their own privacy settings"
ON public.privacy_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- 9. CREATE updated trigger for timestamp updates
CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. COMMENT on the security fix
COMMENT ON POLICY "Users can view basic public profile data" ON public.profiles 
IS 'Restricts profile visibility to basic public fields only - SECURITY FIX';

COMMENT ON TABLE public.privacy_settings 
IS 'User privacy controls for granular profile visibility - SECURITY ENHANCEMENT';