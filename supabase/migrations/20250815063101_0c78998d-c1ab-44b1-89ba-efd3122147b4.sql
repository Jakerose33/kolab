-- Fix security warning: Update function search path to be immutable
CREATE OR REPLACE FUNCTION public.calculate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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