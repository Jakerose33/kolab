import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import { MapPin, Calendar, Clock, Users, Heart, Share2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveEventCardProps {
  event: any;
  onRSVP?: (eventId: string, status: string) => void;
  onShare?: (eventId: string) => void;
  userRSVP?: string;
  className?: string;
}

export function ResponsiveEventCard({ 
  event, 
  onRSVP, 
  onShare, 
  userRSVP, 
  className 
}: ResponsiveEventCardProps) {
  const isMobile = useIsMobile();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isMobile) {
    return (
      <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in", className)}>
        <CardContent className="p-0">
          <div className="flex">
            {/* Compact Image */}
            <div className="w-24 h-24 flex-shrink-0 relative">
              <OptimizedImage
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              
              {/* Date Badge */}
              <div className="absolute top-1 left-1">
                <div className="bg-white/90 backdrop-blur-sm rounded px-1 py-0.5 text-[10px] font-medium">
                  {new Date(event.start_at).getDate()}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                  {event.title}
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 ml-2">
                  <Heart className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.start_at)} • {formatTime(event.start_at)}</span>
                </div>
                
                {event.venue_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.venue_name}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex gap-1 mb-2">
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {event.tags[0]}
                  </Badge>
                </div>
              )}

              {/* RSVP Button */}
              <Button 
                size="sm" 
                className="h-6 px-2 text-xs w-full"
                onClick={() => onRSVP?.(event.id, userRSVP === 'going' ? 'not_going' : 'going')}
              >
                {userRSVP === 'going' ? 'Going' : 'RSVP'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop version
  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in", className)}>
      <CardContent className="p-0">
        {/* Event Image */}
        <div className="relative">
          <OptimizedImage
            src={event.image_url || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          
          {/* Date Badge */}
          <div className="absolute top-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium">
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase">
                  {formatDate(event.start_at)}
                </div>
                <div className="text-sm font-bold">
                  {new Date(event.start_at).getDate()}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={() => onShare?.(event.id)}
            >
              <Share2 className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Heart className="h-3 w-3" />
            </Button>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="text-xs">
                {event.tags[0]}
              </Badge>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {event.title}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(event.start_at)} at {formatTime(event.start_at)}
            </span>
          </div>

          {/* Location */}
          {event.venue_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1 h-9 text-sm hover-scale"
              onClick={() => onRSVP?.(event.id, userRSVP === 'going' ? 'not_going' : 'going')}
            >
              {userRSVP === 'going' ? 'Cancel RSVP' : 'RSVP'}
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 hover-scale">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}