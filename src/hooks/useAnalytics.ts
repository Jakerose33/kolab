import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

interface EventAnalytics {
  date: string
  views: number
  unique_views: number
  rsvp_conversions: number
  shares: number
  engagement_score: number
  revenue: number
}

interface VenueAnalytics {
  date: string
  views: number
  unique_views: number
  booking_requests: number
  booking_conversions: number
  revenue: number
  average_rating: number
  occupancy_rate: number
}

interface UserBehavior {
  date: string
  sessions: number
  page_views: number
  events_viewed: number
  events_created: number
  bookings_made: number
  messages_sent: number
  search_queries: number
  time_spent_minutes: number
}

interface PlatformMetrics {
  date: string
  total_users: number
  active_users: number
  new_users: number
  total_events: number
  new_events: number
  total_venues: number
  total_bookings: number
  total_revenue: number
  conversion_rate: number
  retention_rate: number
}

export function useAnalytics(dateRange: { from: Date; to: Date }) {
  const { user } = useAuth()
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics[]>([])
  const [venueAnalytics, setVenueAnalytics] = useState<VenueAnalytics[]>([])
  const [userBehavior, setUserBehavior] = useState<UserBehavior[]>([])
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEventAnalytics = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('event_analytics')
        .select(`
          date,
          views,
          unique_views,
          rsvp_conversions,
          shares,
          engagement_score,
          revenue
        `)
        .eq('organizer_id', user.id)
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

      if (error) throw error
      setEventAnalytics(data || [])
    } catch (error: any) {
      console.error('Error fetching event analytics:', error)
      setError(error.message)
    }
  }

  const fetchVenueAnalytics = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('venue_analytics')
        .select(`
          date,
          views,
          unique_views,
          booking_requests,
          booking_conversions,
          revenue,
          average_rating,
          occupancy_rate
        `)
        .eq('owner_id', user.id)
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

      if (error) throw error
      setVenueAnalytics(data || [])
    } catch (error: any) {
      console.error('Error fetching venue analytics:', error)
      setError(error.message)
    }
  }

  const fetchUserBehavior = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_behavior_analytics')
        .select(`
          date,
          sessions,
          page_views,
          events_viewed,
          events_created,
          bookings_made,
          messages_sent,
          search_queries,
          time_spent_minutes
        `)
        .eq('user_id', user.id)
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

      if (error) throw error
      setUserBehavior(data || [])
    } catch (error: any) {
      console.error('Error fetching user behavior:', error)
      setError(error.message)
    }
  }

  const fetchPlatformMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_analytics')
        .select(`
          date,
          total_users,
          active_users,
          new_users,
          total_events,
          new_events,
          total_venues,
          total_bookings,
          total_revenue,
          conversion_rate,
          retention_rate
        `)
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

      if (error) throw error
      setPlatformMetrics(data || [])
    } catch (error: any) {
      console.error('Error fetching platform metrics:', error)
      setError(error.message)
    }
  }

  const trackEventView = async (eventId: string, isUnique = false) => {
    if (!user) return

    try {
      await supabase.rpc('track_event_view', {
        p_event_id: eventId,
        p_user_id: user.id,
        p_is_unique: isUnique
      })
    } catch (error: any) {
      console.error('Error tracking event view:', error)
    }
  }

  const trackUserAction = async (actionType: string, metadata: any = {}) => {
    if (!user) return

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      // Update user behavior analytics
      const updateData: any = { user_id: user.id }
      
      switch (actionType) {
        case 'page_view':
          updateData.page_views = 1
          break
        case 'event_created':
          updateData.events_created = 1
          break
        case 'booking_made':
          updateData.bookings_made = 1
          break
        case 'message_sent':
          updateData.messages_sent = 1
          break
        case 'search_query':
          updateData.search_queries = 1
          break
        case 'session_start':
          updateData.sessions = 1
          break
      }

      await supabase
        .from('user_behavior_analytics')
        .upsert({
          user_id: user.id,
          date: today,
          ...updateData
        }, {
          onConflict: 'user_id,date'
        })
    } catch (error: any) {
      console.error('Error tracking user action:', error)
    }
  }

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      setLoading(true)
      setError(null)
      
      try {
        await Promise.all([
          fetchEventAnalytics(),
          fetchVenueAnalytics(),
          fetchUserBehavior(),
          fetchPlatformMetrics()
        ])
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (user && dateRange.from && dateRange.to) {
      fetchAllAnalytics()
    }
  }, [user, dateRange])

  const getTopEvents = () => {
    return eventAnalytics
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 5)
  }

  const getTopVenues = () => {
    return venueAnalytics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  const getTotalMetrics = () => {
    const totals = {
      totalViews: eventAnalytics.reduce((sum, item) => sum + item.views, 0),
      totalRevenue: eventAnalytics.reduce((sum, item) => sum + item.revenue, 0) + 
                   venueAnalytics.reduce((sum, item) => sum + item.revenue, 0),
      totalConversions: eventAnalytics.reduce((sum, item) => sum + item.rsvp_conversions, 0) +
                       venueAnalytics.reduce((sum, item) => sum + item.booking_conversions, 0),
      averageEngagement: eventAnalytics.length > 0 
        ? eventAnalytics.reduce((sum, item) => sum + item.engagement_score, 0) / eventAnalytics.length
        : 0
    }

    return totals
  }

  return {
    eventAnalytics,
    venueAnalytics,
    userBehavior,
    platformMetrics,
    loading,
    error,
    trackEventView,
    trackUserAction,
    getTopEvents,
    getTopVenues,
    getTotalMetrics,
    refreshData: () => {
      fetchEventAnalytics()
      fetchVenueAnalytics()
      fetchUserBehavior()
      fetchPlatformMetrics()
    }
  }
}