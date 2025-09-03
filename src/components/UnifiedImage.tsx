import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface UnifiedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  debug?: boolean;
}

interface ImageState {
  isLoaded: boolean;
  isInView: boolean;
  hasError: boolean;
  currentSrc: string;
  loadAttempts: number;
}

const MAX_LOAD_ATTEMPTS = 2;
const INTERSECTION_THRESHOLD = 0.1;
const INTERSECTION_ROOT_MARGIN = '50px';

export function UnifiedImage({
  src,
  alt,
  className,
  width,
  height,
  aspectRatio,
  priority = false,
  sizes = '100vw',
  quality = 75,
  placeholder = 'empty',
  fallbackSrc = '/placeholder.svg',
  onLoad,
  onError,
  debug = false
}: UnifiedImageProps) {
  const [state, setState] = useState<ImageState>({
    isLoaded: false,
    isInView: priority,
    hasError: false,
    currentSrc: src,
    loadAttempts: 0
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const log = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`[UnifiedImage] ${message}`, data || '');
    }
  }, [debug]);

  // Cleanup observer
  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (priority || state.isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          log('Image came into view');
          setState(prev => ({ ...prev, isInView: true }));
          cleanupObserver();
        }
      },
      {
        threshold: INTERSECTION_THRESHOLD,
        rootMargin: INTERSECTION_ROOT_MARGIN
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
      observerRef.current = observer;
      log('Observer attached');
    }

    return cleanupObserver;
  }, [priority, state.isInView, cleanupObserver, log]);

  // Handle successful image load
  const handleLoad = useCallback(() => {
    log('Image loaded successfully');
    setState(prev => ({ 
      ...prev, 
      isLoaded: true, 
      hasError: false 
    }));
    onLoad?.();
  }, [onLoad, log]);

  // Handle image load error with retry logic
  const handleError = useCallback((error: any) => {
    log('Image load error', { error, attempts: state.loadAttempts + 1 });
    
    setState(prev => {
      const newAttempts = prev.loadAttempts + 1;
      
      // Try fallback if available and we haven't exceeded attempts
      if (newAttempts < MAX_LOAD_ATTEMPTS && fallbackSrc && prev.currentSrc !== fallbackSrc) {
        log('Trying fallback image');
        return {
          ...prev,
          currentSrc: fallbackSrc,
          loadAttempts: newAttempts,
          hasError: false
        };
      }
      
      // Final failure
      log('Image loading failed permanently');
      return {
        ...prev,
        hasError: true,
        loadAttempts: newAttempts
      };
    });
    
    onError?.(error);
  }, [fallbackSrc, onError, log, state.loadAttempts]);

  // Reset state when src changes
  useEffect(() => {
    log('Source changed, resetting state', { newSrc: src });
    setState(prev => ({
      ...prev,
      isLoaded: false,
      hasError: false,
      currentSrc: src,
      loadAttempts: 0
    }));
  }, [src, log]);

  // Calculate container styles
  const containerStyles: React.CSSProperties = {
    width,
    height,
    aspectRatio
  };

  // Determine if we should render the image
  const shouldRenderImage = state.isInView || priority;

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted/20',
        className
      )}
      style={containerStyles}
    >
      {/* Placeholder */}
      {!state.isLoaded && !state.hasError && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 animate-pulse" />
      )}

      {/* Main Image */}
      {shouldRenderImage && !state.hasError && (
        <img
          ref={imgRef}
          src={state.currentSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            state.isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Error fallback */}
      {state.hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
          <div className="text-center p-4">
            <div className="text-xs mb-1">Failed to load image</div>
            {debug && (
              <div className="text-xs opacity-60">
                Attempts: {state.loadAttempts}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!state.isLoaded && shouldRenderImage && !state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Debug info */}
      {debug && (
        <div className="absolute top-1 left-1 bg-black/50 text-white text-xs p-1 rounded">
          <div>Loaded: {state.isLoaded.toString()}</div>
          <div>InView: {state.isInView.toString()}</div>
          <div>Error: {state.hasError.toString()}</div>
          <div>Attempts: {state.loadAttempts}</div>
        </div>
      )}
    </div>
  );
}

// Export a simplified version for common use cases
export function SimpleImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <UnifiedImage
      src={src}
      alt={alt}
      className={className}
      placeholder="blur"
      fallbackSrc="/placeholder.svg"
    />
  );
}