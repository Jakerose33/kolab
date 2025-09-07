import { supabase } from '@/integrations/supabase/client';

type AnyRec = Record<string, any>;

const DEFAULT_BUCKET =
  (import.meta.env.VITE_PUBLIC_MEDIA_BUCKET as string) || 'public';
const PLACEHOLDER = '/placeholder.svg';
const FALLBACK = '/images/placeholders/event.jpg';

const UPLOAD_HOSTS = [
  'lovable-uploads',
  '.supabase.co',
  'images.unsplash.com',
  'cdn.pixabay.com',
  'images.pexels.com'
];

const ABSOLUTE = /^https?:\/\//i;

// URL resolution cache for performance
const urlCache = new Map<string, string>();
const CACHE_MAX_SIZE = 500;

// Rate limiting for edge function calls
let logQueue: Array<any> = [];
let logTimeout: NodeJS.Timeout | null = null;

/** Absolute URL or data URL? */
const isAbsoluteUrl = (s?: string | null) =>
  !!s && (/^(?:https?:)?\/\//i.test(s) || /^data:image\//i.test(s));

/** Check if URL is from trusted hosts for CORS safety */
const isTrustedHost = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return UPLOAD_HOSTS.some(host => urlObj.hostname.includes(host));
  } catch {
    return false;
  }
};

/** Sanitize URL to prevent XSS */
const sanitizeUrl = (url: string): string => {
  if (url.startsWith('javascript:') || url.startsWith('data:text/')) {
    return PLACEHOLDER;
  }
  return url;
};

/** Central image URL resolver - handles all image URL patterns */
export function resolveImageUrl(raw?: string | null): string {
  if (!raw) return PLACEHOLDER;
  
  // Check cache first
  const cacheKey = `resolve:${raw}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey)!;
  }
  
  let resolved: string;
  
  // Already absolute
  if (ABSOLUTE.test(raw)) {
    const sanitized = sanitizeUrl(raw);
    if (!isTrustedHost(sanitized)) {
      logImageFallback(raw, 'untrusted_host');
      resolved = FALLBACK;
    } else {
      resolved = sanitized;
    }
  } else if (raw.startsWith('lovable-uploads/')) {
    // Known Lovable uploads → force absolute
    resolved = `https://${raw}`;
  } else if (raw.startsWith('storage://')) {
    // Supabase storage with error handling
    try {
      const [, bucket, ...rest] = raw.split('://')[1].split('/');
      const path = rest.join('/');
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      resolved = data?.publicUrl || PLACEHOLDER;
    } catch (error) {
      logImageFallback(raw, `supabase_parse_error:${error}`);
      resolved = PLACEHOLDER;
    }
  } else if (raw.startsWith('/')) {
    // Site-relative paths
    resolved = raw;
  } else if (raw.startsWith('src/') || raw.startsWith('assets/')) {
    // Handle relative paths that should be absolute
    resolved = `/${raw}`;
  } else {
    // Fallback: treat as invalid
    logImageFallback(raw, 'invalid_format');
    resolved = PLACEHOLDER;
  }
  
  // Cache the result
  if (urlCache.size >= CACHE_MAX_SIZE) {
    const firstKey = urlCache.keys().next().value;
    urlCache.delete(firstKey);
  }
  urlCache.set(cacheKey, resolved);
  
  return resolved;
}

/** Convert a storage key to a public URL; passthrough absolute URLs. */
export function toPublicUrl(
  key?: string | null,
  bucket: string = DEFAULT_BUCKET
): string | null {
  if (!key) return null;
  if (isAbsoluteUrl(key)) return key;
  
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(String(key));
    return data?.publicUrl ?? null;
  } catch (error) {
    logImageFallback(key, `to_public_url_exception:${error}`);
    return null;
  }
}

