-- Create push subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for push subscriptions timestamp updates
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create offline queue table for actions performed while offline
CREATE TABLE public.offline_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3
);

-- Enable RLS on offline_queue
ALTER TABLE public.offline_queue ENABLE ROW LEVEL SECURITY;

-- Users can manage their own offline queue
CREATE POLICY "Users can manage their own offline queue"
ON public.offline_queue FOR ALL
USING (auth.uid() = user_id);

-- Function to process offline queue
CREATE OR REPLACE FUNCTION public.process_offline_action(
  p_user_id UUID,
  p_action_type TEXT,
  p_action_data JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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