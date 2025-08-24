import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface AdvancedSEOSystemProps {
  children: React.ReactNode;
}

export function AdvancedSEOSystem({ children }: AdvancedSEOSystemProps) {
  const location = useLocation();

  // Advanced performance optimizations
  const optimizePerformance = useCallback(() => {
    // Preload critical resources
    const criticalResources = [
      { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
      { href: 'https://fonts.gstatic.com', rel: 'preconnect', crossorigin: 'anonymous' },
      { href: '/src/assets/hero-boiler-room.jpg', rel: 'preload', as: 'image' },
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      Object.entries(resource).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
        document.head.appendChild(link);
      }
    });

    // Prefetch likely next pages
    const prefetchPages = ['/events', '/venues', '/careers'];
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      if (!document.querySelector(`link[href="${page}"][rel="prefetch"]`)) {
        document.head.appendChild(link);
      }
    });

    // Optimize font loading
    const fontOptimization = document.createElement('link');
    fontOptimization.rel = 'preload';
    fontOptimization.href = 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap';
    fontOptimization.as = 'style';
    fontOptimization.onload = function(this: HTMLLinkElement) {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    if (!document.querySelector('link[href*="Inter"]')) {
      document.head.appendChild(fontOptimization);
    }
  }, []);

  // Advanced meta tag management
  const updateAdvancedMeta = useCallback(() => {
    const path = location.pathname;
    
    // Enhanced meta tags based on route
    const metaConfigs: Record<string, any> = {
      '/': {
        title: 'Kolab - Where Your City Comes Alive | Underground Events & Hidden Venues',
        description: 'Your backstage pass to the city\'s best-kept secrets. Discover underground culture, exclusive events, and hidden venues. Join the collaborative community.',
        keywords: 'underground events, hidden venues, secret events, exclusive parties, cultural events, nightlife, art galleries, music venues, creative spaces, underground culture',
        type: 'website',
        priority: '1.0'
      },
      '/events': {
        title: 'Discover Underground Events | Exclusive Parties & Cultural Experiences | Kolab',
        description: 'Find the best underground events, secret parties, and cultural experiences in your city. From intimate music venues to exclusive art galleries.',
        keywords: 'events, underground events, secret parties, music events, art events, cultural events, nightlife, live music, art galleries, creative events',
        type: 'website',
        priority: '0.9'
      },
      '/venues': {
        title: 'Hidden Venues & Secret Spaces | Book Unique Event Locations | Kolab',
        description: 'Discover and book hidden venues, secret spaces, and unique locations for your events. From underground clubs to exclusive galleries.',
        keywords: 'venues, hidden venues, secret spaces, event spaces, unique venues, underground clubs, art galleries, creative spaces, venue booking',
        type: 'website',
        priority: '0.8'
      },
      '/careers': {
        title: 'Creative Careers & Jobs | Join the Underground Culture Movement | Kolab',
        description: 'Find creative careers, freelance opportunities, and jobs in the underground culture scene. Connect with artists, venues, and creative professionals.',
        keywords: 'creative jobs, culture careers, freelance, artist jobs, venue jobs, creative opportunities, cultural sector, entertainment jobs',
        type: 'website',
        priority: '0.7'
      }
    };

    const config = metaConfigs[path] || metaConfigs['/'];
    
    // Update title
    document.title = config.title;

    // Update meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', config.description);
    updateMeta('keywords', config.keywords);
    updateMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMeta('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    
    // Open Graph
    updateMeta('og:title', config.title, true);
    updateMeta('og:description', config.description, true);
    updateMeta('og:type', config.type, true);
    updateMeta('og:url', window.location.href, true);
    updateMeta('og:site_name', 'Kolab', true);
    updateMeta('og:locale', 'en_GB', true);
    
    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', config.title);
    updateMeta('twitter:description', config.description);
    updateMeta('twitter:site', '@kolab');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [location.pathname]);

  // Enhanced structured data
  const addAdvancedStructuredData = useCallback(() => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.textContent?.includes('"@context"')) {
        script.remove();
      }
    });

    const structuredData = [
      // Website
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Kolab",
        "alternateName": "Underground Culture Platform",
        "url": window.location.origin,
        "description": "Underground culture platform connecting you to exclusive events and hidden venues",
        "publisher": {
          "@type": "Organization",
          "name": "Kolab",
          "url": window.location.origin
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "sameAs": [
          "https://www.facebook.com/kolab",
          "https://twitter.com/kolab",
          "https://www.instagram.com/kolab"
        ]
      },
      // Organization
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Kolab",
        "url": window.location.origin,
        "description": "Underground culture platform connecting you to exclusive events and hidden venues",
        "foundingDate": "2024",
        "areaServed": "United Kingdom",
        "knowsAbout": ["Underground Culture", "Events", "Venues", "Art", "Music", "Nightlife"],
        "sameAs": [
          "https://www.facebook.com/kolab",
          "https://twitter.com/kolab",
          "https://www.instagram.com/kolab"
        ]
      },
      // FAQ
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Kolab?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Kolab is your backstage pass to underground culture, exclusive events, and hidden venues. We connect you to the city's best-kept secrets including art galleries, music venues, cultural events, and unique spaces."
            }
          },
          {
            "@type": "Question",
            "name": "How do I find underground events near me?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Use our advanced search and filter tools to discover events by location, category, and date. We feature underground music, art, culture, and nightlife events that you won't find anywhere else."
            }
          },
          {
            "@type": "Question",
            "name": "Can I book unique venues through Kolab?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Browse our curated collection of unique venues and hidden spaces. Connect directly with venue owners to book your next event in spaces ranging from underground clubs to exclusive galleries."
            }
          },
          {
            "@type": "Question",
            "name": "Is Kolab free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, discovering events and venues on Kolab is free. Some premium features and exclusive events may require payment, but the core platform is free to use."
            }
          }
        ]
      },
      // Breadcrumb for non-home pages
      ...(location.pathname !== '/' ? [{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2),
            "item": window.location.href
          }
        ]
      }] : [])
    ];

    // Add structured data to page
    structuredData.forEach(data => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }, [location.pathname]);

  // Performance monitoring
  const monitorPerformance = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as any;
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as any;
            if (!clsEntry.hadRecentInput) {
              console.log('CLS:', clsEntry.value);
            }
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Observer not supported
      }
    }
  }, []);

  useEffect(() => {
    optimizePerformance();
    updateAdvancedMeta();
    addAdvancedStructuredData();
    monitorPerformance();
  }, [location.pathname, optimizePerformance, updateAdvancedMeta, addAdvancedStructuredData, monitorPerformance]);

  return <>{children}</>;
}