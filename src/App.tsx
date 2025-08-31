import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { LoadingState } from "@/components/LoadingState";
import { SecurityProvider } from "@/components/SecurityProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { LazyPages } from "./lib/lazyLoading";
import { AdvancedSEOSystem } from "@/components/AdvancedSEOSystem";
import { AdvancedSitemapGenerator } from "@/components/AdvancedSitemapGenerator";
import { AdvancedRobotsTxtManager } from "@/components/AdvancedRobotsTxtManager";
import { optimizeImages } from "@/lib/performanceOptimizations";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

// ↓ NEW: direct imports for the auth screens you just created
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";

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
            We're sorry, but something unexpected happened. Please try again.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={resetErrorBoundary}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
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

// Auto-resetting routes wrapper
function RoutesWithErrorReset() {
  const location = useLocation();
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      FallbackComponent={AppErrorFallback}
      onReset={reset}
      resetKeys={[location.pathname]} // Auto-reset on route change
    >
      <Routes>
        <Route path="/" element={<LazyPages.Index />} />
        <Route path="/events" element={<LazyPages.Events />} />
        <Route path="/events/:idOrSlug" element={<LazyPages.EventDetail />} />
        <Route path="/events/:idOrSlug/book" element={<LazyPages.EventBooking />} />
        <Route path="/payment" element={<LazyPages.Payment />} />
        <Route path="/journal" element={<LazyPages.JournalArchive />} />
        <Route path="/venues" element={<LazyPages.Venues />} />
        <Route path="/venues/:id" element={<LazyPages.VenueDetail />} />
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
    </ErrorBoundary>
  );
}

function App() {
  useEffect(() => {
    // Optimise performance on mount
    optimizeImages();

    // Optimise images when DOM changes
    const observer = new MutationObserver(() => {
      optimizeImages();
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
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
                  <RoutesWithErrorReset />
                </Suspense>
              </AdvancedSEOSystem>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SecurityProvider>
  );
}

export default App;
