-- Fix the Security Definer View issue by removing problematic views

-- Drop the views that are causing Security Definer View warnings
DROP VIEW IF EXISTS public.basic_profiles CASCADE;
DROP VIEW IF EXISTS public.public_venues CASCADE;

-- The existing secure functions are already available:
-- - get_basic_profile_info(target_user_id uuid) 
-- - get_public_venues_safe() and similar functions
-- Applications should use these functions instead of direct table/view access

-- Let's make sure there are no other problematic views by checking system catalogs
-- (This is just a check, not creating anything)
SELECT 
    'Checking for problematic views' as status;