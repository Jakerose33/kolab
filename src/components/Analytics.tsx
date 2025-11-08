import { useEffect } from 'react';

export function Analytics() {
  useEffect(() => {
    // Google Analytics 4 (GA4) setup
    const initGA4 = () => {
      // In production, replace with your actual GA4 measurement ID
      const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
      
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // Initialize gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        // Enhanced ecommerce and event tracking
        enhanced_ecommerce: true,
        send_page_view: true,
        // Privacy-focused settings
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });

      // Custom events for Kolab
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        content_group1: 'Underground Events',
        content_group2: 'Culture Platform'
      });
    };

    // Initialize search console verification
    const addSearchConsoleVerification = () => {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = 'your-google-search-console-verification-code';
      document.head.appendChild(meta);
    };

    // Track user engagement
    const trackEngagement = () => {
      let engagementTime = 0;
      const startTime = Date.now();

      // Track scroll depth
      let maxScroll = 0;
      const trackScrollDepth = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          // Track milestone scroll depths
          if ([25, 50, 75, 90].includes(scrollPercent)) {
            if ((window as any).gtag) {
              (window as any).gtag('event', 'scroll', {
                event_category: 'engagement',
                event_label: `${scrollPercent}%`,
                value: scrollPercent
              });
            }
          }
        }
      };

      // Track time on page
      const trackTimeOnPage = () => {
        engagementTime = Math.round((Date.now() - startTime) / 1000);
        
        // Send engagement events at intervals
        if ([15, 30, 60, 120, 300].includes(engagementTime)) {
          if ((window as any).gtag) {
            (window as any).gtag('event', 'engagement_time', {
              event_category: 'engagement',
              event_label: `${engagementTime}s`,
              value: engagementTime
            });
          }
        }
      };

      // Event listeners
      window.addEventListener('scroll', trackScrollDepth);
      const timeInterval = setInterval(trackTimeOnPage, 1000);

      // Cleanup
      return () => {
        window.removeEventListener('scroll', trackScrollDepth);
        clearInterval(timeInterval);
      };
    };

    // Custom event tracking for Kolab features
    const trackKolabEvents = () => {
      // Track event views
      (window as any).trackEventView = (eventId: string, eventTitle: string) => {
        if ((window as any).gtag) {
          (window as any).gtag('event', 'view_item', {
            event_category: 'events',
            event_label: eventTitle,
            item_id: eventId,
            content_type: 'event'
          });
        }
      };

      // Track RSVP actions
      (window as any).trackRSVP = (eventId: string, status: string) => {
        if ((window as any).gtag) {
          (window as any).gtag('event', 'rsvp', {
            event_category: 'engagement',
            event_label: status,
            item_id: eventId,
            value: status === 'going' ? 2 : 1 // Higher value for going vs interested
          });
        }
      };

      // Track venue bookings
      (window as any).trackVenueBooking = (venueId: string, venueName: string) => {
        if ((window as any).gtag) {
          (window as any).gtag('event', 'booking_inquiry', {
            event_category: 'venues',
            event_label: venueName,
            item_id: venueId,
            value: 5 // High value action
          });
        }
      };

      // Track searches
      (window as any).trackSearch = (query: string, results: number) => {
        if ((window as any).gtag) {
          (window as any).gtag('event', 'search', {
            event_category: 'site_search',
            event_label: query,
            value: results
          });
        }
      };
    };

    // Initialize all analytics
    if (typeof window !== 'undefined') {
      // Only in production
      if (window.location.hostname !== 'localhost') {
        initGA4();
        addSearchConsoleVerification();
      }
      
      const cleanupEngagement = trackEngagement();
      trackKolabEvents();

      return cleanupEngagement;
    }
  }, []);

  return null;
}