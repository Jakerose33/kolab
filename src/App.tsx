import { Suspense, useEffect } from "react";
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
                      <Route path="/" element={<ErrorBoundary where="Index"><LazyPages.Index /></ErrorBoundary>} />
                      <Route path="/events" element={<ErrorBoundary where="Events"><LazyPages.Events /></ErrorBoundary>} />
                      <Route path="/events/:idOrSlug" element={<ErrorBoundary where="EventDetail"><LazyPages.EventDetail /></ErrorBoundary>} />
                      <Route path="/events/:idOrSlug/book" element={<ErrorBoundary where="EventBooking"><LazyPages.EventBooking /></ErrorBoundary>} />
                      <Route path="/journal" element={<ErrorBoundary where="JournalArchive"><LazyPages.JournalArchive /></ErrorBoundary>} />
                      <Route path="/venues" element={<ErrorBoundary where="Venues"><LazyPages.Venues /></ErrorBoundary>} />
                      <Route path="/venues/:id" element={<ErrorBoundary where="VenueDetail"><LazyPages.VenueDetail /></ErrorBoundary>} />
                      <Route path="/social" element={<ErrorBoundary where="Social"><LazyPages.Social /></ErrorBoundary>} />
                      <Route path="/careers" element={<ErrorBoundary where="Careers"><LazyPages.Careers /></ErrorBoundary>} />
                      <Route path="/profile" element={<ErrorBoundary where="Profile"><LazyPages.Profile /></ErrorBoundary>} />
                      <Route path="/settings" element={<ErrorBoundary where="Settings"><LazyPages.Settings /></ErrorBoundary>} />
                      <Route path="/bookings" element={<ErrorBoundary where="MyBookings"><LazyPages.MyBookings /></ErrorBoundary>} />
                      <Route path="/messages" element={<ErrorBoundary where="Messages"><LazyPages.Messages /></ErrorBoundary>} />

                      {/* ===== Auth routes ===== */}
                      <Route path="/auth" element={<ErrorBoundary where="SignIn"><SignIn /></ErrorBoundary>} />
                      <Route path="/auth/signup" element={<ErrorBoundary where="SignUp"><SignUp /></ErrorBoundary>} />
                      <Route path="/auth/debug" element={<ErrorBoundary where="AuthDebug"><LazyPages.AuthDebug /></ErrorBoundary>} />
                      <Route path="/auth/callback" element={<ErrorBoundary where="AuthCallback"><LazyPages.AuthCallback /></ErrorBoundary>} />
                      <Route path="/auth/forgot-password" element={<ErrorBoundary where="ForgotPassword"><LazyPages.ForgotPassword /></ErrorBoundary>} />
                      <Route path="/auth/reset-password" element={<ErrorBoundary where="ResetPassword"><LazyPages.ResetPassword /></ErrorBoundary>} />
                      <Route path="/auth/signin" element={<ErrorBoundary where="SignIn"><SignIn /></ErrorBoundary>} />
                      {/* ===== /Auth routes ===== */}
                      
                      <Route path="/venue-dashboard" element={<ErrorBoundary where="VenueOwnerDashboard"><LazyPages.VenueOwnerDashboard /></ErrorBoundary>} />
                      
                      {/* ===== Venue Onboarding Routes ===== */}
                      <Route path="/venues/onboarding/:step" element={<ErrorBoundary where="VenueOnboarding"><LazyPages.VenueOnboarding /></ErrorBoundary>} />
                      <Route path="/venues/onboarding" element={<ErrorBoundary where="VenueOnboarding"><LazyPages.VenueOnboarding /></ErrorBoundary>} />

                      <Route path="/admin" element={<ErrorBoundary where="Admin"><LazyPages.Admin /></ErrorBoundary>} />
                      <Route path="/analytics" element={<ErrorBoundary where="Analytics"><LazyPages.Analytics /></ErrorBoundary>} />
                      <Route path="/search" element={<ErrorBoundary where="Search"><LazyPages.Search /></ErrorBoundary>} />
                      <Route path="/venue-partners" element={<ErrorBoundary where="VenuePartners"><LazyPages.VenuePartners /></ErrorBoundary>} />
                      <Route path="/privacy" element={<ErrorBoundary where="PrivacyPolicy"><LazyPages.PrivacyPolicy /></ErrorBoundary>} />
                      <Route path="/terms" element={<ErrorBoundary where="TermsOfService"><LazyPages.TermsOfService /></ErrorBoundary>} />
                      <Route path="/about" element={<ErrorBoundary where="AboutUs"><LazyPages.AboutUs /></ErrorBoundary>} />
                      <Route path="/refunds" element={<ErrorBoundary where="RefundsPolicy"><LazyPages.RefundsPolicy /></ErrorBoundary>} />
                      <Route path="/contact" element={<ErrorBoundary where="Contact"><LazyPages.Contact /></ErrorBoundary>} />
                      <Route path="/help" element={<ErrorBoundary where="Help"><LazyPages.Help /></ErrorBoundary>} />
                      <Route path="/safety" element={<ErrorBoundary where="Safety"><LazyPages.Safety /></ErrorBoundary>} />
                      <Route path="/cookies" element={<ErrorBoundary where="CookiePolicy"><LazyPages.CookiePolicy /></ErrorBoundary>} />

                      <Route path="*" element={<ErrorBoundary where="NotFound"><LazyPages.NotFound /></ErrorBoundary>} />
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
