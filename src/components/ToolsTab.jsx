import React, { useState, useRef } from 'react';
import { 
  Mic, MicOff, Phone, Volume2, Moon, Route, Users,
  Camera, Car, Play, Square, Clock, AlertTriangle,
  Check, X, ChevronRight, MapPin, Bell, Shield
} from 'lucide-react';

const ToolsTab = ({ 
  t, 
  isDark, 
  audioRecording, 
  onFakeCall, 
  onSiren, 
  onGhostMode,
  communityHook,
  journeyHook,
  isPremium 
}) => {
  const [expandedTool, setExpandedTool] = useState(null);
  const [selectedCaller, setSelectedCaller] = useState('Maman');
  const [callDelay, setCallDelay] = useState(5);
  const [journeyDest, setJourneyDest] = useState('');
  const [journeyTime, setJourneyTime] = useState(30);
  const [showReportModal, setShowReportModal] = useState(false);
  const [platePhoto, setPlatePhoto] = useState(null);
  const [plateNote, setPlateNote] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  const callers = [
    { id: 'mom', name: 'Maman', emoji: '👩' },
    { id: 'dad', name: 'Papa', emoji: '👨' },
    { id: 'boss', name: 'Patron', emoji: '👔' },
    { id: 'friend', name: 'Ami(e)', emoji: '👋' },
    { id: 'doctor', name: 'Médecin', emoji: '👨‍⚕️' },
    { id: 'taxi', name: 'Taxi', emoji: '🚕' },
  ];

  // Ouvrir la caméra pour photographier la plaque
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Erreur caméra:', error);
      alert('Impossible d\'accéder à la caméra');
    }
  };

  // Prendre la photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setPlatePhoto(photoData);

    // Arrêter la caméra
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Sauvegarder la photo de plaque
  const savePlatePhoto = () => {
    if (!platePhoto) return;

    const savedPlates = JSON.parse(localStorage.getItem('sos_plate_photos') || '[]');
    savedPlates.push({
      id: Date.now(),
      photo: platePhoto,
      note: plateNote,
      timestamp: new Date().toISOString(),
      location: null // Ajouter la position GPS si disponible
    });
    localStorage.setItem('sos_plate_photos', JSON.stringify(savedPlates));

    setPlatePhoto(null);
    setPlateNote('');
    setExpandedTool(null);
    
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    alert('✅ Photo de plaque sauvegardée!');
  };

  // Démarrer le mode trajet
  const handleStartJourney = () => {
    if (!journeyDest.trim()) {
      alert('Entrez une destination');
      return;
    }
    
    const success = journeyHook.startJourney(journeyDest, journeyTime, null);
    if (success) {
      setExpandedTool(null);
    }
  };

  // Outils disponibles
  const tools = [
    {
      id: 'recording',
      title: 'Enregistrement Audio',
      description: audioRecording.isRecording ? 'En cours...' : 'Enregistrer discrètement',
      icon: audioRecording.isRecording ? MicOff : Mic,
      color: audioRecording.isRecording ? 'red' : 'blue',
      badge: audioRecording.isRecording ? '● REC' : null
    },
    {
      id: 'plate',
      title: 'Photo Plaque',
      description: 'Photographier une plaque d\'immatriculation',
      icon: Car,
      color: 'purple'
    },
    {
      id: 'fakecall',
      title: 'Faux Appel',
      description: 'Simuler un appel entrant',
      icon: Phone,
      color: 'green'
    },
    {
      id: 'siren',
      title: 'Sirène d\'Urgence',
      description: 'Déclencher une alarme forte',
      icon: Volume2,
      color: 'orange'
    },
    {
      id: 'ghost',
      title: 'Mode Furtif',
      description: 'Écran noir, GPS actif',
      icon: Moon,
      color: 'indigo'
    },
    {
      id: 'journey',
      title: 'Mode Accompagnement',
      description: journeyHook.isActive ? `Vers ${journeyHook.destination}` : 'Suivi de trajet sécurisé',
      icon: Route,
      color: 'teal',
      badge: journeyHook.isActive ? 'ACTIF' : null
    },
    {
      id: 'community',
      title: 'Alertes Communautaires',
      description: `${communityHook.alerts?.length || 0} alertes à proximité`,
      icon: Users,
      color: 'pink'
    }
  ];

  const getColorClasses = (color, active = false) => {
    const colors = {
      blue: active ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      red: active ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400 border-red-500/30',
      green: active ? 'bg-green-500 text-white' : 'bg-green-500/20 text-green-400 border-green-500/30',
      orange: active ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      purple: active ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      indigo: active ? 'bg-indigo-500 text-white' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      teal: active ? 'bg-teal-500 text-white' : 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      pink: active ? 'bg-pink-500 text-white' : 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      <h2 className={`text-xl font-bold ${textColor} mb-4`}>🛠️ Outils de Sécurité</h2>

      {/* Grille d'outils */}
      <div className="space-y-3">
        {tools.map((tool) => (
          <div key={tool.id} className={`${bgCard} rounded-2xl border ${borderColor} overflow-hidden`}>
            {/* Header de l'outil */}
            <button
              onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
              className="w-full p-4 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(tool.color)}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${textColor}`}>{tool.title}</p>
                  {tool.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tool.badge === '● REC' ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'
                    }`}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${textSecondary}`}>{tool.description}</p>
              </div>
              <ChevronRight className={`w-5 h-5 ${textSecondary} transition-transform ${expandedTool === tool.id ? 'rotate-90' : ''}`} />
            </button>

            {/* Contenu étendu */}
            {expandedTool === tool.id && (
              <div className={`px-4 pb-4 border-t ${borderColor}`}>
                {/* Enregistrement Audio */}
                {tool.id === 'recording' && (
                  <div className="pt-4 space-y-4">
                    {audioRecording.isRecording ? (
                      <>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <Mic className="w-10 h-10 text-red-500" />
                          </div>
                          <p className="text-red-400 font-bold mt-2">Enregistrement en cours</p>
                          <p className={textSecondary}>Durée: {Math.floor(audioRecording.duration / 60)}:{(audioRecording.duration % 60).toString().padStart(2, '0')}</p>
                        </div>
                        <button
                          onClick={audioRecording.stopRecording}
                          className="w-full py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          <Square className="w-5 h-5" />
                          Arrêter l'enregistrement
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={`${textSecondary} text-sm`}>
                          Enregistrez discrètement en cas de danger. Le fichier sera sauvegardé localement.
                        </p>
                        <button
                          onClick={audioRecording.startRecording}
                          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          <Mic className="w-5 h-5" />
                          Démarrer l'enregistrement
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Photo Plaque */}
                {tool.id === 'plate' && (
                  <div className="pt-4 space-y-4">
                    <p className={`${textSecondary} text-sm`}>
                      📸 Photographiez la plaque d'immatriculation d'un taxi ou véhicule avant d'y monter.
                    </p>
                    
                    {!platePhoto ? (
                      <>
                        <video 
                          ref={videoRef} 
                          className="w-full h-48 bg-black rounded-xl object-cover"
                          playsInline
                          muted
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        <div className="flex gap-3">
                          <button
                            onClick={openCamera}
                            className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                          >
                            <Camera className="w-5 h-5" />
                            Ouvrir Caméra
                          </button>
                          <button
                            onClick={capturePhoto}
                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            Capturer
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={platePhoto} alt="Plaque" className="w-full h-48 object-cover rounded-xl" />
                        <input
                          type="text"
                          value={plateNote}
                          onChange={(e) => setPlateNote(e.target.value)}
                          placeholder="Note (ex: Taxi jaune, direction aéroport)"
                          className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => setPlatePhoto(null)}
                            className={`flex-1 py-3 rounded-xl font-bold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                          >
                            Reprendre
                          </button>
                          <button
                            onClick={savePlatePhoto}
                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl"
                          >
                            ✓ Sauvegarder
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Faux Appel */}
                {tool.id === 'fakecall' && (
                  <div className="pt-4 space-y-4">
                    <p className={`${textSecondary} text-sm mb-3`}>
                      Simulez un appel entrant pour vous sortir d'une situation inconfortable.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {callers.map((caller) => (
                        <button
                          key={caller.id}
                          onClick={() => setSelectedCaller(caller.name)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedCaller === caller.name
                              ? 'border-green-500 bg-green-500/20'
                              : `${borderColor} ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`
                          }`}
                        >
                          <span className="text-2xl">{caller.emoji}</span>
                          <p className={`text-xs mt-1 ${textColor}`}>{caller.name}</p>
                        </button>
                      ))}
                    </div>

                    <div>
                      <p className={`${textSecondary} text-sm mb-2`}>Délai avant l'appel:</p>
                      <div className="flex gap-2">
                        {[5, 10, 30, 60].map((delay) => (
                          <button
                            key={delay}
                            onClick={() => setCallDelay(delay)}
                            className={`flex-1 py-2 rounded-xl border-2 ${
                              callDelay === delay
                                ? 'border-green-500 bg-green-500/20 text-green-400'
                                : `${borderColor} ${textSecondary}`
                            }`}
                          >
                            {delay}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onFakeCall({ name: selectedCaller }, callDelay);
                        setExpandedTool(null);
                      }}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Programmer l'appel
                    </button>
                  </div>
                )}

                {/* Sirène */}
                {tool.id === 'siren' && (
                  <div className="pt-4 space-y-4">
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                      <p className="text-orange-400 text-sm">
                        ⚠️ La sirène émet un son très fort. Utilisez-la uniquement en cas de danger réel.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onSiren();
                        setExpandedTool(null);
                      }}
                      className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-6 h-6" />
                      ACTIVER LA SIRÈNE
                    </button>
                  </div>
                )}

                {/* Mode Furtif */}
                {tool.id === 'ghost' && (
                  <div className="pt-4 space-y-4">
                    <p className={`${textSecondary} text-sm`}>
                      L'écran devient noir mais le GPS reste actif. Triple-tap pour déclencher l'alerte SOS.
                    </p>
                    <button
                      onClick={() => {
                        onGhostMode();
                        setExpandedTool(null);
                      }}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Moon className="w-5 h-5" />
                      Activer le mode furtif
                    </button>
                  </div>
                )}

                {/* Mode Accompagnement */}
                {tool.id === 'journey' && (
                  <div className="pt-4 space-y-4">
                    {journeyHook.isActive ? (
                      <>
                        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                          <p className="text-green-400 font-semibold">🚗 Trajet en cours</p>
                          <p className={textSecondary}>Destination: {journeyHook.destination}</p>
                          <p className={textSecondary}>Temps écoulé: {journeyHook.elapsedTime} min / {journeyHook.estimatedTime} min</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => journeyHook.checkIn()}
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl"
                          >
                            ✓ Je suis OK
                          </button>
                          <button
                            onClick={() => journeyHook.stopJourney(true)}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl"
                          >
                            Terminer
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className={`${textSecondary} text-sm`}>
                          Un contact sera notifié de votre trajet et alerté si vous n'arrivez pas à temps.
                        </p>
                        <input
                          type="text"
                          value={journeyDest}
                          onChange={(e) => setJourneyDest(e.target.value)}
                          placeholder="Destination (ex: Maison, Bureau...)"
                          className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
                        />
                        <div>
                          <p className={`${textSecondary} text-sm mb-2`}>Durée estimée:</p>
                          <div className="flex gap-2">
                            {[15, 30, 45, 60].map((time) => (
                              <button
                                key={time}
                                onClick={() => setJourneyTime(time)}
                                className={`flex-1 py-2 rounded-xl border-2 ${
                                  journeyTime === time
                                    ? 'border-teal-500 bg-teal-500/20 text-teal-400'
                                    : `${borderColor} ${textSecondary}`
                                }`}
                              >
                                {time} min
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={handleStartJourney}
                          className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Démarrer le trajet
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Alertes Communautaires */}
                {tool.id === 'community' && (
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className={textSecondary}>
                        {communityHook.nearbyUsers} utilisateurs à proximité
                      </p>
                      <button
                        onClick={communityHook.loadAlerts}
                        className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                      >
                        🔄
                      </button>
                    </div>

                    {/* Liste des alertes */}
                    {communityHook.alerts?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {communityHook.alerts.map((alert) => (
                          <div key={alert.id} className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center gap-3`}>
                            <span className="text-2xl">{alert.icon}</span>
                            <div className="flex-1">
                              <p className={`font-medium ${textColor}`}>{alert.label}</p>
                              <p className={`text-xs ${textSecondary}`}>
                                {new Date(alert.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button
                              onClick={() => communityHook.confirmAlert(alert.id)}
                              className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
                            >
                              +{alert.confirmations}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center ${textSecondary} py-4`}>Aucune alerte à proximité</p>
                    )}

                    {/* Bouton signaler */}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full py-3 bg-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      Signaler un danger
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal signaler danger */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowReportModal(false)} />
          <div className={`relative w-full max-w-sm ${bgCard} rounded-2xl p-6`}>
            <h3 className={`text-lg font-bold ${textColor} mb-4`}>Signaler un danger</h3>
            <div className="grid grid-cols-2 gap-2">
              {communityHook.alertTypes?.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    communityHook.reportAlert(type.id);
                    setShowReportModal(false);
                  }}
                  className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex flex-col items-center gap-2`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className={`text-xs ${textColor}`}>{type.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReportModal(false)}
              className={`w-full mt-4 py-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'} ${textColor}`}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsTab;