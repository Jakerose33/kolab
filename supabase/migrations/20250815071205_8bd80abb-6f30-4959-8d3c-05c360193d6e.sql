-- Fix search_path for security functions
CREATE OR REPLACE FUNCTION public.is_user_suspended(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_suspensions
    WHERE user_suspensions.user_id = is_user_suspended.user_id
    AND (
      is_permanent = true 
      OR (end_date IS NOT NULL AND end_date > now())
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_id UUID, blocked_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE user_blocks.blocker_id = is_user_blocked.blocker_id
    AND user_blocks.blocked_id = is_user_blocked.blocked_id
  );
END;
$$;