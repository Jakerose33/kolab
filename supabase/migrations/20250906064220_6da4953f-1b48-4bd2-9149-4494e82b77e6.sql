-- Fix remaining security issues with corrected trigger syntax
-- Fix the previous SQL error and complete security hardening

-- 1. Create orders table if it doesn't exist and secure it (Warning 7)
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

-- 2. Add enhanced audit logging function for financial operations
CREATE OR REPLACE FUNCTION public.audit_financial_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log access to financial tables
  PERFORM public.log_sensitive_data_access(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    'financial_operation'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Apply audit triggers to sensitive tables (INSERT/UPDATE/DELETE only)
CREATE TRIGGER audit_payment_methods_financial
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.audit_financial_access();

CREATE TRIGGER audit_venue_bookings_financial  
  AFTER INSERT OR UPDATE OR DELETE ON public.venue_bookings
  FOR EACH ROW EXECUTE FUNCTION public.audit_financial_access();

CREATE TRIGGER audit_orders_financial
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_financial_access();

-- 3. Create function to securely mask contact information
CREATE OR REPLACE FUNCTION public.get_masked_venue_contact(venue_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  address text,
  contact_masked text,
  latitude numeric,
  longitude numeric,
  capacity integer,
  hourly_rate numeric,
  tags text[],
  amenities text[],
  images text[],
  opening_hours jsonb,
  status text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    v.id,
    v.name,
    v.description,
    v.address,
    -- Only show contact info to venue owner or users with approved bookings
    CASE 
      WHEN auth.uid() = v.owner_id THEN CONCAT('Email: ', v.contact_email, ', Phone: ', v.contact_phone)
      WHEN EXISTS (
        SELECT 1 FROM public.venue_bookings vb 
        WHERE vb.venue_id = v.id 
        AND vb.user_id = auth.uid()
        AND vb.status = 'approved'
      ) THEN CONCAT('Email: ', v.contact_email, ', Phone: ', v.contact_phone)
      ELSE 'Contact info available after booking approval'
    END as contact_masked,
    v.latitude,
    v.longitude,
    v.capacity,
    v.hourly_rate,
    v.tags,
    v.amenities,
    v.images,
    v.opening_hours,
    v.status,
    v.created_at
  FROM public.venues v
  WHERE v.id = venue_id
    AND v.status = 'active';
$function$;

-- 4. Update remaining functions to have proper search_path (Fix Warning 1)
CREATE OR REPLACE FUNCTION public.process_offline_action(p_user_id uuid, p_action_type text, p_action_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result BOOLEAN := false;
BEGIN
  -- Process different types of offline actions
  CASE p_action_type
    WHEN 'create_event_rsvp' THEN
      INSERT INTO public.event_rsvps (user_id, event_id, status)
      VALUES (
        p_user_id,
        (p_action_data ->> 'event_id')::UUID,
        p_action_data ->> 'status'
      )
      ON CONFLICT (user_id, event_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        updated_at = now();
      result := true;
      
    WHEN 'create_venue_booking' THEN
      INSERT INTO public.venue_bookings (
        user_id, venue_id, start_date, end_date, 
        guest_count, event_type, message
      )
      VALUES (
        p_user_id,
        (p_action_data ->> 'venue_id')::UUID,
        (p_action_data ->> 'start_date')::TIMESTAMP WITH TIME ZONE,
        (p_action_data ->> 'end_date')::TIMESTAMP WITH TIME ZONE,
        (p_action_data ->> 'guest_count')::INTEGER,
        p_action_data ->> 'event_type',
        p_action_data ->> 'message'
      );
      result := true;
      
    WHEN 'send_message' THEN
      INSERT INTO public.messages (
        sender_id, recipient_id, content, message_type
      )
      VALUES (
        p_user_id,
        (p_action_data ->> 'recipient_id')::UUID,
        p_action_data ->> 'content',
        COALESCE(p_action_data ->> 'message_type', 'text')
      );
      result := true;
      
    ELSE
      -- Unknown action type
      result := false;
  END CASE;
  
  RETURN result;
END;
$function$;

-- 5. Create secure email masking function (Fix Warning 3)
CREATE OR REPLACE FUNCTION public.get_masked_user_info(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  handle text,
  avatar_url text,
  contact_status text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.handle,
    p.avatar_url,
    -- Never expose email, only provide contact status
    CASE 
      WHEN auth.uid() = p.user_id THEN 'Own Profile'
      WHEN public.get_user_privacy_setting(p.user_id, 'show_website') AND p.website IS NOT NULL THEN 'Contact via website'
      WHEN public.get_user_privacy_setting(p.user_id, 'show_linkedin') AND p.linkedin_url IS NOT NULL THEN 'Contact via LinkedIn'
      ELSE 'Private profile'
    END as contact_status,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$function$;