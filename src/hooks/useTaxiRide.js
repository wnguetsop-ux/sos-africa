import { useEffect, useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'sos_taxi_active_ride';
const HISTORY_KEY = 'sos_taxi_history';

// Check-in cadence (ms)
const CHECKIN_INTERVAL_MS = 3 * 60 * 1000;       // demande toutes les 3 min
const CHECKIN_RESPONSE_WINDOW_MS = 60 * 1000;    // 60s pour repondre
const FINAL_GRACE_MS = 5 * 60 * 1000;            // 5 min apres heure d'arrivee

const readActive = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};

const writeActive = (data) => {
  try {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

const readHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeHistory = (list) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {}
};

const localNotify = (title, body, tag, vibrate = [400, 200, 400]) => {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const n = new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag,
        requireInteraction: true,
        vibrate,
      });
      // Don't auto-close — driver alert needs attention
      setTimeout(() => n.close(), 30000);
    }
    if (navigator.vibrate) navigator.vibrate(vibrate);
  } catch {}
};

/**
 * Hook qui gere un trajet taxi actif :
 *   - persiste tout dans localStorage (survit au reload)
 *   - declenche un check-in toutes les 3 min ('Tu vas bien ?')
 *   - si pas de reponse dans 60s -> auto-alerte aux contacts
 *   - propose un check-in final apres l'heure d'arrivee + 5 min
 *   - sauve dans l'historique a la fin
 */
