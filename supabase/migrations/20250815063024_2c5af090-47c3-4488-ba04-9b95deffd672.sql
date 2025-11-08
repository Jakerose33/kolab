-- Create analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for analytics events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics events
CREATE POLICY "Users can view their own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Create admin analytics views
CREATE TABLE public.admin_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_name, date_recorded)
);

-- Enable RLS for admin metrics
ALTER TABLE public.admin_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for admin metrics (only for admin users)
CREATE POLICY "Only admins can view metrics" 
ON public.admin_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.bio LIKE '%admin%'
  )
);

CREATE POLICY "Only system can insert metrics" 
ON public.admin_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create function to calculate daily metrics
CREATE OR REPLACE FUNCTION public.calculate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Calculate user signups
  INSERT INTO public.admin_metrics (metric_name, metric_value)
  VALUES (
    'daily_signups',
    (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'date', CURRENT_DATE
      )
      FROM public.profiles
      WHERE DATE(created_at) = CURRENT_DATE
    )
  )
  ON CONFLICT (metric_name, date_recorded) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Calculate events created
  INSERT INTO public.admin_metrics (metric_name, metric_value)
  VALUES (
    'daily_events_created',
    (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'date', CURRENT_DATE
      )
      FROM public.events
      WHERE DATE(created_at) = CURRENT_DATE
    )
  )
  ON CONFLICT (metric_name, date_recorded) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Calculate venue bookings
  INSERT INTO public.admin_metrics (metric_name, metric_value)
  VALUES (
    'daily_bookings',
    (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'date', CURRENT_DATE
      )
      FROM public.venue_bookings
      WHERE DATE(created_at) = CURRENT_DATE
    )
  )
  ON CONFLICT (metric_name, date_recorded) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Calculate RSVPs
  INSERT INTO public.admin_metrics (metric_name, metric_value)
  VALUES (
    'daily_rsvps',
    (
      SELECT jsonb_build_object(
        'count', COUNT(*),
        'going', COUNT(*) FILTER (WHERE status = 'going'),
        'interested', COUNT(*) FILTER (WHERE status = 'interested'),
        'date', CURRENT_DATE
      )
      FROM public.event_rsvps
      WHERE DATE(created_at) = CURRENT_DATE
    )
  )
  ON CONFLICT (metric_name, date_recorded) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_admin_metrics_date ON public.admin_metrics(date_recorded);
CREATE INDEX idx_admin_metrics_name ON public.admin_metrics(metric_name);