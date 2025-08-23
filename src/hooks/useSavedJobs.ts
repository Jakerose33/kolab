import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSavedJobs() {
  const { toast } = useToast();
  
  const {
    data: savedJobs = [],
    isLoading
  } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            company,
            location,
            job_type,
            salary_min,
            salary_max,
            currency,
            is_remote,
            description,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved jobs:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    savedJobs,
    isLoading
  };
}

export function useSavedJobMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save jobs');
      }

      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: user.id,
          job_id: jobId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Job saved",
        description: "Job has been added to your saved jobs.",
      });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save job",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const unsaveJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in');
      }

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Job removed",
        description: "Job has been removed from your saved jobs.",
      });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove job",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const { savedJobs } = useSavedJobs();
  
  const isJobSaved = (jobId: string) => {
    return savedJobs.some((saved: any) => saved.job_id === jobId);
  };

  return {
    saveJob,
    unsaveJob,
    isJobSaved
  };
}