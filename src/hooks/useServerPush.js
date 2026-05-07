// Helper pour declencher un push serveur via /api/push/send
// Utilise depuis n'importe quel composant — le serveur fanout aux membres famille.

export const sendServerPush = async ({ userIds, familyId, title, body, data }) => {
  try {
    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, familyId, title, body, data: data || {} }),
    });
    if (!res.ok) {
      console.warn('push/send returned', res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('push/send failed:', err);
    return null;
  }
};

export default sendServerPush;
