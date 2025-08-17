import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { LoadingState } from './LoadingState';

interface AdminRouteProps {
  children: ReactNode;
  requireModerator?: boolean; // If true, allows both admin and moderator access
}

export function AdminRoute({ children, requireModerator = false }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isModerator, loading: rolesLoading } = useUserRoles();

  if (authLoading || rolesLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasAccess = requireModerator ? (isAdmin() || isModerator()) : isAdmin();

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}