-- Create content reports table
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  reported_content_id UUID,
  content_type TEXT NOT NULL CHECK (content_type IN ('event', 'message', 'profile', 'venue')),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'fake', 'violence', 'copyright', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  moderator_id UUID,
  moderator_notes TEXT,
  resolution_action TEXT CHECK (resolution_action IN ('no_action', 'content_removed', 'user_warned', 'user_suspended', 'user_banned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create user blocks table
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create user suspensions table
CREATE TABLE public.user_suspensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  moderator_id UUID NOT NULL,
  reason TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content moderation log
CREATE TABLE public.moderation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('report_reviewed', 'content_removed', 'user_warned', 'user_suspended', 'user_banned', 'content_restored')),
  target_user_id UUID,
  target_content_id UUID,
  content_type TEXT,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_reports
CREATE POLICY "Users can create reports" 
ON public.content_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" 
ON public.content_reports 
FOR SELECT 
USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports" 
ON public.content_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (bio ILIKE '%admin%' OR bio ILIKE '%moderator%')
));

CREATE POLICY "Moderators can update reports" 
ON public.content_reports 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (bio ILIKE '%admin%' OR bio ILIKE '%moderator%')
));

-- RLS Policies for user_blocks
CREATE POLICY "Users can manage their own blocks" 
ON public.user_blocks 
FOR ALL 
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can see if they are blocked" 
ON public.user_blocks 
FOR SELECT 
USING (auth.uid() = blocked_id);

-- RLS Policies for user_suspensions
CREATE POLICY "Users can view their own suspensions" 
ON public.user_suspensions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Moderators can manage suspensions" 
ON public.user_suspensions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (bio ILIKE '%admin%' OR bio ILIKE '%moderator%')
));

-- RLS Policies for moderation_log
CREATE POLICY "Moderators can view moderation log" 
ON public.moderation_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (bio ILIKE '%admin%' OR bio ILIKE '%moderator%')
));

CREATE POLICY "Moderators can create log entries" 
ON public.moderation_log 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (bio ILIKE '%admin%' OR bio ILIKE '%moderator%')
) AND auth.uid() = moderator_id);

-- Add triggers for updated_at
CREATE TRIGGER update_content_reports_updated_at
  BEFORE UPDATE ON public.content_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_suspensions_updated_at
  BEFORE UPDATE ON public.user_suspensions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_id UUID, blocked_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE user_blocks.blocker_id = is_user_blocked.blocker_id
    AND user_blocks.blocked_id = is_user_blocked.blocked_id
  );
END;
$$;