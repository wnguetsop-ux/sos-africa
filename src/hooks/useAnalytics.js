import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour le tracking des statistiques d'utilisation
 */
export const useAnalytics = () => {
  const sessionStartRef = useRef(Date.now());
  const pageViewsRef = useRef(0);
  const actionsRef = useRef(0);

  // Initialiser la session au montage
  useEffect(() => {
    sessionStartRef.current = Date.now();
    
    // Incrémenter le compteur d'utilisateurs totaux (une seule fois par installation)
    const isNewUser = !localStorage.getItem('sos_user_id');
    if (isNewUser) {
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sos_user_id', userId);
      incrementStat('totalUsers');
      incrementStat('downloads');
    }

    // Marquer comme utilisateur actif
    incrementStat('activeUsers');

    // Sauvegarder les stats de session périodiquement
    const interval = setInterval(saveSessionStats, 30000);

    // Cleanup
    return () => {
      clearInterval(interval);
      saveSessionStats();
    };
  }, []);

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

  // Tracker une fonctionnalité utilisée
  const trackFeature = useCallback((featureName) => {
    try {
      const stats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
      if (!stats.features) stats.features = {};
      stats.features[featureName] = (stats.features[featureName] || 0) + 1;
      localStorage.setItem('sos_app_stats', JSON.stringify(stats));
      actionsRef.current++;
    } catch (err) {
      console.error('Erreur tracking:', err);
    }
  }, []);

  // Tracker une alerte envoyée
  const trackAlert = useCallback((alertType) => {
    incrementStat('alertsSent');
    trackFeature(alertType);
  }, [incrementStat, trackFeature]);

  // Tracker un don
  const trackDonation = useCallback((amount) => {
    try {
      const stats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
      if (!stats.donations) stats.donations = { total: 0, count: 0 };
      stats.donations.total += amount;
      stats.donations.count += 1;
      localStorage.setItem('sos_app_stats', JSON.stringify(stats));
    } catch (err) {
      console.error('Erreur donation tracking:', err);
    }
  }, []);

  // Tracker une page vue
  const trackPageView = useCallback((pageName) => {
    pageViewsRef.current++;
  }, []);

  // Tracker le pays (basé sur la langue ou timezone)
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
    } catch (err) {
      console.error('Erreur session stats:', err);
    }
  }, []);

  // Obtenir les stats actuelles
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