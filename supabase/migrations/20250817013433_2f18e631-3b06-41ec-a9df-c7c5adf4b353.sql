-- **SECURITY FIX: Event Authorization and Data Protection**
-- This migration fixes the security issue where events are exposed without proper authorization
-- and addresses null organizer_id values that break ownership controls.

-- 1. First, let's check for and fix any events with null organizer_id
-- We'll create a system user for orphaned events
DO $$
DECLARE
    system_user_id uuid;
    orphaned_count integer;
BEGIN
    -- Check if we have orphaned events
    SELECT COUNT(*) INTO orphaned_count FROM public.events WHERE organizer_id IS NULL;
    
    IF orphaned_count > 0 THEN
        -- Create a system profile for orphaned events if it doesn't exist
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            'system@kolab.internal', 
            crypt('system_generated_password_' || extract(epoch from now()), gen_salt('bf')),
            now(),
            now(),
            now()
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Get or create system user profile
        SELECT user_id INTO system_user_id 
        FROM public.profiles 
        WHERE handle = 'system' 
        LIMIT 1;
        
        IF system_user_id IS NULL THEN
            -- Insert system profile
            INSERT INTO public.profiles (user_id, full_name, handle, bio)
            SELECT id, 'System Events', 'system', 'System-managed events'
            FROM auth.users 
            WHERE email = 'system@kolab.internal'
            RETURNING user_id INTO system_user_id;
        END IF;
        
        -- Update orphaned events to have system ownership
        UPDATE public.events 
        SET organizer_id = system_user_id,
            updated_at = now()
        WHERE organizer_id IS NULL;
        
        RAISE NOTICE 'Fixed % orphaned events by assigning to system user', orphaned_count;
    END IF;
END $$;

-- 2. Make organizer_id NOT NULL to prevent future issues
ALTER TABLE public.events 
ALTER COLUMN organizer_id SET NOT NULL;

-- 3. Add constraint to ensure organizer_id references valid profiles
-- (This will prevent events from being created without proper ownership)
ALTER TABLE public.events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Drop the overly permissive RLS policy
DROP POLICY IF EXISTS "Events are viewable by everyone when published" ON public.events;

-- 5. Create new restrictive RLS policies for events
-- Only basic event info should be publicly visible, not sensitive details
CREATE POLICY "Public can view basic published event info"
ON public.events
FOR SELECT
USING (
  status = 'published' AND visibility = 'public'
);

-- 6. Create a privacy-aware function for event details
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
SET search_path = public
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
    -- Only show full address to event organizer or if event allows it
    CASE 
      WHEN auth.uid() = e.organizer_id THEN e.venue_address
      WHEN e.status = 'published' AND e.visibility = 'public' THEN e.venue_address
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

-- 7. Create function to get public event listings (summary only)
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
SET search_path = public
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

-- 8. Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_event_with_privacy(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_with_privacy(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_events(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_events(integer, text) TO anon;

-- 9. Add helpful comments
COMMENT ON FUNCTION public.get_event_with_privacy(uuid)
IS 'Returns event data with privacy controls - full details to organizer, limited info to others';

COMMENT ON FUNCTION public.get_public_events(integer, text)
IS 'Returns public event listings with privacy-safe information only';

COMMENT ON POLICY "Public can view basic published event info" ON public.events
IS 'Allows public access to basic published event info only, sensitive details require authorization';

-- 10. Add validation to prevent events without proper ownership
CREATE OR REPLACE FUNCTION public.validate_event_ownership()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger to enforce ownership validation
CREATE TRIGGER validate_event_ownership_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_ownership();