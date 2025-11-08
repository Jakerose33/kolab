-- Simple query to check views without complex operations

-- List all views in public schema
\d+ public.*

-- If that doesn't work, try this simpler approach:
-- Check if we can see view definitions one by one
SELECT 'public_profiles view definition:' as info;
SELECT pg_get_viewdef('public.public_profiles'::regclass) as view_def;