import { useEffect, useRef, useCallback } from 'react';
import { Motion } from '@capacitor/motion';

/**
 * Hook de détection de secousse (Shake to Alert)
 * Détecte les mouvements violents pour déclencher une alerte
 * Optimisé pour économiser la batterie
 */
export const useShakeDetection = (onShake, enabled = true) => {
  const lastShakeTime = useRef(0);
  const shakeCount = useRef(0);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const listenerRef = useRef(null);
  
  // Seuils de détection (calibrés pour une agression)
  const SHAKE_THRESHOLD = 25; // Force minimale (m/s²)
  const SHAKE_COUNT_THRESHOLD = 3; // Nombre de secousses pour déclencher
  const SHAKE_RESET_TIME = 1500; // Reset après 1.5s sans mouvement
  const COOLDOWN_TIME = 5000; // 5s entre deux alertes

  const handleMotion = useCallback((event) => {
    if (!enabled) return;

    const now = Date.now();
    
    // Cooldown entre les alertes
    if (now - lastShakeTime.current < COOLDOWN_TIME && shakeCount.current >= SHAKE_COUNT_THRESHOLD) {
      return;
    }

    // Reset si trop de temps écoulé
    if (now - lastShakeTime.current > SHAKE_RESET_TIME) {
      shakeCount.current = 0;
    }

    // Calculer l'accélération totale (sans gravité si disponible)
    let acceleration;
    if (event.accelerationIncludingGravity) {
      acceleration = event.accelerationIncludingGravity;
    } else if (event.acceleration) {
      acceleration = event.acceleration;
    } else {
      return;
    }

    const { x, y, z } = acceleration;
    
    // Calculer le delta d'accélération
    const deltaX = Math.abs(x - lastAcceleration.current.x);
    const deltaY = Math.abs(y - lastAcceleration.current.y);
    const deltaZ = Math.abs(z - lastAcceleration.current.z);
    
    const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

    // Mettre à jour la dernière accélération
    lastAcceleration.current = { x, y, z };

    // Détecter une secousse
    if (totalDelta > SHAKE_THRESHOLD) {
      shakeCount.current += 1;
      lastShakeTime.current = now;

      // Vibration feedback pour chaque secousse détectée
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Déclencher l'alerte si seuil atteint
      if (shakeCount.current >= SHAKE_COUNT_THRESHOLD) {
        shakeCount.current = 0;
        
        // Vibration de confirmation
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        
        onShake();
      }
    }
  }, [enabled, onShake]);

  useEffect(() => {
    if (!enabled) {
      // Nettoyer le listener si désactivé
      if (listenerRef.current) {
        Motion.removeAllListeners();
        listenerRef.current = null;
      }
      return;
    }

    const startListening = async () => {
      try {
        // Essayer d'utiliser l'API Capacitor Motion
        if (Motion && Motion.addListener) {
          listenerRef.current = await Motion.addListener('accel', (event) => {
            handleMotion({
              acceleration: event.acceleration,
              accelerationIncludingGravity: event.accelerationIncludingGravity
            });
          });
        }
      } catch (err) {
        console.log('Capacitor Motion non disponible, utilisation de l\'API Web');
      }

      // Fallback vers l'API Web DeviceMotion
      if (window.DeviceMotionEvent) {
        // Demander permission sur iOS 13+
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          try {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          } catch (err) {
            console.error('Permission acceleromètre refusée:', err);
          }
        } else {
          // Android et anciens iOS
          window.addEventListener('devicemotion', handleMotion);
        }
      }
    };

    startListening();

    return () => {
      if (listenerRef.current) {
        Motion.removeAllListeners();
      }
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled, handleMotion]);

  return {
    isSupported: window.DeviceMotionEvent !== undefined || (Motion && Motion.addListener)
  };
};

export default useShakeDetection;