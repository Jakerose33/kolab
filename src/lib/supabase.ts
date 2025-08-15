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

// Temporary stub functions for existing functionality
export const rsvpToEvent = async (eventId: string, status: 'going' | 'interested') => {
  console.log('RSVP feature will be available after event tables are created');
  return { data: null, error: new Error('Feature not yet implemented') };
};

export const createEvent = async (eventData: any) => {
  console.log('Event creation will be available after event tables are created');
  return { data: null, error: new Error('Feature not yet implemented') };
};

export const bookVenue = async (venueId: string, bookingData: any) => {
  console.log('Venue booking will be available after venue tables are created');
  return { data: null, error: new Error('Feature not yet implemented') };
};

export const getUserBookings = async () => {
  console.log('Bookings will be available after venue tables are created');
  return { data: [], error: null };
};

export const getUserRSVPs = async () => {
  console.log('RSVPs will be available after event tables are created');
  return { data: [], error: null };
};