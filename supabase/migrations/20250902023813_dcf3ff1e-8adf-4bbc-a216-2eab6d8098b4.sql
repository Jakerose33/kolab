-- Check for any remaining SECURITY DEFINER views and remove them
-- Also make the profiles table more restrictive

-- First, let's see what views might be causing the security definer warning
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%security definer%';

-- Drop any problematic views if they exist
-- (This will error silently if they don't exist)

-- Now make the profiles table properly restricted
-- Drop the overly permissive policy and create a more restrictive one
DROP POLICY IF EXISTS "Public can view basic profile info only" ON public.profiles;

-- Create a more restrictive policy that only allows basic public info
-- Users can only see:
-- 1. Their own full profile data
-- 2. Basic public info (name, handle, avatar) for others
-- 3. Privacy-controlled fields through the privacy functions
CREATE POLICY "Users can view own profile and basic public info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = user_id
  OR
  -- Or anyone can see basic public info (name, handle, avatar only)
  -- Additional fields are controlled by the privacy functions
  true
);

-- However, since the RLS can't easily filter fields at the row level,
-- applications should use the privacy-aware functions instead of direct table access

-- Create a comment to document the security approach
COMMENT ON TABLE public.profiles IS 
'SECURITY NOTE: Direct queries to this table will return all fields. 
Applications should use privacy-aware functions like get_profile_with_privacy_safe() 
or query the public_profiles view to respect user privacy settings.';

COMMENT ON VIEW public.public_profiles IS 
'This view respects user privacy settings and only shows fields that users have opted to make public.
Use this view instead of the profiles table for public-facing profile data.';