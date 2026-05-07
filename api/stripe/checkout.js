// Vercel Serverless Function — Crée une session Stripe Checkout
// Requires : STRIPE_SECRET_KEY + STRIPE_PRICE_MONTHLY/YEARLY/FAMILY env vars

import Stripe from 'stripe';

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
  family: process.env.STRIPE_PRICE_FAMILY,
};

const PLAN_DAYS = { monthly: 30, yearly: 365, family: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(503).json({
      error: 'Stripe not configured',
      hint: "STRIPE_SECRET_KEY n'est pas défini dans les env vars Vercel.",
    });
  }

  try {
    const { plan, userId, userEmail, origin } = req.body || {};

    if (!plan || !PRICE_IDS[plan]) {
      return res.status(400).json({
        error: 'Plan invalide',
        hint: 'Utilise plan = monthly | yearly | family',
      });
    }
    if (!PRICE_IDS[plan]) {
      return res.status(503).json({
        error: `Price ID manquant pour le plan "${plan}"`,
        hint: `Ajoute STRIPE_PRICE_${plan.toUpperCase()} dans Vercel env vars.`,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const baseUrl =
      origin ||
      (req.headers.origin ? req.headers.origin : 'https://sos-africa.vercel.app');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      // Pre-fill customer email if provided
      customer_email: userEmail || undefined,
      // Important: store userId so the webhook can activate the right user
      client_reference_id: userId || 'anonymous',
      metadata: {
        userId: userId || 'anonymous',
        plan,
        durationDays: String(PLAN_DAYS[plan] || 30),
      },
      subscription_data: {
        metadata: {
          userId: userId || 'anonymous',
          plan,
        },
      },
      success_url: `${baseUrl}/?stripe=success&plan=${plan}`,
      cancel_url: `${baseUrl}/?stripe=cancel`,
      // Locale FR par défaut
      locale: 'fr',
      // Allow promotion codes (codes promo Stripe)
      allow_promotion_codes: true,
    });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({
      error: err.message || 'Internal error',
    });
  }
}
