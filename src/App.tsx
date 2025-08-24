// src/App.tsx
import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { LoadingState } from "@/components/LoadingState";
import { SecurityProvider } from "@/components/SecurityProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { LazyPages } from "./lib/lazyLoading";
import { AdvancedSEOSystem } from "@/components/AdvancedSEOSystem";
import { AdvancedSitemapGenerator } from "@/components/AdvancedSitemapGenerator";
import { AdvancedRobotsTxtManager } from "@/components/AdvancedRobotsTxtManager";
import { optimizeImages } from "@/lib/performanceOptimizations";

// ↓ NEW: direct imports for the auth screens you just created
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes("4")) {
          return false;
        }
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Optimise performance on mount
    optimizeImages();

    // Optimise images when DOM changes
    const observer = new MutationObserver(() => {
      optimizeImages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ErrorBoundary>
      <SecurityProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
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
                      <Route
                        path="/"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Index />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/events"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Events />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/events/:id"
                        element={
                          <ErrorBoundary>
                            <LazyPages.EventDetail />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/journal"
                        element={
                          <ErrorBoundary>
                            <LazyPages.JournalArchive />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/venues"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Venues />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/social"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Social />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/careers"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Careers />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Profile />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Settings />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/bookings"
                        element={
                          <ErrorBoundary>
                            <LazyPages.MyBookings />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/messages"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Messages />
                          </ErrorBoundary>
                        }
                      />

                      {/* ===== Auth routes ===== */}
                      {/* REPLACED: old /auth route → now renders SignIn */}
                      <Route
                        path="/auth"
                        element={
                          <ErrorBoundary>
                            <SignIn />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/auth/signup"
                        element={
                          <ErrorBoundary>
                            <SignUp />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/auth/debug"
                        element={
                          <ErrorBoundary>
                            <LazyPages.AuthDebug />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/auth/callback"
                        element={
                          <ErrorBoundary>
                            <LazyPages.AuthCallback />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/auth/forgot-password"
                        element={
                          <ErrorBoundary>
                            <LazyPages.ForgotPassword />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/auth/reset-password"
                        element={
                          <ErrorBoundary>
                            <LazyPages.ResetPassword />
                          </ErrorBoundary>
                        }
                      />
                      {/* ===== /Auth routes ===== */}
                      
                      <Route
                        path="/venue-dashboard"
                        element={
                          <ErrorBoundary>
                            <LazyPages.VenueOwnerDashboard />
                          </ErrorBoundary>
                        }
                      />

                      {/* ===== /Auth routes ===== */}

                      <Route
                        path="/admin"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Admin />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/analytics"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Analytics />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/search"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Search />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/venue-partners"
                        element={
                          <ErrorBoundary>
                            <LazyPages.VenuePartners />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/privacy"
                        element={
                          <ErrorBoundary>
                            <LazyPages.PrivacyPolicy />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/terms"
                        element={
                          <ErrorBoundary>
                            <LazyPages.TermsOfService />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/about"
                        element={
                          <ErrorBoundary>
                            <LazyPages.AboutUs />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/contact"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Contact />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/help"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Help />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/safety"
                        element={
                          <ErrorBoundary>
                            <LazyPages.Safety />
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/cookies"
                        element={
                          <ErrorBoundary>
                            <LazyPages.CookiePolicy />
                          </ErrorBoundary>
                        }
                      />

                      <Route path="*" element={<LazyPages.NotFound />} />
                    </Routes>
                  </Suspense>
                </AdvancedSEOSystem>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;
