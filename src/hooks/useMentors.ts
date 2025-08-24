import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/features/auth/AuthProvider';
import { toast } from 'sonner';

interface Mentor {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  experience_level?: string;
  hourly_rate?: number;
  mentor_expertise?: string[];
  mentor_bio?: string;
  is_mentor: boolean;
}

export function useMentors(searchQuery?: string) {
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_mentor', true);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,mentor_bio.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Mentor[];
    },
  });

  return { mentors: mentors || [], isLoading };
}

export function useMentorMutations() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const requestMentorship = useMutation({
    mutationFn: async ({ mentorId, message }: { mentorId: string; message: string }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('mentor_requests')
        .insert({
          mentee_id: session.user.id,
          mentor_id: mentorId,
          message,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mentorship request sent!');
      queryClient.invalidateQueries({ queryKey: ['mentor-requests'] });
    },
    onError: (error) => {
      toast.error(`Failed to send request: ${error.message}`);
    },
  });

  return { requestMentorship };
}