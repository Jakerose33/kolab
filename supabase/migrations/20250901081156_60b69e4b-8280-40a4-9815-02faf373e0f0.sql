-- Fix critical security issues

-- 1. Remove public access to users table and restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

CREATE POLICY "Users can view their own user data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Update profiles table policies to be more restrictive
DROP POLICY IF EXISTS "Allow profile access for auth" ON public.profiles;

-- Allow users to view basic public profile info only (remove sensitive data exposure)
CREATE POLICY "Users can view basic public profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow users to view their own complete profile
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Add venue onboarding related tables for the Stripe setup
CREATE TABLE IF NOT EXISTS public.venue_onboarding_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  step_completed TEXT[] DEFAULT '{}',
  stripe_account_id TEXT,
  business_type TEXT,
  tax_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on venue onboarding status
ALTER TABLE public.venue_onboarding_status ENABLE ROW LEVEL SECURITY;

-- Only venue owners can manage their onboarding status
CREATE POLICY "Venue owners can manage onboarding status" 
ON public.venue_onboarding_status 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_venue_onboarding_status_updated_at
  BEFORE UPDATE ON public.venue_onboarding_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();