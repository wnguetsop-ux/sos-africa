import { useCallback, useState } from 'react';

/**
 * Hook pour l'envoi de SMS et WhatsApp d'urgence
 * Utilise le plugin Capacitor SMS ou fallback vers liens SMS/WhatsApp
 */
export const useSMS = () => {
  const [sendingStatus, setSendingStatus] = useState({});
  
  // Envoyer SMS via Capacitor (si disponible) ou ouvrir l'app SMS
  const sendSMS = useCallback(async (contacts, message) => {
    if (!contacts || contacts.length === 0) {
      console.warn('Aucun contact d\'urgence configuré');
      return { success: false, error: 'Aucun contact' };
    }

    const phoneNumbers = contacts.map(c => c.phone);

    try {
      // Essayer le plugin Capacitor SMS natif
      const { SmsManager } = await import('@byteowls/capacitor-sms');
      
      // Envoyer à chaque contact
      for (const phone of phoneNumbers) {
        await SmsManager.send({
          numbers: [phone],
          text: message
        });
      }
      
      return { success: true, method: 'native' };
      
    } catch (err) {
      console.log('Plugin SMS natif non disponible, utilisation du lien SMS');
      
      // Fallback: ouvrir l'application SMS avec le message pré-rempli
      const smsLink = generateSMSLink(contacts, null, message);
      
      try {
        window.open(smsLink, '_system');
        return { success: true, method: 'link' };
      } catch (linkErr) {
        // Dernier recours: copier dans le presse-papier
        try {
          await navigator.clipboard.writeText(message);
          return { 
            success: true, 
            method: 'clipboard',
            message: 'Message copié dans le presse-papier'
          };
        } catch (clipErr) {
          return { success: false, error: 'Impossible d\'envoyer le SMS' };
        }
      }
    }
  }, []);

  // ========== WHATSAPP INTEGRATION ==========

  // Envoyer à un contact WhatsApp
  const sendWhatsApp = useCallback(async (phone, message) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    try {
      window.open(waLink, '_blank');
      return { success: true, method: 'whatsapp' };
    } catch (err) {
      console.error('Erreur WhatsApp:', err);
      return { success: false, error: 'Impossible d\'ouvrir WhatsApp' };
    }
  }, []);

  // Envoyer alerte WhatsApp à tous les contacts
  const sendWhatsAppToAll = useCallback(async (contacts, location, customMessage = null) => {
    if (!contacts || contacts.length === 0) {
      return { success: false, error: 'Aucun contact' };
    }

    const mapsLink = location 
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : "Position GPS indisponible";
    
    const accuracy = location ? `${Math.round(location.accuracy)}m` : "N/A";
    
    const message = customMessage || 
`🆘 *URGENCE SOS AFRICA!*

❗ J'ai besoin d'aide immédiate!

📍 *Ma position:*
${mapsLink}

📏 Précision: ${accuracy}
⏰ Heure: ${new Date().toLocaleString('fr-FR')}

_Ce message a été envoyé automatiquement via SOS Africa._`;

    const results = [];
    
    // Ouvrir WhatsApp pour chaque contact séquentiellement
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      setSendingStatus({ current: i + 1, total: contacts.length, contact: contact.name });
      
      const result = await sendWhatsApp(contact.phone, message);
      results.push({ contact: contact.name, ...result });
      
      // Attendre un peu entre chaque envoi
      if (i < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    setSendingStatus({});
    
    return {
      success: results.every(r => r.success),
      results,
      method: 'whatsapp_multi'
    };
  }, [sendWhatsApp]);

  // Partager la position via WhatsApp (envoi unique à sélectionner)
  const shareLocationWhatsApp = useCallback((location) => {
    if (!location) {
      return { success: false, error: 'Position non disponible' };
    }

    const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const message = 
`📍 *Ma position actuelle - SOS Africa*

🗺️ ${mapsLink}

📏 Précision: ${Math.round(location.accuracy)}m
⏰ ${new Date().toLocaleString('fr-FR')}`;

    const encodedMessage = encodeURIComponent(message);
    
    // Ouvrir WhatsApp sans numéro spécifique (l'utilisateur choisit)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    
    return { success: true, method: 'whatsapp_share' };
  }, []);

  // Envoyer un message d'arrivée
  const sendArrivalWhatsApp = useCallback((contacts, destinationName) => {
    const message = 
`✅ *Arrivée confirmée - SOS Africa*

🎉 Je suis bien arrivé(e) à: ${destinationName || 'destination'}
⏰ Heure: ${new Date().toLocaleTimeString('fr-FR')}

Merci de m'avoir accompagné(e)! 🙏`;

    if (contacts && contacts.length > 0) {
      return sendWhatsApp(contacts[0].phone, message);
    }
    
    return shareLocationWhatsApp({ message });
  }, [sendWhatsApp]);

  // Vérifier si WhatsApp est installé (heuristique)
  const isWhatsAppAvailable = useCallback(() => {
    // Sur mobile, on suppose que WhatsApp est installé
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|iphone|ipad|ipod/.test(userAgent);
  }, []);

  // Générer un lien SMS compatible multi-plateforme
  const generateSMSLink = useCallback((contacts, location, customMessage = null) => {
    if (!contacts || contacts.length === 0) return '#';

    const phoneNumbers = contacts.map(c => c.phone).join(',');
    
    const mapsLink = location 
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : "Position GPS indisponible";
    
    const accuracy = location ? `${Math.round(location.accuracy)}m` : "N/A";
    
    const message = customMessage || 
      `🆘 URGENCE!\n\nJ'ai besoin d'aide!\n📍 Position: ${mapsLink}\n📏 Précision: ${accuracy}\n⏰ ${new Date().toLocaleString('fr-FR')}`;

    const encodedMessage = encodeURIComponent(message);

    // Détecter la plateforme pour le bon format de lien
    const userAgent = navigator.userAgent || '';
    
    if (/android/i.test(userAgent)) {
      // Android
      return `sms:${phoneNumbers}?body=${encodedMessage}`;
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      // iOS
      return `sms:${phoneNumbers}&body=${encodedMessage}`;
    } else {
      // Fallback générique
      return `sms:${phoneNumbers}?body=${encodedMessage}`;
    }
  }, []);

  // Générer un lien WhatsApp (populaire en Afrique)
  const generateWhatsAppLink = useCallback((phone, location) => {
    const mapsLink = location 
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : "Position GPS indisponible";
    
    const message = `🆘 URGENCE SOS AFRICA!\n\nJ'ai besoin d'aide immédiate!\n\n📍 Ma position: ${mapsLink}\n⏰ ${new Date().toLocaleString('fr-FR')}\n\nCe message a été envoyé automatiquement.`;
    
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }, []);

  // Appeler un contact
  const callContact = useCallback((phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.open(`tel:${cleanPhone}`, '_system');
  }, []);

  return {
    // SMS
    sendSMS,
    generateSMSLink,
    
    // WhatsApp
    sendWhatsApp,
    sendWhatsAppToAll,
    shareLocationWhatsApp,
    sendArrivalWhatsApp,
    generateWhatsAppLink,
    isWhatsAppAvailable,
    sendingStatus,
    
    // Appel
    callContact
  };
};

export default useSMS;