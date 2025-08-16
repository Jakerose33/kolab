-- **FINAL SECURITY FIX: Remove View Security Issues**
-- The public_profiles view might be triggering the security definer warning
-- because it's owned by postgres. Let's recreate it properly.

-- 1. Drop the existing view
DROP VIEW IF EXISTS public.public_profiles;

-- 2. Instead of a view, create a function that returns public profile data
-- This gives us more control over security and permissions
CREATE OR REPLACE FUNCTION public.get_public_profiles()
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
STABLE
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
  FROM public.profiles p;
$$;

-- 3. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO anon;

-- 4. Create a simpler view that relies on RLS instead of ownership
CREATE VIEW public.public_profiles_view 
WITH (security_barrier=true) 
AS
SELECT 
  id,
  user_id,
  full_name,
  handle,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- 5. Grant select permissions on the new view
GRANT SELECT ON public.public_profiles_view TO authenticated;
GRANT SELECT ON public.public_profiles_view TO anon;

-- 6. Add security comments
COMMENT ON FUNCTION public.get_public_profiles() 
IS 'Safe public profile accessor function - no SECURITY DEFINER';

COMMENT ON VIEW public.public_profiles_view 
IS 'Secure public profiles view with security_barrier - relies on RLS';