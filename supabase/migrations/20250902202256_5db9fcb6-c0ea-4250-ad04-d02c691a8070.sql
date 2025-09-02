-- Security Fix: Strengthen users table access control
-- Issue: Users table contains email addresses that could be accessed inappropriately

-- 1. Add explicit policy to block unauthenticated access
CREATE POLICY "Block unauthenticated access to users" 
ON public.users 
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. Add explicit policy to block public role access
CREATE POLICY "Block public access to users" 
ON public.users 
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 3. Strengthen the existing authenticated user policy
DROP POLICY IF EXISTS "Users can only view their own user data" ON public.users;

CREATE POLICY "Authenticated users can only view own data" 
ON public.users 
FOR SELECT
TO authenticated
USING (auth.uid() = id AND auth.uid() IS NOT NULL);

-- 4. Add strict insert/update policies
CREATE POLICY "Users can only insert their own data" 
ON public.users 
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can only update their own data" 
ON public.users 
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

-- 5. Block delete operations entirely for security
CREATE POLICY "Block all delete operations" 
ON public.users 
FOR DELETE
TO authenticated
USING (false);

-- 6. Create audit function for sensitive access
CREATE OR REPLACE FUNCTION public.audit_users_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any access to users table for monitoring
  PERFORM public.log_sensitive_access(
    TG_OP,
    'users',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_users_access_trigger ON public.users;
CREATE TRIGGER audit_users_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.audit_users_access();