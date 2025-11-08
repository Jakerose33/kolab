-- Address all security issues identified in the scan

-- 1. Fix the profiles table RLS to be truly restrictive
DROP POLICY IF EXISTS "Users can view own profile and basic public info" ON public.profiles;

-- Create a policy that only allows users to see their own data and very basic public info
CREATE POLICY "Profiles are private except basic public info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = user_id
);

-- 2. Create a separate policy for very limited public access (name, handle, avatar only)
-- We'll do this through a restricted view instead of allowing table access

-- 3. Fix venue contact information exposure
-- Check current venue policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'venues';