/* ============================================================
   Plant Maintenance Tracker - Service Worker
   Offline Support + Cache Updating
============================================================ */

const CACHE_NAME = "pm-tracker-v1";
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "inventory.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

/* ------------------------------------------------------------
   INSTALL - Cache all required files
------------------------------------------------------------ */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

/* ------------------------------------------------------------
   ACTIVATE - Remove old caches
------------------------------------------------------------ */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

/* ------------------------------------------------------------
   FETCH - Serve from cache, fallback to network
------------------------------------------------------------ */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResp) => {
      return (
        cachedResp ||
        fetch(event.request).catch(() =>
          caches.match("index.html")
        )
      );
    })
  );
});
