import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, signOut } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getCurrentUser().then(setUser).finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };
}