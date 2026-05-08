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
 * envoyer un push à un utilisateur précis OU par numéro de téléphone (clé phone).
 */
const normalizePhone = (raw) => {
  if (!raw) return null;
  // garde uniquement chiffres et +, retire indicatif éventuel pour normaliser
  let s = String(raw).replace(/[^\d+]/g, '');
  // remove leading 00 (international prefix)
  if (s.startsWith('00')) s = '+' + s.slice(2);
  // si pas de +, on prefixe (mais on ne devine pas le pays)
  return s;
};

export const usePushNotifications = (userId, userPhone) => {
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
    setError(null);
    // 1) Prefer the native browser Notification API for the prompt
    //    (works even if FCM-specific isSupported() returned false)
    if (typeof Notification === 'undefined') {
      setError('Notifications non supportées sur ce navigateur.');
      return null;
    }
    let perm = Notification.permission;
    try {
      if (perm === 'default') {
        perm = await Notification.requestPermission();
      }
      setPermission(perm);
    } catch (err) {
      console.error('Notification.requestPermission error:', err);
      setError(
        "Le navigateur n'a pas autorisé la demande. Vérifie HTTPS + paramètres."
      );
      return null;
    }
    if (perm !== 'granted') {
      if (perm === 'denied') {
        setError(
          'Notifications bloquées. Va dans les paramètres du navigateur pour les autoriser.'
        );
      }
      return null;
    }

    // 2) Try to get an FCM token (might fail on iOS, old browsers, etc.)
    if (!VAPID_KEY) {
      setError('Clé VAPID manquante côté app.');
      return null;
    }
    try {
      // SW must be registered first (main.jsx does it). Wait briefly if needed.
      let swReg = await navigator.serviceWorker?.getRegistration?.();
      if (!swReg && navigator.serviceWorker?.ready) {
        swReg = await navigator.serviceWorker.ready;
      }
      const messaging = getMessaging(firebaseApp);
      const t = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });
      if (t) {
        setToken(t);
        if (userId) {
          const phone = normalizePhone(userPhone);
          // Generate also a 'phoneTail' (last 9 digits) for matching tolerant
          // queries when the sender wrote the phone differently
          const phoneTail = phone ? phone.replace(/\D/g, '').slice(-9) : null;
          await setDoc(
            doc(db, 'fcmTokens', userId),
            {
              token: t,
              userId,
              phone: phone || null,
              phoneTail: phoneTail || null,
              userAgent: navigator.userAgent,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch((e) =>
            console.warn('fcmTokens write failed (Firestore Rules ?):', e.code)
          );
        }
        return t;
      }
      // Permission granted but no token — typically iOS without PWA install
      setError(
        "Permission OK mais token FCM indisponible. Sur iPhone : ajoute l'app à l'écran d'accueil pour activer les push."
      );
      return null;
    } catch (err) {
      console.error('FCM getToken error:', err);
      setError(
        err?.code === 'messaging/unsupported-browser'
          ? "Push non supporté ici. Sur iPhone : ajoute l'app à l'écran d'accueil."
          : err?.message || "Erreur lors de l'obtention du token FCM."
      );
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
