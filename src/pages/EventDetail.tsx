import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import EventHeader from "@/features/events/EventHeader"
import EventGallery from "@/features/events/EventGallery"
import EventRSVPBar from "@/features/events/EventRSVPBar"
import { LoadingState } from "@/components/LoadingState"
import { EventJsonLD, BreadcrumbJsonLD } from "@/components/SEOJsonLD"
import { editorialData } from "@/data/editorial"
import BookingCTA from "@/components/booking/BookingCTA"

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

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRSVP, setUserRSVP] = useState<'going' | 'interested' | null>(null)

  useEffect(() => {
    if (!id) {
      navigate('/')
      return
    }

    // Simulate API call
    setTimeout(() => {
      const eventData = extendedEventData[id as keyof typeof extendedEventData]
      if (eventData) {
        setEvent(eventData)
      }
      setLoading(false)
    }, 500)
  }, [id, navigate])

  const handleRSVPChange = (status: 'going' | 'interested' | null) => {
    setUserRSVP(status)
  }

  if (loading) {
    return <LoadingState />
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    )
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
          venue: event.venue,
          venueAddress: event.venueAddress,
          image: event.image,
          ticketUrl: event.ticketUrl,
          organizer: event.organizer,
          capacity: event.capacity,
          tags: event.tags,
          going: event.going,
          interested: event.interested
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
                date={event.date || 'Tonight'}
                time={event.time || '11PM'}
                neighbourhood={event.neighbourhood || 'London'}
                venue={event.venue}
                capacity={event.capacity}
                going={event.going}
              />

              {/* Booking CTA */}
              <div className="mt-4">
                <BookingCTA className="w-full md:w-auto" />
              </div>

              {/* Event gallery */}
              <EventGallery
                images={event.images || [event.image]}
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
                  {event.lineup && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Lineup</h2>
                      <div className="space-y-2">
                        {event.lineup.map((item: string, index: number) => (
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
                          <p className="font-semibold">{event.venue}</p>
                          <p className="text-sm text-muted-foreground">{event.venueAddress}</p>
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
                  {event.organizer && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Organizer</h2>
                      <p className="text-muted-foreground">{event.organizer}</p>
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
            going={event.going || 0}
            interested={event.interested || 0}
            userRSVP={userRSVP}
            ticketUrl={event.ticketUrl}
            onRSVPChange={handleRSVPChange}
          />
        </div>
      </div>
      </div>
    </>
  )
}