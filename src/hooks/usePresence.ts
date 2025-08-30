import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/AuthProvider';

interface UserPresence {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  online_at: string;
  status: 'online' | 'away' | 'busy';
  current_page?: string;
}

interface UsePresenceProps {
  room?: string;
  enabled?: boolean;
}

export function usePresence({ room = 'main', enabled = true }: UsePresenceProps = {}) {
  const { user, profile } = useAuth();
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [onlineCount, setOnlineCount] = useState(0);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !user) return;

    const channel = supabase.channel(`presence:${room}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        console.log('Presence sync:', newState);
        
        // Convert presence state to our format
        const presenceMap: Record<string, UserPresence> = {};
        Object.entries(newState).forEach(([key, presenceArray]) => {
          if (presenceArray && Array.isArray(presenceArray) && presenceArray.length > 0) {
            const presence = presenceArray[0];
            // Validate that the presence object has all required UserPresence properties
            if (presence && 
                typeof presence === 'object' && 
                'user_id' in presence && 
                'online_at' in presence && 
                'status' in presence) {
              presenceMap[key] = presence as UserPresence;
            }
          }
        });
        
        setPresences(presenceMap);
        setOnlineCount(Object.keys(presenceMap).length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        const userStatus: UserPresence = {
          user_id: user.id,
          full_name: profile?.full_name || 'Anonymous',
          avatar_url: profile?.avatar_url || null,
          online_at: new Date().toISOString(),
          status: 'online',
          current_page: window.location.pathname
        };

        await channel.track(userStatus);
      });

    channelRef.current = channel;

    // Update user status on page visibility changes
    const handleVisibilityChange = async () => {
      if (!channelRef.current) return;
      
      const status = document.hidden ? 'away' : 'online';
      const userStatus: UserPresence = {
        user_id: user.id,
        full_name: profile?.full_name || 'Anonymous',
        avatar_url: profile?.avatar_url || null,
        online_at: new Date().toISOString(),
        status,
        current_page: window.location.pathname
      };

      await channelRef.current.track(userStatus);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, profile, room, enabled]);

  const updateStatus = async (status: 'online' | 'away' | 'busy') => {
    if (!channelRef.current || !user) return;

    const userStatus: UserPresence = {
      user_id: user.id,
      full_name: profile?.full_name || 'Anonymous',
      avatar_url: profile?.avatar_url || null,
      online_at: new Date().toISOString(),
      status,
      current_page: window.location.pathname
    };

    await channelRef.current.track(userStatus);
  };

  return {
    presences,
    onlineCount,
    updateStatus,
    isOnline: (userId: string) => Boolean(presences[userId])
  };
}