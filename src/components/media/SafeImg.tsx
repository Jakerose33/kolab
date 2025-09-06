import * as React from 'react';
import { logImageFallback } from '@/lib/media';

// Use a reliable base64 SVG that will always work
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMkw0NCA0NE0yMCA0NEw0NCAyMiIgc3Ryb2tlPSIjOTNBM0I4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fallbackContext?: string;
};

export function SafeImg({ src, fallbackContext, ...rest }: Props) {
  const [finalSrc, setFinalSrc] = React.useState(src || PLACEHOLDER);
  const [hasErrored, setHasErrored] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    if (fallbackContext === 'hero') {
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
      // Log the fallback for observability  
      console.error('[img-fallback]', {
        originalSrc: src,
        finalSrc,
        fallbackContext,
        timestamp: new Date().toISOString()
      });
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