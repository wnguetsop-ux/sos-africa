import React, { useState } from 'react';
import { 
  Mic, Phone, Volume2, Users, Moon, Navigation,
  Play, Square, Clock, ChevronRight, Shield,
  Radio, AlertCircle, PhoneCall
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
  const [activeSection, setActiveSection] = useState(null);
  const [selectedCaller, setSelectedCaller] = useState('mom');
  const [callDelay, setCallDelay] = useState(5);

  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  const callers = [
    { id: 'mom', name: 'Maman', icon: '👩' },
    { id: 'dad', name: 'Papa', icon: '👨' },
    { id: 'boss', name: 'Patron', icon: '👔' },
    { id: 'friend', name: 'Ami(e)', icon: '🧑‍🤝‍🧑' },
    { id: 'doctor', name: 'Docteur', icon: '👨‍⚕️' },
    { id: 'taxi', name: 'Taxi', icon: '🚕' }
  ];

  const tools = [
    {
      id: 'recording',
      icon: Mic,
      title: t('tools.audioRecording'),
      description: t('tools.audioDesc'),
      color: 'blue',
      active: audioRecording?.isRecording
    },
    {
      id: 'fakecall',
      icon: Phone,
      title: t('tools.fakeCall'),
      description: t('tools.fakeCallDesc'),
      color: 'orange'
    },
    {
      id: 'siren',
      icon: Volume2,
      title: t('tools.siren'),
      description: t('tools.sirenDesc'),
      color: 'pink'
    },
    {
      id: 'community',
      icon: Users,
      title: t('tools.communityAlerts'),
      description: t('tools.communityDesc'),
      color: 'cyan',
      active: communityHook?.isEnabled
    },
    {
      id: 'ghost',
      icon: Moon,
      title: t('tools.ghostMode'),
      description: t('tools.ghostDesc'),
      color: 'purple'
    },
    {
      id: 'journey',
      icon: Navigation,
      title: t('tools.journeyMode'),
      description: t('tools.journeyDesc'),
      color: 'green',
      active: journeyHook?.isActive
    }
  ];

  const handleToolClick = (toolId) => {
    switch (toolId) {
      case 'recording':
        setActiveSection(activeSection === 'recording' ? null : 'recording');
        break;
      case 'fakecall':
        setActiveSection(activeSection === 'fakecall' ? null : 'fakecall');
        break;
      case 'siren':
        onSiren?.();
        break;
      case 'community':
        setActiveSection(activeSection === 'community' ? null : 'community');
        break;
      case 'ghost':
        onGhostMode?.();
        break;
      case 'journey':
        setActiveSection(activeSection === 'journey' ? null : 'journey');
        break;
    }
  };

  const getColorClasses = (color, active = false) => {
    const colors = {
      blue: active ? 'bg-blue-500' : 'bg-blue-500/20',
      orange: active ? 'bg-orange-500' : 'bg-orange-500/20',
      pink: active ? 'bg-pink-500' : 'bg-pink-500/20',
      cyan: active ? 'bg-cyan-500' : 'bg-cyan-500/20',
      purple: active ? 'bg-purple-500' : 'bg-purple-500/20',
      green: active ? 'bg-green-500' : 'bg-green-500/20'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color, active = false) => {
    if (active) return 'text-white';
    const colors = {
      blue: 'text-blue-400',
      orange: 'text-orange-400',
      pink: 'text-pink-400',
      cyan: 'text-cyan-400',
      purple: 'text-purple-400',
      green: 'text-green-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Titre */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-purple-400" />
        </div>
        <h1 className={`text-2xl font-bold ${textColor}`}>{t('tools.title')}</h1>
      </div>

      {/* Grille des outils */}
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`${bgCard} rounded-2xl p-4 border ${borderColor} text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
              tool.active ? 'ring-2 ring-offset-2 ring-offset-slate-950' : ''
            } ${tool.active ? `ring-${tool.color}-500` : ''}`}
          >
            <div className={`w-12 h-12 ${getColorClasses(tool.color, tool.active)} rounded-xl flex items-center justify-center mb-3`}>
              <tool.icon className={`w-6 h-6 ${getIconColor(tool.color, tool.active)}`} />
            </div>
            <h3 className={`font-semibold ${textColor} text-sm mb-1`}>{tool.title}</h3>
            <p className={`text-xs ${textSecondary}`}>{tool.description}</p>
            {tool.active && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Actif
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section Enregistrement Audio */}
      {activeSection === 'recording' && (
        <div className={`${bgCard} rounded-2xl p-4 border ${borderColor} animate-in slide-in-from-top`}>
          <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}>
            <Mic className="w-5 h-5 text-blue-400" />
            {t('tools.audioRecording')}
          </h3>

          <div className="flex flex-col items-center py-6">
            {/* Bouton d'enregistrement */}
            <button
              onClick={() => {
                if (audioRecording?.isRecording) {
                  audioRecording.stopRecording();
                } else {
                  audioRecording?.startRecording();
                }
              }}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                audioRecording?.isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {audioRecording?.isRecording ? (
                <Square className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>

            <p className={`mt-4 ${textColor} font-medium`}>
              {audioRecording?.isRecording 
                ? t('tools.recordingInProgress')
                : t('tools.startRecording')
              }
            </p>

            {audioRecording?.isRecording && audioRecording?.duration && (
              <p className="text-red-400 font-mono text-lg mt-2">
                {Math.floor(audioRecording.duration / 60)}:{(audioRecording.duration % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>

          {/* Historique des enregistrements */}
          {audioRecording?.recordings?.length > 0 && (
            <div className="mt-4 border-t border-slate-700 pt-4">
              <p className={`text-sm ${textSecondary} mb-2`}>Enregistrements récents</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {audioRecording.recordings.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2 ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-lg`}>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-400" />
                      <span className={`text-sm ${textColor}`}>{rec.name || `Enregistrement ${idx + 1}`}</span>
                    </div>
                    <span className={`text-xs ${textSecondary}`}>{rec.duration || '--'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section Faux Appel */}
      {activeSection === 'fakecall' && (
        <div className={`${bgCard} rounded-2xl p-4 border ${borderColor} animate-in slide-in-from-top`}>
          <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}>
            <Phone className="w-5 h-5 text-orange-400" />
            {t('tools.fakeCall')}
          </h3>

          {/* Sélection de l'appelant */}
          <div className="mb-4">
            <p className={`text-sm ${textSecondary} mb-2`}>Choisir l'appelant</p>
            <div className="grid grid-cols-3 gap-2">
              {callers.map((caller) => (
                <button
                  key={caller.id}
                  onClick={() => setSelectedCaller(caller.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedCaller === caller.id
                      ? 'bg-orange-500 text-white'
                      : isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{caller.icon}</span>
                  <span className={`text-xs ${selectedCaller === caller.id ? 'text-white' : textColor}`}>
                    {caller.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Délai */}
          <div className="mb-4">
            <p className={`text-sm ${textSecondary} mb-2`}>Délai avant l'appel</p>
            <div className="flex gap-2">
              {[5, 10, 30, 60].map((delay) => (
                <button
                  key={delay}
                  onClick={() => setCallDelay(delay)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    callDelay === delay
                      ? 'bg-orange-500 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {delay}s
                </button>
              ))}
            </div>
          </div>

          {/* Bouton lancer */}
          <button
            onClick={() => {
              onFakeCall?.(callers.find(c => c.id === selectedCaller), callDelay);
              setActiveSection(null);
            }}
            className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500"
          >
            <PhoneCall className="w-5 h-5" />
            {t('tools.schedule')} ({callDelay}s)
          </button>
        </div>
      )}

      {/* Section Communauté */}
      {activeSection === 'community' && (
        <div className={`${bgCard} rounded-2xl p-4 border ${borderColor} animate-in slide-in-from-top`}>
          <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}>
            <Users className="w-5 h-5 text-cyan-400" />
            {t('tools.communityAlerts')}
          </h3>

          <div className="space-y-4">
            {/* Toggle activation */}
            <button
              onClick={() => communityHook?.toggleEnabled?.()}
              className={`w-full p-4 rounded-xl flex items-center justify-between ${
                communityHook?.isEnabled 
                  ? 'bg-cyan-500/20 border-2 border-cyan-500' 
                  : isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className={communityHook?.isEnabled ? 'text-cyan-400' : 'text-slate-500'} />
                <span className={textColor}>Alertes communautaires</span>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                communityHook?.isEnabled ? 'bg-cyan-500' : 'bg-slate-600'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  communityHook?.isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </button>

            {/* Stats */}
            {communityHook?.isEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <p className={`text-2xl font-bold ${textColor}`}>
                    {communityHook?.nearbyUsers || 0}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>Utilisateurs proches</p>
                </div>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                  <p className={`text-2xl font-bold ${textColor}`}>
                    {communityHook?.incomingAlerts?.length || 0}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>Alertes reçues</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Trajet */}
      {activeSection === 'journey' && (
        <div className={`${bgCard} rounded-2xl p-4 border ${borderColor} animate-in slide-in-from-top`}>
          <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}>
            <Navigation className="w-5 h-5 text-green-400" />
            {t('tools.journeyMode')}
          </h3>

          {journeyHook?.isActive ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/20' : 'bg-green-100'} border border-green-500/30`}>
                <p className="text-green-400 font-medium mb-2">Trajet en cours</p>
                <p className={textSecondary}>Destination: {journeyHook.destination || 'Non définie'}</p>
                <p className={textSecondary}>Temps restant: {journeyHook.remainingTime || '--'}min</p>
              </div>
              
              <button
                onClick={() => journeyHook?.stopJourney?.()}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl"
              >
                Arrêter le trajet
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className={`${textSecondary} mb-4`}>
                Démarrez un trajet surveillé pour que vos contacts soient alertés si vous n'arrivez pas à destination.
              </p>
              <button
                onClick={() => journeyHook?.openJourneySetup?.()}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                {t('tools.start')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolsTab;