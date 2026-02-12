import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer l'historique des alertes
 */
export const useAlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'historique au démarrage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = localStorage.getItem('sos_alert_history');
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder l'historique
  const saveHistory = (newAlerts) => {
    localStorage.setItem('sos_alert_history', JSON.stringify(newAlerts));
    setAlerts(newAlerts);
  };

  // Ajouter une nouvelle alerte
  const addAlert = useCallback((alertData) => {
    const newAlert = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: alertData.type || 'sos', // sos, shake, journey, community
      status: alertData.status || 'sent', // sent, cancelled, received
      location: alertData.location || null,
      contactsNotified: alertData.contacts?.length || 0,
      contactsList: alertData.contacts?.map(c => c.name) || [],
      method: alertData.method || 'sms', // sms, whatsapp, community
      cancelled: alertData.cancelled || false,
      cancelledAt: null,
      notes: alertData.notes || ''
    };

    const updatedAlerts = [newAlert, ...alerts].slice(0, 100); // Max 100 alertes
    saveHistory(updatedAlerts);
    
    return newAlert;
  }, [alerts]);

  // Marquer une alerte comme annulée
  const cancelAlert = useCallback((alertId) => {
    const updatedAlerts = alerts.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: 'cancelled',
          cancelled: true,
          cancelledAt: new Date().toISOString()
        };
      }
      return alert;
    });
    saveHistory(updatedAlerts);
  }, [alerts]);

  // Supprimer une alerte de l'historique
  const deleteAlert = useCallback((alertId) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    saveHistory(updatedAlerts);
  }, [alerts]);

  // Effacer tout l'historique
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, []);

  // Obtenir les statistiques
  const getStats = useCallback(() => {
    const now = new Date();
    const thisMonth = alerts.filter(a => {
      const alertDate = new Date(a.timestamp);
      return alertDate.getMonth() === now.getMonth() && 
             alertDate.getFullYear() === now.getFullYear();
    });

    const thisWeek = alerts.filter(a => {
      const alertDate = new Date(a.timestamp);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return alertDate >= weekAgo;
    });

    return {
      total: alerts.length,
      thisMonth: thisMonth.length,
      thisWeek: thisWeek.length,
      cancelled: alerts.filter(a => a.cancelled).length,
      byType: {
        sos: alerts.filter(a => a.type === 'sos').length,
        shake: alerts.filter(a => a.type === 'shake').length,
        journey: alerts.filter(a => a.type === 'journey').length,
        community: alerts.filter(a => a.type === 'community').length
      }
    };
  }, [alerts]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Moins d'une minute
    if (diff < 60000) {
      return 'À l\'instant';
    }
    
    // Moins d'une heure
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `Il y a ${mins} min`;
    }
    
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    }
    
    // Moins d'une semaine
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    
    // Date complète
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir l'icône du type d'alerte
  const getAlertTypeInfo = (type) => {
    const types = {
      sos: { icon: '🆘', label: 'SOS Manuel', color: 'red' },
      shake: { icon: '📳', label: 'Secousse', color: 'orange' },
      journey: { icon: '🚶', label: 'Trajet', color: 'blue' },
      community: { icon: '🌍', label: 'Communauté', color: 'purple' }
    };
    return types[type] || types.sos;
  };

  return {
    alerts,
    isLoading,
    addAlert,
    cancelAlert,
    deleteAlert,
    clearHistory,
    getStats,
    formatDate,
    getAlertTypeInfo
  };
};

export default useAlertHistory;