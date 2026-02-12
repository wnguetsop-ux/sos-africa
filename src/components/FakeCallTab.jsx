import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, PhoneCall, PhoneOff, Clock, User, 
  Volume2, VolumeX, Settings, ChevronRight 
} from 'lucide-react';

// Contacts fictifs pré-configurés
const DEFAULT_CALLERS = [
  { id: 1, name: 'Maman', avatar: '👩', delay: 5 },
  { id: 2, name: 'Papa', avatar: '👨', delay: 5 },
  { id: 3, name: 'Bureau', avatar: '🏢', delay: 5 },
  { id: 4, name: 'Ami(e)', avatar: '🧑', delay: 5 },
  { id: 5, name: 'Urgences', avatar: '🚨', delay: 3 },
];

const FakeCallTab = () => {
  const [selectedCaller, setSelectedCaller] = useState(DEFAULT_CALLERS[0]);
  const [delay, setDelay] = useState(5);
  const [countdown, setCountdown] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customName, setCustomName] = useState('');
  const [ringtoneEnabled, setRingtoneEnabled] = useState(true);
  
  const audioRef = useRef(null);
  const vibrationInterval = useRef(null);

  // Gestion du compte à rebours
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Déclencher l'appel
      startFakeCall();
    }
  }, [countdown]);

  // Durée de l'appel
  useEffect(() => {
    if (!callAccepted) return;
    
    const timer = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [callAccepted]);

  // Programmer un faux appel
  const scheduleFakeCall = () => {
    setCountdown(delay);
    
    // Vibration de confirmation
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // Annuler le compte à rebours
  const cancelSchedule = () => {
    setCountdown(null);
  };

  // Démarrer le faux appel
  const startFakeCall = () => {
    setCallActive(true);
    setCountdown(null);
    
    // Jouer la sonnerie
    if (ringtoneEnabled && audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log('Audio blocked:', e));
    }
    
    // Vibration continue
    if (navigator.vibrate) {
      vibrationInterval.current = setInterval(() => {
        navigator.vibrate([500, 200]);
      }, 1000);
    }
  };

  // Accepter l'appel
  const acceptCall = () => {
    setCallAccepted(true);
    setCallDuration(0);
    
    // Arrêter la sonnerie
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Arrêter la vibration
    if (vibrationInterval.current) {
      clearInterval(vibrationInterval.current);
      navigator.vibrate(0);
    }
  };

  // Terminer l'appel
  const endCall = () => {
    setCallActive(false);
    setCallAccepted(false);
    setCallDuration(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (vibrationInterval.current) {
      clearInterval(vibrationInterval.current);
      navigator.vibrate(0);
    }
  };

  // Formater la durée
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Écran d'appel entrant
  if (callActive && !callAccepted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col">
        {/* Audio de sonnerie */}
        <audio ref={audioRef} src="/sounds/ringtone.mp3" />
        
        {/* Contenu */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Animation d'appel entrant */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-slate-600">
              {selectedCaller.avatar}
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {customName || selectedCaller.name}
          </h2>
          <p className="text-lg text-green-400 animate-pulse">Appel entrant...</p>
        </div>
        
        {/* Boutons d'action */}
        <div className="p-8 flex justify-around items-center">
          {/* Refuser */}
          <button
            onClick={endCall}
            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
          >
            <PhoneOff className="w-10 h-10 text-white" />
          </button>
          
          {/* Accepter */}
          <button
            onClick={acceptCall}
            className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 active:scale-95 transition-transform"
          >
            <Phone className="w-10 h-10 text-white" />
          </button>
        </div>
        
        {/* Swipe hint */}
        <p className="text-center text-slate-500 pb-8 text-sm">
          Glissez pour répondre ou appuyez sur un bouton
        </p>
      </div>
    );
  }

  // Écran d'appel en cours
  if (callActive && callAccepted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-green-900 via-slate-900 to-slate-900 z-50 flex flex-col">
        {/* Contenu */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-28 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-5xl shadow-xl mb-6">
            {selectedCaller.avatar}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {customName || selectedCaller.name}
          </h2>
          
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
          </div>
        </div>
        
        {/* Actions de l'appel */}
        <div className="p-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-2xl">
              <VolumeX className="w-6 h-6 text-slate-400" />
              <span className="text-xs text-slate-400">Muet</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-2xl">
              <Volume2 className="w-6 h-6 text-slate-400" />
              <span className="text-xs text-slate-400">HP</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-2xl">
              <User className="w-6 h-6 text-slate-400" />
              <span className="text-xs text-slate-400">Contact</span>
            </button>
          </div>
          
          {/* Raccrocher */}
          <div className="flex justify-center">
            <button
              onClick={endCall}
              className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
            >
              <PhoneOff className="w-10 h-10 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interface de configuration
  return (
    <div className="p-4 space-y-4">
      {/* Audio preload */}
      <audio ref={audioRef} src="/sounds/ringtone.mp3" preload="auto" />
      
      {/* Header */}
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
          <PhoneCall className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Faux Appel</h2>
        <p className="text-slate-400 mt-1">Simulez un appel pour vous échapper</p>
      </div>

      {/* Compte à rebours actif */}
      {countdown !== null && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center">
          <p className="text-green-400 mb-2">Appel dans</p>
          <p className="text-5xl font-bold text-white mb-4">{countdown}s</p>
          <button
            onClick={cancelSchedule}
            className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-500 transition-colors"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Sélection du contact */}
      {countdown === null && (
        <>
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Qui vous appelle ?</h3>
            <div className="grid grid-cols-3 gap-2">
              {DEFAULT_CALLERS.map(caller => (
                <button
                  key={caller.id}
                  onClick={() => {
                    setSelectedCaller(caller);
                    setCustomName('');
                  }}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    selectedCaller.id === caller.id
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-2xl">{caller.avatar}</span>
                  <span className="text-xs font-medium">{caller.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nom personnalisé */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <label className="text-sm font-semibold text-slate-400 block mb-2">
              Nom personnalisé (optionnel)
            </label>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="Ex: Dr. Martin"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Délai */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">Délai avant l'appel</span>
              </div>
              <span className="text-lg font-bold text-white">{delay}s</span>
            </div>
            <input
              type="range"
              min="3"
              max="60"
              value={delay}
              onChange={e => setDelay(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>3s</span>
              <span>30s</span>
              <span>60s</span>
            </div>
          </div>

          {/* Options */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700">
            <button
              onClick={() => setRingtoneEnabled(!ringtoneEnabled)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {ringtoneEnabled ? (
                  <Volume2 className="w-5 h-5 text-green-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-white font-medium">Sonnerie</span>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                ringtoneEnabled ? 'bg-green-500' : 'bg-slate-600'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  ringtoneEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>

          {/* Bouton principal */}
          <button
            onClick={scheduleFakeCall}
            className="w-full py-5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-2xl shadow-lg shadow-green-500/30 active:scale-[0.98] transition-transform"
          >
            Programmer l'appel
          </button>

          {/* Instructions */}
          <div className="bg-slate-800/30 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-400 mb-2">💡 Comment ça marche</h4>
            <ul className="text-sm text-slate-500 space-y-1">
              <li>1. Choisissez qui vous "appelle"</li>
              <li>2. Réglez le délai souhaité</li>
              <li>3. Rangez votre téléphone dans votre poche</li>
              <li>4. L'appel arrivera automatiquement</li>
              <li>5. Prétextez que vous devez répondre et partez</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default FakeCallTab;