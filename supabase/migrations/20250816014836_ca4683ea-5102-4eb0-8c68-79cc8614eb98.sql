-- Temporarily allow null organizer_id to add sample events
ALTER TABLE public.events ALTER COLUMN organizer_id DROP NOT NULL;

-- Insert sample events with null organizer_id for now
INSERT INTO public.events (
  title, description, start_at, end_at, 
  venue_name, venue_address, capacity, status, visibility,
  image_url, tags
) VALUES 
(
  'Midnight Jazz at The Underground',
  'Experience intimate jazz in our dimly lit underground venue. Tonight features local musicians creating soulful melodies in an atmospheric setting perfect for jazz enthusiasts.',
  NOW() + INTERVAL '3 hours',
  NOW() + INTERVAL '6 hours',
  'The Underground Jazz Club',
  '15 Basement Level, Old Street, London EC1V 9HH',
  50,
  'published',
  'public',
  '/images/events/midnight-jazz.jpg',
  ARRAY['jazz', 'music', 'underground', 'intimate']
),
(
  'Street Art Gallery Opening',
  'Discover the latest in underground street art at this exclusive gallery opening featuring works from emerging artists across the city.',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 4 hours',
  'Urban Canvas Gallery',
  '23 Brick Lane, London E1 6QR',
  80,
  'published',
  'public',
  '/images/events/street-art-opening.jpg',
  ARRAY['art', 'gallery', 'street art', 'opening']
),
(
  'Underground Market Night',
  'Explore unique vendors, artisanal goods, and street food in this atmospheric underground market. A perfect evening of discovery and culture.',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days 5 hours',
  'The Vaults Market',
  'Leake Street Arches, London SE1 7NN',
  200,
  'published',
  'public',
  '/images/events/underground-market.jpg',
  ARRAY['market', 'food', 'vendors', 'underground']
),
(
  'Warehouse Rave: Electronic Nights',
  'Dance until dawn at this underground electronic music event in a converted warehouse space with cutting-edge sound and lighting.',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days 8 hours',
  'Printworks Warehouse',
  'Surrey Quays Road, London SE16 2XU',
  500,
  'published',
  'public',
  '/images/events/warehouse-rave.jpg',
  ARRAY['electronic', 'rave', 'warehouse', 'dance']
)