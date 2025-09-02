-- Fix all critical security issues

-- 1. Make profiles table truly private - only owners can see their data
DROP POLICY IF EXISTS "Profiles are private except basic public info" ON public.profiles;

-- Create a restrictive policy: users can only see their own profiles
CREATE POLICY "Users can only view their own profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Drop the problematic public_profiles view that may be causing Security Definer View warning
DROP VIEW IF EXISTS public.public_profiles;

-- 3. Create a new secure public view for basic profile info only (no sensitive data)
CREATE VIEW public.basic_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.handle,
  p.avatar_url,
  p.created_at
FROM public.profiles p;

-- 4. Fix venue contact information exposure by creating a public venues view without contact info
CREATE VIEW public.public_venues AS
SELECT 
  v.id,
  v.name,
  v.description,
  v.address,
  v.latitude,
  v.longitude,
  v.capacity,
  v.hourly_rate,
  v.tags,
  v.amenities,
  v.images,
  v.opening_hours,
  v.status,
  v.created_at,
  v.updated_at,
  -- No contact_email or contact_phone in public view
  p.full_name as owner_name,
  p.handle as owner_handle,
  p.avatar_url as owner_avatar
FROM public.venues v
LEFT JOIN public.profiles p ON p.user_id = v.owner_id
WHERE v.status = 'active';

-- 5. Ensure analytics events are properly restricted
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;

-- Create more restrictive analytics policies
CREATE POLICY "Users can insert anonymous analytics only" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (
  -- Allow inserting analytics with user_id only if it matches auth user
  (user_id IS NULL) OR (auth.uid() = user_id)
);

CREATE POLICY "Only authenticated users can insert their own analytics" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);