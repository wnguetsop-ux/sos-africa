import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour la gestion du système Premium
 * Gère les limites gratuites et les fonctionnalités payantes
 */
export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState('free'); // free, basic, pro, enterprise
  const [expirationDate, setExpirationDate] = useState(null);
  const [usageStats, setUsageStats] = useState({
    contactsUsed: 0,
    alertsSent: 0,
    recordingsCount: 0,
    journeysCompleted: 0
  });
  const [limits, setLimits] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState(null);

  // Configuration des plans - TOUT GRATUIT
  const PLANS = {
    free: {
      name: 'Gratuit',
      price: 0,
      currency: 'XAF',
      period: null,
      limits: {
        maxContacts: -1, // Illimité
        maxAlertsPerMonth: -1, // Illimité
        maxRecordings: -1, // Illimité
        recordingDuration: 1800, // 30 minutes
        maxJourneys: -1, // Illimité
        communityAlerts: true,
        audioRecording: true,
        journeyMode: true,
        ghostMode: true,
        fakeCall: true,
        siren: true,
        whatsappShare: true,
        historyDays: 365,
        adsEnabled: false
      },
      features: [
        'Contacts illimités',
        'Bouton SOS',
        'Mode Ghost',
        'Faux appel',
        'Sirène d\'urgence',
        'Enregistrement audio 30min',
        'Alertes communautaires',
        'Partage WhatsApp',
        'Trajets surveillés illimités',
        '100% Gratuit!'
      ]
    },
    basic: {
      name: 'Basic',
      price: 2000, // 2000 XOF ≈ 3 USD
      currency: 'XOF',
      period: 'month',
      limits: {
        maxContacts: 10,
        maxAlertsPerMonth: 50,
        maxRecordings: 20,
        recordingDuration: 300, // 5 minutes
        maxJourneys: 30,
        communityAlerts: true,
        audioRecording: true,
        journeyMode: true,
        ghostMode: true,
        fakeCall: true,
        siren: true,
        whatsappShare: true,
        historyDays: 30,
        adsEnabled: false
      },
      features: [
        '10 contacts d\'urgence',
        'Enregistrement audio 5min',
        'Alertes communautaires',
        'Partage WhatsApp',
        'Trajets illimités',
        'Sans publicité',
        'Historique 30 jours'
      ]
    },
    pro: {
      name: 'Pro',
      price: 5000, // 5000 XOF ≈ 7.5 USD
      currency: 'XOF',
      period: 'month',
      limits: {
        maxContacts: -1, // Illimité
        maxAlertsPerMonth: -1,
        maxRecordings: 100,
        recordingDuration: 1800, // 30 minutes
        maxJourneys: -1,
        communityAlerts: true,
        audioRecording: true,
        journeyMode: true,
        ghostMode: true,
        fakeCall: true,
        siren: true,
        whatsappShare: true,
        historyDays: 90,
        adsEnabled: false,
        prioritySupport: true,
        cloudBackup: true
      },
      features: [
        'Contacts illimités',
        'Enregistrement 30min',
        'Alertes communautaires prioritaires',
        'Sauvegarde cloud',
        'Support prioritaire',
        'Historique 90 jours',
        'Badge Pro visible'
      ]
    },
    enterprise: {
      name: 'Entreprise',
      price: null, // Sur devis
      currency: 'XOF',
      period: 'year',
      limits: {
        maxContacts: -1,
        maxAlertsPerMonth: -1,
        maxRecordings: -1,
        recordingDuration: -1,
        maxJourneys: -1,
        communityAlerts: true,
        audioRecording: true,
        journeyMode: true,
        ghostMode: true,
        fakeCall: true,
        siren: true,
        whatsappShare: true,
        historyDays: 365,
        adsEnabled: false,
        prioritySupport: true,
        cloudBackup: true,
        dashboard: true,
        apiAccess: true,
        multiUser: true
      },
      features: [
        'Tout illimité',
        'Dashboard entreprise',
        'Gestion multi-utilisateurs',
        'API d\'intégration',
        'Support dédié 24/7',
        'Formation incluse',
        'Personnalisation'
      ]
    }
  };

  // Charger l'état premium
  useEffect(() => {
    loadPremiumStatus();
    loadUsageStats();
  }, []);

  // Charger le statut premium
  const loadPremiumStatus = () => {
    try {
      const stored = localStorage.getItem('sos_premium');
      if (stored) {
        const data = JSON.parse(stored);
        setPlan(data.plan || 'free');
        setIsPremium(data.plan !== 'free');
        setExpirationDate(data.expirationDate ? new Date(data.expirationDate) : null);
        setLimits(PLANS[data.plan || 'free'].limits);
      } else {
        setPlan('free');
        setLimits(PLANS.free.limits);
      }
    } catch (err) {
      console.error('Erreur chargement premium:', err);
      setPlan('free');
      setLimits(PLANS.free.limits);
    }
  };

  // Charger les statistiques d'utilisation
  const loadUsageStats = () => {
    try {
      const stored = localStorage.getItem('sos_usage_stats');
      if (stored) {
        const data = JSON.parse(stored);
        // Réinitialiser si nouveau mois
        const lastReset = new Date(data.lastReset || 0);
        const now = new Date();
        if (lastReset.getMonth() !== now.getMonth() || 
            lastReset.getFullYear() !== now.getFullYear()) {
          resetMonthlyStats();
        } else {
          setUsageStats(data);
        }
      }
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  // Réinitialiser les stats mensuelles
  const resetMonthlyStats = () => {
    const newStats = {
      contactsUsed: 0,
      alertsSent: 0,
      recordingsCount: 0,
      journeysCompleted: 0,
      lastReset: new Date().toISOString()
    };
    setUsageStats(newStats);
    localStorage.setItem('sos_usage_stats', JSON.stringify(newStats));
  };

  // Sauvegarder les stats
  const saveUsageStats = (newStats) => {
    const updated = { ...usageStats, ...newStats };
    setUsageStats(updated);
    localStorage.setItem('sos_usage_stats', JSON.stringify(updated));
  };

  // Vérifier si une fonctionnalité est disponible
  const checkFeature = useCallback((feature) => {
    const currentLimits = PLANS[plan].limits;
    
    switch (feature) {
      case 'addContact':
        if (currentLimits.maxContacts === -1) return true;
        return usageStats.contactsUsed < currentLimits.maxContacts;
      
      case 'sendAlert':
        if (currentLimits.maxAlertsPerMonth === -1) return true;
        return usageStats.alertsSent < currentLimits.maxAlertsPerMonth;
      
      case 'recording':
        return currentLimits.audioRecording;
      
      case 'communityAlerts':
        return currentLimits.communityAlerts;
      
      case 'whatsapp':
        return currentLimits.whatsappShare;
      
      case 'journey':
        if (currentLimits.maxJourneys === -1) return true;
        return usageStats.journeysCompleted < currentLimits.maxJourneys;
      
      default:
        return currentLimits[feature] !== false;
    }
  }, [plan, usageStats]);

  // Essayer d'utiliser une fonctionnalité
  const useFeature = useCallback((feature, increment = 1) => {
    if (!checkFeature(feature)) {
      setBlockedFeature(feature);
      setShowUpgradeModal(true);
      return false;
    }
    
    // Incrémenter l'utilisation
    const statsKey = {
      addContact: 'contactsUsed',
      sendAlert: 'alertsSent',
      recording: 'recordingsCount',
      journey: 'journeysCompleted'
    }[feature];
    
    if (statsKey) {
      saveUsageStats({
        [statsKey]: usageStats[statsKey] + increment
      });
    }
    
    return true;
  }, [checkFeature, usageStats]);

  // Obtenir les limites restantes
  const getRemainingLimits = useCallback(() => {
    const currentLimits = PLANS[plan].limits;
    
    return {
      contacts: currentLimits.maxContacts === -1 
        ? 'Illimité' 
        : `${currentLimits.maxContacts - usageStats.contactsUsed}/${currentLimits.maxContacts}`,
      alerts: currentLimits.maxAlertsPerMonth === -1 
        ? 'Illimité' 
        : `${currentLimits.maxAlertsPerMonth - usageStats.alertsSent}/${currentLimits.maxAlertsPerMonth}`,
      recordings: currentLimits.maxRecordings === -1 
        ? 'Illimité' 
        : `${currentLimits.maxRecordings - usageStats.recordingsCount}/${currentLimits.maxRecordings}`,
      journeys: currentLimits.maxJourneys === -1 
        ? 'Illimité' 
        : `${currentLimits.maxJourneys - usageStats.journeysCompleted}/${currentLimits.maxJourneys}`,
      recordingDuration: currentLimits.recordingDuration === -1 
        ? 'Illimité' 
        : `${currentLimits.recordingDuration / 60} min`
    };
  }, [plan, usageStats]);

  // Souscrire à un plan (simulation)
  const subscribeToPlan = useCallback(async (newPlan) => {
    try {
      // Dans une vraie app, intégrer un système de paiement
      // (Mobile Money, Orange Money, Wave, Stripe, etc.)
      
      console.log('Souscription au plan:', newPlan);
      
      // Simuler le paiement réussi
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      
      const premiumData = {
        plan: newPlan,
        expirationDate: expirationDate.toISOString(),
        subscribedAt: new Date().toISOString()
      };
      
      localStorage.setItem('sos_premium', JSON.stringify(premiumData));
      
      setPlan(newPlan);
      setIsPremium(newPlan !== 'free');
      setExpirationDate(expirationDate);
      setLimits(PLANS[newPlan].limits);
      setShowUpgradeModal(false);
      
      return true;
    } catch (err) {
      console.error('Erreur souscription:', err);
      return false;
    }
  }, []);

  // Annuler l'abonnement
  const cancelSubscription = useCallback(async () => {
    // L'utilisateur garde l'accès jusqu'à la fin de la période
    console.log('Abonnement annulé, accès jusqu\'au:', expirationDate);
    return true;
  }, [expirationDate]);

  // Restaurer les achats
  const restorePurchases = useCallback(async () => {
    // Vérifier les achats précédents via le store
    console.log('Restauration des achats...');
    loadPremiumStatus();
  }, []);

  // Vérifier si l'abonnement est expiré
  const isExpired = useCallback(() => {
    if (!isPremium || !expirationDate) return false;
    return new Date() > new Date(expirationDate);
  }, [isPremium, expirationDate]);

  // Formater le prix
  const formatPrice = (price, currency = 'XOF') => {
    if (price === null) return 'Sur devis';
    if (price === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  // Obtenir le message de blocage
  const getBlockedMessage = (feature) => {
    const messages = {
      addContact: 'Vous avez atteint la limite de contacts. Passez à Premium pour en ajouter plus.',
      sendAlert: 'Vous avez atteint la limite d\'alertes ce mois-ci.',
      recording: 'L\'enregistrement audio nécessite un abonnement Basic ou supérieur.',
      communityAlerts: 'Les alertes communautaires nécessitent un abonnement Basic ou supérieur.',
      whatsapp: 'Le partage WhatsApp nécessite un abonnement Basic ou supérieur.',
      journey: 'Vous avez atteint la limite de trajets surveillés ce mois-ci.'
    };
    return messages[feature] || 'Cette fonctionnalité nécessite un abonnement Premium.';
  };

  return {
    // État
    isPremium,
    plan,
    planDetails: PLANS[plan],
    expirationDate,
    usageStats,
    limits,
    showUpgradeModal,
    blockedFeature,
    isExpired: isExpired(),
    
    // Plans disponibles
    PLANS,
    
    // Actions
    checkFeature,
    useFeature,
    getRemainingLimits,
    subscribeToPlan,
    cancelSubscription,
    restorePurchases,
    setShowUpgradeModal,
    
    // Utilitaires
    formatPrice,
    getBlockedMessage
  };
};

export default usePremium;