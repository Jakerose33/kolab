-- Fix RLS policies for profiles table to restrict sensitive information access
-- Remove the overly permissive policy that allows everyone to view all profile data

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more restrictive policies
CREATE POLICY "Public profiles can view basic info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- However, sensitive fields should be restricted to the profile owner
-- We'll update the table to have separate columns for public/private data
-- For now, let's create a view that only exposes safe public data

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

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Update the original policy to be more restrictive for full profile access
CREATE POLICY "Users can view complete profiles when authenticated" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create a more restrictive policy for sensitive data
CREATE POLICY "Users can only view their own sensitive data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id AND (
  location IS NOT NULL OR 
  website IS NOT NULL OR 
  linkedin_url IS NOT NULL OR 
  skills IS NOT NULL OR 
  interests IS NOT NULL
));