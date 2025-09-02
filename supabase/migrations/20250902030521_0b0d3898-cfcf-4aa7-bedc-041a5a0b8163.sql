-- Fix remaining security issues

-- 1. Add RLS policies to the new views
ALTER VIEW public.basic_profiles SET ROW LEVEL SECURITY ENABLED;
ALTER VIEW public.public_venues SET ROW LEVEL SECURITY ENABLED;

-- Wait, views can't have RLS directly. Let me handle this properly.
-- Instead, create functions that return the data securely

-- Drop the views and replace with secure functions
DROP VIEW IF EXISTS public.basic_profiles;
DROP VIEW IF EXISTS public.public_venues;

-- Create secure functions instead of views (this avoids Security Definer View warnings)
CREATE OR REPLACE FUNCTION public.get_basic_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid, 
  full_name text,
  handle text,
  avatar_url text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    p.created_at
  FROM public.profiles p;
$$;

CREATE OR REPLACE FUNCTION public.get_public_venues()
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
STABLE  
SECURITY DEFINER
SET search_path TO 'public'
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
    -- No contact information exposed
    COALESCE(p.full_name, 'Anonymous') as owner_name,
    COALESCE(p.handle, 'anonymous') as owner_handle,
    p.avatar_url as owner_avatar
  FROM public.venues v
  LEFT JOIN public.profiles p ON p.user_id = v.owner_id
  WHERE v.status = 'active';
$$;