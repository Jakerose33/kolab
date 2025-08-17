-- Fix venue contact information exposure
-- Only show contact info to venue owners or users with booking requests

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
 SET search_path TO 'public'
AS $$
  SELECT 
    v.id,
    v.name,
    v.description,
    v.address,
    -- Only show contact info to venue owner or users with booking requests
    CASE 
      WHEN auth.uid() = v.owner_id THEN v.contact_email
      WHEN EXISTS (
        SELECT 1 FROM public.venue_bookings vb 
        WHERE vb.venue_id = v.id 
        AND vb.user_id = auth.uid()
      ) THEN v.contact_email
      ELSE NULL 
    END as contact_email,
    CASE 
      WHEN auth.uid() = v.owner_id THEN v.contact_phone
      WHEN EXISTS (
        SELECT 1 FROM public.venue_bookings vb 
        WHERE vb.venue_id = v.id 
        AND vb.user_id = auth.uid()
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

-- Add comments for clarity
COMMENT ON FUNCTION public.get_venue_with_contact(uuid) IS 
'Returns venue details with contact information restricted to venue owners and users with existing booking requests only';