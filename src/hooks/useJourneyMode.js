import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour le mode accompagnement de trajet
 * Surveille un trajet de A à B et alerte si problème
 */
export const useJourneyMode = (currentLocation, contacts, sendSMS) => {
  const [isActive, setIsActive] = useState(false);
  const [destination, setDestination] = useState(null);
  const [destinationName, setDestinationName] = useState('');
  const [startLocation, setStartLocation] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(30); // minutes
  const [elapsedTime, setElapsedTime] = useState(0);
  const [checkInInterval, setCheckInInterval] = useState(10); // minutes
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [journeyHistory, setJourneyHistory] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, active, paused, arrived, alert
  
  const timerRef = useRef(null);
  const alertTimeoutRef = useRef(null);
  const checkInTimeoutRef = useRef(null);

  // Charger l'historique
  useEffect(() => {
    const stored = localStorage.getItem('sos_journey_history');
    if (stored) {
      setJourneyHistory(JSON.parse(stored));
    }
  }, []);

  // Timer principal
  useEffect(() => {
    if (isActive && status === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 60000); // Toutes les minutes
      
      return () => clearInterval(timerRef.current);
    }
  }, [isActive, status]);

  // Vérification du temps écoulé
  useEffect(() => {
    if (isActive && elapsedTime > estimatedDuration) {
      setIsOverdue(true);
      // Déclencher alerte automatique après 5 min de retard
      alertTimeoutRef.current = setTimeout(() => {
        if (status === 'active') {
          triggerJourneyAlert('timeout');
        }
      }, 5 * 60 * 1000);
    }
    
    return () => clearTimeout(alertTimeoutRef.current);
  }, [elapsedTime, estimatedDuration, isActive, status]);

  // Démarrer un trajet
  const startJourney = useCallback((config) => {
    const {
      destination: dest,
      destinationName: destName,
      duration,
      guardian,
      guardianName: gName,
      checkInterval
    } = config;

    setDestination(dest);
    setDestinationName(destName || 'Destination');
    setStartLocation(currentLocation);
    setEstimatedDuration(duration || 30);
    setGuardianPhone(guardian);
    setGuardianName(gName || 'Gardien');
    setCheckInInterval(checkInterval || 10);
    setElapsedTime(0);
    setLastCheckIn(Date.now());
    setIsOverdue(false);
    setIsActive(true);
    setStatus('active');

    // Notifier le gardien du départ
    const startMessage = `🚶 TRAJET DÉMARRÉ - SOS Africa

👤 Je pars maintenant vers: ${destName || 'ma destination'}
⏱️ Durée estimée: ${duration || 30} minutes
📍 Position de départ: ${currentLocation ? `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}` : 'Non disponible'}
⏰ Heure de départ: ${new Date().toLocaleTimeString('fr-FR')}

Je vous préviendrai de mon arrivée. Si vous ne recevez pas de nouvelles dans ${(duration || 30) + 10} minutes, essayez de me contacter.`;

    if (guardian) {
      sendNotificationToGuardian(guardian, startMessage);
    }

    // Programmer les check-ins
    scheduleCheckIn(checkInterval || 10);

    // Sauvegarder dans l'historique
    const journey = {
      id: Date.now(),
      startTime: new Date().toISOString(),
      startLocation: currentLocation,
      destination: dest,
      destinationName: destName,
      estimatedDuration: duration,
      guardian,
      status: 'active'
    };
    
    const updatedHistory = [journey, ...journeyHistory].slice(0, 20);
    setJourneyHistory(updatedHistory);
    localStorage.setItem('sos_journey_history', JSON.stringify(updatedHistory));

    // Vibration de confirmation
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

  }, [currentLocation, journeyHistory]);

  // Programmer un check-in
  const scheduleCheckIn = (minutes) => {
    clearTimeout(checkInTimeoutRef.current);
    checkInTimeoutRef.current = setTimeout(() => {
      // Demander un check-in
      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
      // L'utilisateur a 2 minutes pour confirmer
      setStatus('waiting_checkin');
    }, minutes * 60 * 1000);
  };

  // Confirmer un check-in
  const confirmCheckIn = useCallback(() => {
    setLastCheckIn(Date.now());
    setStatus('active');
    
    // Notifier le gardien (optionnel, peut être désactivé)
    const checkInMessage = `✅ CHECK-IN - SOS Africa

👤 Je vais bien!
📍 Position actuelle: ${currentLocation ? `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}` : 'Non disponible'}
⏱️ Temps écoulé: ${elapsedTime} min / ${estimatedDuration} min`;

    if (guardianPhone && elapsedTime > 0) {
      // sendNotificationToGuardian(guardianPhone, checkInMessage);
    }

    // Programmer le prochain check-in
    scheduleCheckIn(checkInInterval);

    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [currentLocation, elapsedTime, estimatedDuration, checkInInterval, guardianPhone]);

  // Confirmer l'arrivée
  const confirmArrival = useCallback(() => {
    setStatus('arrived');
    setIsActive(false);
    clearTimeout(timerRef.current);
    clearTimeout(checkInTimeoutRef.current);
    clearTimeout(alertTimeoutRef.current);

    const arrivalMessage = `🎉 ARRIVÉE CONFIRMÉE - SOS Africa

✅ Je suis bien arrivé(e) à destination!
📍 ${destinationName}
⏱️ Durée du trajet: ${elapsedTime} minutes
⏰ Heure d'arrivée: ${new Date().toLocaleTimeString('fr-FR')}

Merci de m'avoir accompagné(e)! 🙏`;

    if (guardianPhone) {
      sendNotificationToGuardian(guardianPhone, arrivalMessage);
    }

    // Mettre à jour l'historique
    updateJourneyInHistory('arrived');

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 300]);
    }
  }, [destinationName, elapsedTime, guardianPhone]);

  // Déclencher une alerte trajet
  const triggerJourneyAlert = useCallback((reason = 'manual') => {
    setStatus('alert');
    clearTimeout(checkInTimeoutRef.current);

    let alertReason = '';
    switch (reason) {
      case 'timeout':
        alertReason = '⏰ RETARD SIGNIFICATIF';
        break;
      case 'no_checkin':
        alertReason = '❌ PAS DE CHECK-IN';
        break;
      case 'manual':
        alertReason = '🆘 ALERTE MANUELLE';
        break;
      case 'sos':
        alertReason = '🚨 SOS DÉCLENCHÉ';
        break;
      default:
        alertReason = '⚠️ PROBLÈME DÉTECTÉ';
    }

    const alertMessage = `🚨 ALERTE TRAJET - SOS Africa

${alertReason}

👤 Personne: En trajet vers ${destinationName}
📍 Dernière position connue: ${currentLocation ? `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}` : 'Non disponible'}
⏱️ Temps écoulé: ${elapsedTime} min (estimé: ${estimatedDuration} min)
⏰ Dernier check-in: ${lastCheckIn ? new Date(lastCheckIn).toLocaleTimeString('fr-FR') : 'Aucun'}

VEUILLEZ CONTACTER CETTE PERSONNE IMMÉDIATEMENT!`;

    // Envoyer au gardien
    if (guardianPhone) {
      sendNotificationToGuardian(guardianPhone, alertMessage);
    }

    // Envoyer à tous les contacts d'urgence
    if (contacts && contacts.length > 0) {
      sendSMS(contacts, alertMessage);
    }

    // Mettre à jour l'historique
    updateJourneyInHistory('alert');

    // Vibration d'urgence
    if (navigator.vibrate) {
      navigator.vibrate([1000, 500, 1000, 500, 1000]);
    }
  }, [currentLocation, destinationName, elapsedTime, estimatedDuration, lastCheckIn, guardianPhone, contacts, sendSMS]);

  // Annuler le trajet
  const cancelJourney = useCallback(() => {
    setIsActive(false);
    setStatus('idle');
    clearTimeout(timerRef.current);
    clearTimeout(checkInTimeoutRef.current);
    clearTimeout(alertTimeoutRef.current);

    if (guardianPhone && elapsedTime > 0) {
      const cancelMessage = `❌ TRAJET ANNULÉ - SOS Africa

Le trajet vers ${destinationName} a été annulé.
⏰ Heure: ${new Date().toLocaleTimeString('fr-FR')}`;
      
      sendNotificationToGuardian(guardianPhone, cancelMessage);
    }

    updateJourneyInHistory('cancelled');

  }, [guardianPhone, destinationName, elapsedTime]);

  // Mettre à jour l'historique
  const updateJourneyInHistory = (newStatus) => {
    const updatedHistory = journeyHistory.map((j, index) => {
      if (index === 0 && j.status === 'active') {
        return {
          ...j,
          status: newStatus,
          endTime: new Date().toISOString(),
          actualDuration: elapsedTime
        };
      }
      return j;
    });
    setJourneyHistory(updatedHistory);
    localStorage.setItem('sos_journey_history', JSON.stringify(updatedHistory));
  };

  // Envoyer notification au gardien
  const sendNotificationToGuardian = async (phone, message) => {
    try {
      // Essayer SMS natif d'abord
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        const { Sms } = await import('@byteowls/capacitor-sms');
        await Sms.send({
          numbers: [phone],
          text: message
        });
      } else {
        // Fallback: ouvrir l'app SMS
        const encoded = encodeURIComponent(message);
        const userAgent = navigator.userAgent || '';
        const separator = /android/i.test(userAgent) ? '?' : '&';
        window.open(`sms:${phone}${separator}body=${encoded}`, '_blank');
      }
    } catch (err) {
      console.error('Erreur envoi notification gardien:', err);
    }
  };

  // Formater le temps
  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}min`;
    }
    return `${mins} min`;
  };

  return {
    // État
    isActive,
    status,
    destination,
    destinationName,
    startLocation,
    estimatedDuration,
    elapsedTime,
    formattedElapsed: formatTime(elapsedTime),
    formattedEstimated: formatTime(estimatedDuration),
    isOverdue,
    lastCheckIn,
    guardianName,
    journeyHistory,
    
    // Actions
    startJourney,
    confirmCheckIn,
    confirmArrival,
    triggerJourneyAlert,
    cancelJourney,
    setEstimatedDuration,
    setCheckInInterval,
    
    // Utilitaires
    formatTime
  };
};

export default useJourneyMode;