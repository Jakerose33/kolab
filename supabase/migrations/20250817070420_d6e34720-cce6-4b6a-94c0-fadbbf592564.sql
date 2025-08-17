-- Fix venue contact information exposure vulnerability (corrected)
-- Create privacy-aware functions for venue data access

-- 1. Create function to get public venue listings (without contact info)
CREATE OR REPLACE FUNCTION public.get_public_venues(
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
    LEFT(v.description, 500) as description, -- Truncate long descriptions
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
    -- Only basic owner info, no contact details
    COALESCE(p.full_name, 'Anonymous') as owner_name,
    COALESCE(p.handle, 'anonymous') as owner_handle,
    p.avatar_url as owner_avatar
  FROM public.venues v
  LEFT JOIN public.profiles p ON p.user_id = v.owner_id
  WHERE v.status = 'active'
    AND (
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

-- 2. Create function to get venue details with contact info (for authenticated users with booking intent)
CREATE OR REPLACE FUNCTION public.get_venue_with_contact(venue_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  address text,
  contact_email text,
  contact_phone text,
  latitude numeric,
  longitude numeric,
  capacity integer,
  hourly_rate numeric,
  tags text[],
  amenities text[],
  images text[],
  opening_hours jsonb,
  status text,
  owner_id uuid,
  owner_info json,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
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
    -- Only show contact info to authenticated users
    CASE 
      WHEN auth.uid() IS NOT NULL THEN v.contact_email
      ELSE NULL 
    END as contact_email,
    CASE 
      WHEN auth.uid() IS NOT NULL THEN v.contact_phone
      ELSE NULL 
    END as contact_phone,
    v.latitude,
    v.longitude,
    v.capacity,
    v.hourly_rate,
    v.tags,
    v.amenities,
    v.images,
    v.opening_hours,
    v.status,
    -- Only show owner_id to the owner themselves
    CASE 
      WHEN auth.uid() = v.owner_id THEN v.owner_id
      ELSE NULL 
    END as owner_id,
    -- Owner info with privacy considerations
    (
      SELECT json_build_object(
        'full_name', COALESCE(p.full_name, 'Anonymous'),
        'handle', COALESCE(p.handle, 'anonymous'),
        'avatar_url', p.avatar_url
      )
      FROM public.profiles p
      WHERE p.user_id = v.owner_id
    ) as owner_info,
    v.created_at,
    v.updated_at
  FROM public.venues v
  WHERE v.id = venue_id
    AND v.status = 'active';
$$;

-- 3. Update the current overly permissive RLS policy
DROP POLICY IF EXISTS "Active venues are viewable by everyone" ON public.venues;

-- 4. Create more restrictive RLS policies
CREATE POLICY "Venue owners can view their own venues completely"
ON public.venues
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can view basic venue info"
ON public.venues  
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND status = 'active'
);

-- 5. Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_public_venues TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_venue_with_contact TO authenticated, anon;

-- 6. Add comments for documentation
COMMENT ON FUNCTION public.get_public_venues IS 'Returns public venue listings without exposing contact information. Safe for anonymous and public access.';
COMMENT ON FUNCTION public.get_venue_with_contact IS 'Returns venue details with contact information only for authenticated users. Used when users need to contact venue owners for bookings.';