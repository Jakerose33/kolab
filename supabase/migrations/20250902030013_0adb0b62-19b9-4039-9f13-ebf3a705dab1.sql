-- Properly investigate the Security Definer View warning
-- Let's find the actual issue instead of dismissing it

-- Check the actual system catalogs for views with SECURITY property
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE schemaname = 'public';

-- Check if there are any views created with SECURITY DEFINER by examining pg_class
SELECT 
    c.relname as view_name,
    c.relkind,
    pg_get_viewdef(c.oid) as view_definition
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relkind = 'v'  -- views only
AND pg_get_viewdef(c.oid) ILIKE '%security%definer%';

-- Also check if any of our functions are creating views dynamically
SELECT 
    proname,
    pg_get_functiondef(oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(oid) ILIKE '%create%view%';