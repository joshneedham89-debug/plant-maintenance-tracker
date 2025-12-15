/* =======================================================
   SERVICE WORKER – Plant Maintenance v10
   Offline caching + auto update
======================================================= */

const CACHE_NAME = "pm_v10_cache";
const APP_FILES = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "inventory.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

/* Install – cache all essential files */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

/* Activate – clean old caches */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* Fetch – network first, fallback to cache */
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with latest file
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
