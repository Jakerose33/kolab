-- Fix the missing foreign key relationship for organizer_id in events table
-- First, let's create a basic users table if it doesn't exist for organizers
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Now ensure the events table has the proper foreign key relationship
-- First check if organizer_id column exists and add foreign key constraint
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_organizer_id_fkey' 
    AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events 
    ADD CONSTRAINT events_organizer_id_fkey 
    FOREIGN KEY (organizer_id) REFERENCES public.users(id);
  END IF;
END $$;

-- Create some sample users and events if the tables are empty
INSERT INTO public.users (id, email, name, avatar_url) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'organizer1@example.com', 'Underground Collective', '/images/avatars/organizer1.jpg'),
  ('550e8400-e29b-41d4-a716-446655440001', 'organizer2@example.com', 'Warehouse Events', '/images/avatars/organizer2.jpg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'organizer3@example.com', 'Secret Society', '/images/avatars/organizer3.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample events if table is empty
INSERT INTO public.events (id, title, description, start_time, end_time, location, organizer_id, ticket_url, booking_url, image_url, category, rsvp_going_count, rsvp_interested_count) VALUES 
  ('660e8400-e29b-41d4-a716-446655440000', 'Underground Jazz Night', 'Intimate jazz session in a hidden basement venue', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '4 hours', 'Secret Basement, Downtown', '550e8400-e29b-41d4-a716-446655440000', 'https://tickets.example.com/jazz', NULL, '/images/events/midnight-jazz.jpg', 'music', 45, 23),
  ('660e8400-e29b-41d4-a716-446655440001', 'Warehouse Rave', 'Electronic music and visual arts in an industrial space', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '6 hours', 'Warehouse District', '550e8400-e29b-41d4-a716-446655440001', NULL, 'https://booking.example.com/rave', '/images/events/warehouse-rave.jpg', 'music', 120, 87),
  ('660e8400-e29b-41d4-a716-446655440002', 'Street Art Opening', 'Gallery opening featuring underground street artists', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours', 'Underground Gallery', '550e8400-e29b-41d4-a716-446655440002', NULL, NULL, '/images/events/street-art-opening.jpg', 'art', 67, 34)
ON CONFLICT (id) DO NOTHING;