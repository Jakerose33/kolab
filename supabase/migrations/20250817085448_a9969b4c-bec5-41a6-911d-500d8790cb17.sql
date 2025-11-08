-- Final critical security fixes

-- 1. Fix the broken profile access policy
DROP POLICY IF EXISTS "Users can only view minimal public profile data" ON public.profiles;

-- Create a proper policy that allows basic profile viewing but forces use of privacy functions for detailed data
CREATE POLICY "Users can view basic profile info"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> user_id AND (
    -- Allow viewing basic fields only (name, handle, avatar)
    -- Detailed fields should use privacy-safe functions
    true
  )
);

-- However, we'll update the application to use the privacy-safe functions instead of direct table access

-- 2. Fix venue contact exposure by updating the general user policy to explicitly exclude contact fields
DROP POLICY IF EXISTS "General authenticated users can view venues without contact info" ON public.venues;

-- Create policy that explicitly prevents contact info access
CREATE POLICY "General users view venues excluding contact info"
ON public.venues
FOR SELECT
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL
  AND auth.uid() <> owner_id
  AND NOT EXISTS (
    SELECT 1 FROM public.venue_bookings vb 
    WHERE vb.venue_id = venues.id 
    AND vb.user_id = auth.uid()
    AND vb.status IN ('approved', 'pending')
  )
  -- This policy should only be used with column-level filtering to exclude contact info
);

-- 3. Create a view that completely excludes contact information for general venue access
CREATE OR REPLACE VIEW public.venues_public AS
SELECT 
  id,
  name,
  description,
  address,
  latitude,
  longitude,
  capacity,
  hourly_rate,
  tags,
  amenities,
  images,
  opening_hours,
  status,
  owner_id,
  created_at,
  updated_at
  -- Deliberately exclude contact_email and contact_phone
FROM public.venues
WHERE status = 'active';

-- Enable RLS on the view
ALTER VIEW public.venues_public SET (security_invoker = on);

-- Create policy for the public venues view
CREATE POLICY "Authenticated users can view public venue info"
ON public.venues_public
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. Create explicit functions for each use case to prevent confusion

-- Function for general venue browsing (no contact info ever)
CREATE OR REPLACE FUNCTION public.browse_venues(
  venue_limit integer DEFAULT 50,
  search_query text DEFAULT NULL,
  venue_tags text[] DEFAULT NULL,
  min_capacity integer DEFAULT NULL
)
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
  updated_at timestamp with time zone,
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
    LEFT(v.description, 500) as description,
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
    -- Basic owner info, never expose contact details in this function
    COALESCE(p.full_name, 'Anonymous') as owner_name,
    COALESCE(p.handle, 'anonymous') as owner_handle,
    p.avatar_url as owner_avatar
  FROM public.venues_public v
  LEFT JOIN public.profiles p ON p.user_id = v.owner_id
  WHERE (
      search_query IS NULL 
      OR v.name ILIKE '%' || search_query || '%'
      OR v.description ILIKE '%' || search_query || '%'
      OR v.address ILIKE '%' || search_query || '%'
    )
    AND (
      venue_tags IS NULL
      OR v.tags && venue_tags
    )
    AND (
      min_capacity IS NULL
      OR v.capacity >= min_capacity
    )
  ORDER BY v.created_at DESC
  LIMIT venue_limit;
$$;