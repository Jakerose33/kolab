import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLazyLoading } from '@/lib/lazyLoading';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lazy?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  fallback?: string;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  lazy = true,
  aspectRatio,
  fallback = '/placeholder.svg',
  sizes,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(priority ? src : '');
  const imgRef = useRef<HTMLImageElement>(null);
  const { observeElement } = useLazyLoading();

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  // Handle lazy loading
  useEffect(() => {
    if (!lazy || priority) {
      setImageSrc(src);
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    img.dataset.src = src;
    observeElement(img);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px' }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, lazy, priority, observeElement]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
  };

  return (
    <div className={cn(
      'relative overflow-hidden bg-muted',
      aspectRatio && aspectRatioClasses[aspectRatio],
      className
    )}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        sizes={sizes}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'opacity-50'
        )}
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
}

// Higher-order component for lazy loading any component
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  const LazyComponent = (props: T) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(element);
            }
          });
        },
        { rootMargin: '50px 0px' }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <div ref={elementRef}>
        {isVisible ? (
          <Component {...props} />
        ) : (
          fallback || <Skeleton className="w-full h-48" />
        )}
      </div>
    );
  };

  return LazyComponent;
}