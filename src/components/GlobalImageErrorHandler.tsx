import { useEffect } from 'react';
import { toast } from 'sonner';

interface ImageErrorEvent extends Event {
  target: HTMLImageElement;
}

export function GlobalImageErrorHandler() {
  useEffect(() => {
    const handleImageError = (event: Event) => {
      const imgElement = event.target as HTMLImageElement;
      const src = imgElement?.src;
      
      // Only proceed if we have a valid src
      if (!src || typeof src !== 'string') return;
      
      console.error('[GLOBAL_IMAGE_ERROR]', {
        src,
        alt: imgElement.alt,
        naturalWidth: imgElement.naturalWidth,
        naturalHeight: imgElement.naturalHeight,
        complete: imgElement.complete,
        currentSrc: imgElement.currentSrc
      });
      
      // Only report errors for user uploaded images, not system placeholders
      if (!src.startsWith('data:image/svg+xml')) {
        if (src.includes('lovable-uploads') || src.includes('supabase')) {
          console.warn('[Image Error] Failed to load user uploaded image:', {
            src,
            alt: imgElement.alt,
            naturalWidth: imgElement.naturalWidth,
            naturalHeight: imgElement.naturalHeight
          });
          
          // Show user-friendly error for personal library images
          if (src.includes('lovable-uploads')) {
            toast.error('Image from your library failed to load', {
              description: 'This may be due to a temporary network issue. Please try refreshing the page.',
              duration: 5000
            });
          }
        }
      }
    };

    // Add global error listener for images
    document.addEventListener('error', handleImageError, true);

    return () => {
      document.removeEventListener('error', handleImageError, true);
    };
  }, []);

  return null;
}