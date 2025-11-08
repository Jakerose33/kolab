-- Update RLS policy to allow viewing published events even with null organizer_id
DROP POLICY IF EXISTS "Events are viewable by everyone when published" ON public.events;

CREATE POLICY "Events are viewable by everyone when published" 
ON public.events 
FOR SELECT 
USING (status = 'published' AND visibility = 'public');