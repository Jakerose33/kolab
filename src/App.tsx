import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { LoadingState } from "@/components/LoadingState";
import { initAnalytics } from "./lib/analytics";
import { LazyPages } from "./lib/lazyLoading";
import { SecurityMiddleware } from "./lib/securityHeaders";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  // Initialize analytics tracking and security
  React.useEffect(() => {
    initAnalytics();
    
    // Set CSP meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = SecurityMiddleware.generateCSP();
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <Suspense fallback={<LoadingState />}>
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary>
                    <LazyPages.Index />
                  </ErrorBoundary>
                } />
                <Route path="/venues" element={
                  <ErrorBoundary>
                    <LazyPages.Venues />
                  </ErrorBoundary>
                } />
                <Route path="/social" element={
                  <ErrorBoundary>
                    <LazyPages.Social />
                  </ErrorBoundary>
                } />
                <Route path="/careers" element={
                  <ErrorBoundary>
                    <LazyPages.Careers />
                  </ErrorBoundary>
                } />
                <Route path="/profile" element={
                  <ErrorBoundary>
                    <LazyPages.Profile />
                  </ErrorBoundary>
                } />
                <Route path="/settings" element={
                  <ErrorBoundary>
                    <LazyPages.Settings />
                  </ErrorBoundary>
                } />
                <Route path="/bookings" element={
                  <ErrorBoundary>
                    <LazyPages.MyBookings />
                  </ErrorBoundary>
                } />
                <Route path="/messages" element={
                  <ErrorBoundary>
                    <LazyPages.Messages />
                  </ErrorBoundary>
                } />
                <Route path="/auth" element={
                  <ErrorBoundary>
                    <LazyPages.Auth />
                  </ErrorBoundary>
                } />
                <Route path="/admin" element={
                  <ErrorBoundary>
                    <LazyPages.Admin />
                  </ErrorBoundary>
                } />
                <Route path="*" element={<LazyPages.NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
