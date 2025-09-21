/**
 * Robust hero image URL resolver with bulletproof fallbacks
 * Handles environment variables, HTTPS enforcement, and guaranteed fallbacks
 */

/**
 * Validate that a URL is a proper HTTPS URL to prevent mixed content issues
 */
function isValidHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Clean and normalize a URL, encoding spaces and removing dangerous fragments
 */
function cleanUrl(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    // Basic normalization: encode path components, strip hash
    u.pathname = u.pathname.split('/').map(encodeURIComponent).join('/');
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Resolve hero image URL with comprehensive fallback chain:
 * 1. VITE_HERO_IMAGE_URL (if HTTPS and valid)
 * 2. Local public asset
 * 3. Final fallback handled by component onError
 */
export function resolveHeroImageUrl(): string {
  // 1. Try environment variable (must be HTTPS for security)
  const envUrl = import.meta.env.VITE_HERO_IMAGE_URL as string | undefined;
  if (envUrl) {
    const cleaned = cleanUrl(envUrl);
    if (cleaned && isValidHttpsUrl(cleaned)) {
      return cleaned;
    }
    
    // Log invalid environment URL for debugging
    if (import.meta.env.DEV) {
      console.warn('[HERO] Invalid VITE_HERO_IMAGE_URL:', envUrl, 'Must be HTTPS');
    }
  }
  
  // 2. Fallback to local public asset (shipped with the app)
  return '/images/hero-boiler-room.jpg';
}

/**
 * Log hero image failures for monitoring and debugging
 */
export function logHeroImageError(src: string, error: string) {
  const logData = {
    src,
    error,
    userAgent: navigator.userAgent.substring(0, 100),
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
  
  // Console log for immediate debugging
  console.error('[HERO_IMG_ERROR]', logData);
  
  // Store in localStorage for persistence across page loads
  try {
    const existing = JSON.parse(localStorage.getItem('hero_errors') || '[]');
    existing.push(logData);
    // Keep only last 10 errors
    localStorage.setItem('hero_errors', JSON.stringify(existing.slice(-10)));
  } catch {
    // Silent fail - don't break the app
  }
}
