import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Index from "./pages/Index";
import Venues from "./pages/Venues";
import Social from "./pages/Social";
import Careers from "./pages/Careers";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import MyBookings from "./pages/MyBookings";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ErrorBoundary>
                <Index />
              </ErrorBoundary>
            } />
            <Route path="/venues" element={
              <ErrorBoundary>
                <Venues />
              </ErrorBoundary>
            } />
            <Route path="/social" element={
              <ErrorBoundary>
                <Social />
              </ErrorBoundary>
            } />
            <Route path="/careers" element={
              <ErrorBoundary>
                <Careers />
              </ErrorBoundary>
            } />
            <Route path="/profile" element={
              <ErrorBoundary>
                <Profile />
              </ErrorBoundary>
            } />
            <Route path="/settings" element={
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            } />
            <Route path="/bookings" element={
              <ErrorBoundary>
                <MyBookings />
              </ErrorBoundary>
            } />
            <Route path="/messages" element={
              <ErrorBoundary>
                <Messages />
              </ErrorBoundary>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
