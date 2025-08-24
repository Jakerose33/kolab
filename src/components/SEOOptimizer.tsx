import { useEffect } from 'react';
import { SEOHead } from './SEOHead';
import { 
  WebsiteJsonLD, 
  OrganizationJsonLD, 
  EventJsonLD, 
  BreadcrumbJsonLD,
  CollectionPageJsonLD 
} from './SEOJsonLD';

interface SEOOptimizerProps {
  page: 'home' | 'events' | 'event-detail' | 'venues' | 'venue-detail' | 'careers' | 'social' | 'profile';
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  eventData?: any;
  venueData?: any;
  collectionData?: {
    name: string;
    description: string;
    items: Array<{ id: string; title: string; url: string; image?: string }>;
  };
}

export function SEOOptimizer({
  page,
  title,
  description,
  image,
  keywords = [],
  breadcrumbs = [],
  eventData,
  venueData,
  collectionData
}: SEOOptimizerProps) {
  
  // Page-specific SEO configurations
  const seoConfigs = {
    home: {
      title: "Kolab - Where Your City Comes Alive | Underground Events & Hidden Venues",
      description: "Your backstage pass to the city's best-kept secrets. Discover underground culture, exclusive events, and hidden venues. Join the collaborative community.",
      keywords: ["underground events", "hidden venues", "secret events", "exclusive parties", "cultural events", "nightlife", "art galleries", "music venues", "creative spaces", "underground culture"],
      type: 'website' as const
    },
    events: {
      title: "Discover Underground Events | Exclusive Parties & Cultural Experiences",
      description: "Find the best underground events, secret parties, and cultural experiences in your city. From intimate music venues to exclusive art galleries.",
      keywords: ["events", "underground events", "secret parties", "music events", "art events", "cultural events", "nightlife", "live music", "art galleries", "creative events"],
      type: 'website' as const
    },
    'event-detail': {
      title: title || "Event Details | Kolab",
      description: description || "Join this exclusive underground event. Get all the details, location, and book your spot.",
      keywords: keywords.length ? keywords : ["event", "underground", "exclusive", "book event", "event details"],
      type: 'event' as const
    },
    venues: {
      title: "Hidden Venues & Secret Spaces | Book Unique Event Locations",
      description: "Discover and book hidden venues, secret spaces, and unique locations for your events. From underground clubs to exclusive galleries.",
      keywords: ["venues", "hidden venues", "secret spaces", "event spaces", "unique venues", "underground clubs", "art galleries", "creative spaces", "venue booking"],
      type: 'website' as const
    },
    'venue-detail': {
      title: title || "Venue Details | Kolab",
      description: description || "Discover this unique venue space. Get details, photos, and book for your next event.",
      keywords: keywords.length ? keywords : ["venue", "event space", "booking", "unique venue"],
      type: 'website' as const
    },
    careers: {
      title: "Creative Careers & Jobs | Join the Underground Culture Movement",
      description: "Find creative careers, freelance opportunities, and jobs in the underground culture scene. Connect with artists, venues, and creative professionals.",
      keywords: ["creative jobs", "culture careers", "freelance", "artist jobs", "venue jobs", "creative opportunities", "cultural sector", "entertainment jobs"],
      type: 'website' as const
    },
    social: {
      title: "Connect with Creatives | Social Hub for Underground Culture",
      description: "Connect with like-minded creatives, artists, and culture enthusiasts. Share experiences, collaborate, and build your network.",
      keywords: ["social network", "creative community", "artist network", "culture community", "creative collaboration", "underground network"],
      type: 'website' as const
    },
    profile: {
      title: title || "Profile | Kolab",
      description: description || "Creative profile showcasing interests, events, and connections in the underground culture scene.",
      keywords: ["profile", "creative profile", "artist profile", "culture enthusiast"],
      type: 'website' as const
    }
  };

  const config = seoConfigs[page];
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Performance optimization - preload critical resources
  useEffect(() => {
    // Preload critical images
    const criticalImages = ['/src/assets/hero-boiler-room.jpg'];
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Add structured data for page performance
    const performanceScript = document.createElement('script');
    performanceScript.type = 'application/ld+json';
    performanceScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": typeof window !== 'undefined' ? window.location.origin : '',
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${typeof window !== 'undefined' ? window.location.origin : ''}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    });
    document.head.appendChild(performanceScript);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript && existingScript === performanceScript) {
        document.head.removeChild(performanceScript);
      }
    };
  }, []);

  return (
    <>
      {/* Core SEO Meta Tags */}
      <SEOHead
        title={config.title}
        description={config.description}
        image={image}
        url={currentUrl}
        type={config.type}
        keywords={config.keywords}
      />

      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && <BreadcrumbJsonLD items={breadcrumbs} />}

      {/* Page-specific structured data */}
      {page === 'home' && (
        <>
          <WebsiteJsonLD 
            name="Kolab"
            url={typeof window !== 'undefined' ? window.location.origin : ''}
            description="Underground culture platform connecting you to exclusive events and hidden venues"
          />
          <OrganizationJsonLD 
            name="Kolab"
            url={typeof window !== 'undefined' ? window.location.origin : ''}
            description="Underground culture platform connecting you to exclusive events and hidden venues"
            sameAs={[]}
          />
        </>
      )}

      {/* Event-specific structured data */}
      {eventData && page === 'event-detail' && (
        <EventJsonLD event={eventData} />
      )}

      {/* Collection pages (events listing, venues listing) */}
      {collectionData && (
        <CollectionPageJsonLD 
          name={collectionData.name}
          description={collectionData.description}
          url={currentUrl}
          events={collectionData.items}
        />
      )}

      {/* Local Business structured data for venues */}
      {venueData && page === 'venue-detail' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Place",
              "name": venueData.name,
              "description": venueData.description,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": venueData.address
              },
              "geo": venueData.latitude && venueData.longitude ? {
                "@type": "GeoCoordinates",
                "latitude": venueData.latitude,
                "longitude": venueData.longitude
              } : undefined,
              "amenityFeature": venueData.amenities?.map((amenity: string) => ({
                "@type": "LocationFeatureSpecification",
                "name": amenity
              })),
              "maximumAttendeeCapacity": venueData.capacity,
              "priceRange": venueData.hourlyRate ? `$${venueData.hourlyRate}/hour` : undefined
            })
          }}
        />
      )}

      {/* FAQ structured data for common pages */}
      {(page === 'home' || page === 'events') && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is Kolab?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kolab is your backstage pass to underground culture, exclusive events, and hidden venues. We connect you to the city's best-kept secrets."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "How do I find events near me?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Use our search and filter tools to discover events by location, category, and date. We feature underground music, art, culture, and nightlife events."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I book venues through Kolab?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Browse our collection of unique venues and hidden spaces. Contact venue owners directly to book your next event."
                  }
                }
              ]
            })
          }}
        />
      )}
    </>
  );
}