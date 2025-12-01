const CACHE_NAME = "pmtracker-v8";  
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./inventory.js",
  "./manifest.json",

  // icons  
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-1024.png"
];

// Install SW + cache everything
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // activate immediately
});

// Activate SW + delete old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // start controlling pages
});

// Fetch handler — network first, fallback to cache
self.addEventListener("fetch", event => {
  const req = event.request;

  // Only GET requests (avoid issues with forms or posts)
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then(res => {
        // Clone and store in cache
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
