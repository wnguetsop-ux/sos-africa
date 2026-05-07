import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

// Approx 1 deg latitude ~ 111 km
// We fetch all zones (cap 500) and filter client-side by distance.
// For larger scale, switch to GeoFirestore / GeoHash queries.
const haversine = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(aa));
};

const EXPIRY_DAYS = 7;

export const RISK_TYPES = [
  { id: 'theft', label: 'Vol / arnaque', emoji: '💰', color: 'red' },
  { id: 'aggression', label: 'Agression', emoji: '⚠️', color: 'red' },
  { id: 'taxi', label: 'Taxi suspect', emoji: '🚕', color: 'amber' },
  { id: 'crowd', label: 'Foule à risque', emoji: '👥', color: 'amber' },
  { id: 'dark', label: 'Zone non éclairée', emoji: '🌙', color: 'amber' },
  { id: 'protest', label: 'Manifestation', emoji: '🪧', color: 'amber' },
  { id: 'flood', label: 'Inondation', emoji: '🌊', color: 'blue' },
  { id: 'other', label: 'Autre vigilance', emoji: '👁️', color: 'amber' },
];

export const useRiskZones = (location, radiusKm = 10) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe in real-time
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'riskZones'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt:
              data.createdAt?.toMillis?.() ||
              data.createdAt?.seconds * 1000 ||
              null,
          };
        });

        // Filter expired (older than 7 days, no recent confirmation)
        const now = Date.now();
        const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const fresh = all.filter((z) => {
          if (!z.createdAt) return true;
          if (now - z.createdAt < expiryMs) return true;
          // Keep if confirmed recently
          const lastConfirm =
            z.lastConfirmAt?.toMillis?.() ||
            z.lastConfirmAt?.seconds * 1000 ||
            0;
          return lastConfirm && now - lastConfirm < expiryMs;
        });

        // Filter by radius if location available
        let visible = fresh;
        if (location?.lat && location?.lng) {
          visible = fresh.filter((z) => {
            if (!z.lat || !z.lng) return false;
            return haversine({ lat: location.lat, lng: location.lng }, z) <= radiusKm;
          });
        }

        setZones(visible);
        setLoading(false);
      },
      (err) => {
        console.error('Risk zones listener error:', err);
        setError(err.message || 'firestore_error');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [location?.lat, location?.lng, radiusKm]);

  const reportZone = async ({ type, lat, lng, note, userId }) => {
    if (!type || lat == null || lng == null) return null;
    try {
      const docRef = await addDoc(collection(db, 'riskZones'), {
        type,
        lat: Number(lat),
        lng: Number(lng),
        note: note || '',
        createdBy: userId || 'anonymous',
        createdAt: serverTimestamp(),
        confirmations: 1,
        confirmedBy: [userId || 'anonymous'],
        lastConfirmAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('reportZone error:', err);
      throw err;
    }
  };

  const confirmZone = async (zoneId, userId) => {
    if (!zoneId) return false;
    try {
      const ref = doc(db, 'riskZones', zoneId);
      await updateDoc(ref, {
        confirmations: increment(1),
        confirmedBy: arrayUnion(userId || 'anonymous'),
        lastConfirmAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error('confirmZone error:', err);
      return false;
    }
  };

  return { zones, loading, error, reportZone, confirmZone, RISK_TYPES };
};

export default useRiskZones;
