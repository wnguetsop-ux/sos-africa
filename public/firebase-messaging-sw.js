// Firebase Cloud Messaging service worker — required by FCM Web SDK.
// Loaded automatically by FCM at scope '/'.
// Receives background push notifications when the app is closed.

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA2vTg4Twj0qCSxwxb_Jy1RDU8_eygr_Bo',
  authDomain: 'sos-africa.firebaseapp.com',
  projectId: 'sos-africa',
  storageBucket: 'sos-africa.firebasestorage.app',
  messagingSenderId: '500807651493',
  appId: '1:500807651493:web:12336e486075dc3e057d4c',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notif = payload.notification || {};
  const data = payload.data || {};
  const title = notif.title || data.title || 'SOS Africa';
  const body = notif.body || data.body || '';
  const options = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'sos-africa-push',
    renotify: true,
    requireInteraction: data.urgent === 'true',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if ('focus' in win) {
          win.focus();
          if ('navigate' in win) win.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
