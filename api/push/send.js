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
    const { userIds, familyId, title, body, data } = req.body || {};

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

    if (!targetUserIds.length) {
      return res.status(400).json({ error: 'No target users' });
    }

    // Fetch tokens
    const tokens = [];
    for (const uid of targetUserIds) {
      try {
        const doc = await db.collection('fcmTokens').doc(uid).get();
        if (doc.exists && doc.data()?.token) tokens.push(doc.data().token);
      } catch (e) {
        // continue
      }
    }

    if (!tokens.length) {
      return res.status(200).json({
        sent: 0,
        targets: targetUserIds.length,
        note: 'No FCM tokens registered for these users',
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
