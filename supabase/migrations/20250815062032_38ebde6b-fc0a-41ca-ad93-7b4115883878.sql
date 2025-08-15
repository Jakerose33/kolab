-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  hourly_rate DECIMAL(10, 2),
  tags TEXT[],
  amenities TEXT[],
  images TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  opening_hours JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policies for venues
CREATE POLICY "Active venues are viewable by everyone" 
ON public.venues 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can view their own venues" 
ON public.venues 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create venues" 
ON public.venues 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own venues" 
ON public.venues 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own venues" 
ON public.venues 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create venue bookings table
CREATE TABLE public.venue_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  guest_count INTEGER NOT NULL,
  event_type TEXT,
  special_requests TEXT,
  total_amount DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message TEXT,
  owner_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for bookings
ALTER TABLE public.venue_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for venue bookings
CREATE POLICY "Users can view their own bookings" 
ON public.venue_bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can view bookings for their venues" 
ON public.venue_bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = venue_bookings.venue_id 
    AND venues.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create bookings" 
ON public.venue_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.venue_bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can update bookings for their venues" 
ON public.venue_bookings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = venue_bookings.venue_id 
    AND venues.owner_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_bookings_updated_at
  BEFORE UPDATE ON public.venue_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_venues_owner_id ON public.venues(owner_id);
CREATE INDEX idx_venues_status ON public.venues(status);
CREATE INDEX idx_venues_location ON public.venues(latitude, longitude);
CREATE INDEX idx_venues_tags ON public.venues USING GIN(tags);
CREATE INDEX idx_venue_bookings_user_id ON public.venue_bookings(user_id);
CREATE INDEX idx_venue_bookings_venue_id ON public.venue_bookings(venue_id);
CREATE INDEX idx_venue_bookings_dates ON public.venue_bookings(start_date, end_date);
CREATE INDEX idx_venue_bookings_status ON public.venue_bookings(status);