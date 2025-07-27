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
import { MapPin, Navigation, Search, Filter, Star, Users } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates: [number, number];
  price: number;
  capacity: number;
  rating: number;
  type: string;
  amenities: string[];
}

const mockMapVenues: Venue[] = [
  {
    id: "1",
    name: "Urban Studio Loft",
    description: "Modern industrial space perfect for creative events",
    location: "Southbank, Melbourne", 
    coordinates: [144.9631, -37.8236],
    price: 150,
    capacity: 50,
    rating: 4.8,
    type: "Studio",
    amenities: ["WiFi", "Sound System", "Parking"]
  },
  {
    id: "2", 
    name: "Rooftop Garden Venue",
    description: "Stunning rooftop space with city views",
    location: "CBD, Melbourne",
    coordinates: [144.9612, -37.8136],
    price: 300,
    capacity: 100,
    rating: 4.9,
    type: "Rooftop",
    amenities: ["WiFi", "Bar", "City Views"]
  },
  {
    id: "3",
    name: "Tech Conference Hall", 
    description: "Professional conference space with state-of-the-art tech",
    location: "Docklands, Melbourne",
    coordinates: [144.9400, -37.8181],
    price: 500,
    capacity: 200,
    rating: 4.7,
    type: "Conference",
    amenities: ["WiFi", "AV Equipment", "Parking"]
  },
  {
    id: "4",
    name: "Artisan Workshop Space",
    description: "Creative workshop space in trendy Fitzroy",
    location: "Fitzroy, Melbourne",
    coordinates: [144.9780, -37.7956],
    price: 120,
    capacity: 30,
    rating: 4.6,
    type: "Workshop",
    amenities: ["WiFi", "Art Supplies", "Natural Light"]
  },
  {
    id: "5",
    name: "Waterfront Event Hall",
    description: "Elegant hall with stunning water views",
    location: "St Kilda, Melbourne", 
    coordinates: [144.9779, -37.8675],
    price: 400,
    capacity: 150,
    rating: 4.8,
    type: "Event Hall",
    amenities: ["WiFi", "Catering", "Water Views"]
  },
];

interface VenueMapProps {
  venues?: Venue[];
}

const VenueMap = ({ venues: propsVenues }: VenueMapProps = {}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken = 'pk.eyJ1Ijoia29sYWIiLCJhIjoiY21ka3Jzc3duMTB2bjJ4cTNhYjBmNDI4NCJ9.joO5ftfGwuKkHBV6rwDJdA';
  const [venues, setVenues] = useState<Venue[]>(propsVenues || mockMapVenues);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Filter venues
  const filteredVenues = venues.filter(venue => {
    const matchesType = selectedType === 'all' || venue.type.toLowerCase() === selectedType;
    const matchesSearch = !searchQuery || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [144.9631, -37.8136], // Melbourne, Victoria
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for filtered venues
    filteredVenues.forEach(venue => {
      const el = document.createElement('div');
      el.className = 'w-5 h-5 bg-purple-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center';
      el.innerHTML = '🏢';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(venue.coordinates)
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'venue-popup'
      }).setHTML(`
        <div class="p-3 min-w-64">
          <h3 class="font-semibold text-sm mb-1">${venue.name}</h3>
          <p class="text-xs text-muted-foreground mb-2">${venue.description}</p>
          <div class="flex justify-between items-center text-xs mb-2">
            <span class="text-muted-foreground">${venue.location}</span>
            <div class="flex items-center gap-1">
              <span class="text-yellow-500">⭐</span>
              <span>${venue.rating}</span>
            </div>
          </div>
          <div class="flex justify-between items-center text-xs mb-2">
            <span class="font-medium">$${venue.price}/day</span>
            <span class="text-muted-foreground">👥 ${venue.capacity} people</span>
          </div>
          <div class="mt-2">
            <button 
              class="w-full bg-primary text-primary-foreground text-xs py-1 px-3 rounded hover:opacity-90 transition-opacity"
              onclick="window.selectMapVenue('${venue.id}')"
            >
              Book Venue
            </button>
          </div>
        </div>
      `);

      marker.setPopup(popup);
    });

    // Global function for popup buttons
    (window as any).selectMapVenue = (venueId: string) => {
      const venue = venues.find(v => v.id === venueId);
      if (venue) setSelectedVenue(venue);
    };

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, filteredVenues]);

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search venues or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="rooftop">Rooftop</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="event hall">Event Hall</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Map Container */}
      <div className="relative h-96 rounded-lg overflow-hidden border shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Venue Count Overlay */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <p className="text-sm font-medium">
            {filteredVenues.length} venues found
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

      {/* Venues List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedVenue?.id === venue.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => {
              setSelectedVenue(venue);
              map.current?.flyTo({
                center: venue.coordinates,
                zoom: 15
              });
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm">{venue.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{venue.rating}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {venue.description}
            </p>
            <div className="flex justify-between items-center text-xs">
              <div>
                <div className="text-muted-foreground">{venue.location}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3" />
                  <span>Up to {venue.capacity}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${venue.price}</div>
                <div className="text-muted-foreground">per day</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No venues found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or type filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default VenueMap;