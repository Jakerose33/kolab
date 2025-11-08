-- Fix function search path issues by updating functions
DROP FUNCTION IF EXISTS public.create_social_activity();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.create_social_activity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create activity feed entry for follows and connections
  IF NEW.interaction_type = 'follow' OR NEW.interaction_type = 'connect' THEN
    INSERT INTO activity_feed (
      user_id,
      actor_id,
      action_type,
      target_type,
      target_id,
      metadata
    ) VALUES (
      NEW.target_id, -- The user being followed/connected to
      NEW.user_id,   -- The user doing the action
      NEW.interaction_type,
      NEW.target_type,
      NEW.target_id,
      NEW.metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Drop and recreate the triggers with the updated function name
DROP TRIGGER IF EXISTS social_activity_trigger ON public.social_interactions;
DROP TRIGGER IF EXISTS update_user_connections_updated_at ON public.user_connections;
DROP TRIGGER IF EXISTS update_saved_searches_enhanced_updated_at ON public.saved_searches_enhanced;
DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON public.payment_plans;

-- Recreate triggers
CREATE TRIGGER social_activity_trigger
  AFTER INSERT ON public.social_interactions
  FOR EACH ROW EXECUTE FUNCTION create_social_activity();

CREATE TRIGGER update_user_connections_updated_at
    BEFORE UPDATE ON public.user_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_saved_searches_enhanced_updated_at
    BEFORE UPDATE ON public.saved_searches_enhanced
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_payment_plans_updated_at
    BEFORE UPDATE ON public.payment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();