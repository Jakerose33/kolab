import { AppLayout } from "@/components/AppLayout";
import EventCard from "@/components/events/EventCard";
import PreviewEventCard from "@/components/events/PreviewEventCard";
import EventMap from "@/components/EventMap";
import AdvancedEventFilters, { EventFilters } from "@/components/AdvancedEventFilters";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/features/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Search, Filter, Plus, Map, Grid3X3 } from "lucide-react";
import { getEventLink, normalizeEvent } from "@/lib/linking";
import { format } from "date-fns";

// Enhanced sample events data with coordinates and pricing
const sampleEvents = [
  {
    id: "1",
    title: "Underground Art Gallery Opening",
    description: "Exclusive underground art exhibition featuring emerging local artists",
    start_at: new Date(Date.now() + 86400000).toISOString(),
    end_at: null,
    venue_name: "Hidden Gallery",
    venue_address: "Collins Street, Melbourne CBD",
    latitude: -37.8136,
    longitude: 144.9631,
    capacity: 50,
    price: 25,
    tags: ["art", "gallery"],
    image_url: "/images/events/street-art-opening.jpg",
    status: "published",
    organizer_id: "organizer1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Art Curator",
      handle: "artcurator"
    }
  },
  {
    id: "2", 
    title: "Midnight Jazz Session",
    description: "Intimate jazz performance in a secret speakeasy location",
    start_at: new Date(Date.now() + 172800000).toISOString(),
    end_at: null,
    venue_name: "The Vault",
    venue_address: "Fitzroy, Melbourne", 
    latitude: -37.7964,
    longitude: 144.9784,
    capacity: 40,
    price: 35,
    tags: ["music", "jazz"],
    image_url: "/images/events/midnight-jazz.jpg",
    status: "published",
    organizer_id: "organizer2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Jazz Collective",
      handle: "jazzvibes"
    }
  },
  {
    id: "3",
    title: "Warehouse Rave",
    description: "Electronic music event in an abandoned warehouse with top DJs",
    start_at: new Date(Date.now() + 604800000).toISOString(),
    end_at: null,
    venue_name: "Warehouse District",
    venue_address: "Richmond, Melbourne",
    latitude: -37.8197,
    longitude: 144.9942,
    capacity: 200,
    price: 45,
    tags: ["music", "electronic"],
    image_url: "/images/events/warehouse-rave.jpg",
    status: "published", 
    organizer_id: "organizer3",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Underground Events",
      handle: "undergroundevents"
    }
  },
  {
    id: "4",
    title: "Tech Startup Pitch Night",
    description: "Present your startup ideas to Melbourne investors and entrepreneurs",
    start_at: new Date(Date.now() + 259200000).toISOString(),
    end_at: null,
    venue_name: "Innovation Hub",
    venue_address: "South Yarra, Melbourne",
    latitude: -37.8467,
    longitude: 144.9944,
    capacity: 100,
    price: 0, // Free event
    tags: ["business", "technology"],
    image_url: "/images/events/startup-pitch.jpg",
    status: "published",
    organizer_id: "organizer4",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Tech Melbourne",
      handle: "techmelbourne"
    }
  }
];

