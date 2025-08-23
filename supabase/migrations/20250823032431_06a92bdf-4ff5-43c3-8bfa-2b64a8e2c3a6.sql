-- Temporarily disable the foreign key constraint
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;

-- Clear existing data
DELETE FROM public.events;
DELETE FROM public.users;

-- Insert sample users
INSERT INTO public.users (id, email, name, avatar_url) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'organizer1@example.com', 'Underground Collective', '/images/avatars/organizer1.jpg'),
  ('550e8400-e29b-41d4-a716-446655440001', 'organizer2@example.com', 'Warehouse Events', '/images/avatars/organizer2.jpg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'organizer3@example.com', 'Secret Society', '/images/avatars/organizer3.jpg');

-- Insert sample events
INSERT INTO public.events (id, title, description, start_at, end_at, venue_name, venue_address, organizer_id, image_url, tags, status, visibility) VALUES 
  ('660e8400-e29b-41d4-a716-446655440000', 'Underground Jazz Night', 'Intimate jazz session in a hidden basement venue', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '4 hours', 'Secret Basement', 'Downtown District', '550e8400-e29b-41d4-a716-446655440000', '/images/events/midnight-jazz.jpg', ARRAY['music', 'jazz'], 'published', 'public'),
  ('660e8400-e29b-41d4-a716-446655440001', 'Warehouse Rave', 'Electronic music and visual arts in an industrial space', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '6 hours', 'Warehouse District', 'Industrial Zone', '550e8400-e29b-41d4-a716-446655440001', '/images/events/warehouse-rave.jpg', ARRAY['music', 'electronic'], 'published', 'public'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Street Art Opening', 'Gallery opening featuring underground street artists', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours', 'Underground Gallery', 'Arts District', '550e8400-e29b-41d4-a716-446655440002', '/images/events/street-art-opening.jpg', ARRAY['art', 'gallery'], 'published', 'public');

-- Re-enable the foreign key constraint
ALTER TABLE public.events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES public.users(id);