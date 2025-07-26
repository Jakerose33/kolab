import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Users, Wifi, Car, Coffee, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock venue data
const mockVenues = [
  {
    id: "1",
    name: "Urban Studio Loft",
    description: "Modern industrial space perfect for creative events and workshops",
    location: "Downtown District, Creative Quarter",
    price: 150,
    capacity: 50,
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"],
    amenities: ["WiFi", "Sound System", "Parking", "Catering Kitchen"],
    type: "Studio",
    availability: "Available",
  },
  {
    id: "2",
    name: "Rooftop Garden Venue",
    description: "Stunning rooftop space with city views and garden atmosphere",
    location: "Midtown Heights, Sky District",
    price: 300,
    capacity: 100,
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop"],
    amenities: ["WiFi", "Bar", "Outdoor Seating", "City Views"],
    type: "Rooftop",
    availability: "Available",
  },
  {
    id: "3",
    name: "Tech Conference Hall",
    description: "Professional conference space with state-of-the-art technology",
    location: "Business District, Innovation Hub",
    price: 500,
    capacity: 200,
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop"],
    amenities: ["WiFi", "AV Equipment", "Parking", "Coffee Station"],
    type: "Conference",
    availability: "Available",
  },
];

const amenityIcons = {
  "WiFi": Wifi,
  "Sound System": Zap,
  "Parking": Car,
  "Catering Kitchen": Coffee,
  "Bar": Coffee,
  "Outdoor Seating": Users,
  "City Views": MapPin,
  "AV Equipment": Zap,
  "Coffee Station": Coffee,
};

export function VenueBooking() {
  const [venues, setVenues] = useState(mockVenues);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState("rating");
  const { toast } = useToast();

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = !searchQuery || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || venue.type.toLowerCase() === filterType;
    
    return matchesSearch && matchesType;
  });

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "capacity":
        return b.capacity - a.capacity;
      case "rating":
      default:
        return b.rating - a.rating;
    }
  });

  const handleBookVenue = (venueId: string, venueName: string) => {
    toast({
      title: "Venue Booking Request Sent",
      description: `Your booking request for ${venueName} has been submitted.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Venue Booking</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover and book exceptional venues for your collaborative events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="w-full lg:w-96">
          <Input
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Venue Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="rooftop">Rooftop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="capacity">Largest Capacity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map Integration Placeholder */}
      <Card className="kolab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Venue Map View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded flex items-center justify-center">
            <p className="text-muted-foreground">Interactive Map Integration Coming Soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedVenues.map((venue) => (
          <Card key={venue.id} className="kolab-card overflow-hidden group">
            <div className="relative">
              <img
                src={venue.images[0]}
                alt={venue.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className="absolute top-4 right-4 bg-background/80 text-foreground border">
                {venue.availability}
              </Badge>
            </div>
            
            <CardHeader className="space-y-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{venue.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{venue.rating}</span>
                </div>
              </div>
              
              <CardDescription className="text-sm">
                {venue.description}
              </CardDescription>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {venue.location}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Amenities */}
              <div className="flex flex-wrap gap-2">
                {venue.amenities.slice(0, 4).map((amenity) => {
                  const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Wifi;
                  return (
                    <div key={amenity} className="flex items-center gap-1 text-xs">
                      <Icon className="h-3 w-3" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Capacity and Price */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Up to {venue.capacity} people</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${venue.price}</div>
                  <div className="text-xs text-muted-foreground">per day</div>
                </div>
              </div>

              <Button 
                className="w-full kolab-button-primary"
                onClick={() => handleBookVenue(venue.id, venue.name)}
              >
                Request Booking
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {sortedVenues.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold mb-2">No venues found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find more venues.
          </p>
        </div>
      )}
    </div>
  );
}