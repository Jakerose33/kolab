import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Navigation, Search, Filter } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  coordinates: [number, number];
  price?: number;
  attendees: number;
  capacity: number;
}

const mockMapEvents: Event[] = [
  {
    id: "1",
    title: "Rooftop Photography Session",
    description: "Capture stunning Melbourne skyline views",
    date: "March 16, 2024",
    time: "6:00 PM",
    location: "Eureka Skydeck, Melbourne",
    category: "photography",
    coordinates: [144.9631, -37.8136],
    price: 35,
    attendees: 8,
    capacity: 15,
  },
  {
    id: "2", 
    title: "Street Art Walking Tour",
    description: "Explore vibrant Hosier Lane street art",
    date: "March 17, 2024",
    time: "2:00 PM",
    location: "Hosier Lane, Melbourne",
    category: "art",
    coordinates: [144.9692, -37.8172],
    price: 20,
    attendees: 12,
    capacity: 20,
  },
  {
    id: "3",
    title: "Startup Pitch Night", 
    description: "Present your startup ideas to Melbourne investors",
    date: "March 18, 2024",
    time: "7:00 PM",
    location: "The Commons, South Yarra",
    category: "business",
    coordinates: [144.9944, -37.8467],
    attendees: 25,
    capacity: 50,
  },
];

interface EventMapProps {
  events?: Event[];
}

const EventMap = ({ events: propsEvents }: EventMapProps = {}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const mapboxToken = 'pk.eyJ1Ijoia29sYWIiLCJhIjoiY21ka3Jzc3duMTB2bjJ4cTNhYjBmNDI4NCJ9.joO5ftfGwuKkHBV6rwDJdA';
  const [events, setEvents] = useState<Event[]>(propsEvents || mockMapEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Update events when props change
  useEffect(() => {
    if (propsEvents) {
      setEvents(propsEvents);
    }
  }, [propsEvents]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = mapboxToken;
      
      console.log('Initializing map...');
      
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Use streets style instead of light
        center: [144.9631, -37.8136], // Melbourne CBD
        zoom: 11,
        attributionControl: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map load
      map.current.on('load', () => {
        console.log('Map loaded successfully!');
        setMapLoaded(true);
        setMapError(null);
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your internet connection.');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Separate effect for updating markers when filteredEvents change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    filteredEvents.forEach((event, index) => {
      console.log(`Adding marker ${index + 1}: ${event.title}`);
      
      // Create custom marker element with category-based colors
      const el = document.createElement('div');
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontSize = '12px';
      el.style.fontWeight = 'bold';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.transition = 'transform 0.2s ease';
      
      // Category-based colors
      const categoryColors: Record<string, string> = {
        art: '#8b5cf6',
        music: '#ef4444', 
        technology: '#3b82f6',
        business: '#059669',
        photography: '#f97316',
        food: '#eab308',
        sports: '#06b6d4',
        workshop: '#84cc16',
        networking: '#ec4899'
      };
      
      el.style.backgroundColor = categoryColors[event.category] || '#6b7280';
      el.style.border = '2px solid white';
      el.textContent = (index + 1).toString();
      
      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(event.coordinates)
        .addTo(map.current!);

      // Enhanced popup with better styling
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'event-popup'
      }).setHTML(`
        <div style="padding: 16px; min-width: 250px; max-width: 300px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <h3 style="font-weight: bold; font-size: 16px; margin: 0; line-height: 1.2;">${event.title}</h3>
            <span style="background: ${categoryColors[event.category] || '#6b7280'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase; font-weight: 500;">${event.category}</span>
          </div>
          <p style="font-size: 13px; color: #666; margin: 0 0 12px 0; line-height: 1.4;">${event.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 12px; color: #888;">
              <div>${event.date}</div>
              <div>${event.time}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; font-size: 14px;">${event.price ? `$${event.price}` : 'Free'}</div>
              <div style="font-size: 11px; color: #666;">${event.attendees}/${event.capacity} attending</div>
            </div>
          </div>
          <div style="font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 8px;">
            📍 ${event.location}
          </div>
        </div>
      `);

      marker.setPopup(popup);
      markers.current.push(marker);
    });

    // Auto-fit bounds if we have events
    if (filteredEvents.length > 0 && filteredEvents.length !== events.length) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredEvents.forEach(event => {
        bounds.extend(event.coordinates);
      });
      
      // Add padding and animate to bounds
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [filteredEvents, mapLoaded]);

  if (mapError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Map Error</h3>
          <p className="text-red-600 text-sm">{mapError}</p>
          <p className="text-red-600 text-sm mt-2">Showing events in list format below:</p>
        </div>
        
        {/* Fallback to event list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
              <div className="flex justify-between text-sm">
                <span>{event.date}</span>
                <span className="font-medium">{event.price ? `$${event.price}` : 'Free'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="photography">Photography</SelectItem>
            <SelectItem value="art">Art</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border shadow-lg" style={{ height: '500px' }}>
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading Melbourne map...</p>
            </div>
          </div>
        )}
        
        {/* Event Count Overlay */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <p className="text-sm font-medium">
            {filteredEvents.length} events found
          </p>
        </div>

        {/* Location Button */}
        <Button
          size="sm"
          variant="outline"
          className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm"
          onClick={() => {
            if (navigator.geolocation && map.current) {
              navigator.geolocation.getCurrentPosition((position) => {
                map.current?.flyTo({
                  center: [position.coords.longitude, position.coords.latitude],
                  zoom: 14
                });
              });
            }
          }}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedEvent?.id === event.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => {
              setSelectedEvent(event);
              map.current?.flyTo({
                center: event.coordinates,
                zoom: 15
              });
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm">{event.title}</h3>
              <Badge variant="outline" className="text-xs">
                {event.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {event.description}
            </p>
            <div className="flex justify-between items-center text-xs">
              <div>
                <div className="text-muted-foreground">{event.date}</div>
                <div className="text-muted-foreground">{event.time}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {event.price ? `$${event.price}` : 'Free'}
                </div>
                <div className="text-muted-foreground">
                  {event.attendees}/{event.capacity}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or category filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventMap;