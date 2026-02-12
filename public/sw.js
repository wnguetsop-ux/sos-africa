// Service Worker pour SOS Africa
// Permet le fonctionnement hors ligne

const CACHE_NAME = 'sos-africa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sounds/siren.mp3',
  '/sounds/ringtone.mp3',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Suppression ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de fetch: Network First, fallback sur Cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;
  
  // Ignorer les requêtes vers d'autres domaines (sauf maps)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('google')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cloner la réponse pour la mettre en cache
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            // Ne pas cacher les API ou les requêtes POST
            if (event.request.url.includes('/api/')) return;
            cache.put(event.request, responseClone);
          });
        
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, utiliser le cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Pour les pages HTML, retourner la page principale
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
            
            return new Response('Hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Gestion des notifications push (pour les alertes)
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle alerte SOS',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'sos-alert',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Voir' },
      { action: 'dismiss', title: 'Ignorer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SOS Africa - Alerte!', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic sur notification');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Synchronisation en arrière-plan (pour envoyer les SMS en attente)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync:', event.tag);
  
  if (event.tag === 'send-pending-alerts') {
    event.waitUntil(
      // Logique pour envoyer les alertes en attente
      sendPendingAlerts()
    );
  }
});

// Fonction pour envoyer les alertes en attente
async function sendPendingAlerts() {
  try {
    // Récupérer les alertes en attente depuis IndexedDB ou localStorage
    // Cette logique serait implémentée selon les besoins
    console.log('[SW] Envoi des alertes en attente...');
  } catch (error) {
    console.error('[SW] Erreur envoi alertes:', error);
  }
}