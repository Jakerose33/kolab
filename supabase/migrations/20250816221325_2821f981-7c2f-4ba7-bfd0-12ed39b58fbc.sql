-- **SECURITY FIX: Remove Security Definer from Function**
-- This addresses the security linter warning about the get_public_profile function

-- 1. DROP the existing function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- 2. CREATE a safer version without SECURITY DEFINER
-- Users will access this through normal RLS policies instead
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
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
$$;

-- 3. GRANT execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;

-- 4. COMMENT on the security improvement
COMMENT ON FUNCTION public.get_public_profile(uuid) 
IS 'Safe public profile accessor without SECURITY DEFINER - relies on RLS policies';