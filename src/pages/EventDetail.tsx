import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Users, Clock } from "lucide-react"
import EventHeader from "@/features/events/EventHeader"
import EventGallery from "@/features/events/EventGallery"
import EventRSVPBar from "@/features/events/EventRSVPBar"
import { EventJsonLD, BreadcrumbJsonLD } from "@/components/SEOJsonLD"
import { editorialData } from "@/data/editorial"
import BookingCTA from "@/components/booking/BookingCTA"
import { useRouteId } from "@/utils/routing"
import { PageSkeleton, NotFound, InlineError } from "@/components/common/ErrorBits"
import { useEvent } from "@/hooks/useEventsData"
import { normalizeEventData } from "@/utils/eventHelpers"
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary"
import { useNavigate } from "react-router-dom"

// Extended event data for detail view
const extendedEventData = {
  '1': {
    ...editorialData.find(e => e.id === '1'),
    venue: 'The Underground',
    venueAddress: '47 Curtain Road, Shoreditch, London EC2A 3PT',
    capacity: 200,
    description: `An intimate evening of jazz in the heart of Shoreditch's underground scene. Experience the raw energy of live improvisation in a space where music legends have performed for decades.

The Underground has been London's premier jazz venue since 1987, hosting everyone from rising stars to international legends. Tonight, we present a carefully curated lineup that represents the best of contemporary jazz fusion.

The venue features a state-of-the-art sound system designed specifically for acoustic performances, ensuring every note resonates with crystal clarity. The intimate setting means you'll be close enough to see the passion in the musicians' eyes.

Entry includes complimentary welcome drink and access to our late-night bar menu featuring small plates designed to complement the evening's musical journey.`,
    lineup: [
      'Marcus Thompson Trio - 11:00 PM',
      'Sarah Chen Quartet - 12:30 AM', 
      'Late Night Jam Session - 2:00 AM'
    ],
    images: [
      '/images/events/jazz-underground-1.jpg',
      '/images/events/jazz-underground-2.jpg',
      '/images/events/jazz-underground-3.jpg'
    ],
    ticketUrl: 'https://example.com/tickets/jazz-underground',
    organizer: 'London Jazz Collective',
    tags: ['Jazz', 'Live Music', 'Underground', 'Intimate']
  },
  '2': {
    ...editorialData.find(e => e.id === '2'),
    venue: 'Warehouse 47',
    venueAddress: 'Unit 47, Hackney Wick Industrial Estate, London E9 5JP',
    capacity: 800,
    description: `Industrial sounds meet cutting-edge production in this raw warehouse space. Experience electronic music as it was meant to be heard - loud, uncompromising, and transformative.

This abandoned textile factory has been transformed into East London's most sought-after underground venue. The cavernous space, with its 20-foot ceilings and concrete floors, provides the perfect acoustic environment for electronic music.

Tonight's lineup features pioneers of the industrial techno scene alongside emerging artists pushing the boundaries of electronic sound. The custom-built sound system delivers bone-rattling bass frequencies that you'll feel in your chest.

No phones policy in effect - this is about losing yourself in the music and connecting with the collective energy of the crowd.`,
    lineup: [
      'NRVS - 10:00 PM',
      'Industrial Frequency - 11:30 PM',
      'Concrete Dreams - 1:00 AM',
      'B2B Closing Set - 3:00 AM'
    ],
    images: [
      '/images/events/warehouse-rave-1.jpg',
      '/images/events/warehouse-rave-2.jpg',
      '/images/events/warehouse-rave-3.jpg',
      '/images/events/warehouse-rave-4.jpg'
    ],
    ticketUrl: 'https://example.com/tickets/warehouse-rave',
    organizer: 'Underground Collective',
    tags: ['Techno', 'Industrial', 'Warehouse', 'Underground']
  },
  // Add the actual Supabase UUIDs for fallback
  '256ec2c0-5194-4d5d-8362-cbcaf0163994': {
    id: '256ec2c0-5194-4d5d-8362-cbcaf0163994',
    title: 'Underground Jazz Night',
    description: 'Intimate jazz session in a hidden basement venue',
    venue: 'Secret Basement',
    venueAddress: 'Downtown District, London',
    capacity: 150,
    lineup: [
      'Jazz Ensemble - 9:00 PM',
      'Solo Piano - 10:30 PM',
      'Late Night Jam - 12:00 AM'
    ],
    images: ['/images/events/midnight-jazz.jpg'],
    ticketUrl: '#',
    organizer: 'Underground Music Collective',
    tags: ['Jazz', 'Live Music', 'Underground', 'Intimate']
  },
  'a226d064-cddc-4735-8b2c-1c1f79bb2d47': {
    id: 'a226d064-cddc-4735-8b2c-1c1f79bb2d47',
    title: 'Warehouse Rave',
    description: 'Electronic music and visual arts in an industrial space',
    venue: 'Warehouse District',
    venueAddress: 'Industrial Zone, London',
    capacity: 500,
    lineup: [
      'Electronic Artist 1 - 10:00 PM',
      'Visual Arts Performance - 11:30 PM',
      'Main DJ Set - 1:00 AM'
    ],
    images: ['/images/events/warehouse-rave.jpg'],
    ticketUrl: '#',
    organizer: 'Warehouse Collective',
    tags: ['Electronic', 'Industrial', 'Warehouse', 'Underground']
  },
  'cadc3a4b-9882-4e10-87ba-5d3a6ece6ad5': {
    id: 'cadc3a4b-9882-4e10-87ba-5d3a6ece6ad5',
    title: 'Street Art Opening',
    description: 'Gallery opening featuring underground street artists',
    venue: 'Underground Gallery',
    venueAddress: 'Arts District, London',
    capacity: 200,
    lineup: [
      'Gallery Opening - 7:00 PM',
      'Artist Talks - 8:30 PM',
      'Closing Reception - 10:00 PM'
    ],
    images: ['/images/events/street-art-opening.jpg'],
    ticketUrl: '#',
    organizer: 'Street Art Collective',
    tags: ['Art', 'Gallery', 'Street Art', 'Opening']
  }
}

