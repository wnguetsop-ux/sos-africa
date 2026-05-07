import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Distance haversine en mètres
const haversineM = (a, b) => {
  if (!a || !b || a.lat == null || b.lat == null) return Infinity;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000; // m
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(aa));
};

// Local notification helper — fires only if permission granted
const localNotify = (title, body, tag) => {
  try {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const notif = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag,
      vibrate: [200, 100, 200],
    });
    setTimeout(() => notif.close(), 8000);
  } catch (e) {
    console.warn('Notification failed:', e);
  }
};

const STATE_KEY = (familyId, userId) => `sos_geofence_state_${familyId}_${userId}`;

/**
 * Hook qui :
 *   - liste les geofences du cercle famille (Firestore real-time)
 *   - detecte les crossings (entree/sortie) sur les changements de location
 *   - declenche une notif locale + log dans Firestore
 *   - expose CRUD : addGeofence, updateGeofence, deleteGeofence
 */
export const useGeofences = ({ familyId, location, userId, userName, enabled = true }) => {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Last known inside/outside state per fence (avoid double-firing)
  const stateRef = useRef({});

  // Initial load of state from localStorage
  useEffect(() => {
    if (!familyId || !userId) return;
    try {
      stateRef.current = JSON.parse(
        localStorage.getItem(STATE_KEY(familyId, userId)) || '{}'
      );
    } catch {
      stateRef.current = {};
    }
  }, [familyId, userId]);

  // Subscribe to family geofences
  useEffect(() => {
    if (!familyId || !enabled) {
      setGeofences([]);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, 'families', familyId, 'geofences'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setGeofences(list);
        setLoading(false);
      },
      (err) => {
        console.error('geofences listener:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [familyId, enabled]);

  // Crossing detection on each location update
  useEffect(() => {
    if (!enabled || !familyId || !userId || !location?.lat || geofences.length === 0) return;
    const next = { ...stateRef.current };
    geofences.forEach((g) => {
      if (g.lat == null || g.lng == null || !g.radius) return;
      const distance = haversineM(
        { lat: location.lat, lng: location.lng },
        { lat: g.lat, lng: g.lng }
      );
      const wasInside = !!stateRef.current[g.id];
      const isInside = distance <= g.radius;
      next[g.id] = isInside;

      if (isInside !== wasInside) {
        // Crossing detected
        const action = isInside ? 'enter' : 'exit';
        const wantNotif =
          g.notifyOn === 'both' ||
          (g.notifyOn === 'enter' && action === 'enter') ||
          (g.notifyOn === 'exit' && action === 'exit');

        if (wantNotif) {
          const title = isInside ? '📍 Arrivée détectée' : '🚪 Sortie détectée';
          const body = `${userName || 'Tu'} ${
            isInside ? 'viens d\'arriver à' : 'viens de quitter'
          } ${g.name || 'la zone'}.`;
          localNotify(title, body, `geofence-${g.id}-${action}`);
        }

        // Log in Firestore so other family members can see
        try {
          addDoc(collection(db, 'families', familyId, 'crossings'), {
            geofenceId: g.id,
            geofenceName: g.name || '',
            userId,
            userName: userName || '',
            action,
            lat: location.lat,
            lng: location.lng,
            timestamp: serverTimestamp(),
          }).catch(() => {});
        } catch {}

        // Push aux autres membres famille via le serveur (no-op si pas configuré)
        try {
          fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              familyId,
              title: isInside
                ? `📍 ${userName || 'Un membre'} est arrivé`
                : `🚪 ${userName || 'Un membre'} vient de partir`,
              body: `${isInside ? 'Arrivée à' : 'Sortie de'} ${g.name || 'la zone'}`,
              data: { url: '/?tab=tools' },
            }),
          }).catch(() => {});
        } catch {}
      }
    });

    // Persist state
    if (JSON.stringify(next) !== JSON.stringify(stateRef.current)) {
      stateRef.current = next;
      try {
        localStorage.setItem(STATE_KEY(familyId, userId), JSON.stringify(next));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng, geofences, familyId, userId, userName, enabled]);

  // CRUD
  const addGeofence = async ({ name, lat, lng, radius, color, notifyOn }) => {
    if (!familyId) throw new Error('Pas de famille active');
    const docRef = await addDoc(collection(db, 'families', familyId, 'geofences'), {
      name: name || 'Zone',
      lat: Number(lat),
      lng: Number(lng),
      radius: Number(radius) || 100,
      color: color || '#3D8BFF',
      notifyOn: notifyOn || 'both',
      createdBy: userId || 'anonymous',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateGeofence = async (id, patch) => {
    if (!familyId || !id) return;
    await updateDoc(doc(db, 'families', familyId, 'geofences', id), patch);
  };

  const deleteGeofence = async (id) => {
    if (!familyId || !id) return;
    await deleteDoc(doc(db, 'families', familyId, 'geofences', id));
  };

  // Current state per geofence (memoized)
  const insideMap = useMemo(() => {
    const m = {};
    if (!location?.lat) return m;
    geofences.forEach((g) => {
      if (g.lat == null || g.lng == null || !g.radius) return;
      const d = haversineM(
        { lat: location.lat, lng: location.lng },
        { lat: g.lat, lng: g.lng }
      );
      m[g.id] = { inside: d <= g.radius, distance: d };
    });
    return m;
  }, [geofences, location?.lat, location?.lng]);

  return {
    geofences,
    loading,
    error,
    addGeofence,
    updateGeofence,
    deleteGeofence,
    insideMap,
  };
};

export default useGeofences;
