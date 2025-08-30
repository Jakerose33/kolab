import { useState } from 'react'
import { format, isAfter, isToday } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LockIcon, HeartIcon, ShareIcon, MapPinIcon, CalendarIcon, ClockIcon, UsersIcon } from 'lucide-react'
import { OptimizedImage } from './OptimizedImage'
import { cn } from '@/lib/utils'

// Event interface based on Supabase schema
interface Event {
  id: string
  title: string
  description?: string | null
  start_at: string
  end_at?: string | null
  venue_name?: string | null
  venue_address?: string | null
  capacity?: number | null
  tags?: string[] | null
  image_url?: string | null
  status: string
  organizer_id?: string
  going?: number
  interested?: number
  profiles?: {
    full_name?: string | null
    handle?: string | null
    avatar_url?: string | null
  }
}

interface PreviewEventCardProps {
  event: Event
  className?: string
  onSignInRequired: () => void
}

export function PreviewEventCard({ 
  event, 
  className, 
  onSignInRequired 
}: PreviewEventCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    onSignInRequired();
  };

  const handleShare = () => {
    onSignInRequired();
  };

  const eventDate = new Date(event.start_at);
  const endDate = event.end_at ? new Date(event.end_at) : null;
  const organizerName = event.profiles?.full_name || "Event Organizer";
  const organizerHandle = event.profiles?.handle || "organizer";
  const isUpcoming = isAfter(new Date(event.start_at), new Date()) || isToday(new Date(event.start_at))

  return (
    <Card className={cn("relative overflow-hidden hover:shadow-lg transition-all duration-300 group", className)}>
      {/* Preview overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-center text-white p-6">
          <LockIcon className="w-8 h-8 mx-auto mb-3" />
          <h4 className="font-semibold text-lg mb-2">Sign in to view details</h4>
          <p className="text-white/80 text-sm mb-4">Join the community to see full event information and RSVP</p>
          <Button 
            onClick={onSignInRequired}
            className="bg-white text-black hover:bg-white/90"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage
          src={event.image_url || '/placeholder.svg'}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Event Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {event.tags?.[0] || "Event"}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
            onClick={handleLike}
          >
            <HeartIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
            onClick={handleShare}
          >
            <ShareIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Past event indicator */}
        {!isUpcoming && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
              Past Event
            </Badge>
          </div>
        )}
      </div>

      {/* Event Content */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              {format(eventDate, "PPP")} at {format(eventDate, "p")}
              {endDate && ` - ${format(endDate, "p")}`}
            </span>
          </div>
          
          {event.venue_name && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">
                {event.venue_name}
                {event.venue_address && `, ${event.venue_address}`}
              </span>
            </div>
          )}
          
          {event.capacity && (
            <div className="flex items-center text-sm text-muted-foreground">
              <UsersIcon className="h-4 w-4 mr-2" />
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={event.profiles?.avatar_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`} 
              alt={organizerName} 
            />
            <AvatarFallback>{organizerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">{organizerName}</span>
              <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">@{organizerHandle}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* RSVP Preview Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-red-500">🔥</span>
            <span className="font-medium">{event.going || 0}</span>
            <span className="text-muted-foreground">Going</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-500">👀</span>
            <span className="font-medium">{event.interested || 0}</span>
            <span className="text-muted-foreground">Interested</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={onSignInRequired}
        >
          Sign in to view full details & RSVP
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PreviewEventCard;