import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/features/auth/AuthProvider';
import { toast } from 'sonner';

interface NotificationPrefs {
  email_enabled: boolean;
  push_enabled: boolean;
  event_reminders: boolean;
  new_messages: boolean;
  booking_confirmations: boolean;
  event_updates: boolean;
  moderation_updates: boolean;
}

interface PrivacySettings {
  show_location: boolean;
  show_website: boolean;
  show_linkedin: boolean;
  show_skills: boolean;
  show_interests: boolean;
}

export function useSettings() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notification preferences
  const { data: notificationPrefs } = useQuery({
    queryKey: ['notification-preferences', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch privacy settings
  const { data: privacySettings } = useQuery({
    queryKey: ['privacy-settings', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching privacy settings:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Update notification preferences
  const updateNotificationPrefs = useMutation({
    mutationFn: async (updates: Partial<NotificationPrefs>) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: session.user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', session?.user?.id] });
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    },
  });

  // Update privacy settings
  const updatePrivacySettings = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: session.user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings', session?.user?.id] });
      toast.success('Privacy settings updated');
    },
    onError: (error) => {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    },
  });

  return {
    notificationPrefs,
    privacySettings,
    updateNotificationPrefs: updateNotificationPrefs.mutateAsync,
    updatePrivacySettings: updatePrivacySettings.mutateAsync,
    isUpdatingNotifications: updateNotificationPrefs.isPending,
    isUpdatingPrivacy: updatePrivacySettings.isPending,
  };
}