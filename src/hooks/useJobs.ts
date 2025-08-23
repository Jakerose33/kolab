import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salary_min?: number;
  salary_max?: number;
  currency: string;
  is_remote: boolean;
  description: string;
  requirements?: string[];
  benefits?: string[];
  posted_by?: string;
  application_count: number;
  view_count: number;
  is_active: boolean;
  application_deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface JobFilters {
  jobType?: string;
  salaryRange?: [number, number];
  isRemote?: boolean;
  search?: string;
}

export function useJobs(filters: JobFilters = {}) {
  const { toast } = useToast();

  const {
    data: jobs = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.jobType && filters.jobType !== 'all') {
        query = query.eq('job_type', filters.jobType);
      }

      if (filters.isRemote) {
        query = query.eq('is_remote', true);
      }

      if (filters.salaryRange) {
        const [min, max] = filters.salaryRange;
        query = query.gte('salary_min', min).lte('salary_max', max);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      return data as Job[];
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading jobs",
        description: "Failed to fetch job listings. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return {
    jobs,
    isLoading,
    error
  };
}

export function useJobMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const incrementViewCount = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.rpc('increment_job_view_count', {
        job_uuid: jobId
      });

      if (error) throw error;
    },
    onError: () => {
      // Silently fail for view count increments
      console.warn('Failed to increment job view count');
    }
  });

  const applyToJob = useMutation({
    mutationFn: async ({ 
      jobId, 
      coverLetter, 
      resumeUrl 
    }: { 
      jobId: string; 
      coverLetter?: string; 
      resumeUrl?: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to apply for jobs');
      }

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: coverLetter,
          resume_url: resumeUrl,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your job application has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    incrementViewCount,
    applyToJob
  };
}