-- **FINAL SECURITY FIX: Resolve Security Definer View Warning**
-- The public_profiles_view is owned by postgres, which triggers the security linter
-- Let's recreate it with proper ownership and security settings

-- 1. Drop the problematic view
DROP VIEW IF EXISTS public.public_profiles_view;

-- 2. Instead of a view, let's use a more secure approach with a function
-- that explicitly uses invoker rights (not definer rights)
CREATE OR REPLACE FUNCTION public.get_public_profiles_data()
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
SECURITY INVOKER  -- This explicitly uses invoker's permissions
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

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_profiles_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles_data() TO anon;

-- 4. Add security comment
COMMENT ON FUNCTION public.get_public_profiles_data() 
IS 'Secure public profile accessor with SECURITY INVOKER - uses caller permissions with RLS';