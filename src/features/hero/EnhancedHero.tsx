import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import heroDiscoverImage from '@/assets/hero-discover-tram.jpg';
import heroBookImage from '@/assets/hero-book-laptop.jpg';
import heroNightImage from '@/assets/hero-night-crowd.jpg';
import heroAfterglowImage from '@/assets/hero-afterglow-friends.jpg';

interface HeroImage {
  src: string;
  alt: string;
  storyBeat: string;
  headline: string;
  subtext: string;
}

const heroImages: HeroImage[] = [
  { 
    src: heroDiscoverImage, 
    alt: 'Person on a tram discovering local events on their phone at dusk',
    storyBeat: 'Discover',
    headline: 'Find your scene',
    subtext: 'Curated events waiting to be discovered'
  },
  { 
    src: heroBookImage, 
    alt: 'Laptop and phone showing a simple event booking page with a clear call to action',
    storyBeat: 'Book',
    headline: 'Secure your spot',
    subtext: 'Simple booking, no surprises'
  },
  { 
    src: heroNightImage, 
    alt: 'Crowd celebrating at a live event with vibrant lights and confetti',
    storyBeat: 'The Night',
    headline: 'Experience the magic',
    subtext: 'Where memories are made'
  },
  { 
    src: heroAfterglowImage, 
    alt: 'Friends sharing last night\'s event photos with subtle hints of chat and recommendations',
    storyBeat: 'Afterglow',
    headline: 'Share the story',
    subtext: 'Connect and plan your next adventure'
  },
];

const timeBasedMessages = {
  late: {
    headline: "Your city's underground. Unlocked.",
    subtext: "The real scene happens after dark",
    cta: "Discover tonight's scene"
  },
  day: {
    headline: "Where the real scene happens.",
    subtext: "Curated events, hidden venues, authentic experiences",
    cta: "Find what's on tonight"
  },
  weekend: {
    headline: "Discover what others miss.",
    subtext: "Underground culture, warehouse venues, local artists",
    cta: "Explore weekend plans"
  }
};

export default function EnhancedHero() {
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<'late' | 'day' | 'weekend'>('day');
  const isMountedRef = React.useRef(true);

  // Determine time-based messaging
  useEffect(() => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    if (hour >= 22 || hour <= 6) {
      setTimeOfDay('late');
    } else if (day === 5 || day === 6) {
      setTimeOfDay('weekend');
    } else {
      setTimeOfDay('day');
    }
  }, []);

  // Rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Slightly faster to keep narrative moving
    
    return () => clearInterval(interval);
  }, []);

  // Get user location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok && isMountedRef.current) {
          const data = await response.json();
          if (isMountedRef.current) {
            setUserLocation(data.city || data.region);
          }
        }
      } catch (error) {
        console.debug('Could not fetch user location:', error);
      }
    };

    getUserLocation();
  }, []);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentMessage = timeBasedMessages[timeOfDay];
  const currentImage = heroImages[currentImageIndex];
  const showStoryOverlay = currentImageIndex > 0; // Show story overlay for narrative beats

  return (
    <section 
      className="relative isolate overflow-hidden"
      aria-label="Hero section"
      style={{ aspectRatio: '16/9', minHeight: '600px' }}
    >
      {/* Dynamic Background Images */}
      {heroImages.map((image, index) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-2000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "low"}
          width="1920"
          height="1080"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== '/placeholder.svg') {
              target.src = '/placeholder.svg';
            }
          }}
        />
      ))}

      {/* Enhanced Overlay with Vibe */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-4xl">
          {/* Location Badge */}
          {userLocation && (
            <div className="mb-6">
              <Badge 
                variant="outline" 
                className="bg-black/20 text-white border-white/30 backdrop-blur-sm animate-fade-in"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {userLocation}
              </Badge>
            </div>
          )}

          {/* Dynamic Headline - Story or Time-based */}
          <h1 className="kolab-hero-text text-white drop-shadow-2xl mb-6 animate-slide-up">
            {showStoryOverlay ? currentImage.headline : currentMessage.headline}
          </h1>
          
          {/* Enhanced Subtext */}
          <div className="kolab-body-large text-white/95 drop-shadow-lg mb-4 animate-fade-in delay-300">
            {showStoryOverlay ? currentImage.subtext : currentMessage.subtext}
          </div>
          
          {/* Story Beat Indicator */}
          {showStoryOverlay && (
            <div className="mb-4">
              <Badge 
                variant="secondary" 
                className="bg-primary/20 text-white border-primary/30 backdrop-blur-sm animate-fade-in"
              >
                {currentImage.storyBeat}
              </Badge>
            </div>
          )}
          
          {userLocation && (
            <div className="kolab-caption text-white/80 mb-8 animate-fade-in delay-500">
              Underground culture in {userLocation} — no spam, just good events
            </div>
          )}
          
          {/* Enhanced CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-scale-in delay-700">
            <Button 
              asChild 
              size="lg" 
              className="kolab-button-primary group"
            >
              <Link 
                to={timeOfDay === 'late' ? '/events?when=tonight' : '/events'}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {currentMessage.cta}
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-white/50 text-white hover:bg-white hover:text-black backdrop-blur-sm transition-all duration-300 hover:scale-105 group"
            >
              <Link 
                to="/auth?mode=organiser"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                List your event (free)
              </Link>
            </Button>
          </div>

        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-6 right-6 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white shadow-lg scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}