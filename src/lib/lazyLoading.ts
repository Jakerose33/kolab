import { lazy } from 'react';

// Lazy load pages with loading states
export const LazyPages = {
  Index: lazy(() => import('@/pages/Index')),
  Events: lazy(() => import('@/pages/Events')),
  EventDetail: lazy(() => import('@/pages/EventDetail')),
  JournalArchive: lazy(() => import('@/pages/JournalArchive')),
  Venues: lazy(() => import('@/pages/Venues')),
  Social: lazy(() => import('@/pages/Social')),
  Careers: lazy(() => import('@/pages/Careers')),
  Profile: lazy(() => import('@/pages/Profile')),
  Settings: lazy(() => import('@/pages/Settings')),
  MyBookings: lazy(() => import('@/pages/MyBookings')),
  Messages: lazy(() => import('@/pages/Messages')),
  Auth: lazy(() => import('@/pages/Auth')),
  Admin: lazy(() => import('@/pages/Admin')),
  Analytics: lazy(() => import('@/pages/Analytics')),
  Search: lazy(() => import('@/pages/Search')),
  NotFound: lazy(() => import('@/pages/NotFound')),
  VenuePartners: lazy(() => import('@/pages/VenuePartners')),
  PrivacyPolicy: lazy(() => import('@/pages/PrivacyPolicy')),
  TermsOfService: lazy(() => import('@/pages/TermsOfService')),
  AboutUs: lazy(() => import('@/pages/AboutUs')),
  Contact: lazy(() => import('@/pages/Contact')),
  Help: lazy(() => import('@/pages/Help')),
  Safety: lazy(() => import('@/pages/Safety')),
  CookiePolicy: lazy(() => import('@/pages/CookiePolicy')),
  AuthDebug: lazy(() => import('@/pages/auth/AuthDebug')),
  AuthCallback: lazy(() => import('@/pages/auth/AuthCallback')),
  ForgotPassword: lazy(() => import('@/pages/auth/ForgotPassword')),
  ResetPassword: lazy(() => import('@/pages/auth/ResetPassword')),
};

// Lazy load components - only map view for now since others don't have default exports
export const LazyComponents = {
  VenueMap: lazy(() => import('@/components/VenueMap')),
  EventMap: lazy(() => import('@/components/EventMap')),
};

// Preload function for critical routes
export const preloadRoutes = {
  eventDetail: () => import('@/pages/EventDetail'),
  journalArchive: () => import('@/pages/JournalArchive'),
  venues: () => import('@/pages/Venues'),
  social: () => import('@/pages/Social'),
  auth: () => import('@/pages/Auth'),
  analytics: () => import('@/pages/Analytics'),
  search: () => import('@/pages/Search'),
  venuePartners: () => import('@/pages/VenuePartners'),
  privacy: () => import('@/pages/PrivacyPolicy'),
  terms: () => import('@/pages/TermsOfService'),
  about: () => import('@/pages/AboutUs'),
};

// Intersection Observer for lazy loading images and components
export class LazyLoader {
  private static observer?: IntersectionObserver;
  
  static init() {
    if (typeof window === 'undefined' || this.observer) return;
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const src = element.dataset.src;
            const preload = element.dataset.preload;
            
            if (src && element instanceof HTMLImageElement) {
              element.src = src;
              element.removeAttribute('data-src');
            }
            
            if (preload) {
              import(preload).catch(console.error);
              element.removeAttribute('data-preload');
            }
            
            this.observer?.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );
  }
  
  static observe(element: HTMLElement) {
    if (!this.observer) this.init();
    this.observer?.observe(element);
  }
  
  static unobserve(element: HTMLElement) {
    this.observer?.unobserve(element);
  }
  
  static disconnect() {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}

// React hook for lazy loading
export function useLazyLoading() {
  const observeElement = (element: HTMLElement | null) => {
    if (element) {
      LazyLoader.observe(element);
    }
  };
  
  const preloadRoute = (routeName: keyof typeof preloadRoutes) => {
    preloadRoutes[routeName]().catch(console.error);
  };
  
  return {
    observeElement,
    preloadRoute,
  };
}

// Prefetch on hover utility
export function prefetchOnHover(href: string) {
  const handleMouseEnter = () => {
    const route = href.slice(1) as keyof typeof preloadRoutes;
    if (preloadRoutes[route]) {
      preloadRoutes[route]().catch(console.error);
    }
  };
  
  return { onMouseEnter: handleMouseEnter };
}