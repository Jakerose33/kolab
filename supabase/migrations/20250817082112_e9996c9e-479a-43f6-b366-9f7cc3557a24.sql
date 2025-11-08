-- Fix security definer view issue by removing the view
-- The view was causing a security warning, so we'll rely on the function instead

-- Drop the security definer view that was causing the linter warning
DROP VIEW IF EXISTS public.venues_public;

-- The get_public_venues function already provides the necessary functionality
-- without the security risks of a SECURITY DEFINER view

-- Ensure proper permissions are set on the function
GRANT EXECUTE ON FUNCTION public.get_public_venues(integer, text, text[], integer) TO authenticated, anon;