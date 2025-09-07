import React, { useState } from 'react';
import { getImageProps, logImageFallback } from '@/lib/media';

interface EnhancedSafeImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackContext?: string;
  priority?: boolean;
  retryAttempts?: number;
}

export function EnhancedSafeImg({
  src,
  fallbackContext,
  priority = false,
  retryAttempts = 1,
  onError,
  ...props
}: EnhancedSafeImgProps) {
  const [attempts, setAttempts] = useState(0);
  const [hasErrored, setHasErrored] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    if (currentAttempts < retryAttempts && !hasErrored) {
      // Retry with slight delay
      setTimeout(() => {
        const img = e.currentTarget as HTMLImageElement;
        img.src = img.src + '?retry=' + currentAttempts;
      }, 1000 * currentAttempts);
    } else {
      setHasErrored(true);
      logImageFallback(src, fallbackContext || 'enhanced_safe_img');
    }

    onError?.(e);
  };

  const imageProps = getImageProps(src, {
    alt: props.alt,
    priority,
    sizes: props.sizes,
    onError: handleError
  });

  return (
    <img
      {...imageProps}
      {...props}
      className={`${props.className || ''} ${hasErrored ? 'opacity-75' : ''}`}
    />
  );
}