import { supabase } from '@/integrations/supabase/client';

export type AnyRec = Record<string, any>;

// Consolidated ID validation
export const isValidId = (v?: string | null): boolean => {
  if (!v || v === 'undefined' || v === 'null' || v.trim() === '') return false;
  // Accept numeric IDs or UUID-like strings (16+ hex chars)
  return /^\d+$/.test(v) || /^[0-9a-f-]{16,}$/i.test(v);
};

// Event handling
export type EventLike = AnyRec;

export function normalizeEvent(e: EventLike) {
  const id = e?.id ?? e?.eventId ?? e?.uuid ?? null;
  return {
    id,
    title: e?.title ?? e?.name ?? 'Untitled Event',
    image: e?.image_url ?? e?.heroImage ?? e?.image ?? e?.images?.[0] ?? null,
  };
}

export function getEventLink(e: EventLike): string | null {
  const { id } = normalizeEvent(e);
  const s = String(id ?? '');
  return isValidId(s) ? `/events/${s}` : null;
}

// Venue handling
export type VenueLike = AnyRec;

export function normalizeVenue(v: VenueLike) {
  const id = v?.id ?? v?.venueId ?? v?.uuid ?? null;
  return {
    id,
    name: v?.name ?? v?.title ?? 'Untitled Venue',
    image: v?.heroImage ?? v?.image ?? v?.image_url ?? v?.images?.[0] ?? null,
  };
}

export function getVenueLink(v: VenueLike): string | null {
  const { id } = normalizeVenue(v);
  const s = String(id ?? '');
  return isValidId(s) ? `/venues/${s}` : null;
}

// Storage URL resolution (if needed for images)
export function toPublicUrl(key?: string | null, bucket: string = 'public'): string | null {
  if (!key) return null;
  if (/^(?:https?:)?\/\//i.test(key) || /^data:image\//i.test(key)) return key;
  const { data } = supabase.storage.from(bucket).getPublicUrl(String(key));
  return data?.publicUrl ?? null;
}