import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { LazyPages } from "@/lib/lazyLoading";
import { optimizeImages } from "@/lib/performanceOptimizations";
import { addViewTransitionStyles } from "@/lib/viewTransitions";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

// ↓ Direct imports for the auth screens
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";

// Error fallback component
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

// Component to handle app-level effects
function AppEffects() {
  useEffect(() => {
    // Optimise performance on mount
    optimizeImages();
    
    // Add view transition styles for smooth page transitions
    addViewTransitionStyles();

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

  return null; // This component only handles effects
}

// Routes component with proper hook context
export default function AppRoutes() {
  const location = useLocation();
  const { reset } = useQueryErrorResetBoundary();

  return (
    <>
      <AppEffects />
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

          {/* ===== Venue Partner routes ===== */}
          <Route path="/venue-partners" element={<LazyPages.VenuePartners />} />
          <Route path="/venue-onboarding" element={<LazyPages.VenueOnboarding />} />
          <Route path="/venue-dashboard" element={<LazyPages.VenueOwnerDashboard />} />

          {/* ===== Search route ===== */}
          <Route path="/search" element={<LazyPages.Search />} />

          {/* ===== Admin routes ===== */}
          <Route path="/admin" element={<LazyPages.Admin />} />
          <Route path="/analytics" element={<LazyPages.Analytics />} />
          <Route path="/report" element={<LazyPages.AdvancedErrorReport />} />

          {/* ===== Legal routes ===== */}
          <Route path="/about" element={<LazyPages.AboutUs />} />
          <Route path="/contact" element={<LazyPages.Contact />} />
          <Route path="/help" element={<LazyPages.Help />} />
          <Route path="/safety" element={<LazyPages.Safety />} />
          <Route path="/privacy" element={<LazyPages.PrivacyPolicy />} />
          <Route path="/terms" element={<LazyPages.TermsOfService />} />
          <Route path="/refunds" element={<LazyPages.RefundsPolicy />} />
          <Route path="/cookies" element={<LazyPages.CookiePolicy />} />

          <Route path="*" element={<LazyPages.NotFound />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
}