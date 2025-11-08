import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './supabase';

// Generate a session ID for analytics tracking
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
let sessionId = sessionStorage.getItem('analytics_session_id');
if (!sessionId) {
  sessionId = generateSessionId();
  sessionStorage.setItem('analytics_session_id', sessionId);
}

// Analytics event tracking
interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
}

export const trackEvent = async ({ eventName, properties = {}, userId }: AnalyticsEvent) => {
  try {
    const currentUser = await getCurrentUser();
    
    await supabase.from('analytics_events').insert({
      user_id: userId || currentUser?.id || null,
      session_id: sessionId,
      event_name: eventName,
      event_properties: properties,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Predefined event tracking functions
export const Analytics = {
  // Authentication events
  signUp: () => trackEvent({ eventName: 'user_signup' }),
  signIn: () => trackEvent({ eventName: 'user_signin' }),
  signOut: () => trackEvent({ eventName: 'user_signout' }),

  // Event interactions
  eventViewed: (eventId: string) => trackEvent({ 
    eventName: 'event_viewed', 
    properties: { event_id: eventId } 
  }),
  eventCreated: (eventId: string) => trackEvent({ 
    eventName: 'event_created', 
    properties: { event_id: eventId } 
  }),
  eventRSVP: (eventId: string, status: 'going' | 'interested') => trackEvent({ 
    eventName: 'event_rsvp', 
    properties: { event_id: eventId, rsvp_status: status } 
  }),
  eventShared: (eventId: string) => trackEvent({ 
    eventName: 'event_shared', 
    properties: { event_id: eventId } 
  }),

  // Venue interactions
  venueViewed: (venueId: string) => trackEvent({ 
    eventName: 'venue_viewed', 
    properties: { venue_id: venueId } 
  }),
  venueBooked: (venueId: string) => trackEvent({ 
    eventName: 'venue_booking_requested', 
    properties: { venue_id: venueId } 
  }),

  // Social interactions
  messageSent: (recipientId: string) => trackEvent({ 
    eventName: 'message_sent', 
    properties: { recipient_id: recipientId } 
  }),
  profileViewed: (profileId: string) => trackEvent({ 
    eventName: 'profile_viewed', 
    properties: { profile_id: profileId } 
  }),

  // Page views
  pageView: (pageName: string) => trackEvent({ 
    eventName: 'page_view', 
    properties: { page_name: pageName } 
  }),

  // Search and discovery
  searchPerformed: (query: string, results: number) => trackEvent({ 
    eventName: 'search_performed', 
    properties: { search_query: query, results_count: results } 
  }),
  filterApplied: (filterType: string, filterValue: string) => trackEvent({ 
    eventName: 'filter_applied', 
    properties: { filter_type: filterType, filter_value: filterValue } 
  }),

  // Engagement
  featureUsed: (featureName: string) => trackEvent({ 
    eventName: 'feature_used', 
    properties: { feature_name: featureName } 
  }),
  sessionStart: () => trackEvent({ eventName: 'session_start' }),
  sessionEnd: () => trackEvent({ eventName: 'session_end' }),
};

// Track page views automatically
export const initAnalytics = () => {
  // Track initial page view
  Analytics.pageView(window.location.pathname);
  
  // Track session start
  Analytics.sessionStart();
  
  // Track page changes for SPA navigation
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      Analytics.pageView(currentPath);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    Analytics.sessionEnd();
  });
  
  // Track visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      Analytics.sessionEnd();
    } else {
      Analytics.sessionStart();
    }
  });
};

// Admin analytics functions
export const getAnalyticsMetrics = async () => {
  const { data, error } = await supabase
    .from('admin_metrics')
    .select('*')
    .order('date_recorded', { ascending: false })
    .limit(30);
  
  return { data, error };
};

export const getEventAnalytics = async (timeframe: 'day' | 'week' | 'month' = 'week') => {
  const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_name, created_at, event_properties')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getUserAnalytics = async () => {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_name, created_at, event_properties')
    .eq('user_id', (await getCurrentUser())?.id)
    .order('created_at', { ascending: false })
    .limit(100);
  
  return { data, error };
};