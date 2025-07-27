import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Event RSVP functions
export const rsvpToEvent = async (eventId: string, status: 'going' | 'interested') => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({
      user_id: user.id,
      event_id: eventId,
      status,
      created_at: new Date().toISOString()
    })
  
  return { data, error }
}

export const getUserRSVPs = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('user_id', user.id)
  
  return { data, error }
}

// Venue booking functions
export const bookVenue = async (venueId: string, bookingData: any) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('venue_bookings')
    .insert({
      user_id: user.id,
      venue_id: venueId,
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
  
  return { data, error }
}

export const getUserBookings = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('venue_bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Event creation
export const createEvent = async (eventData: any) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...eventData,
      organizer_id: user.id,
      created_at: new Date().toISOString()
    })
  
  return { data, error }
}

// Messages
export const sendMessage = async (recipientId: string, content: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content,
      created_at: new Date().toISOString()
    })
  
  return { data, error }
}

export const getMessages = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Notifications
export const getNotifications = async () => {
  const user = await getCurrentUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const markNotificationRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  
  return { data, error }
}