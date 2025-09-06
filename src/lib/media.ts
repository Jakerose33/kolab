import { supabase } from '@/integrations/supabase/client';

type AnyRec = Record<string, any>;

const DEFAULT_BUCKET =
  (import.meta.env.VITE_PUBLIC_MEDIA_BUCKET as string) || 'public';
const PLACEHOLDER = '/placeholder.svg';
const FALLBACK = '/images/placeholders/event.jpg';

const UPLOAD_HOSTS = [
  'https://lovable-uploads', // Lovable CDN
  'https://*.supabase.co',   // Supabase storage/CDN
  'https://images.unsplash.com'
];

const ABSOLUTE = /^https?:\/\//i;

/** Absolute URL or data URL? */
const isAbsoluteUrl = (s?: string | null) =>
  !!s && (/^(?:https?:)?\/\//i.test(s) || /^data:image\//i.test(s));

/** Central image URL resolver - handles all image URL patterns */
export function resolveImageUrl(raw?: string | null): string {
  if (!raw) return PLACEHOLDER;
  
  // Already absolute
  if (ABSOLUTE.test(raw)) return raw;
  
  // Known Lovable uploads → force absolute
  if (raw.startsWith('lovable-uploads/')) {
    return `https://${raw}`;
  }
  
  // Supabase storage path shorthand: storage://bucket/path.jpg
  if (raw.startsWith('storage://')) {
    const [, bucket, ...rest] = raw.split('://')[1].split('/');
    const path = rest.join('/');
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || PLACEHOLDER;
  }
  
  // Site-relative paths (prefer placeholder to avoid blue ?)
  if (raw.startsWith('/')) {
    return raw;
  }
  
  // Fallback: treat as invalid, use placeholder
  return PLACEHOLDER;
}

/** Convert a storage key to a public URL; passthrough absolute URLs. */
export function toPublicUrl(
  key?: string | null,
  bucket: string = DEFAULT_BUCKET
): string | null {
  if (!key) return null;
  if (isAbsoluteUrl(key)) return key;
  const { data } = supabase.storage.from(bucket).getPublicUrl(String(key));
  return data?.publicUrl ?? null;
}

/** Best-effort event image resolver across mock + DB shapes. */
export function resolveEventImage(
  e: AnyRec,
  opts?: { bucket?: string; fallback?: string }
): string {
  const fallback = opts?.fallback ?? PLACEHOLDER;

  const candidate =
    e?.heroImage ||
    e?.image ||
    e?.image_url ||
    (Array.isArray(e?.images) ? e.images[0] : undefined) ||
    e?.banner ||
    e?.cover;

  return resolveImageUrl(candidate) || fallback;
}

/** Optional: venue image resolver (same idea). */
export function resolveVenueImage(
  v: AnyRec,
  opts?: { bucket?: string; fallback?: string }
): string {
  const fallback = opts?.fallback ?? PLACEHOLDER;

  const candidate =
    v?.heroImage ||
    v?.image ||
    v?.cover ||
    (Array.isArray(v?.images) ? v.images[0] : undefined);

  return resolveImageUrl(candidate) || fallback;
}

/** Log image fallback for observability */
export async function logImageFallback(url: string, context?: string) {
  try {
    // Lightweight client log
    console.warn('[img-fallback]', url, context);
    
    // Send to edge function for server logging (non-blocking)
    fetch('/api/log-img-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        path: window.location.pathname,
        ua: navigator.userAgent.substring(0, 100), // Truncate
        context,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Silently fail - don't block UI
    });
  } catch {
    // Silently fail - don't block UI
  }
}