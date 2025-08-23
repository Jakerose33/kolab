import { useSecureAuth } from './useSecureAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const secureAuth = useSecureAuth();
  
  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', secureAuth.user?.id],
    queryFn: async () => {
      if (!secureAuth.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', secureAuth.user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!secureAuth.user?.id,
  });

  return {
    ...secureAuth,
    profile,
    isAuthenticated: !!secureAuth.user
  };
}