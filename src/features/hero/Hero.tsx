import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { resolveImageUrl, logImageFallback } from '@/lib/media';

export default function Hero() {
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const isMountedRef = React.useRef(true);
  
  // Integrate environment variable with resolver for better image handling
  const heroImageUrl = resolveImageUrl(
    import.meta.env.VITE_HERO_IMAGE_URL ?? '/src/assets/hero-boiler-room.jpg'
  );

  // Cleanup on unmount to prevent state updates during navigation
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Get user's approximate location for personalization
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Try to get user's location via IP geolocation (lightweight approach)
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok && isMountedRef.current) {
          const data = await response.json();
          if (isMountedRef.current) {
            setUserLocation(data.city || data.region);
          }
        }
      } catch (error) {
        // Silent fail - location is optional enhancement
        console.debug('Could not fetch user location:', error);
      }
    };

    getUserLocation();
  }, []);

  return (
    <section 
      className="relative isolate overflow-hidden"
      aria-label="Hero section"
      style={{ aspectRatio: '16/9', minHeight: '600px' }}
    >
      <img
        src={heroImageUrl}
        alt="Kolab — discover and book events in your city"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        fetchPriority="high"
        width="1920"
        height="1080"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== '/placeholder.svg') {
            logImageFallback(heroImageUrl, 'hero_image_load_error');
            target.src = '/placeholder.svg';
          }
        }}
        sizes="100vw"
        style={{
          objectPosition: 'center center',
        }}
      />

      {/* Enhanced gradient for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-background/20" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            Discover events. Grow your scene.
          </h1>
          <div className="mt-4 max-w-2xl text-lg md:text-xl text-white/95 drop-shadow-md">
            {userLocation 
              ? `Kolab is your city guide and booking hub for events in ${userLocation} and beyond.`
              : 'Kolab is a city guide and booking hub for locals, venues, and organisers.'
            }
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-black hover:bg-white/90 font-semibold transition-transform hover:scale-105"
            >
              <Link to="/events?when=tonight">
                {userLocation ? `Find events in ${userLocation}` : 'Find events tonight'}
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-white/80 text-white hover:bg-white hover:text-black backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Link to="/auth?mode=organiser">List your event (free)</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
