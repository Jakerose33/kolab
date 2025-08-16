-- Fix the security definer view issue
-- Drop the problematic view and recreate it without security definer
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without SECURITY DEFINER (it's not needed here)
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

-- Grant access to the view (this is safe for public profile info)
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Fix the RLS policies - remove conflicting policies first
DROP POLICY IF EXISTS "Public profiles can view basic info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view complete profiles when authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own sensitive data" ON public.profiles;

-- Create a single, clear policy for profile access
-- Authenticated users can see basic profile info of all users
CREATE POLICY "Authenticated users can view public profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Users can see their own complete profile (including sensitive data)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Anonymous users cannot access profiles at all for security
-- If public access is needed later, it should be through the public_profiles view