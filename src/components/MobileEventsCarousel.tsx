import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Heart, Bookmark, Share2 } from 'lucide-react';
import { normalizeEvent } from '@/lib/linking';
import { resolveImageUrl } from '@/lib/media';
import { useToast } from '@/hooks/use-toast';

interface MobileEventsCarouselProps {
  events: any[];
  userRSVPs?: Record<string, string>;
  onShare?: (eventId: string) => void;
  onEventClick?: (event: any) => void;
}

export function MobileEventsCarousel({ 
  events, 
  userRSVPs = {}, 
  onShare, 
  onEventClick 
}: MobileEventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const { toast } = useToast();

  // Create infinite loop by duplicating events
  const infiniteEvents = [...events, ...events, ...events];
  const startOffset = events.length;

  useEffect(() => {
    if (scrollRef.current && !isTransitioning) {
      const cardWidth = scrollRef.current.clientWidth * 0.8;
      const gap = 16;
      const scrollPosition = (startOffset + currentIndex) * (cardWidth + gap);
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, startOffset, isTransitioning]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    setIsTransitioning(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = startXRef.current - currentX;
    
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth * 0.8;
      const gap = 16;
      const baseScrollPosition = (startOffset + currentIndex) * (cardWidth + gap);
      scrollRef.current.scrollTo({
        left: baseScrollPosition + diffX,
        behavior: 'auto'
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startXRef.current - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe left - next event
        setCurrentIndex(prev => (prev + 1) % events.length);
      } else {
        // Swipe right - previous event
        setCurrentIndex(prev => (prev - 1 + events.length) % events.length);
      }
    }

    isDraggingRef.current = false;
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleLike = (event: any) => {
    toast({
      title: "Liked!",
      description: `You liked ${event.title}`,
    });
  };

  const handleBookmark = (event: any) => {
    toast({
      title: "Bookmarked!",
      description: `${event.title} saved to your bookmarks`,
    });
  };

  if (events.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Swipe hint indicator */}
      <div className="flex justify-center mb-2">
        <div className="flex space-x-1">
          {events.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 bg-primary' 
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-hidden scroll-smooth"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {infiniteEvents.map((event, index) => {
          const n = normalizeEvent(event);
          const isCenter = index === startOffset + currentIndex;
          const userRSVP = userRSVPs[event.id];
          
          return (
            <Card 
              key={`${event.id}-${index}`}
              className={`flex-shrink-0 mr-4 transition-all duration-300 ${
                isCenter ? 'w-[80vw] scale-100' : 'w-[75vw] scale-95 opacity-70'
              }`}
              onClick={() => onEventClick?.(event)}
            >
              <div className="relative">
                {n.image ? (
                  <img 
                    src={resolveImageUrl(n.image)} 
                    alt={n.title} 
                    className="h-40 sm:h-48 w-full object-cover rounded-t-lg hover:scale-105 transition-transform duration-300" 
                    width="300"
                    height="192"
                    loading="lazy"
                    sizes="(max-width: 640px) 90vw, 300px"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                      }
                    }}
                  />
                ) : (
                  <div className="h-40 sm:h-48 w-full bg-muted rounded-t-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
                
                {/* Overlapping effect for side cards */}
                {!isCenter && (
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
                )}
                
                {/* Event category badge */}
                {event.tags && event.tags[0] && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
                  >
                    {event.tags[0]}
                  </Badge>
                )}
                
                {/* RSVP status indicator */}
                {userRSVP && (
                  <Badge 
                    variant={userRSVP === 'going' ? 'default' : 'outline'}
                    className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
                  >
                    {userRSVP === 'going' ? 'Going' : 'Interested'}
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                  {n.title}
                </h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {event.start_at && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.start_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  
                  {event.venue_name && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.venue_name}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {Math.floor(Math.random() * 50) + 10} going
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(event);
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(event);
                      }}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare?.(event.id);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Swipe instruction text */}
      <div className="text-center mt-3 text-xs text-muted-foreground">
        Swipe left or right to browse events
      </div>
    </div>
  );
}