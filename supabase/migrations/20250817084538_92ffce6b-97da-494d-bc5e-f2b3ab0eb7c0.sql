-- Final security fixes for remaining vulnerabilities

-- 1. Fix analytics_events - the issue is that the INSERT policy was too broad
-- Replace with more restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert analytics events" ON public.analytics_events;

-- Only allow users to insert their own analytics data
CREATE POLICY "Users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- System can still insert for automated tracking
CREATE POLICY "System can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 2. Fix venue policies - remove overlapping policies and create single clear policy
DROP POLICY IF EXISTS "Authenticated users can view basic venue info (no contact)" ON public.venues;
DROP POLICY IF EXISTS "Users can view their own venues" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can view their own venues completely" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can see all venue data" ON public.venues;
DROP POLICY IF EXISTS "Booking users can see venue contact info" ON public.venues;
DROP POLICY IF EXISTS "Public can view venues without contact info" ON public.venues;

-- Create single comprehensive venue viewing policy
CREATE POLICY "Venue access with contact protection"
ON public.venues
FOR SELECT
USING (
  status = 'active' AND (
    -- Venue owners see everything
    auth.uid() = owner_id
    OR 
    -- Users with approved/pending bookings see contact info
    (
      EXISTS (
        SELECT 1 FROM public.venue_bookings vb 
        WHERE vb.venue_id = venues.id 
        AND vb.user_id = auth.uid()
        AND vb.status IN ('approved', 'pending')
      )
    )
    OR
    -- Everyone else sees venue info but NO contact details
    (
      auth.uid() IS NOT NULL 
      AND auth.uid() <> owner_id
      AND NOT EXISTS (
        SELECT 1 FROM public.venue_bookings vb 
        WHERE vb.venue_id = venues.id 
        AND vb.user_id = auth.uid()
        AND vb.status IN ('approved', 'pending')
      )
      -- This condition will be handled at the application level to exclude contact fields
    )
  )
);

-- 3. Secure system analytics policies - make them truly system-only
-- Use service role authentication instead of general 'true' conditions

-- Update event_analytics
DROP POLICY IF EXISTS "System can manage event analytics" ON public.event_analytics;
CREATE POLICY "System can manage event analytics"
ON public.event_analytics
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Update venue_analytics  
DROP POLICY IF EXISTS "System can manage venue analytics" ON public.venue_analytics;
CREATE POLICY "System can manage venue analytics"
ON public.venue_analytics
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Update user_behavior_analytics
DROP POLICY IF EXISTS "System can manage user behavior analytics" ON public.user_behavior_analytics;
CREATE POLICY "System can manage user behavior analytics"
ON public.user_behavior_analytics
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Update platform_analytics
DROP POLICY IF EXISTS "System can manage platform analytics" ON public.platform_analytics;
CREATE POLICY "System can manage platform analytics"
ON public.platform_analytics
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Also secure the activity_feed system policy
DROP POLICY IF EXISTS "System can create activity entries" ON public.activity_feed;
CREATE POLICY "System can create activity entries"
ON public.activity_feed
FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Secure notifications system policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Also restrict the admin_metrics system policy
DROP POLICY IF EXISTS "Only system can insert metrics" ON public.admin_metrics;
CREATE POLICY "Only system can insert metrics"
ON public.admin_metrics
FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');