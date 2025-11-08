-- Create orders table for venue booking payments
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_booking_id UUID REFERENCES public.venue_bookings(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_intent_id TEXT,
  booking_fee INTEGER DEFAULT 0, -- Platform fee in cents
  venue_owner_amount INTEGER, -- Amount that goes to venue owner
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "users_can_view_own_orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "venue_owners_can_view_orders" ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.venue_bookings vb
      JOIN public.venues v ON v.id = vb.venue_id
      WHERE vb.id = orders.venue_booking_id
      AND v.owner_id = auth.uid()
    )
  );

CREATE POLICY "system_can_manage_orders" ON public.orders
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create payment_methods table for storing user payment methods
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL, -- card, bank_account, etc.
  last4 TEXT,
  brand TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for payment methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_manage_own_payment_methods" ON public.payment_methods
  FOR ALL
  USING (auth.uid() = user_id);

-- Create venue_payouts table for tracking payments to venue owners
CREATE TABLE public.venue_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  stripe_transfer_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  payout_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for venue payouts
ALTER TABLE public.venue_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venue_owners_can_view_own_payouts" ON public.venue_payouts
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "system_can_manage_payouts" ON public.venue_payouts
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add payment status to venue_bookings table
ALTER TABLE public.venue_bookings 
ADD COLUMN payment_status TEXT DEFAULT 'unpaid', -- unpaid, pending, paid, failed
ADD COLUMN stripe_session_id TEXT,
ADD COLUMN requires_payment BOOLEAN DEFAULT true;

-- Create trigger to update timestamps
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_payouts_updated_at
  BEFORE UPDATE ON public.venue_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_venue_booking_id ON public.orders(venue_booking_id);
CREATE INDEX idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_venue_payouts_owner_id ON public.venue_payouts(owner_id);
CREATE INDEX idx_venue_payouts_venue_id ON public.venue_payouts(venue_id);