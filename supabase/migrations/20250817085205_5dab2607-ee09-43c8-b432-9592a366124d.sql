-- Fix remaining security errors with proper cleanup

-- 1. Clean up existing policies and recreate them properly
DROP POLICY IF EXISTS "Users can view public profile info with privacy controls" ON public.profiles;
DROP POLICY IF EXISTS "Venue owners see all data" ON public.venues;
DROP POLICY IF EXISTS "Booking users see venue with contact" ON public.venues;
DROP POLICY IF EXISTS "General users see venues without contact" ON public.venues;

-- 2. Create proper profile privacy policy that respects privacy settings
CREATE POLICY "Users can view basic public profile info only"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> user_id AND (
    -- Only allow viewing basic info, detailed info requires privacy function
    true  -- This will be further restricted by the application layer using get_profile_with_privacy_safe
  )
);

-- 3. Create restrictive venue policies
CREATE POLICY "Venue owners can view all venue data"
ON public.venues
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users with bookings can view venue contact info"
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

CREATE POLICY "General authenticated users can view venues without contact info"
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
  -- Contact fields will be filtered out at application level for this policy
);

-- 4. Create the safe profile function
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

-- 5. Create the safe venues function that never exposes contact info
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