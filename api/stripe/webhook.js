// Vercel Serverless Function — Stripe Webhook
// Reçoit les events Stripe et active/desactive le Premium dans Firestore.
//
// Setup côté Stripe (https://dashboard.stripe.com/webhooks) :
//  1. Créer un endpoint pointant sur https://sos-africa.vercel.app/api/stripe/webhook
//  2. Sélectionner ces events : checkout.session.completed, customer.subscription.deleted,
//     invoice.payment_succeeded, invoice.payment_failed
//  3. Copier le 'Signing secret' et le mettre dans STRIPE_WEBHOOK_SECRET sur Vercel
//
// Côté Vercel, config nécessaire :
//   STRIPE_SECRET_KEY        = sk_live_... ou sk_test_...
//   STRIPE_WEBHOOK_SECRET    = whsec_...
//   FIREBASE_SERVICE_ACCOUNT = JSON complet du service account (en string)

import Stripe from 'stripe';
import admin from 'firebase-admin';

// Vercel needs raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const PLAN_DAYS = { monthly: 30, yearly: 365, family: 30 };

// Initialize firebase-admin once (singleton)
const initAdmin = () => {
  if (admin.apps.length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is missing');
  }
  let serviceAccount;
  try {
    serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT JSON is invalid');
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    console.error('Stripe webhook: missing env vars');
    return res.status(503).send('Stripe webhook not configured');
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

  let event;
  try {
    const raw = await readRawBody(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    initAdmin();
    const db = admin.firestore();

    switch (event.type) {
      // First payment / subscription created
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || 'monthly';
        const days = parseInt(session.metadata?.durationDays || '30', 10);
        if (!userId) break;
        const until = Date.now() + days * 24 * 60 * 60 * 1000;
        await db
          .collection('users')
          .doc(userId)
          .set(
            {
              premium: {
                active: true,
                plan,
                until,
                stripeCustomerId: session.customer || null,
                stripeSubscriptionId: session.subscription || null,
                stripeSessionId: session.id,
                activatedAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'stripe',
              },
            },
            { merge: true }
          );
        // Log payment for the admin dashboard
        await db.collection('payments').add({
          userId,
          plan,
          amount: session.amount_total || null,
          currency: session.currency || 'eur',
          method: 'stripe_card',
          status: 'approved',
          stripeSessionId: session.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Premium activated for ${userId} (${plan}, ${days}j)`);
        break;
      }

      // Recurring renewal
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.userId;
        const plan = sub.metadata?.plan || 'monthly';
        if (!userId) break;
        const days = PLAN_DAYS[plan] || 30;
        const until = Date.now() + days * 24 * 60 * 60 * 1000;
        await db
          .collection('users')
          .doc(userId)
          .set(
            {
              premium: {
                active: true,
                plan,
                until,
                renewedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
            },
            { merge: true }
          );
        console.log(`Subscription renewed for ${userId}`);
        break;
      }

      // Cancellation
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await db
          .collection('users')
          .doc(userId)
          .set(
            {
              premium: {
                active: false,
                cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
              },
            },
            { merge: true }
          );
        console.log(`Premium revoked for ${userId}`);
        break;
      }

      case 'invoice.payment_failed': {
        // Optionnel : notifier l'utilisateur via push/email
        console.log('Payment failed for invoice', event.data.object.id);
        break;
      }

      default:
        // ignore
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send(`Server error: ${err.message}`);
  }
}
