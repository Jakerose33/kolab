-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create activity feed table for real-time updates
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_feed
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity feed
CREATE POLICY "Users can view their own activity feed"
ON public.activity_feed FOR SELECT
USING (auth.uid() = user_id);

-- System can create activity entries
CREATE POLICY "System can create activity entries"
ON public.activity_feed FOR INSERT
WITH CHECK (true);

-- Enable realtime for activity_feed
ALTER TABLE public.activity_feed REPLICA IDENTITY FULL;

-- Create user notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  booking_confirmations BOOLEAN NOT NULL DEFAULT true,
  event_reminders BOOLEAN NOT NULL DEFAULT true,
  new_messages BOOLEAN NOT NULL DEFAULT true,
  event_updates BOOLEAN NOT NULL DEFAULT true,
  moderation_updates BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for notification preferences timestamp updates
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create activity feed entry
CREATE OR REPLACE FUNCTION public.create_activity_entry(
  p_user_id UUID,
  p_actor_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

-- Function to create notification with activity entry
CREATE OR REPLACE FUNCTION public.create_notification_with_activity(
  p_user_id UUID,
  p_actor_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_action_type TEXT DEFAULT 'notification',
  p_target_type TEXT DEFAULT 'general'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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