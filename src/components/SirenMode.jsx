import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, AlertTriangle } from 'lucide-react';

/**
 * Mode Sirène d'Urgence
 * Émet un son strident à volume maximal pour:
 * - Effrayer un agresseur
 * - Attirer l'attention dans une zone isolée
 * - Servir de signal de détresse
 */
const SirenMode = ({ onStop }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState('siren');
  const [flashEnabled, setFlashEnabled] = useState(true);
  const [showFlash, setShowFlash] = useState(false);
  
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const animationRef = useRef(null);

  // Sons disponibles
  const SOUNDS = [
    { id: 'siren', name: 'Sirène Police', icon: '🚨' },
    { id: 'alarm', name: 'Alarme', icon: '🔔' },
    { id: 'horn', name: 'Klaxon', icon: '📢' },
    { id: 'whistle', name: 'Sifflet', icon: '🔊' },
  ];

  // Démarrer le son
  const startSound = () => {
    try {
      // Créer le contexte audio
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioContextRef.current;

      // Créer l'oscillateur
      oscillatorRef.current = ctx.createOscillator();
      gainNodeRef.current = ctx.createGain();

      // Configurer selon le type de son
      switch (selectedSound) {
        case 'siren':
          // Sirène de police - fréquence oscillante
          oscillatorRef.current.type = 'sawtooth';
          oscillatorRef.current.frequency.setValueAtTime(600, ctx.currentTime);
          animateSiren(ctx);
          break;
        case 'alarm':
          // Alarme - bips rapides
          oscillatorRef.current.type = 'square';
          oscillatorRef.current.frequency.setValueAtTime(880, ctx.currentTime);
          animateAlarm(ctx);
          break;
        case 'horn':
          // Klaxon - son continu grave
          oscillatorRef.current.type = 'sawtooth';
          oscillatorRef.current.frequency.setValueAtTime(200, ctx.currentTime);
          gainNodeRef.current.gain.setValueAtTime(1, ctx.currentTime);
          break;
        case 'whistle':
          // Sifflet - son aigu
          oscillatorRef.current.type = 'sine';
          oscillatorRef.current.frequency.setValueAtTime(2500, ctx.currentTime);
          gainNodeRef.current.gain.setValueAtTime(0.8, ctx.currentTime);
          break;
        default:
          oscillatorRef.current.type = 'sine';
          oscillatorRef.current.frequency.setValueAtTime(440, ctx.currentTime);
      }

      // Connecter et démarrer
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
      oscillatorRef.current.start();

      setIsPlaying(true);

      // Vibration continue
      if (navigator.vibrate) {
        const vibratePattern = () => {
          navigator.vibrate([500, 100]);
          if (isPlaying) {
            setTimeout(vibratePattern, 600);
          }
        };
        vibratePattern();
      }

    } catch (err) {
      console.error('Erreur audio:', err);
      // Fallback: utiliser un fichier audio
      playFallbackSound();
    }
  };

  // Animation sirène de police
  const animateSiren = (ctx) => {
    let direction = 1;
    let freq = 600;
    
    const animate = () => {
      if (!oscillatorRef.current) return;
      
      freq += direction * 20;
      if (freq > 1200) direction = -1;
      if (freq < 600) direction = 1;
      
      oscillatorRef.current.frequency.setValueAtTime(freq, ctx.currentTime);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  // Animation alarme
  const animateAlarm = (ctx) => {
    let on = true;
    
    const animate = () => {
      if (!gainNodeRef.current) return;
      
      gainNodeRef.current.gain.setValueAtTime(on ? 1 : 0, ctx.currentTime);
      on = !on;
      
      setTimeout(() => {
        if (isPlaying) animate();
      }, 200);
    };
    
    animate();
  };

  // Fallback audio (fichier MP3)
  const audioElementRef = useRef(null);
  
  const playFallbackSound = () => {
    if (audioElementRef.current) {
      audioElementRef.current.loop = true;
      audioElementRef.current.volume = 1;
      audioElementRef.current.play().catch(e => console.log('Audio blocked:', e));
    }
  };

  // Arrêter le son
  const stopSound = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
      
      navigator.vibrate && navigator.vibrate(0);
      
    } catch (err) {
      console.error('Erreur arrêt audio:', err);
    }
    
    setIsPlaying(false);
  };

  // Flash d'écran
  useEffect(() => {
    if (!isPlaying || !flashEnabled) {
      setShowFlash(false);
      return;
    }

    const interval = setInterval(() => {
      setShowFlash(prev => !prev);
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, flashEnabled]);

  // Cleanup à la fermeture
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  // Démarrer automatiquement
  useEffect(() => {
    // Petit délai pour laisser le composant se monter
    const timer = setTimeout(() => {
      startSound();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-50 transition-colors duration-100 ${
        showFlash ? 'bg-white' : 'bg-red-900'
      }`}
    >
      {/* Audio fallback */}
      <audio ref={audioElementRef} src="/sounds/siren.mp3" preload="auto" />

      {/* Contenu */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        {/* Bouton fermer */}
        <button
          onClick={() => {
            stopSound();
            onStop();
          }}
          className="absolute top-4 right-4 p-3 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
        >
          <X className="w-8 h-8 text-white" />
        </button>

        {/* Icône animée */}
        <div className={`mb-8 transition-transform ${isPlaying ? 'animate-bounce' : ''}`}>
          <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50">
            {isPlaying ? (
              <Volume2 className="w-16 h-16 text-white animate-pulse" />
            ) : (
              <VolumeX className="w-16 h-16 text-white/50" />
            )}
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          SIRÈNE D'URGENCE
        </h1>
        
        <p className={`text-lg mb-8 ${showFlash ? 'text-red-600' : 'text-white/80'}`}>
          {isPlaying ? 'Son à volume maximal en cours...' : 'Prêt à émettre'}
        </p>

        {/* Sélection du son */}
        <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm">
          {SOUNDS.map(sound => (
            <button
              key={sound.id}
              onClick={() => {
                setSelectedSound(sound.id);
                if (isPlaying) {
                  stopSound();
                  setTimeout(startSound, 100);
                }
              }}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                selectedSound === sound.id
                  ? 'bg-white text-red-600 ring-4 ring-white/50'
                  : 'bg-red-800/50 text-white hover:bg-red-700/50'
              }`}
            >
              <span className="text-3xl">{sound.icon}</span>
              <span className="text-sm font-bold">{sound.name}</span>
            </button>
          ))}
        </div>

        {/* Toggle flash */}
        <button
          onClick={() => setFlashEnabled(!flashEnabled)}
          className={`px-6 py-3 rounded-xl mb-6 transition-all ${
            flashEnabled
              ? 'bg-yellow-500 text-black'
              : 'bg-red-800/50 text-white/60'
          }`}
        >
          {flashEnabled ? '⚡ Flash activé' : '⚡ Flash désactivé'}
        </button>

        {/* Bouton principal */}
        {isPlaying ? (
          <button
            onClick={stopSound}
            className="w-full max-w-sm py-5 bg-black text-white text-xl font-black rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            ARRÊTER LA SIRÈNE
          </button>
        ) : (
          <button
            onClick={startSound}
            className="w-full max-w-sm py-5 bg-white text-red-600 text-xl font-black rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            ACTIVER LA SIRÈNE
          </button>
        )}

        {/* Bouton quitter */}
        <button
          onClick={() => {
            stopSound();
            onStop();
          }}
          className="mt-6 text-white/60 hover:text-white transition-colors"
        >
          Retour à l'accueil
        </button>

        {/* Avertissement */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/40 px-4">
          ⚠️ Cette sirène est conçue pour les situations d'urgence réelles uniquement.
        </p>
      </div>
    </div>
  );
};

export default SirenMode;