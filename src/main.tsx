import React, { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client'
import { CriticalCSS } from './components/CriticalCSS';
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics';
import { LoadingState } from './components/LoadingState';
import './index.css'

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Lazy load the main app for better initial bundle size
const App = lazy(() => import('./App'));

// Wrapper component that properly uses React hooks
function AppWithMetrics() {
  usePerformanceMetrics();
  
  return (
    <>
      <CriticalCSS />
      <Suspense fallback={<LoadingState />}>
        <App />
      </Suspense>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithMetrics />
  </StrictMode>
);
