import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users, Heart, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock recommendation data based on user preferences
const mockRecommendations = [
  {
    id: "rec-1",
    title: "Advanced Jazz Improvisation",
    description: "Master jazz improvisation techniques with professional musicians.",
    date: "April 2, 2024",
    time: "7:00 PM",
    location: "Jazz Corner, Melbourne",
    category: "music",
    price: 65,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    organizer: { name: "Jazz Masters", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=32&h=32&fit=crop&crop=face", verified: true },
    reason: "Because you liked Jazz Quartet Night",
    attendees: 25,
    capacity: 30,
    rating: 4.8,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "rec-2",
    title: "Street Photography Walk",
    description: "Capture Melbourne's urban essence through street photography.",
    date: "April 5, 2024",
    time: "2:00 PM",
    location: "Flinders Street, CBD",
    category: "art",
    price: 45,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
    organizer: { name: "Photo Collective", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face", verified: true },
    reason: "Because you bookmarked Portrait Photography Masterclass",
    attendees: 18,
    capacity: 20,
    rating: 4.7,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "rec-3",
    title: "Electronic Music Live Performance",
    description: "Experience cutting-edge electronic music in an intimate venue.",
    date: "April 8, 2024",
    time: "9:00 PM",
    location: "Sub Club, Melbourne",
    category: "music",
    price: 35,
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
    organizer: { name: "Electronic Collective", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face", verified: false },
    reason: "Because you liked Electronic Music Production Workshop",
    attendees: 85,
    capacity: 100,
    rating: 4.6,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "rec-4",
    title: "Contemporary Art Gallery Opening",
    description: "Discover emerging contemporary artists at this exclusive gallery opening.",
    date: "April 12, 2024",
    time: "6:30 PM",
    location: "Modern Gallery, Fitzroy",
    category: "art",
    price: 0,
    image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop",
    organizer: { name: "Modern Gallery", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face", verified: true },
    reason: "Because you attended Modern Sculpture Exhibition Opening",
    attendees: 120,
    capacity: 150,
    rating: 4.9,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "rec-5",
    title: "Collaborative Music Creation",
    description: "Join musicians from different genres for a unique collaboration session.",
    date: "April 15, 2024",
    time: "4:00 PM",
    location: "Music Hub, St Kilda",
    category: "music",
    price: 40,
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop",
    organizer: { name: "Music Collective", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face", verified: true },
    reason: "Because you attended Rock Band Jam Session",
    attendees: 15,
    capacity: 20,
    rating: 4.5,
    isLiked: false,
    isBookmarked: false,
  }
];

interface RecommendationsCarouselProps {
  className?: string;
}

export function RecommendationsCarousel({ className = "" }: RecommendationsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const { toast } = useToast();

  const itemsPerView = 3;
  const maxIndex = Math.max(0, recommendations.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleLike = (eventId: string) => {
    setRecommendations(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isLiked: !event.isLiked }
        : event
    ));
    
    const event = recommendations.find(e => e.id === eventId);
    toast({
      title: event?.isLiked ? "Removed from likes" : "Added to likes",
      description: event?.isLiked 
        ? `Removed "${event.title}" from your likes`
        : `Added "${event?.title}" to your likes`,
    });
  };

  const handleBookmark = (eventId: string) => {
    setRecommendations(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isBookmarked: !event.isBookmarked }
        : event
    ));
    
    const event = recommendations.find(e => e.id === eventId);
    toast({
      title: event?.isBookmarked ? "Removed bookmark" : "Bookmarked",
      description: event?.isBookmarked 
        ? `Removed "${event.title}" from bookmarks`
        : `Bookmarked "${event?.title}" for later`,
    });
  };

  const visibleRecommendations = recommendations.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <p className="text-muted-foreground">
            Personalized suggestions based on your interests
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleRecommendations.map((event) => (
          <Card key={event.id} className="kolab-card overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  {event.reason}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-background/80 hover:bg-background"
                  onClick={() => handleLike(event.id)}
                >
                  <Heart className={`h-4 w-4 ${event.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-background/80 hover:bg-background"
                  onClick={() => handleBookmark(event.id)}
                >
                  <Bookmark className={`h-4 w-4 ${event.isBookmarked ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={event.organizer.avatar} />
                  <AvatarFallback>{event.organizer.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{event.organizer.name}</span>
                {event.organizer.verified && (
                  <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees}/{event.capacity} attending</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="font-bold text-lg">
                  {event.price === 0 ? "Free" : `$${event.price}`}
                </div>
                <Badge variant="outline" className="text-xs">
                  ★ {event.rating}
                </Badge>
              </div>

              <Button className="w-full">
                Join Event
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}