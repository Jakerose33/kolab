import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/AuthProvider';
import { toast } from 'sonner';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  is_remote?: boolean;
  is_active?: boolean;
  application_count: number;
  view_count: number;
  posted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface JobFilters {
  search?: string;
  jobType?: string;
  salaryRange?: [number, number];
  isRemote?: boolean;
}

export function useJobs(filters: JobFilters = {}) {
  const { data: jobs, isLoading, error } = useQuery({
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
        query = query.gte('salary_min', filters.salaryRange[0])
                   .lte('salary_max', filters.salaryRange[1]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Job[];
    },
  });

  return { jobs: jobs || [], isLoading, error };
}

export function useJobMutations() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const incrementViewCount = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.rpc('increment_job_view_count', { job_uuid: jobId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const applyToJob = useMutation({
    mutationFn: async ({ jobId, coverLetter, resumeUrl }: { jobId: string; coverLetter?: string; resumeUrl?: string }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: session.user.id,
          cover_letter: coverLetter,
          resume_url: resumeUrl,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => {
      toast.error(`Failed to apply: ${error.message}`);
    },
  });

  return { incrementViewCount, applyToJob };
}