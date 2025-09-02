-- Fix search_path for functions that don't have it set properly

-- Update calculate_engagement_score function to use proper search_path
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(p_views integer, p_rsvps integer, p_shares integer, p_comments integer DEFAULT 0)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  score DECIMAL(5,2);
  view_weight DECIMAL(3,2) := 0.1;
  rsvp_weight DECIMAL(3,2) := 0.5;
  share_weight DECIMAL(3,2) := 0.3;
  comment_weight DECIMAL(3,2) := 0.1;
BEGIN
  -- Calculate weighted engagement score
  score := (p_views * view_weight) + 
           (p_rsvps * rsvp_weight) + 
           (p_shares * share_weight) + 
           (p_comments * comment_weight);
  
  -- Normalize to 0-100 scale
  score := LEAST(100, score);
  
  RETURN score;
END;
$function$;

-- Update update_events_search_vector function to include search_path
CREATE OR REPLACE FUNCTION public.update_events_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.venue_name, '') || ' ' ||
    COALESCE(NEW.venue_address, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.categories, ' '), '')
  );
  RETURN NEW;
END;
$function$;