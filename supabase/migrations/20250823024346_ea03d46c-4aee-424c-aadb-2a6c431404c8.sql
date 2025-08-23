-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance')),
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  is_remote BOOLEAN DEFAULT false,
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],
  posted_by UUID REFERENCES auth.users(id),
  application_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  application_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'rejected', 'accepted')),
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Create saved_jobs table
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Create mentor_requests table
CREATE TABLE public.mentor_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentee_id, mentor_id)
);

-- Add career-related fields to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mentor_expertise TEXT[],
ADD COLUMN IF NOT EXISTS mentor_bio TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create jobs" 
ON public.jobs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own jobs" 
ON public.jobs FOR UPDATE USING (auth.uid() = posted_by);

-- Job applications policies
CREATE POLICY "Users can view their own applications" 
ON public.job_applications FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can view applications for their jobs" 
ON public.job_applications FOR SELECT USING (
  auth.uid() IN (SELECT posted_by FROM public.jobs WHERE id = job_id)
);

CREATE POLICY "Users can create applications" 
ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications" 
ON public.job_applications FOR UPDATE USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can update application status" 
ON public.job_applications FOR UPDATE USING (
  auth.uid() IN (SELECT posted_by FROM public.jobs WHERE id = job_id)
);

-- Saved jobs policies
CREATE POLICY "Users can view their own saved jobs" 
ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs" 
ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their saved jobs" 
ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Mentor requests policies
CREATE POLICY "Users can view their mentor requests" 
ON public.mentor_requests FOR SELECT USING (
  auth.uid() = mentee_id OR auth.uid() = mentor_id
);

CREATE POLICY "Users can create mentor requests" 
ON public.mentor_requests FOR INSERT WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentees can update their requests" 
ON public.mentor_requests FOR UPDATE USING (auth.uid() = mentee_id);

CREATE POLICY "Mentors can update request status" 
ON public.mentor_requests FOR UPDATE USING (auth.uid() = mentor_id);

-- Create indexes for better performance
CREATE INDEX idx_jobs_active ON public.jobs(is_active) WHERE is_active = true;
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX idx_mentor_requests_mentee_id ON public.mentor_requests(mentee_id);
CREATE INDEX idx_mentor_requests_mentor_id ON public.mentor_requests(mentor_id);
CREATE INDEX idx_profiles_is_mentor ON public.profiles(is_mentor) WHERE is_mentor = true;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_requests_updated_at
  BEFORE UPDATE ON public.mentor_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment job view count
CREATE OR REPLACE FUNCTION public.increment_job_view_count(job_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.jobs 
  SET view_count = view_count + 1 
  WHERE id = job_uuid AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment application count
CREATE OR REPLACE FUNCTION public.increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.jobs 
  SET application_count = application_count + 1 
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment application count
CREATE TRIGGER increment_application_count_trigger
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_application_count();