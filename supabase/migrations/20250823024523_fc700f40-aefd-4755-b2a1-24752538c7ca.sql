-- Fix security warnings by adding search_path to functions
CREATE OR REPLACE FUNCTION public.increment_job_view_count(job_uuid UUID)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs 
  SET view_count = view_count + 1 
  WHERE id = job_uuid AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_application_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs 
  SET application_count = application_count + 1 
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$;