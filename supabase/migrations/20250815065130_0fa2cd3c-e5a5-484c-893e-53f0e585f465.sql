-- Enable realtime for events table (check if not already added)
ALTER TABLE public.events REPLICA IDENTITY FULL;

-- Enable realtime for event_rsvps table
ALTER TABLE public.event_rsvps REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;

-- Enable realtime for notifications table  
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Try to add events table (might already exist)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION
    WHEN duplicate_object THEN
        -- Table already exists in publication, do nothing
        NULL;
END $$;