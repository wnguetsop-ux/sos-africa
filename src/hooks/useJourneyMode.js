import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour le mode accompagnement (Journey Mode)
 * Suit le trajet de l'utilisateur et envoie des alertes si nécessaire
 */
export const useJourneyMode = (location, contacts, sendSMS) => {
  const [isActive, setIsActive] = useState(false);
  const [destination, setDestination] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30); // minutes
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [checkInInterval, setCheckInInterval] = useState(10); // minutes
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [path, setPath] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, active, warning, alert
  const [selectedContact, setSelectedContact] = useState(null);
  
  const timerRef = useRef(null);
  const checkInRef = useRef(null);
  const warningRef = useRef(null);

  // Démarrer le trajet
  const startJourney = useCallback((dest, minutes, contact) => {
    if (!dest || minutes <= 0) {
      alert('Veuillez entrer une destination et une durée valide');
      return false;
    }

    console.log('🚗 Démarrage du trajet vers:', dest, 'Durée:', minutes, 'min');
    
    setDestination(dest);
    setEstimatedTime(minutes);
    setSelectedContact(contact || (contacts.length > 0 ? contacts[0] : null));
    setStartTime(Date.now());
    setElapsedTime(0);
    setLastCheckIn(Date.now());
    setPath(location ? [{ ...location, timestamp: Date.now() }] : []);
    setIsActive(true);
    setStatus('active');

    // Vibrer pour confirmer
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Envoyer notification de départ au contact
    if (contact && location) {
      const message = `🚗 SOS Africa: ${contact.name || 'Votre contact'} a démarré un trajet vers "${dest}". Durée estimée: ${minutes} min. Position de départ: https://maps.google.com/?q=${location.lat},${location.lng}`;
      
      // Essayer d'envoyer via SMS natif
      const smsLink = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      window.open(smsLink, '_blank');
    }

    return true;
  }, [contacts, location]);

  // Arrêter le trajet
  const stopJourney = useCallback((notifyContact = true) => {
    console.log('⏹️ Arrêt du trajet');
    
    // Nettoyer les timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (checkInRef.current) clearInterval(checkInRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Notifier le contact que le trajet est terminé
    if (notifyContact && selectedContact && isActive) {
      const message = `✅ SOS Africa: Trajet terminé en sécurité! Destination "${destination}" atteinte.`;
      const smsLink = `sms:${selectedContact.phone}?body=${encodeURIComponent(message)}`;
      window.open(smsLink, '_blank');
    }

    // Reset l'état
    setIsActive(false);
    setStatus('idle');
    setDestination('');
    setStartTime(null);
    setElapsedTime(0);
    setPath([]);
    
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, [selectedContact, destination, isActive]);

  // Check-in manuel (je suis ok)
  const checkIn = useCallback(() => {
    console.log('✅ Check-in effectué');
    setLastCheckIn(Date.now());
    setStatus('active');
    
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    return true;
  }, []);

  // Déclencher une alerte manuelle
  const triggerAlert = useCallback(() => {
    if (!selectedContact || !location) return;

    console.log('🚨 Alerte trajet déclenchée!');
    setStatus('alert');

    const message = `🚨 ALERTE SOS Africa!\n\nProblème pendant le trajet vers "${destination}".\n\nPosition actuelle:\nhttps://maps.google.com/?q=${location.lat},${location.lng}\n\nContactez-moi immédiatement!`;
    
    const smsLink = `sms:${selectedContact.phone}?body=${encodeURIComponent(message)}`;
    window.open(smsLink, '_blank');

    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  }, [selectedContact, destination, location]);

  // Prolonger le trajet
  const extendTime = useCallback((additionalMinutes) => {
    setEstimatedTime(prev => prev + additionalMinutes);
    setStatus('active');
    console.log(`⏰ Trajet prolongé de ${additionalMinutes} minutes`);
  }, []);

  // Mettre à jour le timer et la position
  useEffect(() => {
    if (!isActive) return;

    // Timer pour le temps écoulé
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 60000); // en minutes
      setElapsedTime(elapsed);

      // Vérifier si le temps estimé est dépassé
      if (elapsed >= estimatedTime && status !== 'alert') {
        setStatus('warning');
        
        // Vibrer pour avertir
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }

      // Si 5 minutes de plus que prévu, alerte automatique
      if (elapsed >= estimatedTime + 5 && status !== 'alert') {
        triggerAlert();
      }
    }, 30000); // Vérifier toutes les 30 secondes

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, startTime, estimatedTime, status, triggerAlert]);

  // Mettre à jour le chemin avec les nouvelles positions
  useEffect(() => {
    if (!isActive || !location) return;

    setPath(prev => {
      const lastPoint = prev[prev.length - 1];
      
      // N'ajouter que si la position a significativement changé
      if (lastPoint) {
        const distance = Math.sqrt(
          Math.pow(location.lat - lastPoint.lat, 2) + 
          Math.pow(location.lng - lastPoint.lng, 2)
        );
        
        if (distance < 0.0001) return prev; // ~10 mètres
      }

      return [...prev, { ...location, timestamp: Date.now() }];
    });
  }, [isActive, location]);

  // Calculer les statistiques du trajet
  const getStats = useCallback(() => {
    const remainingTime = Math.max(0, estimatedTime - elapsedTime);
    const progress = Math.min(100, (elapsedTime / estimatedTime) * 100);
    
    return {
      elapsedTime,
      remainingTime,
      progress,
      pointsCount: path.length,
      isOvertime: elapsedTime > estimatedTime
    };
  }, [elapsedTime, estimatedTime, path]);

  return {
    isActive,
    destination,
    estimatedTime,
    elapsedTime,
    status,
    path,
    selectedContact,
    startJourney,
    stopJourney,
    checkIn,
    triggerAlert,
    extendTime,
    setDestination,
    setEstimatedTime,
    setCheckInInterval,
    setSelectedContact,
    getStats
  };
};

export default useJourneyMode;