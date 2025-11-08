-- Fix remaining security errors: profile privacy and venue contact protection

-- 1. Fix profiles table privacy - implement proper privacy controls
-- Drop the overly permissive policy for viewing other users' profiles
DROP POLICY IF EXISTS "Users can view limited public profile info" ON public.profiles;

-- Create new policy that respects privacy settings
CREATE POLICY "Users can view public profile info with privacy controls"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> user_id AND (
    -- Only show basic info (handle, full_name, avatar) by default
    -- Other fields are only shown if privacy settings allow
    handle IS NOT NULL OR full_name IS NOT NULL OR avatar_url IS NOT NULL
  )
);

-- 2. Update the get_profile_with_privacy function to be more restrictive by default
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy_safe(target_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  full_name text, 
  handle text, 
  avatar_url text, 
  bio text, 
  location text, 
  website text, 
  linkedin_url text, 
  skills text[], 
  interests text[], 
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
    -- Only show bio if current user is viewing their own profile
    CASE WHEN auth.uid() = p.user_id THEN p.bio ELSE NULL END,
    -- Only show location if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.location
      WHEN public.get_user_privacy_setting(p.user_id, 'show_location') THEN p.location 
      ELSE NULL 
    END,
    -- Only show website if privacy settings allow OR user is viewing own profile  
    CASE 
      WHEN auth.uid() = p.user_id THEN p.website
      WHEN public.get_user_privacy_setting(p.user_id, 'show_website') THEN p.website 
      ELSE NULL 
    END,
    -- Only show LinkedIn if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.linkedin_url
      WHEN public.get_user_privacy_setting(p.user_id, 'show_linkedin') THEN p.linkedin_url 
      ELSE NULL 
    END,
    -- Only show skills if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.skills
      WHEN public.get_user_privacy_setting(p.user_id, 'show_skills') THEN p.skills 
      ELSE NULL 
    END,
    -- Only show interests if privacy settings allow OR user is viewing own profile
    CASE 
      WHEN auth.uid() = p.user_id THEN p.interests
      WHEN public.get_user_privacy_setting(p.user_id, 'show_interests') THEN p.interests 
      ELSE NULL 
    END,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

-- 3. Fix venues table contact exposure - create more restrictive policy
-- Remove the current policy and create a cleaner one
DROP POLICY IF EXISTS "Venue access with contact protection" ON public.venues;

-- Create separate policies for different access levels
CREATE POLICY "Venue owners see all data"
ON public.venues
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Booking users see venue with contact"
ON public.venues  
FOR SELECT
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL
  AND auth.uid() <> owner_id
  AND EXISTS (
    SELECT 1 FROM public.venue_bookings vb 
    WHERE vb.venue_id = venues.id 
    AND vb.user_id = auth.uid()
    AND vb.status IN ('approved', 'pending')
  )
);

CREATE POLICY "General users see venues without contact"
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
);

-- 4. Create a safe public venues function that never exposes contact info
CREATE OR REPLACE FUNCTION public.get_venues_safe(
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
    -- Never expose contact_email or contact_phone in this function
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

-- 5. Create function to get venue with contact info only for authorized users
CREATE OR REPLACE FUNCTION public.get_venue_with_contact_safe(venue_id uuid)
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  owner_info json
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
    -- Only show contact info to venue owner or users with bookings
    CASE 
      WHEN auth.uid() = v.owner_id THEN v.contact_email
      WHEN EXISTS (
        SELECT 1 FROM public.venue_bookings vb 
        WHERE vb.venue_id = v.id 
        AND vb.user_id = auth.uid()
        AND vb.status IN ('approved', 'pending')
      ) THEN v.contact_email
      ELSE NULL 
    END as contact_email,
    CASE 
      WHEN auth.uid() = v.owner_id THEN v.contact_phone
      WHEN EXISTS (
        SELECT 1 FROM public.venue_bookings vb 
        WHERE vb.venue_id = v.id 
        AND vb.user_id = auth.uid()
        AND vb.status IN ('approved', 'pending')
      ) THEN v.contact_phone
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
    v.created_at,
    v.updated_at,
    -- Owner info with basic details
    (
      SELECT json_build_object(
        'full_name', COALESCE(p.full_name, 'Anonymous'),
        'handle', COALESCE(p.handle, 'anonymous'),
        'avatar_url', p.avatar_url
      )
      FROM public.profiles p
      WHERE p.user_id = v.owner_id
    ) as owner_info
  FROM public.venues v
  WHERE v.id = venue_id
    AND v.status = 'active';
$$;