import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeProps {
  onEventCreated?: (event: any) => void;
  onEventUpdated?: (event: any) => void;
  onRSVPCreated?: (rsvp: any) => void;
  onRSVPUpdated?: (rsvp: any) => void;
  onMessageReceived?: (message: any) => void;
  onNotificationReceived?: (notification: any) => void;
  onProfileUpdated?: (profile: any) => void;
}

export function useRealtime({
  onEventCreated,
  onEventUpdated,
  onRSVPCreated,
  onRSVPUpdated,
  onMessageReceived,
  onNotificationReceived,
  onProfileUpdated
}: UseRealtimeProps = {}) {
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create a single channel for all real-time subscriptions
    const channel = supabase
      .channel('kolab-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('New event created:', payload);
          if (onEventCreated) {
            onEventCreated(payload.new);
          }
          toast({
            title: "New Event Created",
            description: `${payload.new.title} was just published!`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Event updated:', payload);
          if (onEventUpdated) {
            onEventUpdated(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_rsvps'
        },
        (payload) => {
          console.log('New RSVP:', payload);
          if (onRSVPCreated) {
            onRSVPCreated(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'event_rsvps'
        },
        (payload) => {
          console.log('RSVP updated:', payload);
          if (onRSVPUpdated) {
            onRSVPUpdated(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message:', payload);
          if (onMessageReceived) {
            onMessageReceived(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification:', payload);
          if (onNotificationReceived) {
            onNotificationReceived(payload.new);
          }
          toast({
            title: "New Notification",
            description: payload.new.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile updated:', payload);
          if (onProfileUpdated) {
            onProfileUpdated(payload.new);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [
    onEventCreated,
    onEventUpdated,
    onRSVPCreated,
    onRSVPUpdated,
    onMessageReceived,
    onNotificationReceived,
    onProfileUpdated,
    toast
  ]);

  return {
    channel: channelRef.current
  };
}