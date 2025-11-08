-- Security Fix: Resolve conflicting RLS policies on users table
-- Issue: Multiple PERMISSIVE policies create potential security vulnerabilities

-- Step 1: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Block unauthenticated access to users" ON public.users;
DROP POLICY IF EXISTS "Block public access to users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can only view own data" ON public.users;
DROP POLICY IF EXISTS "Users can only insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can only update their own data" ON public.users;
DROP POLICY IF EXISTS "Block all delete operations" ON public.users;

-- Step 2: Create a single, comprehensive RESTRICTIVE policy to deny all unauthorized access
CREATE POLICY "users_restrictive_access_control" 
ON public.users 
AS RESTRICTIVE
FOR ALL
TO public
USING (
  -- Only allow access if user is authenticated AND accessing their own record
  auth.role() = 'authenticated' AND auth.uid() = id
);

-- Step 3: Create specific PERMISSIVE policies for each operation
-- SELECT: Users can view their own data
CREATE POLICY "users_select_own_data" 
ON public.users 
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- INSERT: Users can insert their own data (typically handled by triggers)
CREATE POLICY "users_insert_own_data" 
ON public.users 
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own data only
CREATE POLICY "users_update_own_data" 
ON public.users 
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DELETE: Completely block delete operations for security
CREATE POLICY "users_block_deletes" 
ON public.users 
FOR DELETE
TO authenticated
USING (false);

-- Step 4: Ensure service_role can still perform admin operations
CREATE POLICY "users_service_role_access" 
ON public.users 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 5: Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_users_policy_violations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log suspicious access attempts
  IF TG_OP = 'SELECT' AND auth.uid() IS NULL THEN
    PERFORM public.log_sensitive_access(
      'UNAUTHORIZED_SELECT_ATTEMPT',
      'users',
      NULL,
      NULL,
      jsonb_build_object(
        'attempted_operation', TG_OP,
        'table', 'users',
        'timestamp', now(),
        'warning', 'Unauthenticated access attempt blocked'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 6: Add security monitoring trigger
DROP TRIGGER IF EXISTS users_security_monitor ON public.users;
CREATE TRIGGER users_security_monitor
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.log_users_policy_violations();