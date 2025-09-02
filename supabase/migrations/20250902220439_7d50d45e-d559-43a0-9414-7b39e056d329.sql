-- Create error reports table
CREATE TABLE public.error_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL DEFAULT 'user_reported',
  title TEXT NOT NULL,
  description TEXT,
  steps_to_reproduce TEXT,
  url TEXT NOT NULL,
  user_agent TEXT,
  browser_info JSONB,
  error_details JSONB,
  stack_trace TEXT,
  screenshot_url TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate')),
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create error reports (even anonymous users)
CREATE POLICY "Anyone can create error reports" 
ON public.error_reports 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own error reports
CREATE POLICY "Users can view their own error reports" 
ON public.error_reports 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Only admins can view all error reports
CREATE POLICY "Admins can view all error reports" 
ON public.error_reports 
FOR SELECT 
USING (public.current_user_has_role('admin'));

-- Only admins can update error reports
CREATE POLICY "Admins can update error reports" 
ON public.error_reports 
FOR UPDATE 
USING (public.current_user_has_role('admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_error_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_error_reports_updated_at
BEFORE UPDATE ON public.error_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_error_reports_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_error_reports_status ON public.error_reports(status);
CREATE INDEX idx_error_reports_severity ON public.error_reports(severity);
CREATE INDEX idx_error_reports_created_at ON public.error_reports(created_at);
CREATE INDEX idx_error_reports_user_id ON public.error_reports(user_id);