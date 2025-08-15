import { useState, useEffect } from "react";
import { KolabHeader } from "@/components/KolabHeader";
import { EventCard } from "@/components/EventCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { RecommendationsCarousel } from "@/components/RecommendationsCarousel";
import { RealtimeActivityFeed } from "@/components/RealtimeActivityFeed";
import { RealtimeNotificationsList } from "@/components/RealtimeNotificationsList";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
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
  Search,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";
import EventMap from "@/components/EventMap";
import { getEvents, getUserRSVPs } from "@/lib/supabase";
import React from "react";

export default function Index() {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [userRSVPs, setUserRSVPs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOnline } = useOfflineQueue();
  usePerformanceMetrics();

  // Generate categories from events
  const categories = React.useMemo(() => {
    const categoryMap = new Map();
    events.forEach(event => {
      if (event.tags) {
        event.tags.forEach((tag: string) => {
          const count = categoryMap.get(tag) || 0;
          categoryMap.set(tag, count + 1);
        });
      }
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase(),
      name,
      icon: null,
      count
    }));
  }, [events]);

  // Real-time event handlers
  const handleNewEvent = (event: any) => {
    // Only add if it's published and not already in the list
    if (event.status === 'published' && !events.find(e => e.id === event.id)) {
      setEvents(prev => [event, ...prev]);
    }
  };

  const handleEventUpdate = (event: any) => {
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
  };

  const handleNewRSVP = (rsvp: any) => {
    // Update user RSVPs if it's for the current user
    if (user && rsvp.user_id === user.id) {
      setUserRSVPs(prev => ({
        ...prev,
        [rsvp.event_id]: rsvp.status
      }));
    }
  };

  // Set up real-time subscriptions
  useRealtime({
    onEventCreated: handleNewEvent,
    onEventUpdated: handleEventUpdate,
    onRSVPCreated: handleNewRSVP,
    onRSVPUpdated: handleNewRSVP
  });

  // Load events and user RSVPs
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: eventsData, error: eventsError } = await getEvents();
        if (eventsError) throw eventsError;
        
        setEvents(eventsData || []);
        
        // Load user RSVPs if authenticated
        if (user) {
          const { data: rsvpData } = await getUserRSVPs();
          const rsvpMap: Record<string, string> = {};
          rsvpData?.forEach((rsvp: any) => {
            if (rsvp.events?.id) {
              rsvpMap[rsvp.events.id] = rsvp.status;
            }
          });
          setUserRSVPs(rsvpMap);
        }
      } catch (error: any) {
        toast({
          title: "Error loading events",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events];

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(event => 
        event.tags && event.tags.some((tag: string) => 
          tag.toLowerCase() === activeCategory.toLowerCase()
        )
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
        case "popularity":
          return 0; // Could implement based on RSVP count
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [events, activeCategory, searchQuery, sortBy]);

  const handleShare = (eventId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/?event=${eventId}`);
    toast({
      title: "Event link copied!",
      description: "Share this link to invite others to the event.",
    });
  };

  const handleCreateEvent = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShowCreateDialog(true);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <KolabHeader
        onCreateEvent={handleCreateEvent}
        onOpenMessages={() => setShowMessagesDialog(true)}
        onOpenNotifications={() => setShowNotificationsDialog(true)}
      />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Discover Events & Collaborations
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with creators, attend amazing events, and build meaningful relationships in our vibrant community.
            </p>
          </div>

          {/* Recommendations Carousel */}
          <RecommendationsCarousel />

          {/* Real-time Activity Feed and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealtimeActivityFeed />
            <RealtimeNotificationsList />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">{events.length}</div>
              <div className="text-sm text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">1.2k</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">{Object.keys(userRSVPs).length}</div>
              <div className="text-sm text-muted-foreground">Your RSVPs</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">23</div>
              <div className="text-sm text-muted-foreground">Venues Available</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, organizers, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Upcoming</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="newest">Recently Added</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter 
            categories={categories}
            selectedCategory={activeCategory}
            onCategorySelect={setActiveCategory}
          />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events ({filteredEvents.length})
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-6">
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onShare={handleShare}
                      userRSVP={userRSVPs[event.id] as 'going' | 'interested' | undefined}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No events found"
                  description="No events match your current filters. Try adjusting your search or category selection."
                  action={{
                    label: "Create Event",
                    onClick: () => user ? setShowCreateDialog(true) : setShowAuth(true)
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <EventMap 
                events={filteredEvents.map(event => ({
                  id: event.id,
                  title: event.title,
                  description: event.description || "",
                  location: event.venue_name || "Location TBD",
                  coordinates: [144.9631 + (Math.random() - 0.5) * 0.1, -37.8136 + (Math.random() - 0.5) * 0.1],
                  date: event.start_at,
                  time: new Date(event.start_at).toLocaleTimeString(),
                  attendees: 0,
                  capacity: event.capacity || 0,
                  category: event.tags?.[0] || "event"
                }))}
              />
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.slice(0, 6).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onShare={handleShare}
                    userRSVP={userRSVPs[event.id] as 'going' | 'interested' | undefined}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <CreateEventWizard
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      <MessagesDialog
        open={showMessagesDialog}
        onOpenChange={setShowMessagesDialog}
      />
      <NotificationsDrawer
        open={showNotificationsDialog}
        onOpenChange={setShowNotificationsDialog}
      />
      
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
      />
    </div>
  );
}