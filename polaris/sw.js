/*
 * Polaris Service Worker
 * ----------------------
 * Gives the installed app offline support and instant startup (Book 15:
 * "Offline capability is essential for accessibility and reliability").
 *
 * Strategy:
 *  - App shell (local HTML/CSS/JS/icons) is precached and served cache-first.
 *  - Navigations fall back to the cached index when offline.
 *  - Cross-origin assets (fonts, icons CDN) use stale-while-revalidate.
 */
const CACHE = "polaris-v2";

const APP_SHELL = [
  "./",
  "index.html",
  "css/polaris.css",
  "js/framework.js",
  "js/experiences.js",
  "js/platform.js",
  "js/store.js",
  "js/engine.js",
  "js/coach.js",
  "js/seed.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigations: serve cached app shell, fall back to network, then offline index.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then((r) => r || caches.match("index.html")).then((r) => r || caches.match("./"))
      )
    );
    return;
  }

  if (sameOrigin) {
    // Cache-first for our own static assets, then update the cache in the background.
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cross-origin (CDN fonts / icons): stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => { cache.put(req, res.clone()); return res; })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
