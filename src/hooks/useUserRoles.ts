import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'moderator' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
}

export function useUserRoles() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRoles = async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.some(userRole => userRole.role === role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isModerator = (): boolean => hasRole('moderator');
  const isAdminOrModerator = (): boolean => isAdmin() || isModerator();

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      // Security: Prevent self-role assignment
      if (userId === user?.id) {
        console.error('Security violation: Users cannot assign roles to themselves');
        return { 
          success: false, 
          error: { message: 'Users cannot assign roles to themselves' }
        };
      }

      // Security: Only admins can assign admin roles
      if (role === 'admin' && !isAdmin()) {
        console.error('Security violation: Only admins can assign admin roles');
        return { 
          success: false, 
          error: { message: 'Only admins can assign admin roles' }
        };
      }

      // Security: Only admins or moderators can assign moderator roles
      if (role === 'moderator' && !isAdminOrModerator()) {
        console.error('Security violation: Only admins or moderators can assign moderator roles');
        return { 
          success: false, 
          error: { message: 'Only admins or moderators can assign moderator roles' }
        };
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          assigned_by: user?.id
        });

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error };
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      // Security: Prevent self-role removal for admin role
      if (userId === user?.id && role === 'admin') {
        console.error('Security violation: Users cannot remove their own admin role');
        return { 
          success: false, 
          error: { message: 'Users cannot remove their own admin role' }
        };
      }

      // Security: Only admins can remove admin roles
      if (role === 'admin' && !isAdmin()) {
        console.error('Security violation: Only admins can remove admin roles');
        return { 
          success: false, 
          error: { message: 'Only admins can remove admin roles' }
        };
      }

      // Security: Only admins or moderators can remove moderator roles
      if (role === 'moderator' && !isAdminOrModerator()) {
        console.error('Security violation: Only admins or moderators can remove moderator roles');
        return { 
          success: false, 
          error: { message: 'Only admins or moderators can remove moderator roles' }
        };
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error removing role:', error);
      return { success: false, error };
    }
  };

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isModerator,
    isAdminOrModerator,
    assignRole,
    removeRole,
    refreshRoles: fetchUserRoles
  };
}