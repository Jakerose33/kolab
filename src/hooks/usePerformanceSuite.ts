import { useEffect, useCallback, useState } from 'react'
import { optimizeImages, preloadCriticalResources, debounce } from '@/lib/performanceOptimizations'
import { applyContentVisibility } from '@/hooks/usePerformanceOptimizations'

interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
  pageLoadTime?: number
  memoryUsage?: number
  connectionSpeed?: string
  cacheHitRate?: number
}

interface PerformanceConfig {
  enableImageOptimization?: boolean
  enableContentVisibility?: boolean
  enableCaching?: boolean
  enableMetrics?: boolean
  criticalResources?: string[]
}

export function usePerformanceSuite(config: PerformanceConfig = {}) {
  const {
    enableImageOptimization = true,
    enableContentVisibility = true,
    enableCaching = true,
    enableMetrics = true,
    criticalResources = []
  } = config

  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isOptimized, setIsOptimized] = useState(false)

  // Core Web Vitals tracking
  const trackCoreWebVitals = useCallback(() => {
    if (!enableMetrics) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
            }
            break
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
            break
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }))
            break
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }))
            }
            break
        }
      }
    })

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
    return () => observer.disconnect()
  }, [enableMetrics])

  // Memory usage tracking
  const trackMemoryUsage = useCallback(() => {
    if (!enableMetrics || !(performance as any).memory) return

    const updateMemory = () => {
      const memory = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      }))
    }

    updateMemory()
    const interval = setInterval(updateMemory, 5000)
    return () => clearInterval(interval)
  }, [enableMetrics])

  // Connection speed detection
  const detectConnectionSpeed = useCallback(() => {
    if (!enableMetrics) return

    const connection = (navigator as any).connection
    if (connection) {
      setMetrics(prev => ({
        ...prev,
        connectionSpeed: connection.effectiveType
      }))
    }
  }, [enableMetrics])

  // Page load metrics
  const trackPageLoad = useCallback(() => {
    if (!enableMetrics) return

    const handleLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      setMetrics(prev => ({
        ...prev,
        ttfb: navigation.responseStart - navigation.requestStart,
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart
      }))
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [enableMetrics])

  // Cache performance tracking
  const trackCachePerformance = useCallback(() => {
    if (!enableCaching) return

    const cacheHits = parseInt(sessionStorage.getItem('cacheHits') || '0')
    const cacheMisses = parseInt(sessionStorage.getItem('cacheMisses') || '0')
    const total = cacheHits + cacheMisses
    
    if (total > 0) {
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: cacheHits / total
      }))
    }
  }, [enableCaching])

  // Optimize performance
  const optimize = useCallback(async () => {
    if (isOptimized) return

    try {
      // Image optimization
      if (enableImageOptimization) {
        optimizeImages()
      }

      // Content visibility
      if (enableContentVisibility) {
        applyContentVisibility()
      }

      // Preload critical resources
      if (criticalResources.length > 0) {
        preloadCriticalResources(criticalResources)
      }

      // Enable service worker
      if ('serviceWorker' in navigator && enableCaching) {
        await navigator.serviceWorker.register('/sw.js')
      }

      setIsOptimized(true)
    } catch (error) {
      console.error('Performance optimization failed:', error)
    }
  }, [isOptimized, enableImageOptimization, enableContentVisibility, criticalResources, enableCaching])

  // Performance score calculation
  const getPerformanceScore = useCallback(() => {
    const { lcp = 0, fid = 0, cls = 0, fcp = 0 } = metrics
    
    let score = 100
    
    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (lcp > 4000) score -= 30
    else if (lcp > 2500) score -= 15
    
    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (fid > 300) score -= 25
    else if (fid > 100) score -= 10
    
    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (cls > 0.25) score -= 25
    else if (cls > 0.1) score -= 10
    
    // FCP scoring (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
    if (fcp > 3000) score -= 20
    else if (fcp > 1800) score -= 10
    
    return Math.max(0, score)
  }, [metrics])

  // Initialize performance suite
  useEffect(() => {
    const cleanupFunctions: Array<() => void> = []

    // Start tracking
    const cwvCleanup = trackCoreWebVitals()
    const memoryCleanup = trackMemoryUsage()
    const pageLoadCleanup = trackPageLoad()
    
    if (cwvCleanup) cleanupFunctions.push(cwvCleanup)
    if (memoryCleanup) cleanupFunctions.push(memoryCleanup)
    if (pageLoadCleanup) cleanupFunctions.push(pageLoadCleanup)

    // Detect connection and cache performance
    detectConnectionSpeed()
    trackCachePerformance()

    // Auto-optimize
    optimize()

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [trackCoreWebVitals, trackMemoryUsage, trackPageLoad, detectConnectionSpeed, trackCachePerformance, optimize])

  return {
    metrics,
    isOptimized,
    performanceScore: getPerformanceScore(),
    optimize,
    trackCachePerformance
  }
}