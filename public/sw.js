const CACHE_NAME = 'kolab-v2';
const STATIC_CACHE = 'kolab-static-v2';
const DYNAMIC_CACHE = 'kolab-dynamic-v2';
const API_CACHE = 'kolab-api-v2';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// URLs to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap',
];

// API endpoints to cache
const API_PATTERNS = [
  /\/api\/events/,
  /\/api\/venues/,
  /\/api\/bookings/,
];

// Install service worker and cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

// Activate service worker and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !cacheName.startsWith('kolab-v2') && !cacheName.includes('v2'))
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      self.clients.claim()
    ])
  );
});

// Enhanced fetch handler with different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle different resource types
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Cache-first strategy for images
async function handleImageRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return fallback image if needed
    return new Response('', { status: 404 });
  }
}

// Network-first with cache fallback for API requests
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful responses for 5 minutes
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cache-timestamp', Date.now().toString());
      cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      // Check if cache is stale (older than 5 minutes)
      const timestamp = cached.headers.get('sw-cache-timestamp');
      if (timestamp && Date.now() - parseInt(timestamp) < 5 * 60 * 1000) {
        return cached;
      }
    }
    throw error;
  }
}

// Cache-first for static assets
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) return cached;
  
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Stale-while-revalidate for navigation
async function handleNavigationRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Return cached version or fallback to index.html for SPA routing
    return cached || cache.match('/');
  });
  
  return cached || fetchPromise;
}

// Helper functions
function isApiRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url.pathname);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle queued offline actions when back online
  console.log('Background sync triggered');
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
});