export const useTaxiRide = ({ contacts, sendSMS, location }) => {
  const [activeRide, setActiveRide] = useState(() => readActive());
  const [history, setHistory] = useState(() => readHistory());
  // Toggled when the user needs to confirm "I'm OK"
  const [pendingCheckIn, setPendingCheckIn] = useState(false);
  const [pendingCheckInDeadline, setPendingCheckInDeadline] = useState(null);
  // Derived
  const [tick, setTick] = useState(0);

  const sendSMSRef = useRef(sendSMS);
  sendSMSRef.current = sendSMS;
  const contactsRef = useRef(contacts);
  contactsRef.current = contacts;
  const locationRef = useRef(location);
  locationRef.current = location;

  // Re-render every 10s while a ride is active so timers/UI update
  useEffect(() => {
    if (!activeRide) return;
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, [activeRide]);

  // Build alert message
  const buildAlertMessage = useCallback((ride, reason = 'no_response') => {
    const mapsLink = locationRef.current
      ? `https://www.google.com/maps?q=${locationRef.current.lat},${locationRef.current.lng}`
      : '';
    const start = ride.startedAt
      ? new Date(ride.startedAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    const reasonText =
      reason === 'no_response'
        ? "n'a pas répondu au check-in de sécurité depuis 60 s"
        : reason === 'manual'
        ? 'a déclenché une alerte taxi'
        : 'n\'est toujours pas arrivée à destination';
    return (
      `🚖 ALERTE TAXI SOS Africa\n\n` +
      `Une personne ${reasonText}.\n\n` +
      `📍 Plaque : ${ride.plateText || 'photographiée'}\n` +
      (ride.plateUrl ? `🖼️ Photo : ${ride.plateUrl}\n` : '') +
      `🚏 Destination : ${ride.destination || 'non précisée'}\n` +
      `⏰ Départ : ${start}\n` +
      (mapsLink ? `📌 Dernière position : ${mapsLink}\n` : '') +
      `\nMerci d'appeler la personne ou les autorités.`
    );
  }, []);

  // Trigger an actual alert SMS to contacts
  const fireAutoAlert = useCallback(
    async (ride, reason = 'no_response') => {
      const targets = (ride.contactIds && ride.contactIds.length
        ? (contactsRef.current || []).filter((c) => ride.contactIds.includes(c.id))
        : contactsRef.current) || [];
      if (!targets.length) return;
      const msg = buildAlertMessage(ride, reason);
      try {
        if (sendSMSRef.current) await sendSMSRef.current(targets, msg);
      } catch (err) {
        console.error('Taxi auto-alert sendSMS failed:', err);
      }
      localNotify(
        '🚨 Alerte envoyée à tes contacts',
        'Pas de réponse au check-in — tes proches ont été notifiés.',
        'taxi-alert',
        [800, 200, 800]
      );
    },
    [buildAlertMessage]
  );

  // Schedule next check-in
  useEffect(() => {
    if (!activeRide) return;
    // If a check-in is currently pending, monitor the deadline instead
    if (pendingCheckIn && pendingCheckInDeadline) {
      const remaining = pendingCheckInDeadline - Date.now();
      if (remaining <= 0) {
        // No response → fire alert
        setPendingCheckIn(false);
        setPendingCheckInDeadline(null);
        fireAutoAlert(activeRide, 'no_response');
        // Continue ride (one alert max per cycle)
        const next = { ...activeRide, lastAlertAt: Date.now() };
        setActiveRide(next);
        writeActive(next);
        return;
      }
      const id = setTimeout(() => setTick((t) => t + 1), Math.min(remaining, 5000));
      return () => clearTimeout(id);
    }

    // Otherwise schedule the next check-in based on lastCheckInAt
    const last = activeRide.lastCheckInAt || activeRide.startedAt;
    const nextAt = last + CHECKIN_INTERVAL_MS;
    const remaining = nextAt - Date.now();
    if (remaining <= 0) {
      // Time to ask
      const deadline = Date.now() + CHECKIN_RESPONSE_WINDOW_MS;
      setPendingCheckIn(true);
      setPendingCheckInDeadline(deadline);
      localNotify(
        '🚖 Check-in taxi',
        'Tu vas bien ? Réponds dans les 60 secondes pour annuler l\'alerte.',
        'taxi-checkin',
        [200, 100, 200, 100, 400]
      );
      return;
    }
    const id = setTimeout(() => setTick((t) => t + 1), Math.min(remaining, 30_000));
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide, pendingCheckIn, pendingCheckInDeadline, tick]);

  // Start ride
  const startRide = useCallback(({ plateText, plateUrl, destination, estimatedMin, contactIds }) => {
    const now = Date.now();
    const ride = {
      id: `ride_${now}`,
      plateText: (plateText || '').toUpperCase().trim(),
      plateUrl: plateUrl || null,
      destination: (destination || '').trim(),
      estimatedMin: Number(estimatedMin) || 15,
      contactIds: contactIds || null,
      startedAt: now,
      expectedArrivalAt: now + (Number(estimatedMin) || 15) * 60 * 1000,
      lastCheckInAt: now,
      checkInsCount: 0,
      lastAlertAt: null,
    };
    setActiveRide(ride);
    writeActive(ride);
    setPendingCheckIn(false);
    setPendingCheckInDeadline(null);
  }, []);

  // User confirms "I'm OK"
  const confirmCheckIn = useCallback(() => {
    if (!activeRide) return;
    const next = {
      ...activeRide,
      lastCheckInAt: Date.now(),
      checkInsCount: (activeRide.checkInsCount || 0) + 1,
    };
    setActiveRide(next);
    writeActive(next);
    setPendingCheckIn(false);
    setPendingCheckInDeadline(null);
  }, [activeRide]);

  // Manual SOS during the ride
  const triggerManualAlert = useCallback(() => {
    if (!activeRide) return;
    fireAutoAlert(activeRide, 'manual');
    const next = { ...activeRide, lastAlertAt: Date.now() };
    setActiveRide(next);
    writeActive(next);
  }, [activeRide, fireAutoAlert]);

  // Arrived safely
  const endRide = useCallback(
    async ({ notifyContacts = false } = {}) => {
      if (!activeRide) return;
      const ended = {
        ...activeRide,
        endedAt: Date.now(),
        outcome: 'safe',
      };
      // Notify contacts if asked
      if (notifyContacts && contactsRef.current?.length && sendSMSRef.current) {
        const targets = activeRide.contactIds
          ? contactsRef.current.filter((c) => activeRide.contactIds.includes(c.id))
          : contactsRef.current;
        const mapsLink = locationRef.current
          ? `https://www.google.com/maps?q=${locationRef.current.lat},${locationRef.current.lng}`
          : '';
        const msg =
          `✅ SOS Africa — Trajet taxi terminé sain·e et sauf·ve.\n` +
          (activeRide.destination ? `📍 Destination : ${activeRide.destination}\n` : '') +
          (mapsLink ? `📌 Position : ${mapsLink}\n` : '');
        try {
          await sendSMSRef.current(targets, msg);
        } catch {}
      }
      const newHist = [ended, ...readHistory()].slice(0, 30);
      writeHistory(newHist);
      setHistory(newHist);
      setActiveRide(null);
      writeActive(null);
      setPendingCheckIn(false);
      setPendingCheckInDeadline(null);
    },
    [activeRide]
  );

  // Cancel ride without alert (e.g., changed mind)
  const cancelRide = useCallback(() => {
    if (!activeRide) return;
    const ended = { ...activeRide, endedAt: Date.now(), outcome: 'cancelled' };
    const newHist = [ended, ...readHistory()].slice(0, 30);
    writeHistory(newHist);
    setHistory(newHist);
    setActiveRide(null);
    writeActive(null);
    setPendingCheckIn(false);
    setPendingCheckInDeadline(null);
  }, [activeRide]);

  // Derived: time elapsed in min
  const elapsedMin = activeRide
    ? Math.floor((Date.now() - activeRide.startedAt) / 60000)
    : 0;
  const overdue = activeRide && Date.now() > activeRide.expectedArrivalAt + FINAL_GRACE_MS;

  return {
    activeRide,
    history,
    pendingCheckIn,
    pendingCheckInDeadline,
    elapsedMin,
    overdue,
    startRide,
    confirmCheckIn,
    triggerManualAlert,
    endRide,
    cancelRide,
  };
};

export default useTaxiRide;
