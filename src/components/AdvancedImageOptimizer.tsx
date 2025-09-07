import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AdvancedImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  webp?: boolean;
  avif?: boolean;
  responsive?: boolean;
}

export function AdvancedImageOptimizer({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = "100vw",
  quality = 75,
  placeholder = 'blur',
  onLoad,
  onError,
  lazy = true,
  webp = true,
  avif = true,
  responsive = true
}: AdvancedImageOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority || !lazy);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Advanced image format detection
  const supportsWebP = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  const supportsAVIF = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }, []);

  // Generate optimized image URLs
  const generateOptimizedSrc = useCallback((originalSrc: string) => {
    if (avif && supportsAVIF()) {
      // In a real app, you'd convert to AVIF format
      return originalSrc;
    }
    if (webp && supportsWebP()) {
      // In a real app, you'd convert to WebP format
      return originalSrc;
    }
    return originalSrc;
  }, [avif, webp, supportsAVIF, supportsWebP]);

  // Generate responsive srcset
  const generateSrcSet = useCallback((baseSrc: string) => {
    if (!responsive) return undefined;
    
    const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];
    return breakpoints.map(bp => `${baseSrc} ${bp}w`).join(', ');
  }, [responsive]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  // Set optimized source when in view
  useEffect(() => {
    if (isInView && !currentSrc) {
      setCurrentSrc(generateOptimizedSrc(src));
    }
  }, [isInView, src, currentSrc, generateOptimizedSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
    
    // Report performance metrics
    if ('performance' in window) {
      const entries = performance.getEntriesByName(currentSrc);
      if (entries.length > 0) {
        const entry = entries[0] as PerformanceResourceTiming;
        console.log(`Image loaded: ${currentSrc} in ${entry.duration}ms`);
      }
    }
  }, [currentSrc, onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    onError?.();
    console.error(`Failed to load image: ${currentSrc}`);
  }, [currentSrc, onError]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = generateOptimizedSrc(src);
      if (responsive) {
        link.imageSizes = sizes;
        link.imageSrcset = generateSrcSet(src) || '';
      }
      document.head.appendChild(link);
      
      return () => {
        try {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        } catch (error) {
          // Silently handle removal errors
        }
      };
    }
  }, [priority, src, sizes, generateOptimizedSrc, generateSrcSet, responsive]);

  const imageProps = {
    ref: imgRef,
    alt,
    width,
    height,
    sizes: responsive ? sizes : undefined,
    srcSet: responsive ? generateSrcSet(currentSrc) : undefined,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' as const : 'lazy' as const,
    decoding: 'async' as const,
    className: cn(
      'transition-all duration-500 ease-out',
      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
      className
    ),
    style: {
      filter: isLoaded ? 'none' : 'blur(8px)',
      transform: isLoaded ? 'scale(1)' : 'scale(1.05)'
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        !isLoaded && 'animate-pulse'
      )}
      style={{ width, height }}
    >
      {/* Advanced placeholder with gradient animation */}
      {!isLoaded && !error && placeholder === 'blur' && (
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-muted via-muted-foreground/5 to-muted animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Main optimized image */}
      {isInView && currentSrc && !error && (
        <picture>
          {avif && (
            <source
              srcSet={responsive ? generateSrcSet(currentSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif')) : undefined}
              type="image/avif"
              sizes={responsive ? sizes : undefined}
            />
          )}
          {webp && (
            <source
              srcSet={responsive ? generateSrcSet(currentSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')) : undefined}
              type="image/webp"
              sizes={responsive ? sizes : undefined}
            />
          )}
          <img
            {...imageProps}
            src={currentSrc}
          />
        </picture>
      )}

      {/* Error fallback with retry */}
      {error && (
        <div className="absolute inset-0 bg-muted/50 flex flex-col items-center justify-center text-muted-foreground">
          <span className="text-sm mb-2">Image failed to load</span>
          <button 
            onClick={() => {
              setError(false);
              setCurrentSrc('');
              setIsLoaded(false);
              setTimeout(() => setCurrentSrc(generateOptimizedSrc(src)), 100);
            }}
            className="text-xs text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Structured data for images */}
      {isLoaded && !error && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "contentUrl": currentSrc,
              "description": alt,
              "width": width,
              "height": height,
              "encodingFormat": currentSrc.includes('.webp') ? 'image/webp' : 
                               currentSrc.includes('.avif') ? 'image/avif' : 'image/jpeg',
              "thumbnailUrl": currentSrc
            })
          }}
        />
      )}
    </div>
  );
}