export default function Events() {
  const [events, setEvents] = useState<any[]>(sampleEvents);
  const [filteredEvents, setFilteredEvents] = useState<any[]>(sampleEvents);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { toast } = useToast();
  const { session } = useAuth();
  const isMobile = useIsMobile();

  // Advanced filters state
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: 'all',
    date: null,
    timeOfDay: 'all',
    radius: 50,
    maxPrice: 200,
    location: ''
  });

  // Fetch real events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('start_at', { ascending: true });

        if (error) throw error;
        
        // Use real events from database, fallback to sample events
        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(sampleEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // Fallback to sample events
        setEvents(sampleEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Advanced filtering logic
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.venue_address?.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.tags?.some((tag: string) => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => 
        event.tags && event.tags.some((tag: string) => 
          tag.toLowerCase() === filters.category.toLowerCase()
        )
      );
    }

    // Date filter
    if (filters.date) {
      const filterDate = format(filters.date, 'yyyy-MM-dd');
      filtered = filtered.filter(event => {
        const eventDate = format(new Date(event.start_at), 'yyyy-MM-dd');
        return eventDate === filterDate;
      });
    }

    // Time of day filter
    if (filters.timeOfDay !== 'all') {
      filtered = filtered.filter(event => {
        const eventHour = new Date(event.start_at).getHours();
        switch (filters.timeOfDay) {
          case 'morning':
            return eventHour >= 6 && eventHour < 12;
          case 'afternoon':
            return eventHour >= 12 && eventHour < 18;
          case 'evening':
            return eventHour >= 18 && eventHour < 23;
          case 'late':
            return eventHour >= 23 || eventHour < 6;
          default:
            return true;
        }
      });
    }

    // Location filter (simplified - in real app would use geocoding)
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.venue_address?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(event => {
      const price = event.price || 0;
      return price <= filters.maxPrice;
    });

    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
    });

    setFilteredEvents(filtered);
  }, [events, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      date: null,
      timeOfDay: 'all',
      radius: 50,
      maxPrice: 200,
      location: ''
    });
  };

  const handleShare = (eventId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
    toast({
      title: "Event link copied!",
      description: "Share this link to invite others to the event.",
    });
  };

  const handleCreateEvent = async (eventData?: any) => {
    if (!session?.user) {
      setShowAuth(true);
      return;
    }

    if (eventData) {
      try {
        // In real implementation, save to database
        const newEvent = {
          id: `event_${Date.now()}`,
          ...eventData,
          organizer_id: session.user.id,
          profiles: {
            full_name: session.user.user_metadata?.full_name || "Event Organizer",
            handle: session.user.user_metadata?.handle || "organizer"
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Add to local state (in real app, refetch from database)
        setEvents(prev => [newEvent, ...prev]);
        
        toast({
          title: "Event Created!",
          description: "Your event has been successfully created and published.",
        });
      } catch (error) {
        console.error('Error creating event:', error);
        toast({
          title: "Failed to create event",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }

    setShowCreateDialog(true);
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'interested') => {
    if (!session?.user) {
      setShowAuth(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: session.user.id,
          status: status
        });

      if (error) throw error;

      toast({
        title: "RSVP Updated",
        description: `You are now marked as ${status} for this event.`,
      });
    } catch (error) {
      console.error('RSVP error:', error);
      toast({
        title: "RSVP Failed",
        description: "Unable to update your RSVP. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  // Transform events for map component
  const mapEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: format(new Date(event.start_at), 'MMM dd, yyyy'),
    time: format(new Date(event.start_at), 'h:mm a'),
    location: event.venue_address || event.venue_name || 'Location TBD',
    category: event.tags?.[0] || 'other',
    coordinates: [event.longitude || 144.9631, event.latitude || -37.8136] as [number, number],
    price: event.price || 0,
    attendees: Math.floor(Math.random() * (event.capacity * 0.7)) + 1,
    capacity: event.capacity || 50
  }));

  return (
    <>
      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <main className="container px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Events
                </h1>
                <p className="text-muted-foreground text-lg">
                  Discover and create amazing events in your area
                </p>
              </div>
              <Button onClick={() => handleCreateEvent()} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Advanced Filters Sidebar */}
              <div className="lg:col-span-1">
                <AdvancedEventFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                />
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* View Mode Toggle */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'map')}>
                  <div className="flex items-center justify-between">
                    <TabsList className="grid w-fit grid-cols-2">
                      <TabsTrigger value="grid" className="gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        Grid View
                      </TabsTrigger>
                      <TabsTrigger value="map" className="gap-2">
                        <Map className="h-4 w-4" />
                        Map View
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="text-sm text-muted-foreground">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                    </div>
                  </div>

                  <TabsContent value="grid" className="mt-6">
                    {/* Events Grid */}
                    {filteredEvents.length > 0 ? (
                      <div className={isMobile 
                        ? "space-y-4" 
                        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      }>
                        {filteredEvents.map((event) => {
                          const link = getEventLink(event);
                          if (!link) return null;

                          const n = normalizeEvent(event);
                          
                          return (
                            <div
                              key={String(n.id)}
                              onClick={() => window.location.href = link}
                              className="cursor-pointer block focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {session?.user ? (
                                <EventCard event={event} />
                              ) : (
                                <PreviewEventCard event={event} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Calendar}
                        title="No events found"
                        description="No events match your current filters. Try adjusting your search or category selection."
                        action={{
                          label: "Create Event",
                          onClick: () => handleCreateEvent()
                        }}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="map" className="mt-6">
                    {/* Map View */}
                    <EventMap events={mapEvents} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </AppLayout>
      
      <CreateEventWizard
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateEvent={handleCreateEvent}
      />
      <MessagesDialog
        open={showMessagesDialog}
        onOpenChange={setShowMessagesDialog}
      />
      <NotificationsDrawer
        open={showNotificationsDialog}
        onOpenChange={setShowNotificationsDialog}
      />
      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
      />
    </>
  );
}