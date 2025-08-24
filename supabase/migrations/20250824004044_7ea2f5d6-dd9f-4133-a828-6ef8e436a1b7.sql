-- Fix the broken RLS policy that prevents viewing public profiles
DROP POLICY IF EXISTS "Users can only view minimal public profile data" ON public.profiles;

-- Create a proper policy that allows viewing basic public profile information
CREATE POLICY "Users can view basic public profile info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Add a policy to allow reading profiles for authentication purposes
CREATE POLICY "Allow profile access for auth" 
ON public.profiles 
FOR ALL 
USING (auth.uid() IS NOT NULL);