/**
 * Performance monitoring utilities for measuring content-visibility impact
 */

interface PerformanceMetrics {
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  interactionToNextPaint?: number
  contentVisibilitySupported: boolean
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    contentVisibilitySupported: CSS.supports('content-visibility', 'auto')
  })

  React.useEffect(() => {
    // Measure First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }))
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, largestContentfulPaint: entry.startTime }))
        }
      }
    })

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })

    return () => observer.disconnect()
  }, [])

  const measureInteraction = React.useCallback((startTime: number) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    setMetrics(prev => ({ ...prev, interactionToNextPaint: duration }))
  }, [])

  return { metrics, measureInteraction }
}

/**
 * Apply content-visibility optimizations to elements
 */
export function applyContentVisibility() {
  if (typeof document === 'undefined') return

  // Apply to sections that benefit from content-visibility
  const selectors = [
    '.editorial-section',
    '.events-grid',
    '.venue-section',
    '.performance-auto'
  ]

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.contentVisibility = 'auto'
        if (!element.style.containIntrinsicSize) {
          element.style.containIntrinsicSize = 'auto 500px'
        }
      }
    })
  })
}

/**
 * Hook to automatically apply performance optimizations
 */
export function usePerformanceOptimizations() {
  React.useEffect(() => {
    // Apply content-visibility on mount
    applyContentVisibility()

    // Apply again when new content loads (for dynamic content)
    const observer = new MutationObserver(() => {
      applyContentVisibility()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])
}

import * as React from "react"