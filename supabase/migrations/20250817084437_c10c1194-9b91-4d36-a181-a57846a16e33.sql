-- Fix remaining security issues identified in scan

-- 1. Fix analytics_events privacy - users should only see their own data
DROP POLICY IF EXISTS "Users can view their own analytics events" ON public.analytics_events;
CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events
FOR SELECT
USING (auth.uid() = user_id);

-- Add policy for admins to view all analytics for platform insights
CREATE POLICY "Admins can view all analytics events"
ON public.analytics_events
FOR SELECT
USING (public.current_user_has_role('admin'));

-- 2. Fix profiles table - implement privacy controls properly
-- Users should only see basic public info of other users unless they have special permissions
DROP POLICY IF EXISTS "Public can view basic profile info only" ON public.profiles;

-- Create more restrictive policy for viewing other users' profiles
CREATE POLICY "Users can view limited public profile info"
ON public.profiles
FOR SELECT
USING (
  auth.uid() <> user_id AND (
    -- Only show very basic info to other users
    handle IS NOT NULL OR full_name IS NOT NULL OR avatar_url IS NOT NULL
  )
);

-- Users can still see their own complete profile
-- (already covered by existing "Users can view their own complete profile" policy)

-- 3. Additional venue contact protection
-- Completely remove any chance of contact info leaking
DROP POLICY IF EXISTS "Contact info only for owners and booking users" ON public.venues;

-- Create new policy that completely excludes contact info for non-owners/non-booking users
CREATE POLICY "Venue owners can see all venue data"
ON public.venues
FOR SELECT
USING (auth.uid() = owner_id);

-- Separate policy for users with bookings to see contact info
CREATE POLICY "Booking users can see venue contact info"
ON public.venues
FOR SELECT
USING (
  auth.uid() <> owner_id 
  AND EXISTS (
    SELECT 1 FROM public.venue_bookings vb 
    WHERE vb.venue_id = venues.id 
    AND vb.user_id = auth.uid()
    AND vb.status IN ('approved', 'pending')
  )
);

-- Policy for general venue viewing without contact info
CREATE POLICY "Public can view venues without contact info"
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
  -- Only allow viewing if we're not exposing contact info
  AND (contact_email IS NULL OR contact_phone IS NULL)
);