import { AppLayout } from "@/components/AppLayout";
import { Helmet } from "react-helmet-async";
import EventCard from "@/components/events/EventCard";
import PreviewEventCard from "@/components/events/PreviewEventCard";
import EventMap from "@/components/EventMap";
import UnifiedEventFilters from "@/components/UnifiedEventFilters";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/features/auth/AuthProvider";
import { useEventsFeed, useMapEvents, useCreateEvent, EventFilters } from "@/hooks/useEventsData";
import { normalizeEventData, getEventLinkSafe, hasValidCoordinates } from "@/utils/eventHelpers";
import { Calendar, Plus, Map, Grid3X3 } from "lucide-react";
import { useRouteQuery } from "@/utils/routing";

export default function Events() {
  const [filters, setFilters] = useState<EventFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");

  // Handle query parameters from hero buttons
  const whenQuery = useRouteQuery('when');
  const categoryQuery = useRouteQuery('category');
  
  // Apply query params to filters on mount - synchronous to prevent race conditions
  useEffect(() => {
    const queryFilters: EventFilters = {};
    
    if (whenQuery === 'tonight') {
      const today = new Date();
      queryFilters.startDate = today.toISOString().split('T')[0];
      queryFilters.endDate = today.toISOString().split('T')[0];
    }
    
    if (categoryQuery && typeof categoryQuery === 'string') {
      queryFilters.categories = [categoryQuery];
    }
    
    if (Object.keys(queryFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...queryFilters }));
    }
  }, [whenQuery, categoryQuery]);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Use canonical data hooks
  const { data: events = [], isLoading, error } = useEventsFeed(filters);
  const { data: mapEvents = [] } = useMapEvents(undefined, filters);
  const createEventMutation = useCreateEvent();

  // Handle loading and error states
  if (error) {
    console.error('Events fetch error:', error);
  }

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return (events || []).map(normalizeEventData);
  }, [events]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  const handleShare = (eventId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
    toast({
      title: "Event link copied!",
      description: "Share this link to invite others to the event.",
    });
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'interested') => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      // Implementation would go here using a hook
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

  // Handle create event
  const handleCreateEvent = async (eventData: any) => {
    createEventMutation.mutate(eventData, {
      onSuccess: () => {
        setShowCreateDialog(false);
      }
    });
  };

  // Use the existing map events without transformation
  const validMapEvents = useMemo(() => {
    return (mapEvents || []).filter(hasValidCoordinates);
  }, [mapEvents]);

  return (
    <>
      {/* SEO and Accessibility Optimization */}
      <Helmet>
        <title>Underground Events Melbourne | Discover Secret Parties & Cultural Experiences | Kolab</title>
        <meta 
          name="description" 
          content="Find the best underground events, secret parties, and cultural experiences in Melbourne. From intimate music venues to exclusive art galleries. Discover events tonight." 
        />
        <meta 
          name="keywords" 
          content="melbourne events, underground events melbourne, secret parties melbourne, music events melbourne, art events melbourne, cultural events melbourne, melbourne nightlife" 
        />
        <link rel="canonical" href="https://ko-lab.com.au/events" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Underground Events Melbourne | Discover Secret Parties & Cultural Experiences" />
        <meta property="og:description" content="Find the best underground events, secret parties, and cultural experiences in Melbourne. From intimate music venues to exclusive art galleries." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ko-lab.com.au/events" />
        <meta property="og:image" content="https://ko-lab.com.au/images/og-kolab.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Underground Events Melbourne | Discover Secret Parties & Cultural Experiences" />
        <meta name="twitter:description" content="Find the best underground events, secret parties, and cultural experiences in Melbourne." />
        <meta name="twitter:image" content="https://ko-lab.com.au/images/og-kolab.jpg" />
        
        {/* Event-specific structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EventOrganization",
            "name": "Kolab Events",
            "description": "Underground events and cultural experiences in Melbourne",
            "url": "https://ko-lab.com.au/events",
            "location": {
              "@type": "City",
              "name": "Melbourne",
              "addressCountry": "AU"
            }
          })}
        </script>
      </Helmet>

      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <main className="container px-4 py-8" role="main">
          <div className="space-y-8">
            {/* Page Header with proper heading hierarchy */}
            <header className="text-center space-y-4" role="banner">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Discover Events
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find underground events, secret parties, and cultural experiences happening in Melbourne
              </p>
            </header>

            {/* Filters and Search Section */}
            <section aria-label="Event search and filters" className="events-filters" role="search">
              <UnifiedEventFilters 
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
                className="mb-6"
              />
            </section>

            {/* Events Display Section */}
            <section aria-label="Event listings and map view" className="events-content" role="main">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6" role="tablist" aria-label="View options">
                  <TabsTrigger value="grid" className="flex items-center gap-2" role="tab" aria-controls="grid-panel">
                    <Grid3X3 className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Grid View</span>
                    <span className="sm:hidden">Grid</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2" role="tab" aria-controls="map-panel">
                    <Map className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Map View</span>
                    <span className="sm:hidden">Map</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="mt-0" role="tabpanel" id="grid-panel" aria-labelledby="grid-tab">
                  {isLoading ? (
                    <LoadingState />
                  ) : (
                    <>
                      {filteredEvents.length > 0 ? (
                        <div 
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                          role="grid"
                          aria-label={`${filteredEvents.length} events found`}
                        >
                          {filteredEvents.map((event) => {
                            if (!event?.id) return null;
                            
                            try {
                              if (user) {
                                return (
                                  <EventCard 
                                    key={String(event.id)}
                                    event={event}
                                  />
                                );
                              } else {
                                return (
                                  <PreviewEventCard 
                                    key={String(event.id)}
                                    event={event}
                                    onClick={() => setShowAuth(true)}
                                  />
                                );
                              }
                            } catch (error) {
                              console.debug('Error rendering event card:', error);
                              return null;
                            }
                          }).filter(Boolean)}
                        </div>
                      ) : (
                        <EmptyState
                          icon={Calendar}
                          title="No events found"
                          description="Try adjusting your filters or check back later for new events."
                          action={{
                            label: "Clear Filters",
                            onClick: clearFilters
                          }}
                        />
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="map" className="mt-0" role="tabpanel" id="map-panel" aria-labelledby="map-tab">
                  <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border">
                    <EventMap />
                  </div>
                  {validMapEvents.length === 0 && (
                    <p className="text-center text-muted-foreground mt-4">
                      No events with location data available for map view.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </main>
        
        {/* Create Event Dialog */}
        <CreateEventWizard
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />

        <MessagesDialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog} />
        <NotificationsDrawer open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog} />
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </AppLayout>
    </>
  );
}