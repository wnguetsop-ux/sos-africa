import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour le tracking des statistiques d'utilisation
 * Peut être connecté à Firebase Analytics pour un tracking réel
 */
export const useAnalytics = () => {
  const sessionStartRef = useRef(Date.now());
  const pageViewsRef = useRef(0);
  const actionsRef = useRef(0);
  const initialized = useRef(false);

  // Initialiser au premier montage
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    sessionStartRef.current = Date.now();

    // Vérifier si nouvel utilisateur
    const userId = localStorage.getItem('sos_user_id');
    if (!userId) {
      const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sos_user_id', newUserId);
      incrementStat('totalUsers');
      incrementStat('newUsersToday');
      
      // Détecter le pays (basé sur la timezone)
      detectCountry();
    }

    // Incrémenter sessions
    incrementStat('totalSessions');

    // Sauvegarder périodiquement
    const interval = setInterval(saveSessionStats, 10000);

    // Événement de fermeture
    const handleBeforeUnload = () => {
      saveSessionStats();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveSessionStats();
    };
  }, []);

  // Détecter le pays basé sur la timezone
  const detectCountry = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let country = 'Autre';
      
      if (timezone.includes('Africa/Douala') || timezone.includes('Africa/Lagos')) {
        country = 'Cameroun';
      } else if (timezone.includes('Africa/Abidjan')) {
        country = 'Côte d\'Ivoire';
      } else if (timezone.includes('Africa/Dakar')) {
        country = 'Sénégal';
      } else if (timezone.includes('Europe/Paris')) {
        country = 'France';
      } else if (timezone.includes('Europe/Brussels')) {
        country = 'Belgique';
      } else if (timezone.includes('Africa/Libreville')) {
        country = 'Gabon';
      } else if (timezone.includes('Africa/Brazzaville') || timezone.includes('Africa/Kinshasa')) {
        country = 'Congo';
      }
      
      trackCountry(country);
    } catch (err) {
      console.log('Détection pays non disponible');
    }
  };

  // Incrémenter une statistique
  const incrementStat = useCallback((statName, amount = 1) => {
    try {
      const stats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
      stats[statName] = (stats[statName] || 0) + amount;
      localStorage.setItem('sos_app_stats', JSON.stringify(stats));
    } catch (err) {
      console.error('Erreur analytics:', err);
    }
  }, []);

  // Tracker une fonctionnalité
  const trackFeature = useCallback((featureName) => {
    try {
      const stats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
      if (!stats.features) stats.features = {};
      stats.features[featureName] = (stats.features[featureName] || 0) + 1;
      localStorage.setItem('sos_app_stats', JSON.stringify(stats));
      actionsRef.current++;
      
      // Log pour debug
      console.log(`📊 Feature tracked: ${featureName}`);
    } catch (err) {
      console.error('Erreur tracking:', err);
    }
  }, []);

  // Tracker une alerte
  const trackAlert = useCallback((alertType, cancelled = false) => {
    incrementStat('alertsSent');
    incrementStat('alertsToday');
    if (cancelled) {
      incrementStat('cancelledAlerts');
    }
    trackFeature(alertType);
  }, [incrementStat, trackFeature]);

  // Tracker un don
  const trackDonation = useCallback((amount) => {
    try {
      const stats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
      if (!stats.donations) stats.donations = { total: 0, count: 0 };
      stats.donations.total += amount;
      stats.donations.count += 1;
      stats.donations.lastDonation = new Date().toISOString();
      localStorage.setItem('sos_app_stats', JSON.stringify(stats));
      
      console.log(`💝 Donation tracked: ${amount} FCFA`);
    } catch (err) {
      console.error('Erreur donation tracking:', err);
    }
  }, []);

  // Tracker une page vue
  const trackPageView = useCallback((pageName) => {
    pageViewsRef.current++;
    incrementStat('totalPageViews');
  }, [incrementStat]);

  // Tracker le pays
  const trackCountry = useCallback((countryName) => {
    try {
      const stats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
      if (!stats.countries) stats.countries = {};
      stats.countries[countryName] = (stats.countries[countryName] || 0) + 1;
      localStorage.setItem('sos_app_stats', JSON.stringify(stats));
    } catch (err) {
      console.error('Erreur country tracking:', err);
    }
  }, []);

  // Sauvegarder les stats de session
  const saveSessionStats = useCallback(() => {
    try {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;

      const sessionStats = {
        startTime: new Date(sessionStartRef.current).toLocaleTimeString('fr-FR'),
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        pageViews: pageViewsRef.current,
        actions: actionsRef.current
      };

      localStorage.setItem('sos_session_stats', JSON.stringify(sessionStats));

      // Mettre à jour le temps moyen
      const stats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
      stats.avgSessionTime = sessionStats.duration;
      localStorage.setItem('sos_app_stats', JSON.stringify(stats));
    } catch (err) {
      console.error('Erreur session stats:', err);
    }
  }, []);

  // Obtenir les stats
  const getStats = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
    } catch (err) {
      return {};
    }
  }, []);

  return {
    incrementStat,
    trackFeature,
    trackAlert,
    trackDonation,
    trackPageView,
    trackCountry,
    saveSessionStats,
    getStats
  };
};

export default useAnalytics;