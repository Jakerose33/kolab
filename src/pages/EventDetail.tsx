import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Users, Clock } from "lucide-react"
import EventHeader from "@/features/events/EventHeader"
import EventGallery from "@/features/events/EventGallery"
import EventRSVPBar from "@/features/events/EventRSVPBar"
import { EventJsonLD, BreadcrumbJsonLD } from "@/components/SEOJsonLD"
import { editorialData } from "@/data/editorial"
import BookingCTA from "@/components/booking/BookingCTA"
import { useRequiredParam, PageSkeleton, NotFound, InlineError } from "@/lib/safe"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

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
  }
}

// Helper function to safely access event properties
const getEventProp = (event: any, mockProp: string, dbProp?: string) => {
  return event?.[mockProp] || event?.[dbProp || mockProp] || null
}

export default function EventDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>()
  const navigate = useNavigate()
  const [userRSVP, setUserRSVP] = useState<'going' | 'interested' | null>(null)

  // Get event key from any param source
  const { id, idOrSlug: paramSlug, eventId } = useParams()
  const key = id ?? paramSlug ?? eventId ?? idOrSlug ?? null
  
  // Validate param early
  if (!key || key === 'undefined' || key === 'null') {
    return <NotFound title="Event not found" subtitle="Invalid event identifier." />
  }

  const eventQuery = useQuery({
    queryKey: ['event', key],
    enabled: !!key,
    queryFn: async () => {
      // Try to get from Supabase first with id only (no slug column)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', key)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      if (data) {
        return data
      }
      
      // Fallback to mock data
      const eventData = extendedEventData[key as keyof typeof extendedEventData]
      return eventData || null
    },
  })

  const handleRSVPChange = (status: 'going' | 'interested' | null) => {
    setUserRSVP(status)
  }

  // Early validation handled above

  if (eventQuery.isLoading) {
    return <PageSkeleton />
  }

  if (eventQuery.isError) {
    console.error('[EventDetail] query error:', eventQuery.error)
    return <InlineError message="We couldn't load this event." />
  }

  const event = eventQuery.data
  if (!event) {
    return <NotFound title="Event not found" />
  }

  // Format dates for JSON-LD
  const eventStartDate = new Date()
  eventStartDate.setHours(23, 0, 0, 0) // Set to 11 PM today
  const eventEndDate = new Date(eventStartDate)
  eventEndDate.setHours(eventStartDate.getHours() + 4) // Assume 4-hour events

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Events", url: "/" },
    { name: event.title, url: `/events/${event.id}` }
  ]

  return (
    <>
      {/* SEO JSON-LD structured data */}
      <EventJsonLD 
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: eventStartDate.toISOString(),
          endDate: eventEndDate.toISOString(),
          venue: getEventProp(event, 'venue', 'venue_name') || 'TBD',
          venueAddress: getEventProp(event, 'venueAddress', 'venue_address') || 'TBD',
          image: getEventProp(event, 'image', 'image_url') || '/placeholder.svg',
          ticketUrl: getEventProp(event, 'ticketUrl') || '#',
          organizer: getEventProp(event, 'organizer') || 'Event Organizer',
          capacity: event.capacity || 0,
          tags: event.tags || [],
          going: getEventProp(event, 'going') || 0,
          interested: getEventProp(event, 'interested') || 0
        }}
      />
      <BreadcrumbJsonLD items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
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
              <EventHeader
                title={event.title}
                date={getEventProp(event, 'date') || 'Tonight'}
                time={getEventProp(event, 'time') || '11PM'}
                neighbourhood={getEventProp(event, 'neighbourhood') || 'London'}
                venue={getEventProp(event, 'venue', 'venue_name') || 'TBD'}
                capacity={event.capacity || 0}
                going={getEventProp(event, 'going') || 0}
              />

              {/* Booking CTA */}
              <div className="mt-4">
                <BookingCTA className="w-full md:w-auto" />
              </div>

              {/* Event gallery */}
              <EventGallery
                images={getEventProp(event, 'images') || [getEventProp(event, 'image', 'image_url') || '/placeholder.svg']}
                title={event.title}
              />

              {/* Event details */}
              <div className="prose prose-lg max-w-none">
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {event.description}
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
                          <p className="font-semibold">{getEventProp(event, 'venue', 'venue_name') || 'TBD'}</p>
                          <p className="text-sm text-muted-foreground">{getEventProp(event, 'venueAddress', 'venue_address') || 'Address TBD'}</p>
                        </div>
                      </div>
                      {event.capacity && (
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm">Capacity: {event.capacity} people</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Organizer */}
                  {(getEventProp(event, 'organizer') || getEventProp(event, 'organizer_id')) && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Organizer</h2>
                      <p className="text-muted-foreground">{getEventProp(event, 'organizer') || 'Event Organizer'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile spacing for sticky bar */}
              <div className="h-32 lg:hidden" />
            </div>
          </div>
        </div>

        {/* Sticky RSVP sidebar */}
        <div className="lg:w-80 lg:shrink-0">
          <EventRSVPBar
            eventId={event.id}
            going={getEventProp(event, 'going') || 0}
            interested={getEventProp(event, 'interested') || 0}
            userRSVP={userRSVP}
            ticketUrl={getEventProp(event, 'ticketUrl') || '#'}
            onRSVPChange={handleRSVPChange}
          />
        </div>
      </div>
      </div>
    </>
  )
}