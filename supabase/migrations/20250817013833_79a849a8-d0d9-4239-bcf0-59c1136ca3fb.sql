-- **FIX: Function Search Path Security Warning**
-- This fixes the security warning about mutable search paths in functions

-- Update get_event_with_privacy function to have immutable search path
CREATE OR REPLACE FUNCTION public.get_event_with_privacy(event_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  image_url text,
  tags text[],
  capacity integer,
  status text,
  visibility text,
  venue_name text,
  venue_address text,
  latitude numeric,
  longitude numeric,
  organizer_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  organizer_info json
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_at,
    e.end_at,
    e.image_url,
    e.tags,
    e.capacity,
    e.status,
    e.visibility,
    e.venue_name,
    -- Only show full address to event organizer
    CASE 
      WHEN auth.uid() = e.organizer_id THEN e.venue_address
      ELSE CONCAT(SPLIT_PART(e.venue_address, ',', -2), ', ', SPLIT_PART(e.venue_address, ',', -1))
    END as venue_address,
    -- Only show precise coordinates to organizer
    CASE WHEN auth.uid() = e.organizer_id THEN e.latitude ELSE NULL END,
    CASE WHEN auth.uid() = e.organizer_id THEN e.longitude ELSE NULL END,
    e.organizer_id,
    e.created_at,
    e.updated_at,
    -- Basic organizer info (using privacy-aware profile function)
    (
      SELECT json_build_object(
        'full_name', COALESCE(p.full_name, 'Anonymous'),
        'handle', COALESCE(p.handle, 'anonymous'),
        'avatar_url', p.avatar_url
      )
      FROM public.profiles p
      WHERE p.user_id = e.organizer_id
    ) as organizer_info
  FROM public.events e
  WHERE e.id = event_id
    AND (
      e.status = 'published' 
      OR auth.uid() = e.organizer_id
    );
$$;

-- Update get_public_events function to have immutable search path
CREATE OR REPLACE FUNCTION public.get_public_events(
  event_limit integer DEFAULT 50,
  search_query text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  image_url text,
  tags text[],
  capacity integer,
  venue_name text,
  venue_area text,
  organizer_name text,
  organizer_handle text,
  organizer_avatar text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    e.id,
    e.title,
    LEFT(e.description, 200) as description, -- Truncate description
    e.start_at,
    e.end_at,
    e.image_url,
    e.tags,
    e.capacity,
    e.venue_name,
    -- Only show general area, not full address
    CONCAT(
      SPLIT_PART(e.venue_address, ',', -2), 
      ', ', 
      SPLIT_PART(e.venue_address, ',', -1)
    ) as venue_area,
    COALESCE(p.full_name, 'Anonymous') as organizer_name,
    COALESCE(p.handle, 'anonymous') as organizer_handle,
    p.avatar_url as organizer_avatar
  FROM public.events e
  LEFT JOIN public.profiles p ON p.user_id = e.organizer_id
  WHERE e.status = 'published' 
    AND e.visibility = 'public'
    AND (
      search_query IS NULL 
      OR e.title ILIKE '%' || search_query || '%'
      OR e.description ILIKE '%' || search_query || '%'
      OR e.venue_name ILIKE '%' || search_query || '%'
    )
  ORDER BY e.start_at ASC
  LIMIT event_limit;
$$;

-- Update validate_event_ownership function to have immutable search path
CREATE OR REPLACE FUNCTION public.validate_event_ownership()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure organizer_id is set and matches authenticated user for INSERT/UPDATE
  IF TG_OP = 'INSERT' THEN
    IF NEW.organizer_id IS NULL THEN
      RAISE EXCEPTION 'Event must have an organizer';
    END IF;
    
    IF NEW.organizer_id != auth.uid() THEN
      RAISE EXCEPTION 'Cannot create event for another user';
    END IF;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    IF OLD.organizer_id != NEW.organizer_id AND auth.uid() != OLD.organizer_id THEN
      RAISE EXCEPTION 'Cannot transfer event ownership';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;