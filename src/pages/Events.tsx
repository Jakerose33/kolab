import { AppLayout } from "@/components/AppLayout";
import { EventCard } from "@/components/EventCard";
import { PreviewEventCard } from "@/components/PreviewEventCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/features/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, Search, Filter, Plus } from "lucide-react";

// Sample events data with working functionality
const sampleEvents = [
  {
    id: "1",
    title: "Underground Art Gallery Opening",
    description: "Exclusive underground art exhibition featuring emerging local artists",
    start_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_at: null,
    venue_name: "Hidden Gallery",
    venue_address: "Downtown",
    capacity: 50,
    tags: ["Art", "Gallery"],
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
    start_at: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    end_at: null,
    venue_name: "The Vault",
    venue_address: "City Center", 
    capacity: 40,
    tags: ["Music", "Jazz"],
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
    start_at: new Date(Date.now() + 604800000).toISOString(), // Next week
    end_at: null,
    venue_name: "Warehouse District",
    venue_address: "Industrial Area",
    capacity: 200,
    tags: ["Music", "Electronic", "Rave"],
    image_url: "/images/events/warehouse-rave.jpg",
    status: "published", 
    organizer_id: "organizer3",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      full_name: "Underground Events",
      handle: "undergroundevents"
    }
  }
];

export default function Events() {
  const [events, setEvents] = useState(sampleEvents);
  const [filteredEvents, setFilteredEvents] = useState(sampleEvents);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const { toast } = useToast();
  const { session } = useAuth();
  const isMobile = useIsMobile();

  // Generate categories from events
  const categories = useMemo(() => {
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

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(event => 
        event.tags && event.tags.some((tag: string) => 
          tag.toLowerCase() === selectedCategory.toLowerCase()
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
  }, [events, selectedCategory, searchQuery, sortBy]);

  const handleShare = (eventId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
    toast({
      title: "Event link copied!",
      description: "Share this link to invite others to the event.",
    });
  };

  const handleCreateEvent = () => {
    if (!session?.user) {
      setShowAuth(true);
      return;
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
              <Button onClick={handleCreateEvent} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>
            
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
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
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Upcoming</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="newest">Recently Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>
            
            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className={isMobile 
                ? "space-y-4" 
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              }>
                {filteredEvents.map((event) => 
                  session?.user ? (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      onShare={handleShare}
                    />
                  ) : (
                    <PreviewEventCard 
                      key={event.id} 
                      event={event}
                      onSignInRequired={() => setShowAuth(true)}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No events found"
                description="No events match your current filters. Try adjusting your search or category selection."
                action={{
                  label: "Create Event",
                  onClick: handleCreateEvent
                }}
              />
            )}
          </div>
        </main>
      </AppLayout>
      
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
      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
      />
    </>
  );
}