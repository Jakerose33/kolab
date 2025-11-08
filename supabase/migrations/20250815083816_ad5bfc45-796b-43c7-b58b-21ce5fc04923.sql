-- Create analytics dashboard tables
CREATE TABLE public.event_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  organizer_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  unique_views INTEGER NOT NULL DEFAULT 0,
  rsvp_conversions INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, date)
);

-- Enable RLS on event_analytics
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- Organizers can view their own event analytics
CREATE POLICY "Organizers can view their own event analytics"
ON public.event_analytics FOR SELECT
USING (auth.uid() = organizer_id);

-- System can manage event analytics
CREATE POLICY "System can manage event analytics"
ON public.event_analytics FOR ALL
USING (true);

-- Create venue analytics table
CREATE TABLE public.venue_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  unique_views INTEGER NOT NULL DEFAULT 0,
  booking_requests INTEGER NOT NULL DEFAULT 0,
  booking_conversions INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2),
  occupancy_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(venue_id, date)
);

-- Enable RLS on venue_analytics
ALTER TABLE public.venue_analytics ENABLE ROW LEVEL SECURITY;

-- Venue owners can view their own venue analytics
CREATE POLICY "Venue owners can view their own venue analytics"
ON public.venue_analytics FOR SELECT
USING (auth.uid() = owner_id);

-- System can manage venue analytics
CREATE POLICY "System can manage venue analytics"
ON public.venue_analytics FOR ALL
USING (true);

-- Create user behavior analytics table
CREATE TABLE public.user_behavior_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sessions INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  events_viewed INTEGER NOT NULL DEFAULT 0,
  events_created INTEGER NOT NULL DEFAULT 0,
  bookings_made INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  search_queries INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on user_behavior_analytics
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own behavior analytics
CREATE POLICY "Users can view their own behavior analytics"
ON public.user_behavior_analytics FOR SELECT
USING (auth.uid() = user_id);

-- System can manage user behavior analytics
CREATE POLICY "System can manage user behavior analytics"
ON public.user_behavior_analytics FOR ALL
USING (true);

-- Create platform analytics table
CREATE TABLE public.platform_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  total_events INTEGER NOT NULL DEFAULT 0,
  new_events INTEGER NOT NULL DEFAULT 0,
  total_venues INTEGER NOT NULL DEFAULT 0,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  retention_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS on platform_analytics
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can view platform analytics
CREATE POLICY "Only admins can view platform analytics"
ON public.platform_analytics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = auth.uid() 
  AND profiles.bio ~~* '%admin%'
));

-- System can manage platform analytics
CREATE POLICY "System can manage platform analytics"
ON public.platform_analytics FOR ALL
USING (true);

-- Create triggers for analytics tables
CREATE TRIGGER update_event_analytics_updated_at
BEFORE UPDATE ON public.event_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_analytics_updated_at
BEFORE UPDATE ON public.venue_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_behavior_analytics_updated_at
BEFORE UPDATE ON public.user_behavior_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_analytics_updated_at
BEFORE UPDATE ON public.platform_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(
  p_views INTEGER,
  p_rsvps INTEGER,
  p_shares INTEGER,
  p_comments INTEGER DEFAULT 0
) RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  score DECIMAL(5,2);
  view_weight DECIMAL(3,2) := 0.1;
  rsvp_weight DECIMAL(3,2) := 0.5;
  share_weight DECIMAL(3,2) := 0.3;
  comment_weight DECIMAL(3,2) := 0.1;
BEGIN
  -- Calculate weighted engagement score
  score := (p_views * view_weight) + 
           (p_rsvps * rsvp_weight) + 
           (p_shares * share_weight) + 
           (p_comments * comment_weight);
  
  -- Normalize to 0-100 scale
  score := LEAST(100, score);
  
  RETURN score;
END;
$$;

-- Function to update analytics when events are viewed
CREATE OR REPLACE FUNCTION public.track_event_view(
  p_event_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_is_unique BOOLEAN DEFAULT FALSE
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  organizer_user_id UUID;
BEGIN
  -- Get organizer ID
  SELECT organizer_id INTO organizer_user_id
  FROM public.events
  WHERE id = p_event_id;
  
  IF organizer_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Update or insert event analytics
  INSERT INTO public.event_analytics (
    event_id, organizer_id, views, unique_views
  )
  VALUES (
    p_event_id, organizer_user_id, 1, CASE WHEN p_is_unique THEN 1 ELSE 0 END
  )
  ON CONFLICT (event_id, date)
  DO UPDATE SET
    views = event_analytics.views + 1,
    unique_views = event_analytics.unique_views + CASE WHEN p_is_unique THEN 1 ELSE 0 END,
    updated_at = now();
    
  -- Update user behavior analytics if user is provided
  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.user_behavior_analytics (
      user_id, events_viewed
    )
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      events_viewed = user_behavior_analytics.events_viewed + 1,
      updated_at = now();
  END IF;
END;
$$;