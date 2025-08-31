import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, Star, Clock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { AuthDialog } from "@/components/AuthDialog";
import BookingCTA from "@/components/booking/BookingCTA";
import { useRequiredParam, PageSkeleton, NotFound, InlineError } from "@/lib/safe";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mock venue data
const mockVenues = {
  '1': {
    id: '1',
    name: 'The Underground',
    description: 'An intimate venue in the heart of Shoreditch featuring state-of-the-art sound systems and a rich musical history.',
    address: '47 Curtain Road, Shoreditch, London EC2A 3PT',
    capacity: 200,
    rating: 4.8,
    images: ['/images/venues/underground-1.jpg', '/images/venues/underground-2.jpg'],
    amenities: ['Sound System', 'Bar', 'Stage Lighting', 'Green Room'],
    hours: 'Mon-Sun: 6PM - 3AM',
    contact: 'bookings@theunderground.com'
  },
  '2': {
    id: '2',
    name: 'Warehouse 47',
    description: 'Raw industrial space perfect for electronic music events with 20-foot ceilings and concrete acoustics.',
    address: 'Unit 47, Hackney Wick Industrial Estate, London E9 5JP',
    capacity: 800,
    rating: 4.6,
    images: ['/images/venues/warehouse-1.jpg', '/images/venues/warehouse-2.jpg'],
    amenities: ['Industrial Sound System', 'Multiple Bars', 'VIP Area', 'Coat Check'],
    hours: 'Fri-Sat: 10PM - 6AM',
    contact: 'events@warehouse47.com'
  }
};

// Helper function to safely access venue properties
const getVenueProp = (venue: any, mockProp: string, dbProp?: string) => {
  return venue?.[mockProp] || venue?.[dbProp || mockProp] || null
}

export default function VenueDetail() {
  const { value: id } = useRequiredParam('id');
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);

  const venueQuery = useQuery({
    queryKey: ['venue', id],
    enabled: !!id,
    queryFn: async () => {
      // Try to get from Supabase first, fallback to mock data
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      if (data) {
        return data
      }
      
      // Fallback to mock data
      const venueData = mockVenues[id as keyof typeof mockVenues];
      return venueData || null
    },
  });

  if (!id) {
    return (
      <AppLayout onOpenNotifications={() => setShowNotificationsDialog(true)} onOpenAuth={() => setShowAuth(true)}>
        <main className="container px-4 py-8">
          <NotFound title="Venue not found" subtitle="Missing venue ID." />
        </main>
      </AppLayout>
    );
  }

  if (venueQuery.isLoading) {
    return (
      <AppLayout onOpenNotifications={() => setShowNotificationsDialog(true)} onOpenAuth={() => setShowAuth(true)}>
        <main className="container px-4 py-8">
          <PageSkeleton />
        </main>
      </AppLayout>
    );
  }

  if (venueQuery.isError) {
    console.error('[VenueDetail] query error:', venueQuery.error)
    return (
      <AppLayout onOpenNotifications={() => setShowNotificationsDialog(true)} onOpenAuth={() => setShowAuth(true)}>
        <main className="container px-4 py-8">
          <InlineError message="We couldn't load this venue." />
        </main>
      </AppLayout>
    );
  }

  const venue = venueQuery.data
  if (!venue) {
    return (
      <AppLayout onOpenNotifications={() => setShowNotificationsDialog(true)} onOpenAuth={() => setShowAuth(true)}>
        <main className="container px-4 py-8">
          <NotFound title="Venue not found" />
        </main>
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout 
        onOpenNotifications={() => setShowNotificationsDialog(true)}
        onOpenAuth={() => setShowAuth(true)}
      >
        <main className="container px-4 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/venues'}
              className="group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Venues
            </Button>
          </div>

          <div className="space-y-8">
            {/* Venue Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venue.address}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Capacity: {venue.capacity}
                </div>
                {getVenueProp(venue, 'rating') && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {getVenueProp(venue, 'rating')}
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{venue.description}</p>
            </div>

            {/* Booking CTA */}
            <div>
              <BookingCTA className="w-full md:w-auto" />
            </div>

            {/* Venue Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(getVenueProp(venue, 'images') || ['/placeholder.svg']).map((image: string, index: number) => (
                <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${venue.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Venue Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="space-y-2">
                  {(getVenueProp(venue, 'amenities') || []).map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Details</h2>
                <div className="space-y-3">
                  {getVenueProp(venue, 'hours', 'opening_hours') && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getVenueProp(venue, 'hours', 'opening_hours')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Max Capacity: {venue.capacity} people</span>
                  </div>
                  {getVenueProp(venue, 'contact', 'contact_email') && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact:</p>
                      <p>{getVenueProp(venue, 'contact', 'contact_email')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </AppLayout>
      
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