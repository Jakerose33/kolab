import React, { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SecurityProvider } from "@/components/SecurityProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AdvancedSEOSystem } from "@/components/AdvancedSEOSystem";
import { AdvancedSitemapGenerator } from "@/components/AdvancedSitemapGenerator";
import { AdvancedRobotsTxtManager } from "@/components/AdvancedRobotsTxtManager";
import { SecurityMonitor } from "@/components/SecurityMonitor";
import { GlobalImageErrorHandler } from "@/components/GlobalImageErrorHandler";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppRoutes from "@/components/AppRoutes";
import { ErrorPrompt, openErrorPromptFor } from "@/components/reporting/ErrorPrompt";
import type { ErrorPayload } from "@/lib/error-report";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, // Don't retry failed queries to prevent error loops
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error fallback component that auto-resets on navigation
function AppErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page or go back to the homepage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetErrorBoundary} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function App() {
  const [errorPrompt, setErrorPrompt] = useState<ErrorPayload | null>(null);

  useEffect(() => {
    // Set up global error prompt handler
    (window as any).__openErrorPrompt = (payload: ErrorPayload) => setErrorPrompt(payload);
    
    // Handle unhandled JavaScript errors
    const onError = (event: ErrorEvent) => {
      openErrorPromptFor(event.error ?? event.message, 'auto');
    };
    
    // Handle unhandled promise rejections
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      openErrorPromptFor(event.reason ?? 'Unhandled promise rejection', 'auto');
    };
    
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={AppErrorFallback}
      onError={(error) => {
        console.error('App-level error:', error);
        openErrorPromptFor(error, 'auto');
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
              <SecurityProvider>
                <AuthProvider>
                  <GlobalImageErrorHandler />
                  <Toaster />
                  <Sonner />
                  <OfflineIndicator />
                  <AdvancedSEOSystem>
                    <AdvancedSitemapGenerator />
                    <AdvancedRobotsTxtManager />
                    <Suspense fallback={<div className="min-h-screen bg-background" />}>
                      <AppRoutes />
                      <SecurityMonitor />
                    </Suspense>
                  </AdvancedSEOSystem>
                  {errorPrompt && (
                    <ErrorPrompt
                      open={!!errorPrompt}
                      payload={errorPrompt}
                      onClose={() => setErrorPrompt(null)}
                    />
                  )}
                </AuthProvider>
              </SecurityProvider>
            </TooltipProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;