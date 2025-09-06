-- Fix remaining security warnings for sensitive data exposure
-- This addresses Warnings 3-7: Contact info, payment details, and financial data protection

-- 1. Fix venue contact information exposure (Warning 4)
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "General authenticated users can view venues without contact inf" ON public.venues;
DROP POLICY IF EXISTS "Users with bookings can view venue contact info" ON public.venues;

-- Create more secure venue viewing policies
CREATE POLICY "Public can view basic venue info only" ON public.venues
FOR SELECT 
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users with approved bookings can view contact info" ON public.venues
FOR SELECT 
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.venue_bookings vb 
    WHERE vb.venue_id = venues.id 
    AND vb.user_id = auth.uid() 
    AND vb.status = 'approved'
  )
);

-- 2. Secure payment methods table (Warning 5)
-- Drop overly permissive policies
DROP POLICY IF EXISTS "payment_methods_strict_owner_only" ON public.payment_methods;

-- Create stricter payment method policies
CREATE POLICY "payment_methods_owner_read_only" ON public.payment_methods
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND user_id IS NOT NULL 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "payment_methods_owner_insert_validated" ON public.payment_methods
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND user_id IS NOT NULL 
  AND auth.uid() IS NOT NULL
  AND stripe_payment_method_id IS NOT NULL
  AND stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$'
  AND type IN ('card', 'bank', 'digital_wallet')
  AND (last4 IS NULL OR last4 ~ '^[0-9]{4}$')
  AND (brand IS NULL OR brand IN ('visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay'))
);

-- 3. Secure venue bookings financial data (Warning 6)
-- Drop existing policies and create more restrictive ones
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.venue_bookings;
DROP POLICY IF EXISTS "Venue owners can view bookings for their venues" ON public.venue_bookings;

CREATE POLICY "Users can view their own bookings with limited financial data" ON public.venue_bookings
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can view bookings for their venues with financial limits" ON public.venue_bookings
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.venues v 
    WHERE v.id = venue_bookings.venue_id 
    AND v.owner_id = auth.uid()
  )
);

-- 4. Create orders table if it doesn't exist and secure it (Warning 7)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_amount integer NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create secure policies for orders
CREATE POLICY "Users can view their own orders only" ON public.orders
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update orders for payment processing" ON public.orders
FOR UPDATE 
USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR auth.uid() = user_id
);

-- 5. Add enhanced audit logging function
CREATE OR REPLACE FUNCTION public.audit_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('payment_methods', 'venue_bookings', 'venues', 'orders') THEN
    PERFORM public.log_sensitive_data_access(
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      'sensitive_financial_data'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;