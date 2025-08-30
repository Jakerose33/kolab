import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart,
  Share2,
  Lock,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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
  organizer_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    handle: string | null;
  };
}

interface PreviewEventCardProps {
  event: Event;
  className?: string;
  onSignInRequired: () => void;
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

  const handleViewDetails = () => {
    onSignInRequired();
  };

  const eventDate = new Date(event.start_at);
  const endDate = event.end_at ? new Date(event.end_at) : null;
  const isUpcoming = eventDate > new Date();
  const organizerName = event.profiles?.full_name || "Event Organizer";
  const organizerHandle = event.profiles?.handle || "organizer";

  return (
    <Link to={`/events/${event.id}`} className="block">
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1 relative",
        className
      )}>
        {/* Preview overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-center p-6">
          <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-2">Sign in to view details</h3>
          <p className="text-sm text-muted-foreground mb-4">Create an account to see full event information and RSVP</p>
          <Button onClick={onSignInRequired} className="bg-gradient-primary">
            Sign In / Create Account
          </Button>
        </div>
      </div>

      {/* Event Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {event.image_url ? (
          <img 
            src={event.image_url.startsWith('/') ? event.image_url : `/${event.image_url}`} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary/30" />
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {event.tags?.[0] || "Event"}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
            onClick={handleLike}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {!isUpcoming && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
              Past Event
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 text-lg font-semibold">
              {event.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {event.description ? `${event.description.substring(0, 60)}...` : "Event details available after sign in"}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleViewDetails}
            className="ml-3"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Limited Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(eventDate, "PPP")}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">
              {event.venue_address ? 
                `${event.venue_address.split(',').slice(-2).join(',')}` : // Show only city/area
                "Location details available after sign in"
              }
            </span>
          </div>
        </div>

        {/* Organizer - Limited info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`} alt={organizerName} />
            <AvatarFallback>{organizerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <span className="text-sm font-medium">{organizerName}</span>
            <div className="text-xs text-muted-foreground">Event Organizer</div>
          </div>
        </div>

        {/* Tags - Limited */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Sign in for more
            </Badge>
          </div>
        )}

        {/* Call to action */}
        <Button 
          onClick={onSignInRequired}
          className="w-full bg-gradient-primary hover:opacity-90"
          size="sm"
        >
          <Lock className="h-4 w-4 mr-2" />
          Sign In to View Details & RSVP
        </Button>
      </CardContent>
    </Card>
    </Link>
  );
}