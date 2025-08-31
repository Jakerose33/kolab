// src/utils/routing.ts
import { useParams } from 'react-router-dom';

export const isValidRouteId = (v?: string | null): boolean => {
  if (!v || v === 'undefined' || v === 'null' || v.trim() === '') return false;
  // Accept numeric IDs or UUID-like strings (16+ hex chars)
  return /^\d+$/.test(v) || /^[0-9a-f-]{16,}$/i.test(v);
};

export function useRouteId(name: string): string | null {
  const params = useParams();
  const id = params[name] ?? null;
  return isValidRouteId(id) ? (id as string) : null;
}

// For cards: only build links when the id is valid
export type EventLike = Record<string, any>;
export function getEventLink(e: EventLike): string | null {
  const raw = String(e?.id ?? e?.eventId ?? e?.uuid ?? e?.slug ?? '');
  return isValidRouteId(raw) ? `/events/${raw}` : null;
}

export type VenueLike = Record<string, any>;
export function getVenueLink(v: VenueLike): string | null {
  const raw = String(v?.id ?? v?.venueId ?? v?.uuid ?? v?.slug ?? '');
  return isValidRouteId(raw) ? `/venues/${raw}` : null;
}