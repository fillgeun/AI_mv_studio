const CACHE_NAME = 'ai-music-platform-v2'; // Increment version on change
const BASE_PATH = '/AI_mv_studio'; // From vite.config.ts base

// On install, cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell');
      // Precaching the root is important for the entry point.
      // With vite, index.html is served from '/AI_mv_studio/'.
      return cache.addAll([
        `${BASE_PATH}/`,
        `${BASE_PATH}/index.html`,
        `${BASE_PATH}/manifest.json`,
        `${BASE_PATH}/icon.svg`
      ]);
    })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// On fetch, serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For navigation requests, use Network Falling Back to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If response is valid, cache it and return it
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, return the cached index.html
          return caches.match(`${BASE_PATH}/index.html`);
        })
    );
    return;
  }

  // For other requests (assets), use Cache First, then Network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Only cache successful responses for safe methods from our origin or trusted CDNs
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET' && (request.url.startsWith(self.location.origin) || request.url.includes('aistudiocdn.com'))) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
