import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

const STORAGE_KEY = 'sos_premium_status';

// Free tier limits — used by features to know when to gate
export const FREE_LIMITS = {
  audio: { maxFiles: 3, maxDurationSec: 60 },        // 1 min, 3 fichiers
  ai: { maxQuestionsPerDay: 5 },                      // 5 questions / 24h
  family: { maxMembers: 2 },                          // 2 membres
  video: { allowed: false },                          // bloque entierement
  pushNotifs: { allowed: false },                     // bloque
  cloudHistory: { allowed: false },                   // bloque
  childTracking: { allowed: false },                  // bloque
};

const PREMIUM_LIMITS = {
  audio: { maxFiles: 100, maxDurationSec: 1800 },     // 30 min, 100 fichiers
  ai: { maxQuestionsPerDay: 200 },                    // generous
  family: { maxMembers: 5 },                          // 5 membres
  video: { allowed: true },
  pushNotifs: { allowed: true },
  cloudHistory: { allowed: true },
  childTracking: { allowed: true },
};

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};

const writeLocal = (data) => {
  try {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

const isStatusActive = (status) => {
  if (!status) return false;
  if (status.active !== true) return false;
  if (status.until && Date.now() > status.until) return false;
  return true;
};

/**
 * Hook qui retourne le statut Premium :
 *   - isPremium, plan, until
 *   - limits (free ou premium selon statut)
 *   - activateCode(code) : valide un code dans Firestore et active
 *   - deactivate() : retire le statut local
 *   - refresh() : refetch depuis Firestore
 *
 * Premier check : localStorage (instantane). Puis sync Firestore en background.
 */
export const usePremiumStatus = (userId) => {
  const [status, setStatus] = useState(() => readLocal());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isPremium = isStatusActive(status);
  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  // Sync from Firestore on mount + listen
  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const remote = data.premium || null;
        if (remote) {
          const merged = {
            active: !!remote.active,
            plan: remote.plan || 'monthly',
            until: remote.until?.toMillis?.() || remote.until || null,
            activatedAt:
              remote.activatedAt?.toMillis?.() || remote.activatedAt || null,
            code: remote.code || null,
          };
          setStatus(merged);
          writeLocal(merged);
        }
      },
      (err) => {
        console.error('Premium listener error:', err);
        setError(err.message);
      }
    );
    return () => unsub();
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const remote = snap.data().premium;
        if (remote) {
          const merged = {
            active: !!remote.active,
            plan: remote.plan || 'monthly',
            until: remote.until?.toMillis?.() || remote.until || null,
          };
          setStatus(merged);
          writeLocal(merged);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Active Premium en validant un code stocké dans Firestore
   * collection 'premiumCodes/{CODE}' :
   *   { used: bool, plan: 'monthly'|'yearly'|'family', durationDays: int }
   *
   * Si le code est valide :
   *   - Marque le code comme utilise (used=true, usedBy=userId, usedAt)
   *   - Cree/maj le doc users/{userId} avec premium.active=true
   *   - Persiste localement
   */
  const activateCode = useCallback(
    async (rawCode) => {
      if (!userId) {
        return { ok: false, error: 'Profil utilisateur requis' };
      }
      const code = String(rawCode || '').trim().toUpperCase();
      if (code.length < 4) {
        return { ok: false, error: 'Code trop court' };
      }
      setLoading(true);
      setError(null);
      try {
        const codeRef = doc(db, 'premiumCodes', code);
        const codeSnap = await getDoc(codeRef);
        if (!codeSnap.exists()) {
          return { ok: false, error: 'Code invalide.' };
        }
        const codeData = codeSnap.data();
        if (codeData.used) {
          return {
            ok: false,
            error: 'Ce code a déjà été utilisé.',
          };
        }

        const plan = codeData.plan || 'monthly';
        const days =
          codeData.durationDays ||
          (plan === 'yearly' ? 365 : plan === 'family' ? 30 : 30);
        const until = Date.now() + days * 24 * 60 * 60 * 1000;

        // Mark code used
        await updateDoc(codeRef, {
          used: true,
          usedBy: userId,
          usedAt: serverTimestamp(),
        });

        // Activate user
        await setDoc(
          doc(db, 'users', userId),
          {
            premium: {
              active: true,
              plan,
              until,
              code,
              activatedAt: serverTimestamp(),
            },
          },
          { merge: true }
        );

        const merged = { active: true, plan, until, code };
        setStatus(merged);
        writeLocal(merged);
        return { ok: true, plan, until };
      } catch (err) {
        console.error('activateCode error:', err);
        const msg =
          err.code === 'permission-denied'
            ? 'Permission refusée. Vérifie les Firestore Rules.'
            : 'Erreur de connexion. Vérifie ta connexion internet.';
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const deactivate = useCallback(() => {
    setStatus(null);
    writeLocal(null);
  }, []);

  return {
    isPremium,
    plan: status?.plan || 'free',
    until: status?.until || null,
    code: status?.code || null,
    limits,
    loading,
    error,
    activateCode,
    deactivate,
    refresh,
  };
};

// Helpers pour les daily counters (usage IA, etc.)
export const incrementDailyCounter = (key, max) => {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `sos_counter_${key}_${today}`;
  const count = parseInt(localStorage.getItem(storageKey) || '0', 10);
  if (count >= max) {
    return { allowed: false, count, max };
  }
  localStorage.setItem(storageKey, String(count + 1));
  return { allowed: true, count: count + 1, max };
};

export const getDailyCounter = (key) => {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `sos_counter_${key}_${today}`;
  return parseInt(localStorage.getItem(storageKey) || '0', 10);
};

export default usePremiumStatus;
