import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface UnifiedImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
  priority?: boolean
  sizes?: string
  placeholder?: 'blur' | 'empty'
  quality?: number
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  width?: number
  height?: number
  webp?: boolean
  avif?: boolean
}

export const UnifiedImageComponent = ({
  src,
  alt,
  className,
  aspectRatio = '16/9',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'blur',
  quality = 75,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
  width,
  height,
  webp = true,
  avif = true
}: UnifiedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [optimizedSrc, setOptimizedSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Browser support detection
  const supportsWebP = () => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('webp') > -1
  }

  const supportsAVIF = () => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    return canvas.toDataURL('image/avif').indexOf('avif') > -1
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px'
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  // Set optimized source based on browser support
  useEffect(() => {
    if (!isInView && !priority) return

    let optimized = src
    if (avif && supportsAVIF()) {
      optimized = src.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif')
    } else if (webp && supportsWebP()) {
      optimized = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }
    
    setOptimizedSrc(optimized)
  }, [src, isInView, priority, webp, avif])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
    
    // Performance tracking
    if (performance.mark) {
      performance.mark(`image-loaded-${src}`)
    }
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
    
    // Fallback to original src if optimized version fails
    if (optimizedSrc !== src) {
      setOptimizedSrc(src)
      setHasError(false)
    } else if (fallbackSrc) {
      setOptimizedSrc(fallbackSrc)
      setHasError(false)
    }
  }

  const generateSrcSet = () => {
    if (!webp && !avif) return undefined
    
    const sizes = [320, 640, 768, 1024, 1280, 1920]
    return sizes.map(size => {
      let url = optimizedSrc
      // In production, you'd use an image CDN here
      return `${url} ${size}w`
    }).join(', ')
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && placeholder === 'blur' && 'bg-muted/20',
        className
      )}
      style={{ aspectRatio, width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 animate-pulse" />
      )}

      {/* Main Image */}
      {(isInView || priority) && (
        <picture>
          {avif && supportsAVIF() && (
            <source 
              srcSet={generateSrcSet()} 
              type="image/avif" 
              sizes={sizes}
            />
          )}
          {webp && supportsWebP() && (
            <source 
              srcSet={generateSrcSet()} 
              type="image/webp" 
              sizes={sizes}
            />
          )}
          <img
            ref={imgRef}
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </picture>
      )}

      {/* Loading indicator */}
      {!isLoaded && (isInView || priority) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Structured data for SEO */}
      {isLoaded && !hasError && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "contentUrl": optimizedSrc,
              "description": alt,
              "width": width,
              "height": height
            })
          }}
        />
      )}
    </div>
  )
}