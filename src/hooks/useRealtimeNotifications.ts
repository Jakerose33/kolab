import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read_at: string | null
  related_id: string | null
  created_at: string
}

interface ActivityFeedItem {
  id: string
  actor_id: string
  action_type: string
  target_type: string
  target_id: string | null
  metadata: any
  created_at: string
}

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch initial notifications and activity feed
  useEffect(() => {
    if (!user) return

    const fetchInitialData = async () => {
      try {
        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (notificationsData) {
          setNotifications(notificationsData)
          setUnreadCount(notificationsData.filter(n => !n.read_at).length)
        }

        // Fetch activity feed
        const { data: activityData } = await supabase
          .from('activity_feed')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (activityData) {
          setActivityFeed(activityData)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [user])

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload)
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification updated:', payload)
          const updatedNotification = payload.new as Notification
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          )
          
          // Update unread count if notification was marked as read
          if (updatedNotification.read_at && !payload.old.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    const activityChannel = supabase
      .channel('activity-feed-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New activity received:', payload)
          const newActivity = payload.new as ActivityFeedItem
          setActivityFeed(prev => [newActivity, ...prev.slice(0, 99)]) // Keep only latest 100
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notificationsChannel)
      supabase.removeChannel(activityChannel)
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .is('read_at', null)

      if (error) throw error

      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    activityFeed,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  }
}