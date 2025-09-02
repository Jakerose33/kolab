-- Fix the ambiguous column reference and properly investigate

-- Check all views in public schema
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Check if any functions create views
SELECT 
    p.proname,
    pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%create%view%';

-- Let's also check what the security linter might be detecting
-- by looking at the actual view definitions more carefully
SELECT 
    viewname,
    CASE 
        WHEN definition ILIKE '%security%definer%' THEN 'CONTAINS SECURITY DEFINER'
        ELSE 'CLEAN'
    END as security_status,
    LEFT(definition, 100) as definition_preview
FROM pg_views 
WHERE schemaname = 'public';