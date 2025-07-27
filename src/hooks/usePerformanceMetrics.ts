import { useEffect } from "react";

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function usePerformanceMetrics() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const metrics: PerformanceMetrics = {};

    // Measure Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metrics.lcp = entry.startTime;
            break;
          case 'first-input':
            const fidEntry = entry as any; // PerformanceEventTiming
            metrics.fid = fidEntry.processingStart - fidEntry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              metrics.cls = (metrics.cls || 0) + (entry as any).value;
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            break;
        }
      }
    });

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
    } catch (e) {
      // Fallback for older browsers
      console.warn('Performance Observer not fully supported');
    }

    // Send metrics after page load
    const sendMetrics = () => {
      if (Object.keys(metrics).length > 0) {
        console.log('Performance Metrics:', metrics);
        // In a real app, you would send these to your analytics service
        // analytics.track('performance_metrics', metrics);
      }
    };

    // Send metrics after a delay to capture all measurements
    setTimeout(sendMetrics, 5000);

    return () => {
      observer.disconnect();
    };
  }, []);
}