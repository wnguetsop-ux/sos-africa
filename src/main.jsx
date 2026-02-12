import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialiser Capacitor si disponible
const initCapacitor = async () => {
  try {
    // Import dynamique pour éviter les erreurs en dev web
    const { App: CapApp } = await import('@capacitor/app');
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    
    // Configurer la barre de statut pour un look natif
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f172a' }); // slate-900
    } catch (e) {
      // StatusBar non disponible (web)
    }

    // Gérer le bouton retour Android
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapApp.exitApp();
      }
    });

  } catch (err) {
    console.log('Capacitor plugins non disponibles (mode web)');
  }
};

// Demander les permissions au démarrage
const requestPermissions = async () => {
  try {
    // Demander la permission de géolocalisation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => console.log('GPS permission granted'),
        (err) => console.warn('GPS permission denied:', err),
        { enableHighAccuracy: true }
      );
    }

    // Demander la permission pour les notifications (optionnel)
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Demander la permission pour l'accéléromètre (iOS 13+)
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        await DeviceMotionEvent.requestPermission();
      } catch (e) {
        console.log('Motion permission request failed:', e);
      }
    }

  } catch (err) {
    console.warn('Permission request error:', err);
  }
};

// Initialisation
initCapacitor();
requestPermissions();

// Monter l'application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker pour le mode hors ligne (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  });
}