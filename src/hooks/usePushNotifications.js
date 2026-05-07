import { useEffect, useState } from 'react';
import { firebaseApp } from '../firebase/config';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// VAPID public key — Firebase Cloud Messaging Web Push.
// Public key, OK to expose in client (private key reste sur Firebase).
// Override possible via env var VITE_FIREBASE_VAPID_KEY.
const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BBT3ul0ZC3r2AX_L-jE_hMcaRECLMneJwUcFL89u7mJpbEaI2ySVXIG2wck6VAwq--fwQAjyWXhp1RNRyZaXQrk';

/**
 * Hook pour gérer les push notifications FCM.
 *
 * Étapes côté Firebase Console (à faire une seule fois) :
 * 1. Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
 * 2. Copier la "Key pair" (clé publique)
 * 3. Ajouter dans Vercel : VITE_FIREBASE_VAPID_KEY = "BHj..."
 *
 * Côté code : ce hook demande la permission notif au boot, récupère le token FCM,
 * l'enregistre dans Firestore (collection 'fcmTokens/{userId}') pour qu'on puisse
 * envoyer un push à un utilisateur précis.
 */
export const usePushNotifications = (userId) => {
  const [permission, setPermission] = useState('default');
  const [token, setToken] = useState(null);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  // Detect support and current permission
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ok = await isSupported();
        if (cancelled) return;
        setSupported(ok);
        if (ok && typeof Notification !== 'undefined') {
          setPermission(Notification.permission);
        }
      } catch (e) {
        setSupported(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      setError('Notifications non supportées sur cet appareil.');
      return null;
    }
    if (!VAPID_KEY) {
      setError(
        'Clé VAPID manquante. Voir Firebase Console > Cloud Messaging > Web push.'
      );
      return null;
    }
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return null;

      const messaging = getMessaging(firebaseApp);
      // Need our SW registered first
      const swReg = await navigator.serviceWorker.getRegistration();
      const t = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });
      if (t) {
        setToken(t);
        // Save token to Firestore so we can target this user
        if (userId) {
          await setDoc(
            doc(db, 'fcmTokens', userId),
            {
              token: t,
              userId,
              userAgent: navigator.userAgent,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {});
        }
        return t;
      }
      return null;
    } catch (err) {
      console.error('FCM error:', err);
      setError(err.message || 'fcm_error');
      return null;
    }
  };

  // Foreground listener (notifications when app is open)
  useEffect(() => {
    if (!supported || !token) return;
    let unsub = () => {};
    try {
      const messaging = getMessaging(firebaseApp);
      unsub = onMessage(messaging, (payload) => {
        setLastMessage(payload);
        // Browser notification while app is open
        if (Notification.permission === 'granted' && payload?.notification) {
          const { title, body } = payload.notification;
          new Notification(title || 'SOS Africa', {
            body: body || '',
            icon: '/icons/icon-192x192.png',
          });
        }
      });
    } catch (err) {
      console.error('FCM listener error:', err);
    }
    return () => {
      try {
        unsub();
      } catch {}
    };
  }, [supported, token]);

  return {
    supported,
    permission,
    token,
    error,
    lastMessage,
    requestPermission,
    canRequest: supported && permission === 'default' && !!VAPID_KEY,
    isReady: supported && permission === 'granted' && !!token,
  };
};

export default usePushNotifications;
