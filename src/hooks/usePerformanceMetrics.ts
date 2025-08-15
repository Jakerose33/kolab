import { useState, useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  pageLoadTime: number
  timeToInteractive: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  memoryUsage: number
  connectionSpeed: string
  cacheHitRate: number
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})
  const [isTracking, setIsTracking] = useState(false)

  const measurePerformance = useCallback(() => {
    if (!window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const newMetrics: Partial<PerformanceMetrics> = {}

    // Page load time
    if (navigation) {
      newMetrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart
      newMetrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart
      newMetrics.ttfb = navigation.responseStart - navigation.requestStart
    }

    // Paint metrics
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
    if (fcp) {
      newMetrics.firstContentfulPaint = fcp.startTime
      newMetrics.fcp = fcp.startTime
    }

    // Memory usage (if supported)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      newMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }

    // Connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      newMetrics.connectionSpeed = connection.effectiveType || 'unknown'
    }

    setMetrics(prev => ({ ...prev, ...newMetrics }))
  }, [])

  const measureCachePerformance = useCallback(() => {
    const cacheHits = sessionStorage.getItem('cache_hits') || '0'
    const cacheMisses = sessionStorage.getItem('cache_misses') || '0'
    const hits = parseInt(cacheHits)
    const misses = parseInt(cacheMisses)
    const total = hits + misses
    
    if (total > 0) {
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: (hits / total) * 100
      }))
    }
  }, [])

  const recordCacheHit = useCallback(() => {
    const current = parseInt(sessionStorage.getItem('cache_hits') || '0')
    sessionStorage.setItem('cache_hits', (current + 1).toString())
    measureCachePerformance()
  }, [measureCachePerformance])

  const recordCacheMiss = useCallback(() => {
    const current = parseInt(sessionStorage.getItem('cache_misses') || '0')
    sessionStorage.setItem('cache_misses', (current + 1).toString())
    measureCachePerformance()
  }, [measureCachePerformance])

  const startTracking = useCallback(() => {
    setIsTracking(true)
    
    // Measure initial performance
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    // Core Web Vitals tracking
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            switch (entry.entryType) {
              case 'paint':
                if (entry.name === 'first-contentful-paint') {
                  setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
                }
                break
              case 'largest-contentful-paint':
                setMetrics(prev => ({ 
                  ...prev, 
                  lcp: entry.startTime,
                  largestContentfulPaint: entry.startTime 
                }))
                break
              case 'first-input':
                const fidEntry = entry as any
                setMetrics(prev => ({ 
                  ...prev, 
                  fid: fidEntry.processingStart - fidEntry.startTime 
                }))
                break
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  setMetrics(prev => ({ 
                    ...prev, 
                    cls: (prev.cls || 0) + (entry as any).value,
                    cumulativeLayoutShift: (prev.cumulativeLayoutShift || 0) + (entry as any).value
                  }))
                }
                break
            }
          }
        })

        observer.observe({ 
          entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
        })
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error)
      }
    }

    measureCachePerformance()
  }, [measurePerformance, measureCachePerformance])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  const getPerformanceScore = useCallback(() => {
    const { 
      firstContentfulPaint = 0,
      largestContentfulPaint = 0,
      cumulativeLayoutShift = 0,
      timeToInteractive = 0
    } = metrics

    let score = 100

    // FCP scoring (good: <1.8s, poor: >3s)
    if (firstContentfulPaint > 3000) score -= 25
    else if (firstContentfulPaint > 1800) score -= 10

    // LCP scoring (good: <2.5s, poor: >4s)
    if (largestContentfulPaint > 4000) score -= 25
    else if (largestContentfulPaint > 2500) score -= 10

    // CLS scoring (good: <0.1, poor: >0.25)
    if (cumulativeLayoutShift > 0.25) score -= 25
    else if (cumulativeLayoutShift > 0.1) score -= 10

    // TTI scoring (good: <3.8s, poor: >7.3s)
    if (timeToInteractive > 7300) score -= 25
    else if (timeToInteractive > 3800) score -= 10

    return Math.max(0, score)
  }, [metrics])

  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy'
      }
      if (!img.decoding) {
        img.decoding = 'async'
      }
    })
  }, [])

  const preloadCriticalResources = useCallback((urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url
      link.as = url.endsWith('.css') ? 'style' : url.endsWith('.js') ? 'script' : 'fetch'
      document.head.appendChild(link)
    })
  }, [])

  useEffect(() => {
    startTracking()
    optimizeImages()

    return () => {
      stopTracking()
    }
  }, [startTracking, stopTracking, optimizeImages])

  return {
    metrics,
    isTracking,
    startTracking,
    stopTracking,
    recordCacheHit,
    recordCacheMiss,
    getPerformanceScore,
    optimizeImages,
    preloadCriticalResources
  }
}