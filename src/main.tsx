import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client'
import { CriticalCSS } from './components/CriticalCSS';
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics';
import { LoadingState } from './components/LoadingState';
import './index.css'

// Lazy load the main app for better initial bundle size
const App = lazy(() => import('./App'));

function AppWithMetrics() {
  usePerformanceMetrics();
  
  return (
    <StrictMode>
      <CriticalCSS />
      <Suspense fallback={<LoadingState />}>
        <App />
      </Suspense>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<AppWithMetrics />);
