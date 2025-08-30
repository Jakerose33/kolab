// src/lib/linking.ts
// Minimal helpers to normalize shapes coming from mock data and Supabase.

export type AnyRec = Record<string, any>;

export type EventLike = AnyRec;
export function normalizeEvent(e: EventLike) {
  const id =
    e?.id ?? e?.eventId ?? e?.uuid ?? e?.slug ?? null; // tolerate many shapes
  return {
    id,
    title: e?.title ?? e?.name ?? 'Untitled Event',
    image: e?.heroImage ?? e?.image ?? e?.image_url ?? e?.images?.[0] ?? null,
  };
}
export function getEventLink(e: EventLike): string | null {
  const { id } = normalizeEvent(e);
  const s = String(id ?? '');
  if (!s || s === 'undefined' || s === 'null') return null;
  return `/events/${s}`;
}

export type VenueLike = AnyRec;
export function normalizeVenue(v: VenueLike) {
  const id = v?.id ?? v?.venueId ?? v?.uuid ?? v?.slug ?? null;
  return {
    id,
    name: v?.name ?? v?.title ?? 'Untitled Venue',
    image: v?.heroImage ?? v?.image ?? v?.image_url ?? v?.images?.[0] ?? null,
  };
}
export function getVenueLink(v: VenueLike): string | null {
  const { id } = normalizeVenue(v);
  const s = String(id ?? '');
  if (!s || s === 'undefined' || s === 'null') return null;
  return `/venues/${s}`;
}