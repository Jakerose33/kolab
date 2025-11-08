# Event Data Flow Documentation

## Overview

This document describes the event data flow architecture implemented in the application, providing a single source of truth for event data across all surfaces.

## Architecture

### Core Principles

1. **Single Source of Truth**: All event data flows through canonical hooks in `src/hooks/useEventsData.ts`
2. **Type Safety**: Consistent event data structure using `normalizeEventData()` helper
3. **Cache Management**: React Query handles caching and invalidation automatically
4. **Error Resilience**: Graceful degradation with proper loading states and error boundaries

### Data Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Supabase DB   │◄──►│  Canonical Hooks │◄──►│   UI Components │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌────────▼────────┐             │
        │              │ React Query     │             │
        │              │ Cache & State   │             │
        │              └─────────────────┘             │
        │                                              │
        └──────────────► Geocoding Edge Function ◄─────┘
```

## Canonical Hooks

### `useEvent(id: string)`
- **Purpose**: Fetch single event details
- **Usage**: Event detail pages
- **Returns**: Normalized event object
- **Cache Key**: `['events', 'detail', id]`

```typescript
const { data: event, isLoading, error } = useEvent(eventId);
```

### `useEventsFeed(filters: EventFilters)`
- **Purpose**: Fetch filtered list of events
- **Usage**: Events page, home page event listings
- **Returns**: Array of normalized events
- **Cache Key**: `['events', 'feed', JSON.stringify(filters)]`

```typescript
const { data: events, isLoading, error } = useEventsFeed({
  search: 'jazz',
  categories: ['music'],
  startDate: '2024-01-01'
});
```

### `useMapEvents(bounds?, filters: EventFilters)`
- **Purpose**: Fetch events optimized for map display
- **Usage**: Map components
- **Returns**: Minimal event data (id, title, lat/lng, category)
- **Cache Key**: `['events', 'map', boundsKey, filtersKey]`

```typescript
const { data: mapEvents } = useMapEvents(mapBounds, filters);
```

### `useCreateEvent()` / `useUpdateEvent()`
- **Purpose**: Mutation hooks for creating/updating events
- **Auto-invalidation**: Automatically invalidates all event queries on success
- **Geocoding**: Automatically geocodes addresses via Edge Function

## Event Data Normalization

### `normalizeEventData(event: any)`

Transforms event data from various sources (DB, API, mock data) into a consistent structure:

```typescript
{
  id: string,
  title: string,
  description: string,
  start_at: string,
  end_at: string,
  venue_name: string,
  venue_address: string,
  city: string,
  latitude: number,
  longitude: number,
  price_min: number,
  price_max: number,
  currency: string,
  categories: string[],
  tags: string[],
  image_url: string,
  organizer_name: string,
  capacity: number,
  ticket_url: string,
  geocoded: boolean,
  created_at: string,
  updated_at: string
}
```

### Helper Functions

- **`getEventLinkSafe(event)`**: Safely generates event URLs
- **`hasValidCoordinates(event)`**: Checks if event can be displayed on map
- **`formatEventPrice(min, max, currency)`**: Consistent price formatting

## Geocoding Integration

### Edge Function: `supabase/functions/geocode-address`

Automatically geocodes event addresses during create/update operations:

```typescript
// Called automatically in useCreateEvent/useUpdateEvent
const geocodeResult = await supabase.functions.invoke('geocode-address', {
  body: { address: eventData.address_full }
});
```

**Environment Variables Required:**
- `GOOGLE_MAPS_API_KEY`: Google Maps Geocoding API key

**Fallback Behavior:**
- If geocoding fails, event is saved with `geocoded: false`
- Map components filter out non-geocoded events
- No errors thrown - graceful degradation

## Filter System

### Unified Event Filters

All filtering happens at the query level using `EventFilters` interface:

```typescript
interface EventFilters {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
```

### Database Function: `get_public_events_enhanced`

Server-side filtering for performance:
- Full-text search using `tsvector`
- Geographic distance calculation using Haversine formula
- Price range filtering
- Date range filtering
- Category intersection

## UI Integration

### Events Page (`/events`)
- Grid and map view tabs
- Real-time filter updates
- Infinite scroll (future enhancement)

### Event Detail Page (`/events/:id`)
- Safe route parameter handling
- Fallback to NotFound component
- Integrated booking CTA

### Home Page (`/`)
- Featured events carousel
- Category-based filtering
- Mobile-optimized display

## Error Handling

### Error Boundaries

**PathnameErrorBoundary**: Resets on navigation to prevent persistent error states

```typescript
<PathnameErrorBoundary key={location.pathname}>
  <App />
</PathnameErrorBoundary>
```

**EventErrorBoundary**: Specialized for event-related pages

### Safe Data Access

- All hooks use `.maybeSingle()` instead of `.single()`
- Optional chaining for all property access
- Graceful loading states and empty states

## Cache Invalidation Rules

### Automatic Invalidation

After successful mutations, the following queries are invalidated:

```typescript
queryClient.invalidateQueries({ queryKey: ['events'] });
```

This invalidates:
- All event feeds (`['events', 'feed', ...]`)
- All map events (`['events', 'map', ...]`)
- Specific event details (`['events', 'detail', id]`)

### Manual Invalidation

For real-time updates or external data changes:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['events', 'feed'] });
```

## Adding New Filters

1. **Update EventFilters interface** in `src/hooks/useEventsData.ts`
2. **Modify database function** `get_public_events_enhanced` to handle new filter
3. **Update UI components** to pass new filter parameters
4. **Test filter combination** edge cases

Example:
```sql
-- Add to get_public_events_enhanced function
AND (
  venue_type IS NULL
  OR e.venue_type = venue_type
)
```

## Performance Optimizations

### Database Indexes

```sql
-- Events search performance
CREATE INDEX idx_events_search_vector ON events USING GIN(search_vector);

-- Geographic queries
CREATE INDEX idx_events_location ON events (latitude, longitude) WHERE geocoded = true;

-- Date filtering
CREATE INDEX idx_events_start_at ON events (start_at) WHERE published = true;
```

### Query Optimizations

- **Selective fields**: Map queries only fetch essential fields
- **Pagination**: Limit results with `LIMIT` clause
- **Conditional joins**: Only join profiles when organizer data needed

### React Query Settings

```typescript
{
  retry: 0, // No retries for failed requests
  refetchOnWindowFocus: false, // Prevent unnecessary refetches
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
}
```

## Testing

### E2E Test Coverage

Located in `tests/events-flow.spec.ts`:

- ✅ Event display across all surfaces
- ✅ Filter functionality
- ✅ Map view integration
- ✅ Navigation without page reloads
- ✅ Error state handling
- ✅ Create event flow
- ✅ Authentication integration
- ✅ Data consistency across views

### Running Tests

```bash
# Run all event flow tests
npx playwright test tests/events-flow.spec.ts

# Run with UI
npx playwright test tests/events-flow.spec.ts --ui

# Run specific test
npx playwright test -g "should display events on home page"
```

## Common Gotchas

### 1. Route Parameter Validation
Always use `useRouteId()` helper instead of direct `useParams()`:

```typescript
// ❌ Don't do this
const { id } = useParams();

// ✅ Do this
const eventId = useRouteId('id');
if (!eventId) return <NotFound />;
```

### 2. Property Access Safety
Always use optional chaining and provide fallbacks:

```typescript
// ❌ Risky
<h1>{event.title}</h1>

// ✅ Safe
<h1>{event?.title || 'Untitled Event'}</h1>
```

### 3. Navigation vs Page Reloads
Use React Router `Link` components, not `<a>` tags:

```typescript
// ❌ Causes full page reload
<a href="/events/123">View Event</a>

// ✅ Client-side navigation
<Link to="/events/123">View Event</Link>
```

### 4. Filter State Management
Keep filter state in URL for bookmarkable/shareable URLs:

```typescript
// Future enhancement
const [filters, setFilters] = useUrlParams<EventFilters>();
```

## Future Enhancements

### Planned Features
- [ ] Real-time event updates via Supabase subscriptions
- [ ] Event recommendation engine
- [ ] Advanced search with AI/semantic matching
- [ ] Event clustering on map view
- [ ] Offline event caching
- [ ] Push notifications for saved searches

### Performance Improvements
- [ ] Virtual scrolling for large event lists
- [ ] Image lazy loading and optimization
- [ ] Progressive Web App features
- [ ] CDN integration for assets

## Troubleshooting

### Common Issues

**Events not loading:**
1. Check console for API errors
2. Verify Supabase connection
3. Check RLS policies
4. Validate filter parameters

**Map not showing events:**
1. Ensure events have `geocoded: true`
2. Check Mapbox token
3. Verify coordinate ranges
4. Check browser geolocation permissions

**Cache issues:**
1. Clear React Query cache: `queryClient.clear()`
2. Hard refresh browser
3. Check for stale closure variables
4. Verify cache key consistency

**Geocoding failures:**
1. Verify Google Maps API key
2. Check API quota limits
3. Validate address format
4. Review Edge Function logs

### Debug Commands

```typescript
// View current cache state
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log(queryClient.getQueryCache().getAll());

// Force refetch
queryClient.refetchQueries({ queryKey: ['events'] });

// Check query status
const query = queryClient.getQueryState(['events', 'feed']);
console.log(query);
```