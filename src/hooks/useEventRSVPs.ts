import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/AuthProvider';

export type RSVPStatus = 'going' | 'interested' | null;

export interface EventRSVPData {
  going: number;
  interested: number;
  userStatus: RSVPStatus;
}

// Fetch RSVP counts and user status for an event
export const useEventRSVPs = (eventId: string | null) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['event-rsvps', eventId, user?.id],
    queryFn: async () => {
      if (!eventId) return null;
      
      // Get RSVP counts
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', eventId);
      
      if (rsvpError) throw rsvpError;
      
      // Calculate counts
      const going = rsvpData?.filter(r => r.status === 'going').length || 0;
      const interested = rsvpData?.filter(r => r.status === 'interested').length || 0;
      
      // Get user's RSVP status if authenticated
      let userStatus: RSVPStatus = null;
      if (user) {
        const { data: userRSVP } = await supabase
          .from('event_rsvps')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        userStatus = userRSVP?.status as RSVPStatus || null;
      }
      
      return {
        going,
        interested,
        userStatus
      } as EventRSVPData;
    },
    enabled: !!eventId,
    refetchOnWindowFocus: false
  });
};

// RSVP to an event
export const useEventRSVP = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: RSVPStatus }) => {
      if (!user) throw new Error('Must be logged in to RSVP');
      
      if (status === null) {
        // Remove RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create or update RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .upsert({
            event_id: eventId,
            user_id: user.id,
            status
          });
        
        if (error) throw error;
      }
      
      return { eventId, status };
    },
    onSuccess: ({ eventId, status }) => {
      // Invalidate RSVP queries for this event
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', eventId] });
      
      toast({
        title: status ? `You're ${status}!` : "RSVP removed",
        description: status 
          ? `Added to your ${status} events` 
          : "Removed from your events"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });
};