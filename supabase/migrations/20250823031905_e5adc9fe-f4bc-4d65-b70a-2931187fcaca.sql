-- Insert the missing user IDs first (needed for foreign key constraint)
INSERT INTO public.users (id, email, name, avatar_url) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'organizer1@example.com', 'Underground Collective', '/images/avatars/organizer1.jpg'),
  ('550e8400-e29b-41d4-a716-446655440001', 'organizer2@example.com', 'Warehouse Events', '/images/avatars/organizer2.jpg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'organizer3@example.com', 'Secret Society', '/images/avatars/organizer3.jpg')
ON CONFLICT (id) DO NOTHING;