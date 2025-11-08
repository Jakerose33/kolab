import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Core Web Vitals monitoring
    const observePerformance = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics (in real app)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'performance'
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as any; // Type assertion for FID entry
          const fidValue = fidEntry.processingStart - fidEntry.startTime;
          console.log('FID:', fidValue);
          
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(fidValue),
              event_category: 'performance'
            });
          }
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShiftEntry = entry as any; // Type assertion for CLS entry
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        console.log('CLS:', clsValue);
        
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'performance'
          });
        }
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Resource timing monitoring
    const monitorResources = () => {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow resources detected:', slowResources);
      }
    };

    // Page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        console.log('Page Load Time:', pageLoadTime + 'ms');
        console.log('DOM Content Loaded:', domContentLoaded + 'ms');
        
        // Send to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'page_load_time', {
            value: pageLoadTime,
            event_category: 'performance'
          });
        }
        
        monitorResources();
      }, 0);
    });

    // Initialize performance monitoring
    if ('PerformanceObserver' in window) {
      observePerformance();
    }

  }, []);

  return null;
}