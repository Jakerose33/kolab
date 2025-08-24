import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageOptimizedProps {
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
}

export function LazyImageOptimized({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = "100vw",
  quality = 75,
  placeholder = 'empty',
  onLoad,
  onError
}: LazyImageOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before the image is visible
      }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate responsive image URLs (simulated - in real app would use image CDN)
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes.map(size => {
      // In real implementation, you'd use an image CDN like Cloudinary or ImageKit
      // For now, we'll use the original source
      return `${baseSrc} ${size}w`;
    }).join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const imageProps = {
    ref: imgRef,
    alt,
    width,
    height,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' as const : 'lazy' as const,
    decoding: 'async' as const,
    className: cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      className
    )
  };

  return (
    <div 
      ref={placeholderRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && placeholder === 'blur' && 'bg-muted animate-pulse'
      )}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          {placeholder === 'blur' && (
            <div className="w-full h-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
          )}
        </div>
      )}

      {/* Main Image */}
      {isInView && !error && (
        <img
          {...imageProps}
          src={src}
          srcSet={generateSrcSet(src)}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}

      {/* SEO-optimized structured data for images */}
      {isLoaded && !error && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "contentUrl": src,
              "description": alt,
              "width": width,
              "height": height
            })
          }}
        />
      )}
    </div>
  );
}