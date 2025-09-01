import { AppLayout } from "@/components/AppLayout";
import EventCard from "@/components/events/EventCard";
import PreviewEventCard from "@/components/events/PreviewEventCard";
import EventMap from "@/components/EventMap";
import AdvancedEventFilters, { EventFilters as LegacyEventFilters } from "@/components/AdvancedEventFilters";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/features/auth/AuthProvider";
import { useEventsFeed, useMapEvents, useCreateEvent, EventFilters } from "@/hooks/useEventsData";
import { normalizeEventData, getEventLinkSafe, hasValidCoordinates } from "@/utils/eventHelpers";
import { Calendar, Plus, Map, Grid3X3 } from "lucide-react";

export default function Events() {
  const [filters, setFilters] = useState<EventFilters>({});
  const [legacyFilters, setLegacyFilters] = useState<LegacyEventFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");

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
    return events.map(normalizeEventData);
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

  // Filter map events to only include geocoded events
  const validMapEvents = useMemo(() => {
    return mapEvents.filter(hasValidCoordinates);
  }, [mapEvents]);

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
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Advanced Filters Sidebar */}
              <div className="lg:col-span-1">
                <AdvancedEventFilters
                  filters={legacyFilters}
                  onFiltersChange={setLegacyFilters}
                  onClearFilters={() => setLegacyFilters({})}
                />
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* View Mode Toggle */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                    {isLoading ? (
                      <LoadingState />
                    ) : (
                      <>
                        {!isLoading && filteredEvents.length === 0 ? (
                          <EmptyState
                            icon={Calendar}
                            title="No events found"
                            description="No events match your current filters. Try adjusting your search or category selection."
                            action={{
                              label: "Create Event",
                              onClick: () => setShowCreateDialog(true)
                            }}
                          />
                        ) : (
                          <div className={isMobile 
                            ? "space-y-4" 
                            : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                          }>
                            {filteredEvents.map((event) => {
                              const eventLink = getEventLinkSafe(event);
                              const EventComponent = user ? EventCard : PreviewEventCard;
                              
                              if (eventLink) {
                                return (
                                  <Link key={event.id} to={eventLink}>
                                    <EventComponent event={event} />
                                  </Link>
                                );
                              } else {
                                return <EventComponent key={event.id} event={event} />;
                              }
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="map" className="mt-6">
                    <EventMap events={validMapEvents} />
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