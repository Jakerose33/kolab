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
                      <Route path="/" element={<LazyPages.Index />} />
                      <Route path="/events" element={<LazyPages.Events />} />
                      <Route path="/events/:id" element={<LazyPages.EventDetail />} />
                      <Route path="/journal" element={<LazyPages.JournalArchive />} />
                      <Route path="/venues" element={<LazyPages.Venues />} />
                      <Route path="/social" element={<LazyPages.Social />} />
                      <Route path="/careers" element={<LazyPages.Careers />} />
                      <Route path="/profile" element={<LazyPages.Profile />} />
                      <Route path="/settings" element={<LazyPages.Settings />} />
                      <Route path="/bookings" element={<LazyPages.MyBookings />} />
                      <Route path="/messages" element={<LazyPages.Messages />} />

                      {/* ===== Auth routes ===== */}
                      <Route path="/auth" element={<SignIn />} />
                      <Route path="/auth/signup" element={<SignUp />} />
                      <Route path="/auth/debug" element={<LazyPages.AuthDebug />} />
                      <Route path="/auth/callback" element={<LazyPages.AuthCallback />} />
                      <Route path="/auth/forgot-password" element={<LazyPages.ForgotPassword />} />
                      <Route path="/auth/reset-password" element={<LazyPages.ResetPassword />} />
                      <Route path="/auth/signin" element={<SignIn />} />
                      {/* ===== /Auth routes ===== */}
                      
                      <Route path="/venue-dashboard" element={<LazyPages.VenueOwnerDashboard />} />
                      
                      {/* ===== Venue Onboarding Routes ===== */}
                      <Route path="/venues/onboarding/:step" element={<LazyPages.VenueOnboarding />} />
                      <Route path="/venues/onboarding" element={<LazyPages.VenueOnboarding />} />

                      <Route path="/admin" element={<LazyPages.Admin />} />
                      <Route path="/analytics" element={<LazyPages.Analytics />} />
                      <Route path="/search" element={<LazyPages.Search />} />
                      <Route path="/venue-partners" element={<LazyPages.VenuePartners />} />
                      <Route path="/privacy" element={<LazyPages.PrivacyPolicy />} />
                      <Route path="/terms" element={<LazyPages.TermsOfService />} />
                      <Route path="/about" element={<LazyPages.AboutUs />} />
                      <Route path="/refunds" element={<LazyPages.RefundsPolicy />} />
                      <Route path="/contact" element={<LazyPages.Contact />} />
                      <Route path="/help" element={<LazyPages.Help />} />
                      <Route path="/safety" element={<LazyPages.Safety />} />
                      <Route path="/cookies" element={<LazyPages.CookiePolicy />} />

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
