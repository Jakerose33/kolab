import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Zap } from 'lucide-react';

interface HeroImage {
  src: string;
  alt: string;
}

const heroImages: HeroImage[] = [
  { src: '/images/hero-boiler-room.jpg', alt: 'Underground warehouse event' },
  { src: '/images/events/warehouse-rave.jpg', alt: 'Warehouse rave atmosphere' },
  { src: '/images/events/midnight-jazz.jpg', alt: 'Late night jazz session' },
  { src: '/images/events/street-art-opening.jpg', alt: 'Street art gallery opening' },
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
  const [liveActivity, setLiveActivity] = useState(Math.floor(Math.random() * 50) + 20);
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
    }, 8000);
    
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

  // Simulate live activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivity(prev => Math.max(10, prev + Math.floor(Math.random() * 3) - 1));
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentMessage = timeBasedMessages[timeOfDay];
  const currentImage = heroImages[currentImageIndex];

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
          {/* Activity Indicator */}
          <div className="mb-6 flex items-center gap-4">
            <Badge 
              variant="secondary" 
              className="bg-white/10 text-white border-white/20 backdrop-blur-sm animate-fade-in"
            >
              <Zap className="w-3 h-3 mr-1 text-yellow-400" />
              {liveActivity} locals active now
            </Badge>
            
            {userLocation && (
              <Badge 
                variant="outline" 
                className="bg-black/20 text-white border-white/30 backdrop-blur-sm"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {userLocation}
              </Badge>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="kolab-hero-text text-white drop-shadow-2xl mb-6 animate-slide-up">
            {currentMessage.headline}
          </h1>
          
          {/* Enhanced Subtext */}
          <div className="kolab-body-large text-white/95 drop-shadow-lg mb-4 animate-fade-in delay-300">
            {currentMessage.subtext}
          </div>
          
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

          {/* Quick Discovery Widget */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-lg animate-fade-in delay-1000">
            <div className="kolab-caption text-white/70 mb-3 uppercase tracking-wider">
              Quick Discovery
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Link 
                to="/events?when=tonight"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-white text-sm font-medium group-hover:text-yellow-400 transition-colors">
                  Tonight
                </div>
              </Link>
              <Link 
                to="/events?when=weekend"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">
                  Weekend
                </div>
              </Link>
              <Link 
                to="/venues"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-center transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">
                  Venues
                </div>
              </Link>
            </div>
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