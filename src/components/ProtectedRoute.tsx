import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from './LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
  showPreview?: boolean; // If true, shows preview content instead of redirecting
  fallback?: ReactNode; // Custom fallback component
}

export function ProtectedRoute({ children, showPreview = false, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    if (showPreview && fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}