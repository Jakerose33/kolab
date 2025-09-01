import { getEventLink } from '@/lib/linking';

// Safe event link helper
export function getEventLinkSafe(event: any): string | null {
  try {
    return getEventLink(event);
  } catch {
    return null;
  }
}

// Normalize event data from different sources
export function normalizeEventData(event: any) {
  return {
    id: event?.id || event?.eventId || event?.uuid || null,
    title: event?.title || event?.name || 'Untitled Event',
    description: event?.description || '',
    start_at: event?.start_at || event?.startAt || event?.date,
    end_at: event?.end_at || event?.endAt || null,
    venue_name: event?.venue_name || event?.venueName || event?.venue?.name,
    venue_address: event?.venue_address || event?.venueAddress || event?.venue?.address,
    city: event?.city || event?.venue?.city,
    latitude: event?.latitude || event?.lat || event?.venue?.latitude,
    longitude: event?.longitude || event?.lng || event?.venue?.longitude,
    price_min: event?.price_min || event?.priceMin || event?.price,
    price_max: event?.price_max || event?.priceMax,
    currency: event?.currency || 'USD',
    categories: event?.categories || event?.category ? [event.category] : [],
    tags: event?.tags || [],
    image_url: event?.image_url || event?.imageUrl || event?.image || event?.heroImage,
    organizer_name: event?.organizer_name || event?.organizerName || event?.profiles?.full_name,
    organizer_handle: event?.organizer_handle || event?.organizerHandle || event?.profiles?.handle,
    organizer_avatar: event?.organizer_avatar || event?.organizerAvatar || event?.profiles?.avatar_url,
    geocoded: event?.geocoded !== false // Default to true unless explicitly false
  };
}

// Check if event has valid coordinates for map display
export function hasValidCoordinates(event: any): boolean {
  const normalized = normalizeEventData(event);
  return !!(normalized.latitude && normalized.longitude && normalized.geocoded);
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Format price for display
export function formatEventPrice(priceMin?: number, priceMax?: number, currency = 'USD'): string {
  if (!priceMin && !priceMax) return 'Free';
  if (priceMin === priceMax) return `${currency} ${priceMin}`;
  if (priceMin && priceMax) return `${currency} ${priceMin} - ${priceMax}`;
  if (priceMin) return `From ${currency} ${priceMin}`;
  if (priceMax) return `Up to ${currency} ${priceMax}`;
  return 'Price TBA';
}

// Generate stable query keys for React Query
export function getEventQueryKey(type: 'detail' | 'feed' | 'map', params?: any) {
  switch (type) {
    case 'detail':
      return ['events', 'detail', params?.id];
    case 'feed':
      return ['events', 'feed', JSON.stringify(params?.filters || {})];
    case 'map':
      return ['events', 'map', JSON.stringify(params?.bounds || {}), JSON.stringify(params?.filters || {})];
    default:
      return ['events'];
  }
}