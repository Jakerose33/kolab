import { useState, useEffect } from "react";
import { KolabHeader } from "@/components/KolabHeader";
import { EventCard } from "@/components/EventCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  MapPin, 
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "Creative Photography Workshop",
    description: "Join us for an immersive photography workshop focusing on urban landscapes and street photography techniques.",
    date: "March 15, 2024",
    time: "2:00 PM",
    location: "Downtown Art Studio, 123 Creative Blvd",
    category: "photography",
    capacity: 20,
    attendees: 15,
    price: 45,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop",
    organizer: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face",
      verified: true,
    },
    tags: ["photography", "creative", "workshop", "urban"],
    rating: 4.8,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "2",
    title: "Tech Startup Networking Mixer",
    description: "Connect with fellow entrepreneurs, investors, and tech enthusiasts in a relaxed networking environment.",
    date: "March 18, 2024",
    time: "6:30 PM",
    location: "Innovation Hub, 456 Tech Street",
    category: "business",
    capacity: 50,
    attendees: 42,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
    organizer: {
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      verified: true,
    },
    tags: ["networking", "startup", "business", "tech"],
    rating: 4.6,
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: "3",
    title: "Collaborative Music Session",
    description: "Bring your instrument and jam with local musicians. All skill levels welcome in this collaborative music experience.",
    date: "March 20, 2024",
    time: "7:00 PM",
    location: "The Sound Lounge, 789 Harmony Ave",
    category: "music",
    capacity: 15,
    attendees: 12,
    price: 20,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    organizer: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      verified: false,
    },
    tags: ["music", "collaboration", "instruments", "community"],
    rating: 4.9,
    isLiked: false,
    isBookmarked: false,
  },
];

const mockCategories = [
  { id: "music", name: "Music", count: 12, icon: null },
  { id: "art", name: "Art", count: 8, icon: null },
  { id: "photography", name: "Photography", count: 15, icon: null },
  { id: "technology", name: "Technology", count: 22, icon: null },
  { id: "wellness", name: "Wellness", count: 9, icon: null },
  { id: "business", name: "Business", count: 18, icon: null },
  { id: "education", name: "Education", count: 14, icon: null },
  { id: "food", name: "Food", count: 11, icon: null },
];

export default function Index() {
  const [events, setEvents] = useState(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Filter events based on category and search
  const filteredEvents = events.filter(event => {
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "popular":
        return b.attendees - a.attendees;
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  const handleCreateEvent = (eventData: any) => {
    setEvents(prev => [eventData, ...prev]);
    toast({
      title: "Event Created!",
      description: "Your collaborative event has been published successfully.",
    });
  };

  const handleBookEvent = (eventId: string) => {
    toast({
      title: "Booking Confirmed!",
      description: "You've successfully joined this collaborative event.",
    });
  };

  const handleLikeEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isLiked: !event.isLiked }
        : event
    ));
  };

  const handleShareEvent = (eventId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
    toast({
      title: "Link Copied!",
      description: "Event link has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={() => setShowCreateDialog(true)}
        onOpenMessages={() => toast({ title: "Messages", description: "Opening messages..." })}
        onOpenNotifications={() => toast({ title: "Notifications", description: "Opening notifications..." })}
      />

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-subtle">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Collaborate. Create. Connect.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join meaningful collaborative events where creativity meets community. 
              Discover workshops, networking sessions, and creative partnerships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-lg px-8"
                onClick={() => setShowCreateDialog(true)}
              >
                Create Event
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explore Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">15K+</div>
              <div className="text-muted-foreground">Collaborators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.9</div>
              <div className="text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              {/* Search */}
              <div className="space-y-4">
                <h3 className="font-semibold">Search Events</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <CategoryFilter
                categories={mockCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />

              {/* Quick Filters */}
              <div className="space-y-4">
                <h3 className="font-semibold">Quick Filters</h3>
                <div className="space-y-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    This Weekend
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    Free Events
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    Near Me
                  </Badge>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="flex-1">
              {/* Tabs and Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing {sortedEvents.length} of {events.length} events
                  {selectedCategory && (
                    <span> in {mockCategories.find(c => c.id === selectedCategory)?.name}</span>
                  )}
                </p>
              </div>

              {/* Tabs with Events Grid */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Events</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="nearby">Nearby</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  {sortedEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {sortedEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onBookEvent={handleBookEvent}
                          onLikeEvent={handleLikeEvent}
                          onShareEvent={handleShareEvent}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold mb-2">No events found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filters to find more events.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="trending" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedEvents.slice(0, 6).map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onBookEvent={handleBookEvent}
                        onLikeEvent={handleLikeEvent}
                        onShareEvent={handleShareEvent}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="nearby" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedEvents.slice(0, 3).map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onBookEvent={handleBookEvent}
                        onLikeEvent={handleLikeEvent}
                        onShareEvent={handleShareEvent}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
}