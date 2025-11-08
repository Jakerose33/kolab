-- Check for functions that might be causing the SECURITY DEFINER view warning
-- Sometimes functions with CREATE VIEW statements can trigger this

-- List all functions and check if any contain CREATE VIEW statements
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND pg_get_functiondef(oid) ILIKE '%create%view%'
ORDER BY proname;

-- Also check for any function that might be doing VIEW operations with SECURITY DEFINER
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND prosecdef = true
AND pg_get_functiondef(oid) ILIKE '%view%'
ORDER BY proname;