// Vercel Serverless Function — Envoie un SMS via Africa's Talking
// Requires :
//   AFRICAS_TALKING_API_KEY      = atsk_... (depuis dashboard AT)
//   AFRICAS_TALKING_USERNAME     = 'sandbox' pour test, ton username pour prod
//   AFRICAS_TALKING_SENDER_ID    = (optionnel) shortcode/sender id approuve
//
// Usage cote client :
//   await fetch('/api/sms/send', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       phones: ['+237651495483', '+237600000000'],
//       message: 'SOS! J\'ai besoin d\'aide. Position : https://...',
//     }),
//   });
//
// Tarif sandbox : gratuit (limites strictes de test)
// Tarif prod Cameroun : ~6 XAF/SMS (varie selon volume)

const SANDBOX_URL = 'https://api.sandbox.africastalking.com/version1/messaging';
const PROD_URL = 'https://api.africastalking.com/version1/messaging';

// Normalise au format E.164 international (+237xxxxxxxxx)
const normalizePhone = (raw, defaultCountryCode = '237') => {
  if (!raw) return null;
  let s = String(raw).replace(/[^\d+]/g, '');
  if (!s) return null;
  // 00xxx → +xxx
  if (s.startsWith('00')) s = '+' + s.slice(2);
  // Si pas de +, on prefixe avec le code pays par defaut (Cameroun)
  if (!s.startsWith('+')) {
    // Si commence deja par le code pays sans le +, ne pas le doubler
    if (s.startsWith(defaultCountryCode)) s = '+' + s;
    else s = '+' + defaultCountryCode + s;
  }
  return s;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  const username = process.env.AFRICAS_TALKING_USERNAME || 'sandbox';
  const senderId = process.env.AFRICAS_TALKING_SENDER_ID || null;
  const defaultCountry = process.env.AFRICAS_TALKING_DEFAULT_COUNTRY || '237';

  if (!apiKey) {
    return res.status(503).json({
      error: 'SMS not configured',
      hint:
        "AFRICAS_TALKING_API_KEY n'est pas defini dans les env vars Vercel. " +
        "Inscription : https://account.africastalking.com",
    });
  }

  try {
    const { phones, message } = req.body || {};
    if (!Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ error: 'phones[] required' });
    }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message (string) required' });
    }
    if (message.length > 700) {
      return res.status(400).json({ error: 'message too long (max 700 chars)' });
    }

    // Normalise et dedupe
    const normalized = Array.from(
      new Set(
        phones
          .map((p) => normalizePhone(p, defaultCountry))
          .filter(Boolean)
      )
    );
    if (!normalized.length) {
      return res.status(400).json({ error: 'no valid phone after normalization' });
    }

    const isProd = username !== 'sandbox';
    const url = isProd ? PROD_URL : SANDBOX_URL;

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('to', normalized.join(','));
    formData.append('message', message);
    if (senderId) formData.append('from', senderId);

    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('AfricasTalking error:', upstream.status, data);
      return res.status(502).json({
        error: 'AT provider error',
        status: upstream.status,
        details: data,
      });
    }

    // AT response shape:
    // { SMSMessageData: { Message, Recipients: [{statusCode, status, number, cost, messageId}] } }
    const recipients = data?.SMSMessageData?.Recipients || [];
    const sent = recipients.filter((r) =>
      // codes >= 100 et < 200 = succes (Sent, Submitted)
      typeof r.statusCode === 'number'
        ? r.statusCode >= 100 && r.statusCode < 200
        : ['Sent', 'Submitted', 'Success'].includes(r.status)
    ).length;

    return res.status(200).json({
      sent,
      total: recipients.length,
      message: data?.SMSMessageData?.Message,
      recipients,
      mode: isProd ? 'production' : 'sandbox',
    });
  } catch (err) {
    console.error('SMS handler error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
