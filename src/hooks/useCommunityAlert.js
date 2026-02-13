import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour les alertes communautaires
 * Permet de voir et signaler des dangers dans la zone
 */
export const useCommunityAlert = (location) => {
  const [alerts, setAlerts] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Types d'alertes
  const alertTypes = [
    { id: 'danger', label: 'Zone dangereuse', icon: '⚠️', color: 'red' },
    { id: 'accident', label: 'Accident', icon: '🚗', color: 'orange' },
    { id: 'theft', label: 'Vol signalé', icon: '🚨', color: 'red' },
    { id: 'harassment', label: 'Harcèlement', icon: '🛑', color: 'purple' },
    { id: 'police', label: 'Contrôle police', icon: '👮', color: 'blue' },
    { id: 'fire', label: 'Incendie', icon: '🔥', color: 'orange' },
    { id: 'flood', label: 'Inondation', icon: '🌊', color: 'blue' },
    { id: 'other', label: 'Autre danger', icon: '❗', color: 'gray' },
  ];

  // Charger les alertes locales (simulé - en production, utiliser une API)
  const loadAlerts = useCallback(async () => {
    if (!location?.lat || !location?.lng) return;

    setIsLoading(true);

    try {
      // Charger depuis localStorage (simulation)
      const stored = localStorage.getItem('sos_community_alerts');
      let allAlerts = stored ? JSON.parse(stored) : [];

      // Filtrer les alertes expirées (plus de 24h)
      const now = Date.now();
      allAlerts = allAlerts.filter(a => now - a.timestamp < 24 * 60 * 60 * 1000);

      // Filtrer les alertes proches (rayon de 5km)
      const nearbyAlerts = allAlerts.filter(alert => {
        const distance = calculateDistance(
          location.lat, location.lng,
          alert.lat, alert.lng
        );
        return distance <= 5; // 5km
      });

      setAlerts(nearbyAlerts);
      setNearbyUsers(Math.floor(Math.random() * 15) + 5); // Simulé
      setLastUpdate(new Date());

      // Sauvegarder les alertes nettoyées
      localStorage.setItem('sos_community_alerts', JSON.stringify(allAlerts));

    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Calculer la distance entre deux points GPS (en km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Signaler une nouvelle alerte
  const reportAlert = useCallback((type, description = '') => {
    if (!location?.lat || !location?.lng) {
      alert('Position GPS requise pour signaler un danger');
      return false;
    }

    const alertType = alertTypes.find(t => t.id === type) || alertTypes[7];

    const newAlert = {
      id: 'alert_' + Date.now(),
      type: type,
      label: alertType.label,
      icon: alertType.icon,
      color: alertType.color,
      description: description,
      lat: location.lat,
      lng: location.lng,
      timestamp: Date.now(),
      reportedBy: 'anonymous',
      confirmations: 1
    };

    // Sauvegarder
    const stored = localStorage.getItem('sos_community_alerts');
    const allAlerts = stored ? JSON.parse(stored) : [];
    allAlerts.push(newAlert);
    localStorage.setItem('sos_community_alerts', JSON.stringify(allAlerts));

    // Mettre à jour l'état local
    setAlerts(prev => [newAlert, ...prev]);

    // Vibrer pour confirmer
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    console.log('🚨 Alerte signalée:', newAlert);
    return true;
  }, [location, alertTypes]);

  // Confirmer une alerte existante
  const confirmAlert = useCallback((alertId) => {
    const stored = localStorage.getItem('sos_community_alerts');
    if (!stored) return;

    const allAlerts = JSON.parse(stored);
    const alertIndex = allAlerts.findIndex(a => a.id === alertId);
    
    if (alertIndex !== -1) {
      allAlerts[alertIndex].confirmations++;
      localStorage.setItem('sos_community_alerts', JSON.stringify(allAlerts));
      
      setAlerts(prev => prev.map(a => 
        a.id === alertId 
          ? { ...a, confirmations: a.confirmations + 1 }
          : a
      ));

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, []);

  // Supprimer une alerte (signaler comme fausse)
  const dismissAlert = useCallback((alertId) => {
    const stored = localStorage.getItem('sos_community_alerts');
    if (!stored) return;

    const allAlerts = JSON.parse(stored).filter(a => a.id !== alertId);
    localStorage.setItem('sos_community_alerts', JSON.stringify(allAlerts));
    
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Obtenir les alertes par type
  const getAlertsByType = useCallback((type) => {
    return alerts.filter(a => a.type === type);
  }, [alerts]);

  // Obtenir le nombre d'alertes actives
  const getActiveCount = useCallback(() => {
    return alerts.length;
  }, [alerts]);

  // Charger les alertes au montage et quand la position change
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Rafraîchir automatiquement toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  return {
    alerts,
    nearbyUsers,
    isLoading,
    lastUpdate,
    alertTypes,
    reportAlert,
    confirmAlert,
    dismissAlert,
    loadAlerts,
    getAlertsByType,
    getActiveCount
  };
};

export default useCommunityAlert;