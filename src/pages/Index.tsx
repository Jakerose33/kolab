import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import Hero from "@/features/hero/Hero";
import EditorialGrid from "@/features/editorial/EditorialGrid";
import CityGuide from "@/features/city/CityGuide";
import DiariesStrip from "@/features/diaries/DiariesStrip";
import CollabsMarquee from "@/features/collabs/CollabsMarquee";
import EventCard from "@/components/events/EventCard";
import PreviewEventCard from "@/components/events/PreviewEventCard";
import { MobileEventCard } from "@/components/MobileEventCard";
import { MobileEventsCarousel } from "@/components/MobileEventsCarousel";
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
import { SEOOptimizer } from "@/components/SEOOptimizer";
import { CriticalCSS } from "@/components/CriticalCSS";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { Analytics } from "@/components/Analytics";
import { AccessibilityOptimizer } from "@/components/AccessibilityOptimizer";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  AlertCircle,
  SlidersHorizontal,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEventLink, normalizeEvent } from "@/lib/linking";
import { Link } from "react-router-dom";
import { useRealtime } from "@/hooks/useRealtime";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { usePerformanceOptimizations } from "@/hooks/usePerformanceOptimizations";
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
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const { toast } = useToast();
  const { session } = useAuth();
  const { isOnline } = useOfflineQueue();
  const isMobile = useIsMobile();
  usePerformanceOptimizations();

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
    if (session?.user && rsvp.user_id === session.user.id) {
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
        if (session?.user) {
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
  }, [session?.user, toast]);

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
    if (!session?.user) {
      setShowAuth(true);
      return;
    }
    setShowCreateDialog(true);
  };

  // Prepare event data for JSON-LD
  const eventListItems = React.useMemo(() => 
    events.slice(0, 10).map(event => ({
      id: event.id,
      title: event.title,
      url: `/events/${event.id}`,
      image: event.image_url
    })), [events]
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      {/* Performance and SEO optimizations */}
      <CriticalCSS />
      <PerformanceMonitor />
      <Analytics />
      <AccessibilityOptimizer />
      
      {/* Comprehensive SEO optimization */}
      <SEOOptimizer
        page="home"
        breadcrumbs={[
          { name: 'Home', url: '/' }
        ]}
        collectionData={{
          name: "Tonight's Events",
          description: "Discover the best underground events happening tonight",
          items: eventListItems
        }}
      />
      
      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenSearch={() => setShowSearchSheet(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        {/* Semantic HTML structure for SEO */}
        <header role="banner">
          <Hero />
        </header>
        
        <section aria-label="Featured Content" className="featured-content">
          <EditorialGrid />
        </section>
        
        <section aria-label="City Guide" className="city-guide">
          <CityGuide />
        </section>
        
        <main role="main" className="container px-4 py-8" id="main-content">
          <section aria-label="Events and Activities" className="events-section">
            {/* Search and Filters - Mobile First */}
            {isMobile ? (
              <div className="space-y-4">
                {/* Mobile Search Sheet */}
                <Sheet open={showSearchSheet} onOpenChange={setShowSearchSheet}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Search events...
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="h-[90vh]">
                    <SheetHeader>
                      <SheetTitle>Search Events</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Search events, organizers, or topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <CategoryFilter 
                        categories={categories}
                        selectedCategory={activeCategory}
                        onCategorySelect={setActiveCategory}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Mobile Filters */}
                <div className="flex justify-between items-center">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Upcoming</SelectItem>
                      <SelectItem value="popularity">Popular</SelectItem>
                      <SelectItem value="newest">Recent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFiltersSheet(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            ) : (
              /* Desktop Search and Filters */
              <div className="space-y-4">
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
                  </div>
                </div>

                <CategoryFilter 
                  categories={categories}
                  selectedCategory={activeCategory}
                  onCategorySelect={setActiveCategory}
                />
              </div>
            )}

            {/* Events Display with semantic markup */}
            <article className="events-listing" aria-label="Event listings">
            {filteredEvents.length > 0 ? (
              isMobile ? (
                session?.user ? (
                  <MobileEventsCarousel
                    events={filteredEvents}
                    userRSVPs={userRSVPs}
                    onShare={handleShare}
                    onEventClick={(event) => {
                      const link = getEventLink(event);
                      if (link) window.location.href = link;
                    }}
                  />
                ) : (
                  <MobileEventsCarousel
                    events={filteredEvents}
                    onShare={handleShare}
                    onEventClick={() => setShowAuth(true)}
                  />
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => {
                    const link = getEventLink(event);
                    if (!link) return null;

                    const n = normalizeEvent(event);
                    
                    if (session?.user) {
                      return (
                        <div
                          key={String(n.id)}
                          onClick={() => window.location.href = link}
                          className="cursor-pointer block focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <EventCard event={event} />
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={String(n.id)}
                          className="cursor-pointer"
                          onClick={() => setShowAuth(true)}
                        >
                          <PreviewEventCard event={event} />
                        </div>
                      );
                    }
                  })}
                </div>
              )
            ) : (
              <EmptyState
                icon={Calendar}
                title="No events found"
                description="No events match your current filters. Try adjusting your search or category selection."
                action={{
                  label: "Create Event",
                  onClick: () => session?.user ? setShowCreateDialog(true) : setShowAuth(true)
                }}
              />
            )}
            </article>

            {/* Recommendations Carousel - Only on desktop */}
            {!isMobile && (
              <aside aria-label="Recommended events">
                <RecommendationsCarousel />
              </aside>
            )}

            {/* Real-time Activity Feed - Only on desktop */}
            {!isMobile && (
              <section aria-label="Activity feed" className="activity-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RealtimeActivityFeed />
                  <RealtimeNotificationsList />
                </div>
              </section>
            )}

            {/* Quick Stats - Mobile optimized */}
            <section aria-label="Platform statistics" className="stats-section">
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
                <Card className="p-4 text-center">
                  <CardContent className="p-0">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                      {events.length}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                      Active Events
                    </div>
                  </CardContent>
                </Card>
                <Card className="p-4 text-center">
                  <CardContent className="p-0">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                      1.2k
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                      Members
                    </div>
                  </CardContent>
                </Card>
                {!isMobile && (
                  <>
                    <Card className="p-4 text-center">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-primary">
                          {Object.keys(userRSVPs).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Your RSVPs</div>
                      </CardContent>
                    </Card>
                    <Card className="p-4 text-center">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-primary">23</div>
                        <div className="text-sm text-muted-foreground">Venues</div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </section>
          </section>
        </main>

        {/* Footer content */}
        <footer role="contentinfo" className="footer-content">
        <CollabsMarquee />

        {/* Kolab Diaries Strip */}
        <DiariesStrip />
        </footer>
        <Footer />
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
      
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
      />
    </>
  );
}