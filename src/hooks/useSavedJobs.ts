import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/AuthProvider';
import { toast } from 'sonner';

export function useSavedJobs() {
  const { session } = useAuth();

  const { data: savedJobs, isLoading } = useQuery({
    queryKey: ['saved-jobs', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          jobs:job_id (*)
        `)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  return { savedJobs: savedJobs || [], isLoading };
}

export function useSavedJobMutations() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { savedJobs } = useSavedJobs();

  const saveJob = useMutation({
    mutationFn: async (jobId: string) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: session.user.id,
          job_id: jobId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job saved!');
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: (error) => {
      toast.error(`Failed to save job: ${error.message}`);
    },
  });

  const unsaveJob = useMutation({
    mutationFn: async (jobId: string) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', session.user.id)
        .eq('job_id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job removed from saved');
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: (error) => {
      toast.error(`Failed to unsave job: ${error.message}`);
    },
  });

  const isJobSaved = (jobId: string): boolean => {
    return savedJobs.some(savedJob => savedJob.job_id === jobId);
  };

  return { saveJob, unsaveJob, isJobSaved };
}