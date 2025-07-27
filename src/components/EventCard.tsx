import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart,
  Share2,
  MessageCircle,
  Star,
  ImageOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    capacity: number;
    attendees: number;
    price?: number;
    image: string;
    organizer: {
      name: string;
      avatar: string;
      verified: boolean;
    };
    tags: string[];
    rating?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  className?: string;
  onBookEvent: (eventId: string) => void;
  onLikeEvent: (eventId: string) => void;
  onShareEvent: (eventId: string) => void;
}

export function EventCard({ 
  event, 
  className, 
  onBookEvent, 
  onLikeEvent, 
  onShareEvent 
}: EventCardProps) {
  const spotsLeft = event.capacity - event.attendees;
  const isAlmostFull = spotsLeft <= 5;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&crop=center";

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1",
      className
    )}>
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {!imageLoaded && !imageError && (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <ImageOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <span className="text-sm text-muted-foreground">Image not available</span>
            </div>
          </div>
        ) : (
          <img 
            src={imageError ? fallbackImage : event.image} 
            alt={event.title}
            loading="lazy"
            className={cn(
              "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (!imageError) {
                setImageError(true);
                setImageLoaded(true);
              }
            }}
          />
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
            onClick={() => onLikeEvent(event.id)}
          >
            <Heart 
              className={cn(
                "h-4 w-4",
                event.isLiked ? "fill-primary text-primary" : "text-foreground"
              )} 
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
            onClick={() => onShareEvent(event.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        {event.price && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-primary">
              ${event.price}
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
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>
          {event.rating && (
            <div className="flex items-center space-x-1 ml-3">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{event.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.attendees}/{event.capacity} attending</span>
            </div>
            {isAlmostFull && (
              <Badge variant="destructive" className="text-xs">
                Only {spotsLeft} left!
              </Badge>
            )}
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
            <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">{event.organizer.name}</span>
              {event.organizer.verified && (
                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Event Organizer</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
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
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-gradient-primary hover:opacity-90"
            onClick={() => onBookEvent(event.id)}
          >
            Join Event
          </Button>
          <Button variant="outline" size="sm" className="px-3">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}