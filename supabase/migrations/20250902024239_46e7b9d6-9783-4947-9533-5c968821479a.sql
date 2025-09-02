-- Find the problematic SECURITY DEFINER view with a simpler query

-- List all views and check their definitions
DO $$
DECLARE
    view_rec RECORD;
    view_def TEXT;
BEGIN
    FOR view_rec IN 
        SELECT viewname FROM pg_views WHERE schemaname = 'public'
    LOOP
        SELECT definition INTO view_def 
        FROM pg_views 
        WHERE schemaname = 'public' AND viewname = view_rec.viewname;
        
        IF view_def ILIKE '%security definer%' THEN
            RAISE NOTICE 'Found SECURITY DEFINER view: %', view_rec.viewname;
            RAISE NOTICE 'Definition: %', view_def;
        END IF;
    END LOOP;
END $$;

-- Drop and recreate the public_profiles view to ensure it's not SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate the view without any SECURITY DEFINER
CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.handle,
  p.avatar_url,
  p.created_at,
  p.is_mentor
FROM public.profiles p;