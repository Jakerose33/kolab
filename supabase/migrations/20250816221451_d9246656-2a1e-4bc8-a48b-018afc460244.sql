-- **SECURITY FIX: Update Security Definer Functions with Proper Search Path**
-- This addresses the security linter warning about functions with SECURITY DEFINER
-- All SECURITY DEFINER functions must have explicit search_path settings

-- 1. Fix is_user_suspended function
CREATE OR REPLACE FUNCTION public.is_user_suspended(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_suspensions
    WHERE user_suspensions.user_id = is_user_suspended.user_id
    AND (
      is_permanent = true 
      OR (end_date IS NOT NULL AND end_date > now())
    )
  );
END;
$$;

-- 2. Fix is_user_blocked function
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_id uuid, blocked_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE user_blocks.blocker_id = is_user_blocked.blocker_id
    AND user_blocks.blocked_id = is_user_blocked.blocked_id
  );
END;
$$;

-- 3. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Fix handle_new_user function
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

-- 5. Fix calculate_daily_metrics function
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

-- 6. Fix create_activity_entry function
CREATE OR REPLACE FUNCTION public.create_activity_entry(p_user_id uuid, p_actor_id uuid, p_action_type text, p_target_type text, p_target_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activity_feed (
    user_id, actor_id, action_type, target_type, target_id, metadata
  ) VALUES (
    p_user_id, p_actor_id, p_action_type, p_target_type, p_target_id, p_metadata
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- 7. Fix create_notification_with_activity function
CREATE OR REPLACE FUNCTION public.create_notification_with_activity(p_user_id uuid, p_actor_id uuid, p_title text, p_message text, p_type text, p_related_id uuid DEFAULT NULL::uuid, p_action_type text DEFAULT 'notification'::text, p_target_type text DEFAULT 'general'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
  activity_id UUID;
BEGIN
  -- Create notification
  INSERT INTO public.notifications (
    user_id, title, message, type, related_id
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_related_id
  ) RETURNING id INTO notification_id;
  
  -- Create activity entry
  SELECT public.create_activity_entry(
    p_user_id, p_actor_id, p_action_type, p_target_type, p_related_id,
    jsonb_build_object('notification_id', notification_id, 'title', p_title)
  ) INTO activity_id;
  
  RETURN notification_id;
END;
$$;

-- 8. Fix process_offline_action function
CREATE OR REPLACE FUNCTION public.process_offline_action(p_user_id uuid, p_action_type text, p_action_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result BOOLEAN := false;
BEGIN
  -- Process different types of offline actions
  CASE p_action_type
    WHEN 'create_event_rsvp' THEN
      INSERT INTO public.event_rsvps (user_id, event_id, status)
      VALUES (
        p_user_id,
        (p_action_data ->> 'event_id')::UUID,
        p_action_data ->> 'status'
      )
      ON CONFLICT (user_id, event_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        updated_at = now();
      result := true;
      
    WHEN 'create_venue_booking' THEN
      INSERT INTO public.venue_bookings (
        user_id, venue_id, start_date, end_date, 
        guest_count, event_type, message
      )
      VALUES (
        p_user_id,
        (p_action_data ->> 'venue_id')::UUID,
        (p_action_data ->> 'start_date')::TIMESTAMP WITH TIME ZONE,
        (p_action_data ->> 'end_date')::TIMESTAMP WITH TIME ZONE,
        (p_action_data ->> 'guest_count')::INTEGER,
        p_action_data ->> 'event_type',
        p_action_data ->> 'message'
      );
      result := true;
      
    WHEN 'send_message' THEN
      INSERT INTO public.messages (
        sender_id, recipient_id, content, message_type
      )
      VALUES (
        p_user_id,
        (p_action_data ->> 'recipient_id')::UUID,
        p_action_data ->> 'content',
        COALESCE(p_action_data ->> 'message_type', 'text')
      );
      result := true;
      
    ELSE
      -- Unknown action type
      result := false;
  END CASE;
  
  RETURN result;
END;
$$;

-- 9. Fix track_event_view function
CREATE OR REPLACE FUNCTION public.track_event_view(p_event_id uuid, p_user_id uuid DEFAULT NULL::uuid, p_is_unique boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 10. Add comments documenting the security fix
COMMENT ON FUNCTION public.is_user_suspended(uuid) 
IS 'SECURITY DEFINER with proper search_path - safe for RLS bypass';
COMMENT ON FUNCTION public.is_user_blocked(uuid, uuid) 
IS 'SECURITY DEFINER with proper search_path - safe for RLS bypass';