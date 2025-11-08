-- Fix all remaining critical security issues

-- 1. Fix users table exposure - prevent public access to email addresses
DROP POLICY IF EXISTS "Users can view their own user data" ON public.users;

-- Create restrictive policy for users table
CREATE POLICY "Users can only view their own user data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Ensure no public access to users table
-- (Only authenticated users can see their own record)

-- 2. Fix payment_methods table - ensure only users can see their own payment methods
-- Check existing policies first, then add if missing
DROP POLICY IF EXISTS "users_can_manage_own_payment_methods" ON public.payment_methods;

CREATE POLICY "Users can only access their own payment methods" 
ON public.payment_methods 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Fix messages table - ensure only participants can access messages
-- The existing policies should be sufficient, but let's verify and strengthen them
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own sent messages" ON public.messages;
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.messages;

-- Create comprehensive message policies
CREATE POLICY "Users can view messages they sent or received" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = recipient_id AND read_at IS NULL);

-- 4. Fix orders table - ensure only users and relevant venue owners can see orders
DROP POLICY IF EXISTS "users_can_view_own_orders" ON public.orders;
DROP POLICY IF EXISTS "venue_owners_can_view_orders" ON public.orders;
DROP POLICY IF EXISTS "system_can_manage_orders" ON public.orders;

-- Create comprehensive order policies
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can view orders for their venues" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.venue_bookings vb
    JOIN public.venues v ON v.id = vb.venue_id
    WHERE vb.id = orders.venue_booking_id 
    AND v.owner_id = auth.uid()
  )
);

CREATE POLICY "System can manage orders" 
ON public.orders 
FOR ALL 
USING (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- 5. Fix venue_payouts table - ensure only venue owners can see their payouts
DROP POLICY IF EXISTS "venue_owners_can_view_own_payouts" ON public.venue_payouts;
DROP POLICY IF EXISTS "system_can_manage_payouts" ON public.venue_payouts;

-- Create restrictive venue payout policies
CREATE POLICY "Venue owners can only view their own payouts" 
ON public.venue_payouts 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "System can manage venue payouts" 
ON public.venue_payouts 
FOR ALL 
USING (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- 6. Ensure analytics_events table is properly secured
-- Fix any remaining analytics policies
DROP POLICY IF EXISTS "Users can insert anonymous analytics only" ON public.analytics_events;
DROP POLICY IF EXISTS "Only authenticated users can insert their own analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view aggregated analytics only" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view only their own sanitized analytics" ON public.analytics_events;

-- Create secure analytics policies
CREATE POLICY "Users can insert their own analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (
  (user_id IS NULL) OR (auth.uid() = user_id)
);

CREATE POLICY "Users can view their own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (
  (auth.uid() = user_id AND user_id IS NOT NULL)
);

CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (
  public.current_user_has_role('admin'::app_role)
);

-- 7. Add comments to document security approach
COMMENT ON TABLE public.users IS 
'SECURITY: Users can only view their own record. No public access to email addresses.';

COMMENT ON TABLE public.payment_methods IS 
'SECURITY: Users can only access their own payment methods. No public access to financial data.';

COMMENT ON TABLE public.messages IS 
'SECURITY: Only message participants (sender/recipient) can access message content.';

COMMENT ON TABLE public.orders IS 
'SECURITY: Only order owners and relevant venue owners can view order data.';

COMMENT ON TABLE public.venue_payouts IS 
'SECURITY: Only venue owners can view their own payout information.';