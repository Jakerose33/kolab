
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { LoadingState } from "@/components/LoadingState";
import { SecurityProvider } from "@/components/SecurityProvider";
import { LazyPages } from "./lib/lazyLoading";
import { AdvancedSEOSystem } from "@/components/AdvancedSEOSystem";
import { AdvancedSitemapGenerator } from "@/components/AdvancedSitemapGenerator";
import { AdvancedRobotsTxtManager } from "@/components/AdvancedRobotsTxtManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SecurityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <BrowserRouter>
              <AdvancedSEOSystem>
                <AdvancedSitemapGenerator />
                <AdvancedRobotsTxtManager />
                <Suspense fallback={<LoadingState />}>
                  <Routes>
                  <Route path="/" element={
                    <ErrorBoundary>
                      <LazyPages.Index />
                    </ErrorBoundary>
                  } />
                  <Route path="/events" element={
                    <ErrorBoundary>
                      <LazyPages.Events />
                    </ErrorBoundary>
                  } />
                  <Route path="/events/:id" element={
                    <ErrorBoundary>
                      <LazyPages.EventDetail />
                    </ErrorBoundary>
                  } />
                  <Route path="/journal" element={
                    <ErrorBoundary>
                      <LazyPages.JournalArchive />
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
                  <Route path="/analytics" element={
                    <ErrorBoundary>
                      <LazyPages.Analytics />
                    </ErrorBoundary>
                  } />
                  <Route path="/search" element={
                    <ErrorBoundary>
                      <LazyPages.Search />
                    </ErrorBoundary>
                  } />
                  <Route path="/venue-partners" element={
                    <ErrorBoundary>
                      <LazyPages.VenuePartners />
                    </ErrorBoundary>
                  } />
                  <Route path="/privacy" element={
                    <ErrorBoundary>
                      <LazyPages.PrivacyPolicy />
                    </ErrorBoundary>
                  } />
                  <Route path="/terms" element={
                    <ErrorBoundary>
                      <LazyPages.TermsOfService />
                    </ErrorBoundary>
                  } />
                  <Route path="/about" element={
                    <ErrorBoundary>
                      <LazyPages.AboutUs />
                    </ErrorBoundary>
                  } />
                  <Route path="/contact" element={
                    <ErrorBoundary>
                      <LazyPages.Contact />
                    </ErrorBoundary>
                  } />
                  <Route path="/help" element={
                    <ErrorBoundary>
                      <LazyPages.Help />
                    </ErrorBoundary>
                  } />
                  <Route path="/safety" element={
                    <ErrorBoundary>
                      <LazyPages.Safety />
                    </ErrorBoundary>
                  } />
                  <Route path="/cookies" element={
                    <ErrorBoundary>
                      <LazyPages.CookiePolicy />
                    </ErrorBoundary>
                  } />
                  <Route path="*" element={<LazyPages.NotFound />} />
                  </Routes>
                </Suspense>
              </AdvancedSEOSystem>
            </BrowserRouter>
          </TooltipProvider>
        </SecurityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
