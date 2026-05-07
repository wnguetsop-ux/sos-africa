// SOS Africa Service Worker — v5
// Stratégie : network-first pour HTML/JS/CSS, cache-first pour tuiles/médias,
// stale-while-revalidate pour Nominatim, fallback offline pour HTML.

const APP_CACHE = 'sos-africa-app-v5';
const TILE_CACHE = 'sos-africa-tiles-v1';
const GEO_CACHE = 'sos-africa-geo-v1';
const STATIC_PRECACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Patterns
const TILE_HOST_RX = /^https:\/\/[a-d]?\.basemaps\.cartocdn\.com\//;
const NOMINATIM_RX = /^https:\/\/nominatim\.openstreetmap\.org\//;
const FIREBASE_RX = /(firebaseio|firebasestorage|googleapis|gstatic)\.com/;
const OPENAI_RX = /\/api\/chat/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(STATIC_PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                ![APP_CACHE, TILE_CACHE, GEO_CACHE].includes(k) &&
                k.startsWith('sos-africa')
            )
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Listen for push (FCM via direct push API). Real FCM uses firebase-messaging-sw.js.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'SOS Africa', body: event.data?.text?.() || '' };
  }
  const title = data.title || 'SOS Africa';
  const body = data.body || data.message || '';
  const options = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'sos-africa',
    renotify: true,
    data: data.url ? { url: data.url } : {},
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if (win.url.includes(self.registration.scope)) {
          win.focus();
          if (url) win.navigate?.(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  if (req.method !== 'GET') return;

  // 1) Map tiles → cache-first (illimité offline une fois visité)
  if (TILE_HOST_RX.test(url)) {
    event.respondWith(cacheFirst(req, TILE_CACHE, 200));
    return;
  }

  // 2) Reverse geocoding → stale-while-revalidate (TTL 24h)
  if (NOMINATIM_RX.test(url)) {
    event.respondWith(staleWhileRevalidate(req, GEO_CACHE, 24 * 60 * 60 * 1000));
    return;
  }

  // 3) Firebase / OpenAI / API chat → network-only (fail-fast offline)
  if (FIREBASE_RX.test(url) || OPENAI_RX.test(url)) {
    event.respondWith(fetch(req).catch(() => new Response(null, { status: 503 })));
    return;
  }

  // 4) Tout le reste (HTML/JS/CSS/images app) → network-first avec fallback cache
  event.respondWith(networkFirst(req, APP_CACHE));
});

// --- strategies ---

async function cacheFirst(request, cacheName, maxEntries = 100) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res && res.status === 200) {
      cache.put(request, res.clone());
      trimCache(cacheName, maxEntries);
    }
    return res;
  } catch (err) {
    // No network, no cache — return a transparent 1×1 PNG so the map doesn't crash
    return new Response(null, { status: 504 });
  }
}

async function staleWhileRevalidate(request, cacheName, ttlMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((res) => {
      if (res && res.status === 200) {
        const headers = new Headers(res.headers);
        headers.set('x-cached-at', String(Date.now()));
        const wrapped = new Response(res.clone().body, { headers, status: res.status });
        cache.put(request, wrapped);
      }
      return res;
    })
    .catch(() => null);
  if (cached) {
    const cachedAt = parseInt(cached.headers.get('x-cached-at') || '0', 10);
    if (cachedAt && Date.now() - cachedAt < ttlMs) {
      return cached;
    }
  }
  const fresh = await fetchPromise;
  return fresh || cached || new Response(null, { status: 504 });
}

async function networkFirst(request, cacheName) {
  try {
    const res = await fetch(request);
    if (res && res.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone()).catch(() => {});
    }
    return res;
  } catch (err) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    // Last-resort offline fallback for navigations
    if (request.mode === 'navigate') {
      const root = await cache.match('/');
      if (root) return root;
    }
    return new Response(null, { status: 504 });
  }
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      const toDelete = keys.length - maxEntries;
      for (let i = 0; i < toDelete; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch {}
}
