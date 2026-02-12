import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

/**
 * Mode Fantôme / Ghost Mode
 * Affiche un écran noir pour faire croire que le téléphone est éteint
 * Mais continue à traquer la position et permet de déclencher l'alerte
 * 
 * Gestes secrets:
 * - Double tap en haut à gauche: afficher/masquer les coordonnées
 * - Triple tap en bas à droite: déclencher l'alerte SOS
 * - Swipe vers le haut avec 3 doigts: quitter le mode ghost
 */
const GhostMode = ({ location, onExit, onTriggerSOS }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);

  // Gestion des taps pour afficher les infos
  const handleInfoTap = useCallback((e) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Zone en haut à gauche (coin)
    if (x < 100 && y < 100) {
      if (now - lastTapTime < 500) {
        setTapCount(prev => prev + 1);
      } else {
        setTapCount(1);
      }
      setLastTapTime(now);
    }
  }, [lastTapTime]);

  // Vérifier le double tap pour afficher les infos
  useEffect(() => {
    if (tapCount >= 2) {
      setShowInfo(prev => !prev);
      setTapCount(0);
      
      // Vibration discrète
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
    
    // Reset après timeout
    const timer = setTimeout(() => setTapCount(0), 500);
    return () => clearTimeout(timer);
  }, [tapCount]);

  // Gestion du triple tap pour SOS (coin bas droit)
  const [sosTapCount, setSosTapCount] = useState(0);
  const [lastSosTapTime, setLastSosTapTime] = useState(0);

  const handleSOSTap = useCallback((e) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    
    // Zone en bas à droite (coin)
    if (x > width - 100 && y > height - 100) {
      if (now - lastSosTapTime < 500) {
        setSosTapCount(prev => prev + 1);
      } else {
        setSosTapCount(1);
      }
      setLastSosTapTime(now);
    }
  }, [lastSosTapTime]);

  // Vérifier le triple tap pour SOS
  useEffect(() => {
    if (sosTapCount >= 3) {
      // Vibration d'alerte
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      onTriggerSOS();
      setSosTapCount(0);
    }
    
    const timer = setTimeout(() => setSosTapCount(0), 500);
    return () => clearTimeout(timer);
  }, [sosTapCount, onTriggerSOS]);

  // Gestion du swipe 3 doigts pour quitter
  const handleTouchStart = (e) => {
    if (e.touches.length === 3) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartY !== null && e.changedTouches.length >= 1) {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      
      // Swipe vers le haut de plus de 100px
      if (deltaY > 100) {
        onExit();
      }
    }
    setTouchStartY(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999] select-none"
      onClick={(e) => {
        handleInfoTap(e);
        handleSOSTap(e);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Écran totalement noir - pas de contenu visible */}
      
      {/* Zone d'affichage des infos (discrète) */}
      {showInfo && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-gray-900/80 rounded-xl p-4 backdrop-blur-sm border border-gray-800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Position active</span>
            </div>
            
            {location ? (
              <div className="text-white font-mono text-sm">
                <p>{location.lat.toFixed(6)}</p>
                <p>{location.lng.toFixed(6)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ±{Math.round(location.accuracy)}m
                </p>
              </div>
            ) : (
              <p className="text-yellow-400 text-xs">Recherche GPS...</p>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
              <p>3 taps coin bas-droit = SOS</p>
              <p>3 doigts swipe haut = Quitter</p>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur discret de mode ghost (très subtil) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="w-1 h-1 bg-gray-800 rounded-full" />
      </div>

      {/* Zone de tap SOS - indicateur invisible sauf tap */}
      {sosTapCount > 0 && sosTapCount < 3 && (
        <div className="absolute bottom-8 right-8">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= sosTapCount ? 'bg-red-500' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructions initiales (disparaît après 3 secondes) */}
      <GhostInstructions />
    </div>
  );
};

// Instructions qui s'affichent brièvement au démarrage
const GhostInstructions = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 animate-pulse">
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto bg-gray-900 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-gray-700" />
        </div>
        <h2 className="text-gray-600 text-lg font-bold mb-2">Mode Fantôme Activé</h2>
        <p className="text-gray-700 text-sm max-w-xs mx-auto">
          L'écran semble éteint mais le GPS est actif.
        </p>
        <div className="mt-4 space-y-1 text-xs text-gray-800">
          <p>• 2 taps coin haut-gauche = coordonnées</p>
          <p>• 3 taps coin bas-droit = alerte SOS</p>
          <p>• Swipe 3 doigts vers le haut = quitter</p>
        </div>
      </div>
    </div>
  );
};

export default GhostMode;