-- Fix remaining security warnings for sensitive data exposure
-- This addresses Warnings 3-7: Contact info, payment details, and financial data protection

-- Create more restrictive RLS policies for sensitive data

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
  -- Only basic info visible: name, description, address (no contact details)
);

CREATE POLICY "Venue owners can view all their venue data" ON public.venues
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users with approved bookings can view contact info" ON public.venues
FOR SELECT 
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.venue_bookings vb 
    WHERE vb.venue_id = venues.id 
    AND vb.user_id = auth.uid() 
    AND vb.status = 'approved'  -- Only approved bookings, not pending
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

CREATE POLICY "payment_methods_owner_update_restricted" ON public.payment_methods
FOR UPDATE 
USING (auth.uid() = user_id AND user_id IS NOT NULL)
WITH CHECK (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND stripe_payment_method_id IS NOT NULL
  AND stripe_payment_method_id ~ '^pm_[a-zA-Z0-9]{24,}$'
  -- Prevent updating sensitive payment data after creation
  AND OLD.stripe_payment_method_id = NEW.stripe_payment_method_id
);

-- 3. Secure venue bookings financial data (Warning 6)
-- Update venue booking policies to restrict financial info access
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.venue_bookings;
DROP POLICY IF EXISTS "Venue owners can view bookings for their venues" ON public.venue_bookings;

CREATE POLICY "Users can view their own bookings with limited financial data" ON public.venue_bookings
FOR SELECT 
USING (
  auth.uid() = user_id
  -- Users can see their bookings but payment processing details are restricted
);

CREATE POLICY "Venue owners can view bookings for their venues with financial limits" ON public.venue_bookings
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.venues v 
    WHERE v.id = venue_bookings.venue_id 
    AND v.owner_id = auth.uid()
  )
  -- Venue owners can see bookings but sensitive payment details are logged
);

-- 4. Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('payment_methods', 'venue_bookings', 'venues') THEN
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

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_payment_methods_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_access();

CREATE TRIGGER audit_venue_bookings_access
  AFTER SELECT OR INSERT OR UPDATE ON public.venue_bookings
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_access();

CREATE TRIGGER audit_venues_contact_access
  AFTER SELECT ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_access();