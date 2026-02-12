import React, { useState, useEffect } from 'react';
import { 
  Users, Wifi, WifiOff, MapPin, Bell, BellOff,
  Send, AlertTriangle, CheckCircle, XCircle,
  Phone, Navigation, ChevronDown, ChevronUp,
  Zap, Shield, Radio
} from 'lucide-react';

const CommunityTab = ({ 
  communityHook, 
  location, 
  isPremium, 
  onUpgradeNeeded 
}) => {
  const {
    isEnabled,
    nearbyUsers,
    nearbyCount,
    alertRadius,
    incomingAlerts,
    isLoading,
    error,
    myAlertActive,
    toggleCommunityMode,
    updateAlertRadius,
    sendCommunityAlert,
    cancelMyAlert,
    respondToAlert,
    dismissAlert,
    simulateIncomingAlert,
    requestNotificationPermission
  } = communityHook;

  const [showSettings, setShowSettings] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Demander les permissions au montage
  useEffect(() => {
    if (isEnabled) {
      requestNotificationPermission();
    }
  }, [isEnabled]);

  // Activer le mode communautaire
  const handleToggle = (enabled) => {
    if (enabled && !isPremium) {
      onUpgradeNeeded?.('communityAlerts');
      return;
    }
    toggleCommunityMode(enabled);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          🌍 Alertes Communautaires
        </h2>
        <p className="text-slate-400 text-sm">
          Alertez et soyez alerté par les utilisateurs à proximité
        </p>
      </div>

      {/* Toggle principal */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isEnabled ? 'bg-green-500/20' : 'bg-slate-700'
            }`}>
              {isEnabled ? (
                <Radio className="w-6 h-6 text-green-400" />
              ) : (
                <WifiOff className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="text-white font-medium">Mode Communautaire</h3>
              <p className="text-slate-400 text-sm">
                {isEnabled 
                  ? `${nearbyCount} utilisateur(s) à proximité` 
                  : 'Désactivé'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => handleToggle(!isEnabled)}
            disabled={isLoading}
            className={`w-14 h-8 rounded-full transition-colors relative ${
              isEnabled ? 'bg-green-500' : 'bg-slate-600'
            }`}
          >
            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
              isEnabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>

        {!isPremium && (
          <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-400 text-xs text-center">
              ⭐ Fonctionnalité Premium
            </p>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
          <p className="text-red-300 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Contenu quand activé */}
      {isEnabled && (
        <>
          {/* Alertes entrantes */}
          {incomingAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400 animate-pulse" />
                Alertes à proximité ({incomingAlerts.length})
              </h3>
              
              {incomingAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-red-600/20 border border-red-500/50 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <div>
                        <p className="text-red-300 font-medium">SOS à {alert.distance}m</p>
                        <p className="text-red-300/60 text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-white text-sm">{alert.message}</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => respondToAlert(alert.id, 'coming')}
                      className="py-2 bg-green-600 rounded-lg text-white text-xs font-medium
                                 hover:bg-green-500 transition-colors"
                    >
                      🏃 J'arrive
                    </button>
                    <button
                      onClick={() => respondToAlert(alert.id, 'calling_help')}
                      className="py-2 bg-blue-600 rounded-lg text-white text-xs font-medium
                                 hover:bg-blue-500 transition-colors"
                    >
                      📞 J'appelle
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="py-2 bg-slate-700 rounded-lg text-white text-xs font-medium
                                 hover:bg-slate-600 transition-colors"
                    >
                      🗺️ Voir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mon alerte active */}
          {myAlertActive && (
            <div className="bg-orange-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-white animate-pulse" />
                  <div>
                    <p className="text-white font-bold">Votre alerte est active</p>
                    <p className="text-white/70 text-sm">
                      {nearbyCount} personne(s) notifiée(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelMyAlert}
                  className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm
                             hover:bg-white/30 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Envoyer une alerte */}
          {!myAlertActive && (
            <div className="space-y-3">
              <h3 className="text-white font-medium">Envoyer une alerte</h3>
              
              <input
                type="text"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Message optionnel..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl
                           text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
              
              <button
                onClick={() => {
                  sendCommunityAlert({
                    message: alertMessage || 'Besoin d\'aide!',
                    type: 'sos',
                    severity: 'high'
                  });
                  setAlertMessage('');
                }}
                disabled={!location}
                className="w-full py-4 bg-red-600 rounded-xl flex items-center justify-center gap-3
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-red-500 transition-colors"
              >
                <Send className="w-6 h-6 text-white" />
                <span className="text-white font-bold">
                  Alerter {nearbyCount} personne(s) à proximité
                </span>
              </button>
            </div>
          )}

          {/* Utilisateurs à proximité */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                À proximité
              </h3>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                {nearbyCount} en ligne
              </span>
            </div>
            
            <div className="space-y-2">
              {nearbyUsers.slice(0, 5).map((user, index) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{index + 1}</span>
                    </div>
                    <span className="text-slate-300 text-sm">Utilisateur anonyme</span>
                  </div>
                  <span className="text-slate-400 text-sm">{user.distance}m</span>
                </div>
              ))}
              
              {nearbyCount === 0 && (
                <p className="text-slate-500 text-center py-4">
                  Aucun utilisateur détecté dans votre rayon
                </p>
              )}
            </div>
          </div>

          {/* Paramètres */}
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50"
            >
              <span className="text-white font-medium">⚙️ Paramètres</span>
              {showSettings ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {showSettings && (
              <div className="p-4 border-t border-slate-800 space-y-4">
                {/* Rayon d'alerte */}
                <div>
                  <label className="block text-slate-300 text-sm mb-2">
                    Rayon de détection: {alertRadius}m
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={alertRadius}
                    onChange={(e) => updateAlertRadius(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                               accent-red-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>100m</span>
                    <span>2km</span>
                  </div>
                </div>

                {/* Test d'alerte (dev only) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={simulateIncomingAlert}
                    className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm"
                  >
                    🧪 Simuler une alerte (test)
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Info quand désactivé */}
      {!isEnabled && (
        <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">Rejoignez la communauté</h3>
            <p className="text-slate-400 text-sm">
              Activez le mode communautaire pour être connecté avec d'autres 
              utilisateurs SOS Africa à proximité et recevoir/envoyer des alertes.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <Shield className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-white text-sm font-medium">Protection mutuelle</p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <Navigation className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-white text-sm font-medium">Réponse rapide</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityTab;