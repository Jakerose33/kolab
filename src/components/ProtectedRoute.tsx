import { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoadingState } from './LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
  showPreview?: boolean; // If true, shows preview content instead of redirecting
  fallback?: ReactNode; // Custom fallback component
}

export function ProtectedRoute({ children, showPreview = false, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  // Check if we're in a router context
  let location;
  try {
    location = useLocation();
  } catch (error) {
    // If useLocation fails, we're outside router context
    // In this case, just show children without protection for now
    console.warn('ProtectedRoute used outside Router context');
    return <>{children}</>;
  }

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