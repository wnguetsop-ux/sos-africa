// Vercel Serverless Function — Envoie un push FCM à un ou plusieurs utilisateurs
// Requires : FIREBASE_SERVICE_ACCOUNT (JSON service account complet en string)
//
// Usage côté client :
//   await fetch('/api/push/send', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       userIds: ['william', 'sarah'],
//       title: '📍 Sarah vient d\'arriver à l\'école',
//       body: 'École de Sarah · 14:32',
//       data: { url: '/?tab=tools' },
//     }),
//   });

import admin from 'firebase-admin';

const initAdmin = () => {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var missing');
  let svc;
  try {
    svc = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT JSON invalid');
  }
  admin.initializeApp({ credential: admin.credential.cert(svc) });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initAdmin();
    const db = admin.firestore();
    const { userIds, phones, familyId, title, body, data } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    let targetUserIds = Array.isArray(userIds) ? [...userIds] : [];

    // If familyId provided, expand to all family members
    if (familyId) {
      const membersSnap = await db
        .collection('families')
        .doc(familyId)
        .collection('members')
        .get();
      membersSnap.forEach((d) => {
        if (!targetUserIds.includes(d.id)) targetUserIds.push(d.id);
      });
    }

    // Fetch tokens by direct userId
    const tokensSet = new Set();
    for (const uid of targetUserIds) {
      try {
        const doc = await db.collection('fcmTokens').doc(uid).get();
        if (doc.exists && doc.data()?.token) tokensSet.add(doc.data().token);
      } catch (e) {
        // continue
      }
    }

    // Lookup tokens by phone (matching last 9 digits — tolerant)
    if (Array.isArray(phones) && phones.length) {
      const tails = phones
        .map((p) => String(p || '').replace(/\D/g, '').slice(-9))
        .filter((s) => s.length >= 8);
      if (tails.length) {
        // Firestore 'in' supports up to 30 values per query; chunk if needed
        const chunks = [];
        for (let i = 0; i < tails.length; i += 30) {
          chunks.push(tails.slice(i, i + 30));
        }
        for (const ch of chunks) {
          try {
            const snap = await db
              .collection('fcmTokens')
              .where('phoneTail', 'in', ch)
              .get();
            snap.forEach((d) => {
              const t = d.data()?.token;
              if (t) tokensSet.add(t);
            });
          } catch (e) {
            console.warn('phoneTail query failed:', e.message);
          }
        }
      }
    }

    if (!targetUserIds.length && !phones?.length) {
      return res.status(400).json({ error: 'No target users or phones' });
    }

    const tokens = Array.from(tokensSet);

    if (!tokens.length) {
      return res.status(200).json({
        sent: 0,
        targets: targetUserIds.length,
        phonesQueried: (phones || []).length,
        note: "Aucun token FCM trouvé. Le destinataire doit avoir activé les notifications dans son profil SOS Africa.",
      });
    }

    const message = {
      tokens,
      notification: { title: String(title), body: String(body) },
      data: Object.fromEntries(
        Object.entries(data || {}).map(([k, v]) => [k, String(v)])
      ),
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          requireInteraction: false,
        },
      },
    };

    const result = await admin.messaging().sendEachForMulticast(message);

    // Cleanup invalid tokens
    if (result.failureCount > 0) {
      const invalidTokens = [];
      result.responses.forEach((r, idx) => {
        if (
          !r.success &&
          (r.error?.code === 'messaging/registration-token-not-registered' ||
            r.error?.code === 'messaging/invalid-registration-token')
        ) {
          invalidTokens.push(tokens[idx]);
        }
      });
      if (invalidTokens.length) {
        // Remove from Firestore
        const usersSnap = await db.collection('fcmTokens').get();
        for (const d of usersSnap.docs) {
          if (invalidTokens.includes(d.data()?.token)) {
            await d.ref.delete();
          }
        }
      }
    }

    return res.status(200).json({
      sent: result.successCount,
      failed: result.failureCount,
      targets: targetUserIds.length,
    });
  } catch (err) {
    console.error('push/send error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
