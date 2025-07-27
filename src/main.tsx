import React, { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client'
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<LoadingState />}>
      <App />
    </Suspense>
  </StrictMode>
);
