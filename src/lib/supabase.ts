import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Auth helpers
export const signUp = async (email: string, password: string, userData?: any) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: userData
    }
  });
  
  return { data, error };
};

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

// Profile functions
export const getUserProfile = async (userId?: string) => {
  const currentUser = await getCurrentUser();
  const targetUserId = userId || currentUser?.id;
  if (!targetUserId) return { data: null, error: new Error('No user ID provided') };

  // If requesting own profile, use direct table access
  if (currentUser?.id === targetUserId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();
    
    return { data, error };
  }

  // For other users' profiles, use privacy-aware function
  const { data, error } = await supabase
    .rpc('get_profile_with_privacy', { target_user_id: targetUserId });
  
  // Convert the function result to match expected format
  const profileData = data && data.length > 0 ? data[0] : null;
  return { data: profileData, error };
};

export const updateUserProfile = async (updates: any) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();
  
  return { data, error };
};

// Event functions
export const createEvent = async (eventData: any) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...eventData,
      organizer_id: user.id
    })
    .select()
    .single();
  
  return { data, error };
};

export const getEvents = async (filters?: { status?: string; limit?: number }) => {
  let query = supabase
    .from('events')
    .select(`
      *
    `)
    .eq('status', 'published')
    .order('start_at', { ascending: true });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getUserEvents = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const rsvpToEvent = async (eventId: string, status: 'going' | 'interested' | 'not_going') => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({
      user_id: user.id,
      event_id: eventId,
      status
    })
    .select()
    .single();
  
  return { data, error };
};

export const getUserRSVPs = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('event_rsvps')
    .select(`
      *,
      events(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Venue functions
export const getVenues = async (filters?: { 
  search?: string; 
  tags?: string[]; 
  capacity?: number; 
  limit?: number 
}) => {
  let query = supabase
    .from('venues')
    .select(`
      *,
      profiles!venues_owner_id_fkey(full_name, handle)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
  }

  if (filters?.capacity) {
    query = query.gte('capacity', filters.capacity);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getVenue = async (venueId: string) => {
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *,
      profiles!venues_owner_id_fkey(full_name, handle, avatar_url)
    `)
    .eq('id', venueId)
    .eq('status', 'active')
    .single();
  
  return { data, error };
};

export const bookVenue = async (bookingData: {
  venue_id: string;
  start_date: string;
  end_date: string;
  guest_count: number;
  event_type?: string;
  special_requests?: string;
  message?: string;
}) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('venue_bookings')
    .insert({
      user_id: user.id,
      ...bookingData
    })
    .select(`
      *,
      venues(name, address),
      profiles!venue_bookings_user_id_fkey(full_name, handle)
    `)
    .single();
  
  return { data, error };
};

export const getUserBookings = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('venue_bookings')
    .select(`
      *,
      venues(name, address, images),
      profiles!venues_owner_id_fkey(full_name, handle)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Messaging functions
export const sendMessage = async (recipientId: string, content: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Create or get conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant_one_id.eq.${user.id},participant_two_id.eq.${recipientId}),and(participant_one_id.eq.${recipientId},participant_two_id.eq.${user.id})`)
    .maybeSingle();

  let conversationId = conversation?.id;

  if (!conversation) {
    const { data: newConv, error: newConvError } = await supabase
      .from('conversations')
      .insert({
        participant_one_id: user.id,
        participant_two_id: recipientId
      })
      .select()
      .single();

    if (newConvError) throw newConvError;
    conversationId = newConv.id;
  }

  // Send message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, handle, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(full_name, handle, avatar_url)
    `)
    .single();

  if (error) throw error;

  // Update conversation last message
  await supabase
    .from('conversations')
    .update({
      last_message_id: data.id,
      last_message_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  return { data, error: null };
};

export const getConversations = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_one:profiles!conversations_participant_one_id_fkey(full_name, handle, avatar_url),
      participant_two:profiles!conversations_participant_two_id_fkey(full_name, handle, avatar_url),
      last_message:messages(content, created_at)
    `)
    .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  return { data, error };
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, handle, avatar_url)
    `)
    .or(`sender_id.in.(select participant_one_id from conversations where id = '${conversationId}'),sender_id.in.(select participant_two_id from conversations where id = '${conversationId}')`)
    .order('created_at', { ascending: true });

  return { data, error };
};

export const markMessageAsRead = async (messageId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('read_at', null)
    .select()
    .single();

  return { data, error };
};

// Notification functions
export const getNotifications = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();
  
  return { data, error };
};

// Analytics functions
export const trackAnalyticsEvent = async (
  eventName: string,
  properties: Record<string, any> = {}
) => {
  const user = await getCurrentUser();
  const sessionId = sessionStorage.getItem('analytics_session_id') || 'unknown';
  
  const { data, error } = await supabase
    .from('analytics_events')
    .insert({
      user_id: user?.id || null,
      session_id: sessionId,
      event_name: eventName,
      event_properties: properties,
      page_url: window.location.href,
      user_agent: navigator.userAgent
    });
  
  return { data, error };
};

export const createNotification = async (
  userId: string, 
  title: string, 
  message: string, 
  type: 'message' | 'event_rsvp' | 'booking_update' | 'system',
  relatedId?: string
) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      related_id: relatedId
    })
    .select()
    .single();
  
  return { data, error };
};

export const getVenueBookings = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('venue_bookings')
    .select(`
      *,
      venues!inner(id, name, address, owner_id),
      profiles!venue_bookings_user_id_fkey(full_name, handle, avatar_url)
    `)
    .eq('venues.owner_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: 'approved' | 'rejected', 
  ownerNotes?: string
) => {
  const { data, error } = await supabase
    .from('venue_bookings')
    .update({ 
      status, 
      owner_notes: ownerNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();
  
  return { data, error };
};