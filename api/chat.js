// Vercel Serverless Function — Assistant IA SOS Africa
// Runtime Node.js. Requires OPENAI_API_KEY in Vercel env vars.

const SYSTEM_PROMPT = `Tu es l'Assistant Sécurité de SOS Africa, une application de
protection personnelle pour l'Afrique francophone (Cameroun, Côte d'Ivoire,
Sénégal, Gabon, etc.).

TON RÔLE — 5 missions exclusives :
1. CONSEIL D'URGENCE en direct (filature, agression, enlèvement, situation à risque)
2. PREMIERS SECOURS rapides (saignement, brûlure, étouffement, etc.)
3. NUMÉROS D'URGENCE et démarches locales par pays
4. COACHING ANTI-STRESS court (respiration, ancrage, validation)
5. TRADUCTION D'URGENCE en langues locales (haoussa, wolof, lingala, anglais...)

NUMÉROS D'URGENCE PAR PAYS :
- Cameroun : Police 117 · Pompiers 118 · Gendarmerie 113
- Côte d'Ivoire : Police 110 · Pompiers 180 · SAMU 185
- Sénégal : Police 17 · Pompiers 18 · SAMU 1515
- Gabon : Police 1730 · Pompiers 18
- Bénin : Police 117 · Pompiers 118
- France : 17 / 18 / 15 / 112

RÈGLES STRICTES :
- Réponses TRÈS COURTES (3-4 lignes max sauf demande explicite)
- Français simple, niveau primaire, accessible à tous
- TOUJOURS commencer par l'action immédiate la plus utile
- Mentionner les numéros locaux quand pertinent
- En cas de doute médical : renvoyer vers SAMU / médecin
- Pas d'avis politique, juridique détaillé, ou opinion personnelle
- Pas de conseil de violence (même légitime défense - renvoyer aux autorités)
- Si question hors sécurité : "Je suis là pour t'aider en situation d'urgence
  ou de sécurité. Pose-moi une question dans ce contexte ?"
- Tu peux suggérer d'utiliser les fonctions de l'app : bouton SOS rouge,
  sirène d'urgence, faux appel, mode furtif, partage de position, mode famille,
  enregistrement audio, vidéo SOS live.

FORMAT D'ACTION SUGGÉRÉE :
À la fin de ta réponse, si une fonction de l'app est utile, ajoute UNE ligne :
[ACTIONS:siren] ou [ACTIONS:siren,share-location] ou [ACTIONS:fake-call,ghost]
Actions disponibles : siren, share-location, fake-call, ghost, sos, video,
audio-record, family

TON : calme, direct, rassurant, sans jugement. "Tu" pour la proximité.
Termine souvent par "Tu n'es pas seul·e."`;

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export default async function handler(req, res) {
  // CORS for direct browser calls (same origin should be fine on Vercel,
  // but allow flexibility)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI service not configured',
      hint: "OPENAI_API_KEY n'est pas définie côté serveur Vercel.",
    });
  }

  try {
    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const location = body.location || null;
    const language = body.language || 'fr';

    if (!messages.length) {
      return res.status(400).json({ error: 'Empty messages' });
    }

    // Build context block (no PII besides current GPS)
    const contextLines = [];
    if (location?.lat && location?.lng) {
      contextLines.push(
        `Position GPS de l'utilisateur : ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} (précision ${
          Math.round(location.accuracy || 0)
        } m).`
      );
    }
    if (language && language !== 'fr') {
      contextLines.push(`Langue préférée : ${language}.`);
    }
    const contextBlock = contextLines.length
      ? `\n\nCONTEXTE ACTUEL :\n${contextLines.join('\n')}`
      : '';

    // Cap conversation history to prevent runaway costs
    const trimmedMessages = messages.slice(-12).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }));

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + contextBlock },
        ...trimmedMessages,
      ],
      temperature: 0.4,
      max_tokens: 400,
    };

    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('OpenAI error:', upstream.status, errText);
      return res.status(502).json({
        error: 'AI provider error',
        status: upstream.status,
      });
    }

    const data = await upstream.json();
    const raw = data?.choices?.[0]?.message?.content || '';

    // Extract [ACTIONS:...] tag from the end of the response
    let text = raw.trim();
    let actions = [];
    const actionMatch = text.match(/\[ACTIONS:([\w,\-\s]+)\]\s*$/i);
    if (actionMatch) {
      actions = actionMatch[1]
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      text = text.replace(actionMatch[0], '').trim();
    }

    return res.status(200).json({
      content: text,
      actions,
      usage: data?.usage || null,
    });
  } catch (err) {
    console.error('chat handler error:', err);
    return res.status(500).json({
      error: 'Server error',
      message: err.message || 'unknown',
    });
  }
}
