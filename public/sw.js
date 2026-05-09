/* BEYOND OS — Core Service Worker
   Handles offline caching + runtime caching for fonts/CDN assets.
*/

const VERSION = 'beyond-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './app.js'
];

// Install — cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(CORE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first for core, network-first for everything else
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(resp => {
        // Runtime cache for fonts/CDN assets
        if (resp.ok && (
          e.request.url.includes('fonts') ||
          e.request.url.includes('cdnjs')
        )) {
          const clone = resp.clone();
          caches.open(VERSION).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => {
        // Offline fallback for navigation
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
