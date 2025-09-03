import { useState, useEffect } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UnifiedImage } from "@/components/UnifiedImage"
import { Flame, Eye, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getEvents } from "@/lib/supabase"
import { getEventLink } from "@/lib/entities"

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  capacity: number | null;
  tags: string[] | null;
  image_url: string | null;
  status: string;
}

interface EditorialGridProps {
  className?: string
}

const EventCard = ({ event }: { event: Event }) => {
  const eventDate = new Date(event.start_at);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  
  const link = getEventLink(event);
  const content = (
    <Card className="kolab-card group cursor-pointer overflow-hidden border-0 hover:scale-[1.02]">
        <div className="aspect-[4/5] relative overflow-hidden">
          <UnifiedImage
            src={event.image_url?.startsWith('/') ? event.image_url : `/${event.image_url}`}
            alt={event.title}
            aspectRatio="4/5"
            className="transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Event details overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <span className="text-white/80">
                {isToday ? 'Tonight' : eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-white/60">•</span>
              <span className="text-white/80">
                {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
            <h3 className="kolab-heading-small text-white mb-1 line-clamp-2">{event.title}</h3>
            <p className="text-white/70 text-sm mb-3">{event.venue_address?.split(',')[1]?.trim()}</p>
            
            {/* RSVP chips with micro-interactions */}
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 micro-bounce cursor-pointer">
                <Flame className="w-3 h-3 mr-1" />
                {Math.floor(Math.random() * 200) + 50} Going
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 micro-bounce cursor-pointer">
                <Eye className="w-3 h-3 mr-1" />
                {Math.floor(Math.random() * 150) + 30} Interested
              </Badge>
            </div>
          </div>
        </div>
      </Card>
  );

  return link 
    ? <div onClick={() => window.location.href = link} className="block cursor-pointer">{content}</div>
    : <div className="block opacity-60 pointer-events-none" aria-disabled="true">
        {content}
      </div>;
}


export default function EditorialGrid({ className }: EditorialGridProps) {
  const [activeTab, setActiveTab] = useState<'tonight' | 'week'>('tonight')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await getEvents({ limit: 10 })
        if (error) {
          console.error('Error fetching events:', error)
        } else {
          setEvents(data || [])
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [])
  
  const tonightEvents = events.filter(event => {
    const eventDate = new Date(event.start_at)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  })
  
  const weekEvents = events.slice(0, 6)

  const displayEvents = activeTab === 'tonight' ? tonightEvents : weekEvents

  if (loading) {
    return (
      <section className={cn("py-16 bg-background", className)}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={cn("py-16 bg-background editorial-section scroll-fade-up", className)}>
      <div className="container mx-auto px-4 container-responsive">
        {/* Section header with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="mb-6 sm:mb-0">
            <p className="kolab-accent-text mb-4">What's happening</p>
            <div className="flex gap-1 mb-4">
              <Button
                variant={activeTab === 'tonight' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('tonight')}
                className="kolab-heading-large h-auto p-0 bg-transparent hover:bg-transparent text-foreground hover:text-primary transition-colors duration-300 micro-spring"
              >
                Tonight
              </Button>
              <span className="kolab-heading-large text-muted-foreground mx-2">/</span>
              <Button
                variant={activeTab === 'week' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('week')}
                className="kolab-heading-large h-auto p-0 bg-transparent hover:bg-transparent text-foreground hover:text-primary transition-colors duration-300 micro-spring"
              >
                This week
              </Button>
            </div>
          </div>
          
          <Button variant="outline" className="kolab-button-ghost self-start sm:self-center group border-border/40 hover:border-primary/40 micro-spring">
            <span className="kolab-caption">View all</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>

        {/* Grid with container queries */}
        <div className="grid-responsive gap-6 lg:gap-8 events-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}