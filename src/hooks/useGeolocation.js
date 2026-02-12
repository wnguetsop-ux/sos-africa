import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';

/**
 * Hook de géolocalisation robuste avec fallback
 * Fonctionne hors ligne - utilise le GPS natif du téléphone
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Options GPS optimisées pour l'Afrique (précision vs batterie)
  const geoOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000, // Cache de 30s pour économiser batterie
    timeout: 20000 // 20s timeout (réseaux lents)
  };

  // Fonction pour obtenir la position actuelle
  const getCurrentPosition = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Vérifier les permissions d'abord
      const permStatus = await Geolocation.checkPermissions();
      
      if (permStatus.location === 'denied') {
        const requested = await Geolocation.requestPermissions();
        if (requested.location === 'denied') {
          throw new Error('Permission GPS refusée. Veuillez l\'activer dans les paramètres.');
        }
      }

      // Obtenir la position
      const position = await Geolocation.getCurrentPosition(geoOptions);
      
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        timestamp: position.timestamp
      };

      setLocation(newLocation);
      setError(null);
      retryCountRef.current = 0;
      
    } catch (err) {
      handleGeoError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Démarrer le suivi continu
  const startWatching = useCallback(async () => {
    try {
      // Arrêter le suivi précédent si existe
      if (watchIdRef.current) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
      }

      watchIdRef.current = await Geolocation.watchPosition(
        geoOptions,
        (position, err) => {
          if (err) {
            handleGeoError(err);
            return;
          }

          if (position) {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              speed: position.coords.speed,
              timestamp: position.timestamp
            });
            setLoading(false);
            setError(null);
          }
        }
      );
    } catch (err) {
      handleGeoError(err);
    }
  }, []);

  // Gestion des erreurs GPS
  const handleGeoError = useCallback((err) => {
    let message = 'Erreur GPS inconnue';
    
    if (err.code) {
      switch (err.code) {
        case 1: // PERMISSION_DENIED
          message = 'Permission GPS refusée. Activez la localisation dans les paramètres.';
          break;
        case 2: // POSITION_UNAVAILABLE
          message = 'Signal GPS indisponible. Sortez à l\'extérieur.';
          break;
        case 3: // TIMEOUT
          message = 'Recherche GPS trop longue. Réessayez.';
          break;
        default:
          message = err.message || 'Erreur technique GPS';
      }
    } else if (err.message) {
      message = err.message;
    }

    setError(message);
    setLoading(false);

    // Retry automatique (max 3 fois)
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current += 1;
      setTimeout(() => {
        getCurrentPosition();
      }, 3000 * retryCountRef.current); // Délai croissant
    }
  }, [getCurrentPosition]);

  // Rafraîchir manuellement
  const refresh = useCallback(() => {
    retryCountRef.current = 0;
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Initialisation
  useEffect(() => {
    getCurrentPosition();
    startWatching();

    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
      }
    };
  }, []);

  // Fallback pour navigateur web (développement)
  useEffect(() => {
    if (typeof Geolocation === 'undefined' || !Geolocation.getCurrentPosition) {
      // Mode navigateur web
      if ('geolocation' in navigator) {
        setLoading(true);
        
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              speed: position.coords.speed,
              timestamp: position.timestamp
            });
            setLoading(false);
            setError(null);
          },
          (err) => {
            handleGeoError(err);
          },
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 20000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        setError('GPS non supporté sur cet appareil');
        setLoading(false);
      }
    }
  }, [handleGeoError]);

  return {
    location,
    loading,
    error,
    refresh
  };
};

export default useGeolocation;