-- Create function to notify about new error reports
CREATE OR REPLACE FUNCTION public.notify_error_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for high and critical severity reports
  IF NEW.severity IN ('high', 'critical') THEN
    -- Call the edge function to send notifications
    PERFORM net.http_post(
      url := (SELECT current_setting('app.base_url', true) || '/functions/v1/notify-error-report'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT current_setting('app.service_key', true))
      ),
      body := jsonb_build_object(
        'reportId', NEW.id,
        'title', NEW.title,
        'severity', NEW.severity,
        'userEmail', NEW.contact_email,
        'description', LEFT(COALESCE(NEW.description, ''), 200),
        'url', NEW.url
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to call notification function
CREATE TRIGGER trigger_notify_error_report
AFTER INSERT ON public.error_reports
FOR EACH ROW
EXECUTE FUNCTION public.notify_error_report();