// Helper function to safely access event properties
const getEventProp = (event: any, mockProp: string, dbProp?: string) => {
  return event?.[mockProp] || event?.[dbProp || mockProp] || null
}

export default function EventDetail() {
  const [userRSVP, setUserRSVP] = useState<'going' | 'interested' | null>(null)
  const navigate = useNavigate()
  
  // Use safe route param extraction
  const eventId = useRouteId('idOrSlug')
  
  // Early return for invalid IDs - redirect to events list
  if (!eventId) {
    navigate('/events', { replace: true })
    return null
  }

  // Use canonical event data hook
  const { data: event, isLoading, error } = useEvent(eventId);

  // Safe rendering with proper loading states
  if (isLoading) {
    return <PageSkeleton />
  }

  if (error) {
    console.error('[EventDetail] query error:', error)
    return <InlineError message="We couldn't load this event. Please try again." />
  }

  if (!event) {
    return <NotFound title="Event not found" subtitle="This event may have been removed or doesn't exist." />
  }

  // Normalize the event data for consistent access
  const normalizedEvent = normalizeEventData(event);

  const handleRSVPChange = (status: 'going' | 'interested' | null) => {
    setUserRSVP(status)
  }

  // Format dates for JSON-LD with safe fallbacks
  const eventStartDate = normalizedEvent?.start_at ? new Date(normalizedEvent.start_at) : new Date()
  const eventEndDate = normalizedEvent?.end_at ? new Date(normalizedEvent.end_at) : new Date(eventStartDate.getTime() + 4 * 60 * 60 * 1000)

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Events", url: "/events" },
    { name: normalizedEvent?.title || 'Event', url: `/events/${normalizedEvent?.id || eventId}` }
  ]

  return (
    <SafeErrorBoundary>
      <div>
        {/* SEO JSON-LD structured data */}
        <EventJsonLD
        event={{
          id: normalizedEvent?.id || eventId,
          title: normalizedEvent?.title || 'Event',
          description: normalizedEvent?.description || '',
          startDate: eventStartDate.toISOString(),
          endDate: eventEndDate.toISOString(),
          venue: normalizedEvent?.venue_name || 'TBD',
          venueAddress: normalizedEvent?.venue_address || 'TBD',
          image: normalizedEvent?.image_url || '/placeholder.svg',
          ticketUrl: normalizedEvent?.ticket_url || '#',
          organizer: normalizedEvent?.organizer_name || 'Event Organizer',
          capacity: normalizedEvent?.capacity || 0,
          tags: normalizedEvent?.tags || [],
          going: 0, // Would come from RSVP data
          interested: 0 // Would come from RSVP data
        }}
      />
      <BreadcrumbJsonLD items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
        {/* Back button */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Events
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:flex lg:gap-8 lg:max-w-7xl lg:mx-auto">
          {/* Content area */}
          <div className="flex-1 lg:pr-8">
            <div className="container mx-auto px-4 py-8 lg:px-0">
              <div className="space-y-12">
                {/* Event header */}
                <SafeErrorBoundary inline>
                  <EventHeader
                    title={normalizedEvent?.title || 'Event'}
                    date={normalizedEvent?.start_at ? new Date(normalizedEvent.start_at).toLocaleDateString() : 'TBD'}
                    time={normalizedEvent?.start_at ? new Date(normalizedEvent.start_at).toLocaleTimeString() : 'TBD'}
                    neighbourhood={normalizedEvent?.city || 'Location TBD'}
                    venue={normalizedEvent?.venue_name || 'Venue TBD'}
                    capacity={normalizedEvent?.capacity || 0}
                    going={0} // Would come from RSVP data
                  />
                </SafeErrorBoundary>

                {/* Booking CTA */}
                <div className="mt-4">
                  <BookingCTA eventId={eventId} className="w-full md:w-auto" />
                </div>

                {/* Event gallery */}
                <SafeErrorBoundary inline>
                  <EventGallery
                    images={normalizedEvent?.image_url ? [normalizedEvent.image_url] : ['/placeholder.svg']}
                    title={normalizedEvent?.title || 'Event'}
                  />
                </SafeErrorBoundary>

                {/* Event details */}
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8">
                    {/* Description */}
                    <div>
                      <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {normalizedEvent?.description || 'No description available for this event.'}
                      </div>
                    </div>

                    {/* Lineup */}
                    {getEventProp(event, 'lineup') && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Lineup</h2>
                        <div className="space-y-2">
                          {getEventProp(event, 'lineup').map((item: string, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Venue information */}
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Venue</h2>
                      <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{normalizedEvent?.venue_name || 'Venue TBD'}</p>
                            <p className="text-sm text-muted-foreground">{normalizedEvent?.venue_address || 'Address TBD'}</p>
                          </div>
                        </div>
                        {normalizedEvent?.capacity && (
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm">Capacity: {normalizedEvent.capacity} people</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Organizer */}
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Organizer</h2>
                      <p className="text-muted-foreground">{normalizedEvent?.organizer_name || 'Event Organizer'}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile spacing for sticky bar */}
                <div className="h-32 lg:hidden" />
              </div>
            </div>
          </div>

          {/* Sticky RSVP sidebar */}
          <div className="lg:w-80 lg:shrink-0">
            <SafeErrorBoundary inline>
              <EventRSVPBar
                eventId={normalizedEvent?.id || eventId}
                going={0} // Would come from RSVP data
                interested={0} // Would come from RSVP data
                userRSVP={userRSVP}
                ticketUrl={normalizedEvent?.ticket_url || '#'}
                onRSVPChange={handleRSVPChange}
              />
            </SafeErrorBoundary>
          </div>
        </div>
      </div>
      </div>
    </SafeErrorBoundary>
  )
}