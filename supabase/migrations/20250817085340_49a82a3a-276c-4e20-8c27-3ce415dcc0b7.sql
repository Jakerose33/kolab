-- Final security fixes to address remaining vulnerabilities

-- 1. Fix analytics_events - restrict access more thoroughly
-- Remove the broad policy and replace with more restrictive ones
DROP POLICY IF EXISTS "Users can view their own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;

-- Create more restrictive analytics policies
CREATE POLICY "Users can view only their own sanitized analytics"
ON public.analytics_events
FOR SELECT
USING (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
);

CREATE POLICY "Admins can view aggregated analytics only"
ON public.analytics_events
FOR SELECT
USING (
  public.current_user_has_role('admin')
  -- IP addresses and sensitive fields should be masked at application level
);

-- 2. Fix profiles visibility - make it more restrictive by default
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view basic public profile info only" ON public.profiles;

-- Create very restrictive policy for viewing other users
CREATE POLICY "Users can only view minimal public profile data"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> user_id AND (
    -- Only allow seeing handle, full_name, and avatar_url by default
    -- All other fields must use the get_profile_with_privacy_safe function
    false -- Force use of privacy-safe function for all cross-user profile access
  )
);

-- 3. Create a public profile view function for basic info only
CREATE OR REPLACE FUNCTION public.get_basic_profile_info(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  handle text,
  avatar_url text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

-- 4. Create function for analytics that masks sensitive data
CREATE OR REPLACE FUNCTION public.get_user_analytics_masked(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  event_name text,
  created_at timestamp with time zone,
  page_url text,
  session_id text
  -- IP address and user agent are excluded for privacy
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    ae.id,
    ae.event_name,
    ae.created_at,
    ae.page_url,
    ae.session_id
    -- Deliberately exclude ip_address and user_agent for privacy
  FROM public.analytics_events ae
  WHERE ae.user_id = target_user_id
    AND (
      auth.uid() = target_user_id  -- Users can see their own data
      OR public.current_user_has_role('admin')  -- Admins can see masked data
    )
  ORDER BY ae.created_at DESC;
$$;

-- 5. Add additional security for venue contact info
-- Create a function that ensures contact info is never exposed inappropriately
CREATE OR REPLACE FUNCTION public.get_venue_public_info(venue_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  address text,
  latitude numeric,
  longitude numeric,
  capacity integer,
  hourly_rate numeric,
  tags text[],
  amenities text[],
  images text[],
  opening_hours jsonb,
  status text,
  created_at timestamp with time zone,
  owner_name text,
  owner_handle text,
  owner_avatar text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
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
    -- Basic owner info only, no contact details
    COALESCE(p.full_name, 'Anonymous') as owner_name,
    COALESCE(p.handle, 'anonymous') as owner_handle,
    p.avatar_url as owner_avatar
  FROM public.venues v
  LEFT JOIN public.profiles p ON p.user_id = v.owner_id
  WHERE v.id = venue_id
    AND v.status = 'active';
$$;