-- Fix remaining security issues from linter

-- Fix function search paths for remaining functions that need it
CREATE OR REPLACE FUNCTION public.increment_job_view_count(job_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs 
  SET view_count = view_count + 1 
  WHERE id = job_uuid AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_application_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs 
  SET application_count = application_count + 1 
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_social_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create activity feed entry for follows and connections
  IF NEW.interaction_type = 'follow' OR NEW.interaction_type = 'connect' THEN
    INSERT INTO activity_feed (
      user_id,
      actor_id,
      action_type,
      target_type,
      target_id,
      metadata
    ) VALUES (
      NEW.target_id, -- The user being followed/connected to
      NEW.user_id,   -- The user doing the action
      NEW.interaction_type,
      NEW.target_type,
      NEW.target_id,
      NEW.metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, full_name text, handle text, avatar_url text, bio text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    p.bio,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, handle)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'handle', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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