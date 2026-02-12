import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour les alertes communautaires
 * Permet de notifier les utilisateurs SOS Africa à proximité
 * Note: Nécessite un backend pour fonctionner pleinement
 * Cette version simule le comportement et prépare l'intégration
 */
export const useCommunityAlert = (currentLocation) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [alertRadius, setAlertRadius] = useState(500); // mètres
  const [incomingAlerts, setIncomingAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myAlertActive, setMyAlertActive] = useState(false);
  const [respondedAlerts, setRespondedAlerts] = useState([]);
  
  const wsRef = useRef(null);
  const locationUpdateRef = useRef(null);

  // Charger les préférences
  useEffect(() => {
    const stored = localStorage.getItem('sos_community_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      setIsEnabled(settings.isEnabled ?? false);
      setAlertRadius(settings.alertRadius ?? 500);
    }
  }, []);

  // Sauvegarder les préférences
  const saveSettings = (settings) => {
    localStorage.setItem('sos_community_settings', JSON.stringify(settings));
  };

  // Activer/désactiver le mode communautaire
  const toggleCommunityMode = useCallback((enabled) => {
    setIsEnabled(enabled);
    saveSettings({ isEnabled: enabled, alertRadius });
    
    if (enabled) {
      connectToNetwork();
    } else {
      disconnectFromNetwork();
    }
  }, [alertRadius]);

  // Modifier le rayon d'alerte
  const updateAlertRadius = useCallback((radius) => {
    setAlertRadius(radius);
    saveSettings({ isEnabled, alertRadius: radius });
  }, [isEnabled]);

  // Se connecter au réseau communautaire (simulé)
  const connectToNetwork = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulation: Dans une vraie app, on se connecterait à un WebSocket
      // ws://api.sosafrika.com/community
      
      // Générer un ID utilisateur anonyme
      let userId = localStorage.getItem('sos_user_id');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sos_user_id', userId);
      }

      // Simuler la connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuler des utilisateurs à proximité (pour la démo)
      simulateNearbyUsers();
      
      // Démarrer les mises à jour de position
      startLocationUpdates();
      
      setIsLoading(false);
      
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
    } catch (err) {
      console.error('Erreur connexion réseau communautaire:', err);
      setError('Impossible de se connecter au réseau');
      setIsLoading(false);
    }
  }, [currentLocation]);

  // Se déconnecter du réseau
  const disconnectFromNetwork = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    clearInterval(locationUpdateRef.current);
    setNearbyUsers([]);
    setIncomingAlerts([]);
  }, []);

  // Simuler des utilisateurs à proximité (pour la démo)
  const simulateNearbyUsers = () => {
    if (!currentLocation) return;
    
    // Générer quelques utilisateurs fictifs dans le rayon
    const fakeUsers = [];
    const numUsers = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numUsers; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.01; // ~500m
      const offsetLng = (Math.random() - 0.5) * 0.01;
      
      fakeUsers.push({
        id: 'user_' + Math.random().toString(36).substr(2, 6),
        lat: currentLocation.lat + offsetLat,
        lng: currentLocation.lng + offsetLng,
        distance: Math.floor(Math.random() * alertRadius),
        lastSeen: Date.now() - Math.floor(Math.random() * 300000) // Dans les 5 dernières minutes
      });
    }
    
    setNearbyUsers(fakeUsers);
  };

  // Démarrer les mises à jour de position
  const startLocationUpdates = () => {
    locationUpdateRef.current = setInterval(() => {
      // Mettre à jour la position sur le serveur
      updateMyLocation();
      // Rafraîchir les utilisateurs proches
      simulateNearbyUsers();
    }, 30000); // Toutes les 30 secondes
  };

  // Mettre à jour ma position
  const updateMyLocation = async () => {
    if (!currentLocation || !isEnabled) return;
    
    // Dans une vraie app, envoyer au serveur
    console.log('Position mise à jour:', currentLocation);
  };

  // Envoyer une alerte communautaire
  const sendCommunityAlert = useCallback(async (alertData = {}) => {
    if (!isEnabled || !currentLocation) {
      setError('Mode communautaire non actif');
      return false;
    }

    try {
      setMyAlertActive(true);
      
      const alert = {
        id: 'alert_' + Date.now(),
        senderId: localStorage.getItem('sos_user_id'),
        type: alertData.type || 'sos',
        message: alertData.message || 'Besoin d\'aide!',
        location: currentLocation,
        timestamp: Date.now(),
        radius: alertRadius,
        severity: alertData.severity || 'high' // low, medium, high, critical
      };

      // Simuler l'envoi (dans une vraie app, envoyer au serveur)
      console.log('Alerte communautaire envoyée:', alert);
      
      // Vibration d'alerte
      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }

      // Notification locale
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Alerte SOS envoyée!', {
          body: `${nearbyUsers.length} personne(s) à proximité notifiée(s)`,
          icon: '/icons/icon-192x192.png',
          tag: 'sos-sent'
        });
      }

      // L'alerte reste active pendant 10 minutes
      setTimeout(() => {
        setMyAlertActive(false);
      }, 10 * 60 * 1000);

      return true;
      
    } catch (err) {
      console.error('Erreur envoi alerte communautaire:', err);
      setError('Impossible d\'envoyer l\'alerte');
      return false;
    }
  }, [isEnabled, currentLocation, alertRadius, nearbyUsers]);

  // Annuler mon alerte
  const cancelMyAlert = useCallback(() => {
    setMyAlertActive(false);
    // Notifier le serveur
    console.log('Alerte annulée');
  }, []);

  // Répondre à une alerte entrante
  const respondToAlert = useCallback(async (alertId, response) => {
    const alert = incomingAlerts.find(a => a.id === alertId);
    if (!alert) return;

    try {
      const responseData = {
        alertId,
        responderId: localStorage.getItem('sos_user_id'),
        response: response, // 'coming', 'calling_help', 'cannot_help'
        myLocation: currentLocation,
        timestamp: Date.now()
      };

      // Simuler l'envoi de la réponse
      console.log('Réponse à l\'alerte:', responseData);
      
      // Marquer comme répondu
      setRespondedAlerts(prev => [...prev, alertId]);
      
      // Retirer de la liste des alertes actives
      setTimeout(() => {
        setIncomingAlerts(prev => prev.filter(a => a.id !== alertId));
      }, 2000);

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      return true;
      
    } catch (err) {
      console.error('Erreur réponse alerte:', err);
      return false;
    }
  }, [currentLocation, incomingAlerts]);

  // Ignorer une alerte
  const dismissAlert = useCallback((alertId) => {
    setIncomingAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Calculer la distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c); // Distance en mètres
  };

  // Simuler une alerte entrante (pour les tests)
  const simulateIncomingAlert = useCallback(() => {
    if (!currentLocation) return;
    
    const fakeAlert = {
      id: 'alert_' + Date.now(),
      senderId: 'user_' + Math.random().toString(36).substr(2, 6),
      type: 'sos',
      message: 'Besoin d\'aide urgente!',
      location: {
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.005,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.005
      },
      timestamp: Date.now(),
      distance: Math.floor(Math.random() * alertRadius)
    };
    
    setIncomingAlerts(prev => [fakeAlert, ...prev]);
    
    // Vibration et notification
    if (navigator.vibrate) {
      navigator.vibrate([1000, 500, 1000]);
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🆘 Alerte SOS à proximité!', {
        body: `Quelqu'un a besoin d'aide à ${fakeAlert.distance}m`,
        icon: '/icons/icon-192x192.png',
        tag: 'sos-incoming',
        requireInteraction: true
      });
    }
  }, [currentLocation, alertRadius]);

  // Demander la permission de notification
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      disconnectFromNetwork();
    };
  }, [disconnectFromNetwork]);

  return {
    // État
    isEnabled,
    nearbyUsers,
    nearbyCount: nearbyUsers.length,
    alertRadius,
    incomingAlerts,
    isLoading,
    error,
    myAlertActive,
    respondedAlerts,
    
    // Actions
    toggleCommunityMode,
    updateAlertRadius,
    sendCommunityAlert,
    cancelMyAlert,
    respondToAlert,
    dismissAlert,
    requestNotificationPermission,
    
    // Debug/Test
    simulateIncomingAlert,
    calculateDistance
  };
};

export default useCommunityAlert;