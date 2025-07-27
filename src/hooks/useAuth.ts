import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Temporarily disable Supabase auth until environment is properly configured
    setLoading(false);
  }, []);

  const logout = async () => {
    setUser(null);
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };
}