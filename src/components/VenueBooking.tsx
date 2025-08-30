import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Users, Wifi, Car, Coffee, Zap, DollarSign, Clock, Loader2, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bookVenue } from "@/lib/supabase";
import VenueMap from "@/components/VenueMap";
import { VenueBookingDialog } from "./VenueBookingDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/AuthProvider";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  hourly_rate: number;
  capacity: number;
  images: string[];
  amenities: string[];
  tags: string[];
  latitude?: number;
  longitude?: number;
  owner_name?: string;
  owner_handle?: string;
  status: string;
}

const amenityIcons = {
  "WiFi": Wifi,
  "Sound System": Zap,
  "Parking": Car,
  "Kitchen": Coffee,
  "Bar": Coffee,
  "Outdoor Space": Users,
  "City Views": MapPin,
  "AV Equipment": Zap,
  "Coffee Station": Coffee,
  "Air Conditioning": Zap,
  "Security": Users,
  "Accessible": Users,
};

export function VenueBooking() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState("hourly_rate");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  // Load venues from Supabase
  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVenues(data || []);
    } catch (error: any) {
      console.error('Error loading venues:', error);
      toast({
        title: "Error Loading Venues",
        description: "Failed to load venues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = !searchQuery || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || 
      (venue.tags && venue.tags.some(tag => tag.toLowerCase().includes(filterType.toLowerCase())));
    
    return matchesSearch && matchesType;
  });

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    switch (sortBy) {
      case "hourly_rate-low":
        return (a.hourly_rate || 0) - (b.hourly_rate || 0);
      case "hourly_rate-high":
        return (b.hourly_rate || 0) - (a.hourly_rate || 0);
      case "capacity":
        return (b.capacity || 0) - (a.capacity || 0);
      case "name":
        return a.name.localeCompare(b.name);
      case "hourly_rate":
      default:
        return (a.hourly_rate || 0) - (b.hourly_rate || 0);
    }
  });

  const handleBookVenue = (venue: Venue) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a venue.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedVenue(venue);
    setShowBookingDialog(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingDialog(false);
    setSelectedVenue(null);
    toast({
      title: "Booking Request Sent",
      description: "Your booking request has been submitted successfully. You'll receive an email confirmation shortly.",
    });
  };

  if (loading) {
    return <LoadingState />;
  }

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
              <SelectItem value="hourly_rate">Price: Low to High</SelectItem>
              <SelectItem value="hourly_rate-high">Price: High to Low</SelectItem>
              <SelectItem value="capacity">Largest Capacity</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map Integration */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-4">
          <VenueMap venues={sortedVenues.map(venue => ({
            id: venue.id,
            name: venue.name,
            description: venue.description,
            location: venue.address,
            coordinates: [
              venue.longitude || (144.9631 + (Math.random() - 0.5) * 0.1), 
              venue.latitude || (-37.8136 + (Math.random() - 0.5) * 0.1)
            ],
            price: venue.hourly_rate || 0,
            capacity: venue.capacity || 0,
            rating: 4.5, // Default rating
            type: venue.tags?.[0] || 'Venue',
            amenities: venue.amenities || []
          }))} />
        </TabsContent>

        <TabsContent value="list">
          {sortedVenues.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No venues found"
              description="Try adjusting your search or filters to find more venues."
              action={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery("");
                  setFilterType("all");
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVenues.map((venue) => (
                <Card key={venue.id} className="kolab-card overflow-hidden group">
                  <div className="relative">
                    <img
                      src={venue.images && venue.images.length > 0 
                        ? venue.images[0] 
                        : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"
                      }
                      alt={venue.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-4 right-4 bg-background/80 text-foreground border">
                      Available
                    </Badge>
                  </div>
                  
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{venue.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.5</span>
                      </div>
                    </div>
                    
                    <CardDescription className="text-sm">
                      {venue.description}
                    </CardDescription>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {venue.address}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {venue.tags && venue.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities && venue.amenities.slice(0, 4).map((amenity) => {
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
                        <span>Up to {venue.capacity || 0} people</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${venue.hourly_rate || 0}</div>
                        <div className="text-xs text-muted-foreground">per hour</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      data-testid="booking-request"
                      onClick={() => handleBookVenue(venue)}
                    >
                      🎟️ Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      {selectedVenue && (
        <VenueBookingDialog
          isOpen={showBookingDialog}
          onClose={() => {
            setShowBookingDialog(false);
            setSelectedVenue(null);
            handleBookingSuccess();
          }}
          venue={selectedVenue}
        />
      )}
    </div>
  );
}