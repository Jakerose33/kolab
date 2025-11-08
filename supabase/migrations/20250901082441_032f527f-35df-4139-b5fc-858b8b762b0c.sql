-- Add missing fields to events table for comprehensive data model
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS address_full text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS price_min numeric,
ADD COLUMN IF NOT EXISTS price_max numeric,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS ticket_url text,
ADD COLUMN IF NOT EXISTS categories text[],
ADD COLUMN IF NOT EXISTS published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS geocoded boolean DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_categories ON public.events USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create text search index
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_events_search ON public.events USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION public.update_events_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.venue_name, '') || ' ' ||
    COALESCE(NEW.venue_address, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.categories, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector updates
DROP TRIGGER IF EXISTS update_events_search_vector_trigger ON public.events;
CREATE TRIGGER update_events_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_events_search_vector();

-- Update RLS policies for new published field
DROP POLICY IF EXISTS "Public can view basic published event info" ON public.events;
CREATE POLICY "Public can view basic published event info" 
ON public.events 
FOR SELECT 
USING (published = true AND visibility = 'public');

-- Enhanced search function without PostGIS
CREATE OR REPLACE FUNCTION public.get_public_events_enhanced(
  event_limit integer DEFAULT 50,
  search_query text DEFAULT NULL,
  category_filter text[] DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL,
  latitude_center numeric DEFAULT NULL,
  longitude_center numeric DEFAULT NULL,
  radius_km numeric DEFAULT NULL
)
RETURNS TABLE(
  id uuid, title text, description text, 
  start_at timestamp with time zone, end_at timestamp with time zone,
  image_url text, tags text[], categories text[], capacity integer,
  venue_name text, venue_area text, city text,
  price_min numeric, price_max numeric, currency text,
  organizer_name text, organizer_handle text, organizer_avatar text,
  latitude numeric, longitude numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    e.id,
    e.title,
    LEFT(e.description, 200) as description,
    e.start_at,
    e.end_at,
    e.image_url,
    e.tags,
    e.categories,
    e.capacity,
    e.venue_name,
    CONCAT(
      COALESCE(e.city, SPLIT_PART(e.venue_address, ',', -2)), 
      ', ', 
      COALESCE(e.region, e.country, SPLIT_PART(e.venue_address, ',', -1))
    ) as venue_area,
    e.city,
    e.price_min,
    e.price_max,
    e.currency,
    COALESCE(p.full_name, 'Anonymous') as organizer_name,
    COALESCE(p.handle, 'anonymous') as organizer_handle,
    p.avatar_url as organizer_avatar,
    -- Only return coordinates if geocoded successfully
    CASE WHEN e.geocoded = true THEN e.latitude ELSE NULL END as latitude,
    CASE WHEN e.geocoded = true THEN e.longitude ELSE NULL END as longitude
  FROM public.events e
  LEFT JOIN public.profiles p ON p.user_id = e.organizer_id
  WHERE e.published = true 
    AND e.visibility = 'public'
    AND e.start_at > now()
    AND (
      search_query IS NULL 
      OR e.search_vector @@ plainto_tsquery('english', search_query)
    )
    AND (
      category_filter IS NULL
      OR e.categories && category_filter
    )
    AND (
      min_price IS NULL
      OR e.price_min >= min_price
    )
    AND (
      max_price IS NULL
      OR e.price_max <= max_price OR e.price_max IS NULL
    )
    AND (
      start_date IS NULL
      OR e.start_at >= start_date
    )
    AND (
      end_date IS NULL
      OR e.start_at <= end_date
    )
    AND (
      latitude_center IS NULL OR longitude_center IS NULL OR radius_km IS NULL
      OR (
        e.latitude IS NOT NULL AND e.longitude IS NOT NULL
        AND (
          DEGREES(ACOS(
            SIN(RADIANS(latitude_center)) * SIN(RADIANS(e.latitude)) +
            COS(RADIANS(latitude_center)) * COS(RADIANS(e.latitude)) *
            COS(RADIANS(longitude_center - e.longitude))
          )) * 111.045
        ) <= radius_km
      )
    )
  ORDER BY e.start_at ASC
  LIMIT event_limit;
$$;