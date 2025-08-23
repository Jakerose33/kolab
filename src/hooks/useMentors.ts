import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Mentor {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  mentor_bio?: string;
  mentor_expertise?: string[];
  hourly_rate?: number;
  experience_level?: string;
  created_at: string;
}

export function useMentors(searchQuery: string = '') {
  const { toast } = useToast();

  const {
    data: mentors = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['mentors', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_mentor', true)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,mentor_bio.ilike.%${searchQuery}%,mentor_expertise.cs.{${searchQuery}}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }

      return data as Mentor[];
    },
  });

  return {
    mentors,
    isLoading,
    error
  };
}

export function useMentorRequests() {
  const {
    data: mentorRequests = [],
    isLoading
  } = useQuery({
    queryKey: ['mentor-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('mentor_requests')
        .select(`
          *,
          mentor:mentor_id (
            full_name,
            avatar_url,
            mentor_expertise
          )
        `)
        .eq('mentee_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentor requests:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    mentorRequests,
    isLoading
  };
}

export function useMentorMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const requestMentorship = useMutation({
    mutationFn: async ({ 
      mentorId, 
      message 
    }: { 
      mentorId: string; 
      message: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to request mentorship');
      }

      const { error } = await supabase
        .from('mentor_requests')
        .insert({
          mentee_id: user.id,
          mentor_id: mentorId,
          message,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Mentorship request sent",
        description: "Your mentorship request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['mentor-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Failed to send mentorship request. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    requestMentorship
  };
}