// src/lib/entities.ts
export type EventLike = Record<string, any>;

export function normalizeEvent(e: EventLike) {
  const id =
    e?.id ??
    e?.eventId ??
    e?.uuid ??
    e?.slug ??
    null;

  return {
    id, // may be string or number
    title: e?.title ?? e?.name ?? 'Untitled Event',
    image: e?.heroImage ?? e?.image ?? e?.images?.[0] ?? null,
  };
}

export function getEventLink(e: EventLike): string | null {
  const { id } = normalizeEvent(e);
  const val = String(id ?? '');
  if (!val || val === 'undefined' || val === 'null') return null;
  return `/events/${val}`;
}

export type VenueLike = Record<string, any>;

export function normalizeVenue(v: VenueLike) {
  const id =
    v?.id ??
    v?.venueId ??
    v?.uuid ??
    v?.slug ??
    null;

  return {
    id,
    name: v?.name ?? v?.title ?? 'Untitled Venue',
    image: v?.heroImage ?? v?.image ?? v?.images?.[0] ?? null,
  };
}

export function getVenueLink(v: VenueLike): string | null {
  const { id } = normalizeVenue(v);
  const val = String(id ?? '');
  if (!val || val === 'undefined' || val === 'null') return null;
  return `/venues/${val}`;
}