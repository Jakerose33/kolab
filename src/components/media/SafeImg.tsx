import * as React from 'react';
import { logImageFallback } from '@/lib/media';

const PLACEHOLDER = '/placeholder.svg';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fallbackContext?: string;
};

export function SafeImg({ src, fallbackContext, ...rest }: Props) {
  const [finalSrc, setFinalSrc] = React.useState(src || PLACEHOLDER);
  const [hasErrored, setHasErrored] = React.useState(false);

  // Only debug in development
  React.useEffect(() => {
    if (import.meta.env.DEV && fallbackContext === 'hero') {
      console.log('[HERO SAFEIMG DEBUG]', {
        originalSrc: src,
        finalSrc,
        hasErrored,
        placeholder: PLACEHOLDER
      });
    }
  }, [src, finalSrc, hasErrored, fallbackContext]);

  // Update src when prop changes
  React.useEffect(() => {
    if (src !== finalSrc && !hasErrored) {
      setFinalSrc(src || PLACEHOLDER);
    }
  }, [src, finalSrc, hasErrored]);

  const handleError = React.useCallback(() => {
    if (finalSrc !== PLACEHOLDER) {
      // Log the fallback for observability (without console.error to reduce noise)
      logImageFallback(finalSrc, fallbackContext);
      setFinalSrc(PLACEHOLDER);
      setHasErrored(true);
    }
  }, [finalSrc, fallbackContext, src]);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={finalSrc}
      loading="lazy"
      decoding="async"
      onError={handleError}
      {...rest}
    />
  );
}