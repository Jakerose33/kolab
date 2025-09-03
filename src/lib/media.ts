import { supabase } from '@/integrations/supabase/client';

type AnyRec = Record<string, any>;

const DEFAULT_BUCKET =
  (import.meta.env.VITE_PUBLIC_MEDIA_BUCKET as string) || 'public';
const FALLBACK = '/images/placeholders/event.jpg';

/** Absolute URL or data URL? */
const isAbsoluteUrl = (s?: string | null) =>
  !!s && (/^(?:https?:)?\/\//i.test(s) || /^data:image\//i.test(s));

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
  const bucket = opts?.bucket ?? DEFAULT_BUCKET;
  const fallback = opts?.fallback ?? FALLBACK;

  const candidate =
    e?.heroImage ||
    e?.image ||
    e?.image_url ||
    (Array.isArray(e?.images) ? e.images[0] : undefined) ||
    e?.banner ||
    e?.cover;

  return toPublicUrl(candidate, bucket) ?? fallback;
}

/** Optional: venue image resolver (same idea). */
export function resolveVenueImage(
  v: AnyRec,
  opts?: { bucket?: string; fallback?: string }
): string {
  const bucket = opts?.bucket ?? DEFAULT_BUCKET;
  const fallback = opts?.fallback ?? FALLBACK;

  const candidate =
    v?.heroImage ||
    v?.image ||
    v?.cover ||
    (Array.isArray(v?.images) ? v.images[0] : undefined);

  return toPublicUrl(candidate, bucket) ?? fallback;
}