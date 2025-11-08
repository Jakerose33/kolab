import React from 'react';

// Temporary debugging component to see what images are failing
export function ImageDebugger() {
  React.useEffect(() => {
    console.log('[IMAGE DEBUG] Hero image source:', {
      VITE_HERO_IMAGE_URL: import.meta.env.VITE_HERO_IMAGE_URL,
      hasEnvVar: !!import.meta.env.VITE_HERO_IMAGE_URL
    });

    // Listen for all image errors on the page
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      console.error('[IMAGE DEBUG] Image failed to load:', {
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        currentSrc: img.currentSrc
      });
    };

    document.addEventListener('error', handleImageError, true);
    
    return () => {
      document.removeEventListener('error', handleImageError, true);
    };
  }, []);

  return null;
}