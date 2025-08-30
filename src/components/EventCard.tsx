import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Heart,
  Share2,
  MessageCircle,
  Star,
  UserPlus,
  UserCheck,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { rsvpToEvent } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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

interface EventCardProps {
  event: Event;
  className?: string;
  onShare?: (eventId: string) => void;
  onMessage?: (organizerId: string) => void;
  userRSVP?: 'going' | 'interested' | null;
}

export function EventCard({ 
  event, 
  className, 
  onShare, 
  onMessage,
  userRSVP
}: EventCardProps) {
  const [currentRSVP, setCurrentRSVP] = useState<'going' | 'interested' | null>(userRSVP || null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRSVPLoading, setIsRSVPLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRSVP = async (status: 'going' | 'interested') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to RSVP to events.",
        variant: "destructive",
      });
      return;
    }

    setIsRSVPLoading(true);
    try {
      // If clicking the same status, remove RSVP
      const newStatus = currentRSVP === status ? null : status;
      
      if (newStatus) {
        await rsvpToEvent(event.id, newStatus);
        setCurrentRSVP(newStatus);
        toast({
          title: "RSVP updated!",
          description: `You're now marked as ${newStatus === 'going' ? 'going' : 'interested'}.`,
        });
      } else {
        // Remove RSVP logic would go here
        setCurrentRSVP(null);
        toast({
          title: "RSVP removed",
          description: "Your RSVP has been removed.",
        });
      }
    } catch (error: any) {
      toast({
        title: "RSVP failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRSVPLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from likes" : "Added to likes",
      description: isLiked ? "Event removed from your likes." : "Event added to your likes.",
    });
  };

  const handleShare = () => {
    if (onShare) {
      onShare(event.id);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Event link has been copied to your clipboard.",
      });
    }
  };

  const eventDate = new Date(event.start_at);
  const endDate = event.end_at ? new Date(event.end_at) : null;
  const isUpcoming = eventDate > new Date();
  const organizerName = event.profiles?.full_name || "Event Organizer";
  const organizerHandle = event.profiles?.handle || "organizer";

  return (
    <Link to={`/events/${event.id}`} className="block">
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1",
        className
      )}>
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
            <Heart 
              className={cn(
                "h-4 w-4",
                isLiked ? "fill-primary text-primary" : "text-foreground"
              )} 
            />
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
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-1 ml-3">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium">4.8</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(eventDate, "PPP")} at {format(eventDate, "p")}
              {endDate && ` - ${format(endDate, "p")}`}
            </span>
          </div>
          
          {event.venue_name && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">
                {event.venue_name}
                {event.venue_address && `, ${event.venue_address}`}
              </span>
            </div>
          )}
          
          {event.capacity && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>Capacity: {event.capacity}</span>
              </div>
            </div>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`} alt={organizerName} />
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
          {onMessage && user && user.id !== event.organizer_id && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMessage(event.organizer_id)}
              className="h-7 px-2"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              <span className="text-xs">Message</span>
            </Button>
          )}
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

        {/* Actions */}
        {isUpcoming && (
          <div className="space-y-2">
            {/* RSVP Buttons */}
            <div className="flex gap-2">
              <Button 
                variant={currentRSVP === 'going' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleRSVP('going')}
                disabled={isRSVPLoading}
              >
                {isRSVPLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <>🔥 </>
                )}
                {currentRSVP === 'going' ? 'Going' : 'Going'}
              </Button>
              <Button 
                variant={currentRSVP === 'interested' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleRSVP('interested')}
                disabled={isRSVPLoading}
              >
                {isRSVPLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <>👀 </>
                )}
                {currentRSVP === 'interested' ? 'Interested' : 'Interested'}
              </Button>
            </div>
          </div>
        )}
        
        {!isUpcoming && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">This event has ended</p>
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
}