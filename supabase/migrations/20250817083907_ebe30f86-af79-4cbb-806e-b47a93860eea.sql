-- Create proper role system to replace bio-based role checking

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = check_role
  );
$$;

-- Create function to check if current user has role
CREATE OR REPLACE FUNCTION public.current_user_has_role(check_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), check_role);
$$;

-- Create function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(check_user_id, 'admin') OR public.has_role(check_user_id, 'moderator');
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.current_user_has_role('admin'));

CREATE POLICY "Admins can assign roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.current_user_has_role('admin') AND auth.uid() = assigned_by);

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.current_user_has_role('admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.current_user_has_role('admin'));

-- Update admin_metrics policies to use proper role checking
DROP POLICY IF EXISTS "Only admins can view metrics" ON public.admin_metrics;
CREATE POLICY "Only admins can view metrics"
ON public.admin_metrics
FOR SELECT
USING (public.current_user_has_role('admin'));

-- Update platform_analytics policies
DROP POLICY IF EXISTS "Only admins can view platform analytics" ON public.platform_analytics;
CREATE POLICY "Only admins can view platform analytics"
ON public.platform_analytics
FOR SELECT
USING (public.current_user_has_role('admin'));

-- Update content_reports policies
DROP POLICY IF EXISTS "Moderators can view all reports" ON public.content_reports;
DROP POLICY IF EXISTS "Moderators can update reports" ON public.content_reports;

CREATE POLICY "Moderators can view all reports"
ON public.content_reports
FOR SELECT
USING (public.is_admin_or_moderator());

CREATE POLICY "Moderators can update reports"
ON public.content_reports
FOR UPDATE
USING (public.is_admin_or_moderator());

-- Update moderation_log policies
DROP POLICY IF EXISTS "Moderators can view moderation log" ON public.moderation_log;
DROP POLICY IF EXISTS "Moderators can create log entries" ON public.moderation_log;

CREATE POLICY "Moderators can view moderation log"
ON public.moderation_log
FOR SELECT
USING (public.is_admin_or_moderator());

CREATE POLICY "Moderators can create log entries"
ON public.moderation_log
FOR INSERT
WITH CHECK (public.is_admin_or_moderator() AND auth.uid() = moderator_id);

-- Update user_suspensions policies
DROP POLICY IF EXISTS "Moderators can manage suspensions" ON public.user_suspensions;
CREATE POLICY "Moderators can manage suspensions"
ON public.user_suspensions
FOR ALL
USING (public.is_admin_or_moderator());

-- Secure analytics events - only authenticated users can insert
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix venues table RLS policies - remove conflicting policies and ensure proper contact info protection
DROP POLICY IF EXISTS "Deny contact info access to general users" ON public.venues;

-- Ensure only venue owners and users with bookings can see contact info
CREATE POLICY "Contact info only for owners and booking users"
ON public.venues
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() = owner_id THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.venue_bookings vb 
      WHERE vb.venue_id = venues.id 
      AND vb.user_id = auth.uid()
      AND vb.status IN ('approved', 'pending')
    ) THEN true
    ELSE (contact_email IS NULL AND contact_phone IS NULL)
  END
);