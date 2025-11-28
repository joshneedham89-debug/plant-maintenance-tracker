// -------------------------------------------------------------
// Plant Maintenance Tracker - PWA Service Worker
// Offline caching system (fixed + reliable)
// -------------------------------------------------------------

const CACHE_NAME = "pm-cache-v4";
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

// -------------------------------------------------------------
// INSTALL — cache all core assets
// -------------------------------------------------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// -------------------------------------------------------------
// ACTIVATE — clean old caches
// -------------------------------------------------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// -------------------------------------------------------------
// FETCH — offline-first response
// -------------------------------------------------------------
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(cacheRes => {
        return (
          cacheRes ||
          fetch(event.request)
            .then(fetchRes => {
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, fetchRes.clone());
                return fetchRes;
              });
            })
            .catch(() => caches.match("index.html"))
        );
      })
  );
});;
