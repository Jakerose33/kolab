-- Find and fix any SECURITY DEFINER views
-- This is important for security, not minor

-- Query to find all views with SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND (
    definition ILIKE '%security definer%'
    OR definition ILIKE '%security invoker%'
);

-- Also check for any functions that might be creating views with SECURITY DEFINER
SELECT 
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%create%view%security%definer%';

-- List all views in public schema to identify which one might be the issue
SELECT 
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;