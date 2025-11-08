import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            An unexpected error occurred. This has been logged and we'll fix it soon.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                Error details (dev only)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded border overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={resetErrorBoundary} 
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PathnameErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function PathnameErrorBoundary({ children, fallback = ErrorFallback }: PathnameErrorBoundaryProps) {
  const location = useLocation();

  return (
    <ReactErrorBoundary
      key={location.pathname} // Reset boundary on navigation
      FallbackComponent={fallback}
      onError={(error, errorInfo) => {
        // Log errors in production
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // In production, you might want to send to error tracking service
        if (process.env.NODE_ENV === 'production') {
          // Example: Sentry, LogRocket, etc.
          // errorTracker.captureException(error, { extra: errorInfo });
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Specialized error boundary for event-related pages
export function EventErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <PathnameErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Event Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                This event may have been removed or doesn't exist.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <Link to="/events">
                    Browse Events
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </PathnameErrorBoundary>
  );
}