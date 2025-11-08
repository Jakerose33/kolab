import { AppLayout } from "@/components/AppLayout";
import { Helmet } from "react-helmet-async";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateEventWizard } from "@/components/CreateEventWizard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Star, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getVenueLink } from "@/lib/links";

// Mock venue data for fallback
const mockVenues = [
  {
    id: '1',
    name: 'The Underground',
    description: 'An intimate venue in the heart of Shoreditch featuring state-of-the-art sound systems.',
    address: '47 Curtain Road, Shoreditch, London EC2A 3PT',
    capacity: 200,
    hourly_rate: 150,
    tags: ['Music Venue', 'Intimate', 'Sound System'],
    amenities: ['Sound System', 'Bar', 'Stage Lighting'],
    images: ['/images/venues/underground-1.jpg'],
    opening_hours: { mon: '6PM-3AM', fri: '6PM-3AM', sat: '6PM-3AM' },
    status: 'active',
    owner_name: 'Venue Manager',
    owner_handle: 'venue_manager',
    owner_avatar: null
  },
  {
    id: '2',
    name: 'Warehouse 47',
    description: 'Raw industrial space perfect for electronic music events with 20-foot ceilings.',
    address: 'Unit 47, Hackney Wick Industrial Estate, London E9 5JP',
    capacity: 800,
    hourly_rate: 300,
    tags: ['Industrial', 'Electronic', 'Large Space'],
    amenities: ['Industrial Sound System', 'Multiple Bars', 'VIP Area'],
    images: ['/images/venues/warehouse-1.jpg'],
    opening_hours: { fri: '10PM-6AM', sat: '10PM-6AM' },
    status: 'active',
    owner_name: 'Warehouse Owner',
    owner_handle: 'warehouse_owner',
    owner_avatar: null
  }
];

export default function Venues() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { toast } = useToast();

  const venuesQuery = useQuery({
    queryKey: ['venues', 'list'],
    queryFn: async () => {
      try {
        // Try to get from Supabase first
        const { data, error } = await supabase.rpc('get_venues_safe', {
          venue_limit: 50
        });
        
        if (error) throw error;
        return data && data.length > 0 ? data : mockVenues;
      } catch (error) {
        console.warn('Venues RPC failed, using mock data:', error);
        return mockVenues;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  return (
    <>
      {/* SEO and Accessibility Optimization */}
      <Helmet>
        <title>Venue Rentals Melbourne | Book Underground Spaces & Creative Venues | Kolab</title>
        <meta 
          name="description" 
          content="Rent unique venues in Melbourne for events, parties, and creative projects. Industrial warehouses, intimate spaces, and underground venues available for booking." 
        />
        <meta 
          name="keywords" 
          content="venue rental melbourne, event spaces melbourne, warehouse rental melbourne, underground venues melbourne, creative spaces melbourne, party venues melbourne" 
        />
        <link rel="canonical" href="https://ko-lab.com.au/venues" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Venue Rentals Melbourne | Book Underground Spaces & Creative Venues" />
        <meta property="og:description" content="Rent unique venues in Melbourne for events, parties, and creative projects. Industrial warehouses, intimate spaces, and underground venues available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ko-lab.com.au/venues" />
        <meta property="og:image" content="https://ko-lab.com.au/images/og-kolab.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Venue Rentals Melbourne | Book Underground Spaces & Creative Venues" />
        <meta name="twitter:description" content="Rent unique venues in Melbourne for events, parties, and creative projects." />
        <meta name="twitter:image" content="https://ko-lab.com.au/images/og-kolab.jpg" />
        
        {/* Venue-specific structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Kolab Venues",
            "description": "Unique venue rentals and creative spaces in Melbourne",
            "url": "https://ko-lab.com.au/venues",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Melbourne",
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
            {/* Page Header */}
            <header className="text-center space-y-4" role="banner">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Discover Venues
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find unique spaces for your events, from intimate music venues to industrial warehouses
              </p>
            </header>

            {/* Venues Display Section */}
            <section aria-label="Venue listings" className="venues-content" role="main" data-testid="venues-list">
              {venuesQuery.isLoading ? (
                <LoadingState />
              ) : venuesQuery.isError ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">We couldn't load venues right now.</p>
                  <Button onClick={() => venuesQuery.refetch()}>Try Again</Button>
                </div>
              ) : (
                <>
                  {venuesQuery.data && venuesQuery.data.length > 0 ? (
                    <div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      role="grid"
                      aria-label={`${venuesQuery.data.length} venues found`}
                    >
                      {venuesQuery.data.map((venue: any) => {
                        if (!venue?.id) return null;
                        
                        const venueLink = getVenueLink(venue);
                        const cardElement = (
                          <Card className="h-full hover:shadow-lg transition-shadow" data-testid="venue-card">
                            <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                              <img 
                                src={venue.images?.[0] || '/placeholder.svg'} 
                                alt={venue.name || 'Venue'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width="400"
                                height="225"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (target.src !== '/placeholder.svg') {
                                    target.src = '/placeholder.svg';
                                  }
                                }}
                              />
                            </div>
                            <CardHeader>
                              <CardTitle className="flex items-start justify-between">
                                <span>{venue.name || 'Venue'}</span>
                                <Badge variant="secondary">
                                  £{venue.hourly_rate || 0}/hr
                                </Badge>
                              </CardTitle>
                              <CardDescription className="line-clamp-2">
                                {venue.description || 'No description available'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate">{venue.address || 'Address not available'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  <span>Capacity: {venue.capacity || 0}</span>
                                </div>
                                {venue.tags && venue.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {venue.tags.slice(0, 3).map((tag: string, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );

                        return venueLink ? (
                          <Link key={venue.id} to={venueLink} className="block">
                            {cardElement}
                          </Link>
                        ) : (
                          <div key={venue.id}>
                            {cardElement}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={MapPin}
                      title="No venues found"
                      description="Check back later for new venue listings."
                    />
                  )}
                </>
              )}
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