/** Best-effort event image resolver across mock + DB shapes. */
export function resolveEventImage(
  e: AnyRec,
  opts?: { bucket?: string; fallback?: string }
): string {
  if (!e || typeof e !== 'object') {
    logImageFallback('', 'invalid_event_object');
    return opts?.fallback ?? PLACEHOLDER;
  }

  const fallback = opts?.fallback ?? PLACEHOLDER;

  // Try multiple fields with type checking
  const candidates = [
    e?.heroImage,
    e?.image,
    e?.image_url,
    e?.banner,
    e?.cover
  ];

  // Handle images array safely
  if (e?.images) {
    if (Array.isArray(e.images) && e.images.length > 0) {
      candidates.unshift(e.images[0]);
    } else if (typeof e.images === 'string') {
      candidates.unshift(e.images);
    }
  }

  // Find first valid candidate
  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'string') {
      const resolved = resolveImageUrl(candidate);
      if (resolved !== PLACEHOLDER) {
        return resolved;
      }
    }
  }

  return fallback;
}

/** Optional: venue image resolver (same idea). */
export function resolveVenueImage(
  v: AnyRec,
  opts?: { bucket?: string; fallback?: string }
): string {
  if (!v || typeof v !== 'object') {
    logImageFallback('', 'invalid_venue_object');
    return opts?.fallback ?? PLACEHOLDER;
  }

  const fallback = opts?.fallback ?? PLACEHOLDER;

  const candidates = [
    v?.heroImage,
    v?.image,
    v?.cover
  ];

  // Handle images array safely
  if (v?.images) {
    if (Array.isArray(v.images) && v.images.length > 0) {
      candidates.unshift(v.images[0]);
    } else if (typeof v.images === 'string') {
      candidates.unshift(v.images);
    }
  }

  // Find first valid candidate
  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'string') {
      const resolved = resolveImageUrl(candidate);
      if (resolved !== PLACEHOLDER) {
        return resolved;
      }
    }
  }

  return fallback;
}

/** Log image fallback for observability with batching */
export function logImageFallback(url: string, context?: string) {
  try {
    // Lightweight client log
    console.warn('[img-fallback]', url, context);
    
    // Add to queue for batched logging
    logQueue.push({
      url,
      path: window.location.pathname,
      ua: navigator.userAgent.substring(0, 100),
      context,
      timestamp: new Date().toISOString()
    });

    // Batch logs every 2 seconds to reduce network calls
    if (logTimeout) {
      clearTimeout(logTimeout);
    }
    
    logTimeout = setTimeout(() => {
      if (logQueue.length === 0) return;
      
      const logs = [...logQueue];
      logQueue = [];
      
      // Send batched logs
      fetch('/api/log-img-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
      }).catch(() => {
        // Store in localStorage as fallback
        try {
          const stored = localStorage.getItem('failed_image_logs') || '[]';
          const existing = JSON.parse(stored);
          existing.push(...logs);
          localStorage.setItem('failed_image_logs', JSON.stringify(existing.slice(-50))); // Keep last 50
        } catch {
          // Silent fail
        }
      });
    }, 2000);
  } catch {
    // Silent fail - don't block UI
  }
}

/** Get optimized image props for React components */
export function getImageProps(
  src: string,
  options?: {
    alt?: string;
    priority?: boolean;
    sizes?: string;
    onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  }
): React.ImgHTMLAttributes<HTMLImageElement> {
  const resolvedSrc = resolveImageUrl(src);
  
  return {
    src: resolvedSrc,
    alt: options?.alt || '',
    loading: options?.priority ? 'eager' : 'lazy',
    decoding: 'async',
    sizes: options?.sizes,
    crossOrigin: isTrustedHost(resolvedSrc) ? 'anonymous' : undefined,
    onError: (e) => {
      const img = e.currentTarget as HTMLImageElement;
      if (img.src !== FALLBACK) {
        logImageFallback(src, 'component_onError');
        img.src = FALLBACK;
      }
      options?.onError?.(e);
    },
    onLoad: () => {
      // Clear any localStorage failures for this URL
      try {
        const stored = localStorage.getItem('failed_image_logs') || '[]';
        const existing = JSON.parse(stored);
        const filtered = existing.filter((log: any) => log.url !== src);
        localStorage.setItem('failed_image_logs', JSON.stringify(filtered));
      } catch {
        // Silent fail
      }
    }
  };
}

/** Clear URL cache - useful for testing or memory management */
export function clearImageCache() {
  urlCache.clear();
}