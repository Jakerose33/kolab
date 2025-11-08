-- Enable realtime replica identity for all tables
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_rsvps REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add only event_rsvps to realtime publication (others likely already exist)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;
EXCEPTION
    WHEN duplicate_object THEN
        -- Table already exists in publication, do nothing
        NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
    WHEN duplicate_object THEN
        -- Table already exists in publication, do nothing
        NULL;
END $$;