import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventFilters {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  address?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface EventData {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  venue_name?: string;
  venue_address?: string;
  address_full?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  price_min?: number;
  price_max?: number;
  currency?: string;
  ticket_url?: string;
  categories?: string[];
  tags?: string[];
  image_url?: string;
  published?: boolean;
  organizer_id: string;
  organizer_name?: string;
  organizer_handle?: string;
  organizer_avatar?: string;
  geocoded?: boolean;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  venue_name?: string;
  venue_address?: string;
  address_full?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  price_min?: number;
  price_max?: number;
  currency?: string;
  ticket_url?: string;
  categories?: string[];
  tags?: string[];
  image_url?: string;
  published?: boolean;
  geocoded?: boolean;
}

// Single event fetch hook
export const useEvent = (id: string | null) => {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase.rpc('get_event_with_privacy', {
        event_id: id
      });
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!id,
    retry: 0,
    refetchOnWindowFocus: false
  });
};

// Events feed hook with filters
export const useEventsFeed = (filters: EventFilters = {}) => {
  const filtersKey = JSON.stringify(filters);
  
  return useQuery({
    queryKey: ['events', 'feed', filtersKey],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_events_enhanced', {
        event_limit: 50,
        search_query: filters.search || null,
        category_filter: filters.categories || null,
        min_price: filters.minPrice || null,
        max_price: filters.maxPrice || null,
        start_date: filters.startDate || null,
        end_date: filters.endDate || null,
        latitude_center: filters.latitude || null,
        longitude_center: filters.longitude || null,
        radius_km: filters.radius || null
      });
      
      if (error) throw error;
      return data || [];
    },
    retry: 0,
    refetchOnWindowFocus: false
  });
};

// Map events hook - returns minimal data for performance
export const useMapEvents = (bounds?: MapBounds, filters: EventFilters = {}) => {
  const boundsKey = bounds ? JSON.stringify(bounds) : 'all';
  const filtersKey = JSON.stringify(filters);
  
  return useQuery({
    queryKey: ['events', 'map', boundsKey, filtersKey],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_events_enhanced', {
        event_limit: 200,
        search_query: filters.search || null,
        category_filter: filters.categories || null,
        min_price: filters.minPrice || null,
        max_price: filters.maxPrice || null,
        start_date: filters.startDate || null,
        end_date: filters.endDate || null,
        latitude_center: filters.latitude || null,
        longitude_center: filters.longitude || null,
        radius_km: filters.radius || null
      });
      
      if (error) throw error;
      
      // Filter by bounds if provided and return only essential map data
      let events = data || [];
      if (bounds) {
        events = events.filter((event: any) => 
          event.latitude && event.longitude &&
          event.latitude >= bounds.south &&
          event.latitude <= bounds.north &&
          event.longitude >= bounds.west &&
          event.longitude <= bounds.east
        );
      }
      
      return events.map((event: any) => ({
        id: event.id,
        title: event.title,
        latitude: event.latitude,
        longitude: event.longitude,
        categories: event.categories,
        price_min: event.price_min,
        venue_name: event.venue_name
      }));
    },
    retry: 0,
    refetchOnWindowFocus: false,
    enabled: true
  });
};

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Call geocoding edge function if address provided but no coordinates
      let geocodedData = { ...eventData };
      if ((eventData.venue_address || eventData.address_full) && !eventData.latitude && !eventData.longitude) {
        try {
          const { data: geocodeResult } = await supabase.functions.invoke('geocode-address', {
            body: { 
              address: eventData.address_full || eventData.venue_address 
            }
          });
          
          if (geocodeResult?.latitude && geocodeResult?.longitude) {
            geocodedData = {
              ...geocodedData,
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
              geocoded: true
            };
          }
        } catch (error) {
          console.warn('Geocoding failed:', error);
          geocodedData.geocoded = false;
        }
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...geocodedData,
          organizer_id: user.user.id
        })
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event created successfully!',
        description: data.published ? 'Your event is now live.' : 'Your event has been saved as a draft.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create event',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    }
  });
};

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EventData> }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Call geocoding if address updated but no coordinates
      let updatedData = { ...updates };
      if ((updates.venue_address || updates.address_full) && !updates.latitude && !updates.longitude) {
        try {
          const { data: geocodeResult } = await supabase.functions.invoke('geocode-address', {
            body: { 
              address: updates.address_full || updates.venue_address 
            }
          });
          
          if (geocodeResult?.latitude && geocodeResult?.longitude) {
            updatedData = {
              ...updatedData,
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
              geocoded: true
            };
          }
        } catch (error) {
          console.warn('Geocoding failed:', error);
          updatedData.geocoded = false;
        }
      }

      const { data, error } = await supabase
        .from('events')
        .update(updatedData)
        .eq('id', id)
        .eq('organizer_id', user.user.id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event updated successfully!',
        description: 'Your changes have been saved.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update event',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    }
  });
};