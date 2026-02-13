import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour détecter les secousses du téléphone (shake to alert)
 * Déclenche le callback quand l'utilisateur secoue 3 fois en 2 secondes
 */
export const useShakeDetection = (onShake, enabled = true) => {
  const shakeCount = useRef(0);
  const lastShake = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastZ = useRef(0);
  const shakeTimeout = useRef(null);

  const handleMotion = useCallback((event) => {
    if (!enabled) return;

    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    if (x === null || y === null || z === null) return;

    // Calculer le changement d'accélération
    const deltaX = Math.abs(x - lastX.current);
    const deltaY = Math.abs(y - lastY.current);
    const deltaZ = Math.abs(z - lastZ.current);
    
    // Sauvegarder les valeurs actuelles
    lastX.current = x;
    lastY.current = y;
    lastZ.current = z;

    // Détecter une secousse forte (seuil = 15)
    const shakeThreshold = 15;
    const totalDelta = deltaX + deltaY + deltaZ;

    if (totalDelta > shakeThreshold) {
      const now = Date.now();
      
      // Si plus de 2 secondes depuis la dernière secousse, reset le compteur
      if (now - lastShake.current > 2000) {
        shakeCount.current = 0;
      }

      // Incrémenter le compteur de secousses
      shakeCount.current++;
      lastShake.current = now;

      console.log(`🔔 Shake détecté! Count: ${shakeCount.current}/3`);

      // Si 3 secousses en 2 secondes, déclencher l'alerte
      if (shakeCount.current >= 3) {
        console.log('🚨 SHAKE ALERT TRIGGERED!');
        shakeCount.current = 0;
        
        // Vibrer pour confirmer
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 200]);
        }
        
        onShake();
      }

      // Reset le compteur après 2 secondes d'inactivité
      if (shakeTimeout.current) {
        clearTimeout(shakeTimeout.current);
      }
      shakeTimeout.current = setTimeout(() => {
        shakeCount.current = 0;
      }, 2000);
    }
  }, [onShake, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Vérifier si l'API est disponible
    if (typeof DeviceMotionEvent === 'undefined') {
      console.log('DeviceMotion non supporté');
      return;
    }

    // Pour iOS 13+, il faut demander la permission
    const requestPermission = async () => {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion, true);
            console.log('✅ Shake detection activée (iOS)');
          } else {
            console.log('❌ Permission DeviceMotion refusée');
          }
        } catch (error) {
          console.log('Erreur permission:', error);
        }
      } else {
        // Android et autres
        window.addEventListener('devicemotion', handleMotion, true);
        console.log('✅ Shake detection activée (Android/Web)');
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion, true);
      if (shakeTimeout.current) {
        clearTimeout(shakeTimeout.current);
      }
    };
  }, [handleMotion, enabled]);

  // Fonction pour demander la permission manuellement (iOS)
  const requestMotionPermission = async () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Erreur permission motion:', error);
        return false;
      }
    }
    return true; // Pas besoin de permission sur Android
  };

  return { requestMotionPermission };
};

export default useShakeDetection;