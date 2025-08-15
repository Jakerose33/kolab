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
  const targetUserId = userId || (await getCurrentUser())?.id;
  if (!targetUserId) return { data: null, error: new Error('No user ID provided') };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', targetUserId)
    .single();
  
  return { data, error };
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
      *,
      profiles!events_organizer_id_fkey(full_name, handle)
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

// Venue booking stub functions (will be implemented next)
export const bookVenue = async (venueId: string, bookingData: any) => {
  console.log('Venue booking will be available after venue tables are created');
  return { data: null, error: new Error('Feature not yet implemented') };
};

export const getUserBookings = async () => {
  console.log('Bookings will be available after venue tables are created');
  return { data: [], error: null };
};