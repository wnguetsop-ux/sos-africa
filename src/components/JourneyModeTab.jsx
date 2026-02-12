import React, { useState } from 'react';
import { 
  Navigation, MapPin, Clock, User, Phone, Play, 
  Pause, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, History, Shield
} from 'lucide-react';

const JourneyModeTab = ({ 
  journeyHook, 
  contacts, 
  isPremium, 
  onUpgradeNeeded 
}) => {
  const {
    isActive,
    status,
    destinationName,
    formattedElapsed,
    formattedEstimated,
    isOverdue,
    guardianName,
    journeyHistory,
    startJourney,
    confirmCheckIn,
    confirmArrival,
    triggerJourneyAlert,
    cancelJourney,
    formatTime
  } = journeyHook;

  const [showSetup, setShowSetup] = useState(!isActive);
  const [showHistory, setShowHistory] = useState(false);
  
  // Formulaire de configuration
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [checkInterval, setCheckInterval] = useState(10);

  // Démarrer un trajet
  const handleStartJourney = () => {
    if (!isPremium && journeyHistory.length >= 5) {
      onUpgradeNeeded?.('journey');
      return;
    }

    if (!destination || !selectedGuardian) {
      return;
    }

    startJourney({
      destination: null, // Coordonnées si on avait une carte
      destinationName: destination,
      duration: duration,
      guardian: selectedGuardian.phone,
      guardianName: selectedGuardian.name,
      checkInterval: checkInterval
    });

    setShowSetup(false);
  };

  // Rendu pendant un trajet actif
  if (isActive) {
    return (
      <div className="p-4 space-y-6">
        {/* Header avec statut */}
        <div className={`p-4 rounded-xl ${
          status === 'alert' ? 'bg-red-600' :
          isOverdue ? 'bg-orange-600' :
          status === 'waiting_checkin' ? 'bg-yellow-600' :
          'bg-green-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-white font-bold">Trajet en cours</h2>
                <p className="text-white/80 text-sm">{destinationName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-xl">{formattedElapsed}</p>
              <p className="text-white/60 text-xs">/ {formattedEstimated}</p>
            </div>
          </div>
        </div>

        {/* Alerte de check-in */}
        {status === 'waiting_checkin' && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 animate-pulse">
            <div className="text-center">
              <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-yellow-400 font-bold text-lg">Check-in requis!</h3>
              <p className="text-yellow-300/80 text-sm mb-4">
                Confirmez que vous allez bien
              </p>
              <button
                onClick={confirmCheckIn}
                className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl
                           hover:bg-yellow-400 transition-colors"
              >
                ✓ Je vais bien
              </button>
            </div>
          </div>
        )}

        {/* Infos gardien */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-xs">Gardien notifié</p>
              <p className="text-white font-medium">{guardianName}</p>
            </div>
            <Shield className="w-5 h-5 text-green-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Arrivée confirmée */}
          <button
            onClick={confirmArrival}
            className="p-4 bg-green-600 rounded-xl flex flex-col items-center gap-2
                       hover:bg-green-500 transition-colors"
          >
            <CheckCircle className="w-8 h-8 text-white" />
            <span className="text-white font-medium text-sm">Je suis arrivé(e)</span>
          </button>

          {/* Annuler */}
          <button
            onClick={cancelJourney}
            className="p-4 bg-slate-700 rounded-xl flex flex-col items-center gap-2
                       hover:bg-slate-600 transition-colors"
          >
            <XCircle className="w-8 h-8 text-slate-300" />
            <span className="text-slate-300 font-medium text-sm">Annuler trajet</span>
          </button>
        </div>

        {/* Bouton SOS */}
        <button
          onClick={() => triggerJourneyAlert('sos')}
          className="w-full py-4 bg-red-600 rounded-xl flex items-center justify-center gap-3
                     hover:bg-red-500 transition-colors"
        >
          <AlertTriangle className="w-6 h-6 text-white" />
          <span className="text-white font-bold">🆘 ALERTE D'URGENCE</span>
        </button>
      </div>
    );
  }

  // Rendu du formulaire de configuration
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          🚶 Mode Accompagnement
        </h2>
        <p className="text-slate-400 text-sm">
          Faites-vous accompagner virtuellement pendant vos trajets
        </p>
      </div>

      {/* Formulaire */}
      <div className="space-y-4">
        {/* Destination */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Où allez-vous?
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ex: Bureau, Maison de Maman, Centre commercial..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl
                       text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Durée estimée */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Durée estimée: {duration} min
          </label>
          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                       accent-red-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>5 min</span>
            <span>3 heures</span>
          </div>
        </div>

        {/* Sélection du gardien */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Qui doit vous surveiller?
          </label>
          {contacts.length === 0 ? (
            <div className="p-4 bg-slate-800 rounded-xl text-center">
              <p className="text-slate-400 text-sm">
                Ajoutez d'abord des contacts d'urgence dans Réglages
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedGuardian(contact)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedGuardian?.id === contact.id
                      ? 'bg-red-600 border-2 border-red-400'
                      : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
                  }`}
                >
                  <p className="text-white font-medium text-sm truncate">
                    {contact.name}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {contact.phone}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Intervalle de check-in */}
        <div>
          <label className="block text-slate-300 text-sm mb-2">
            Check-in toutes les: {checkInterval} min
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 30].map((interval) => (
              <button
                key={interval}
                onClick={() => setCheckInterval(interval)}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  checkInterval === interval
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {interval}min
              </button>
            ))}
          </div>
        </div>

        {/* Bouton démarrer */}
        <button
          onClick={handleStartJourney}
          disabled={!destination || !selectedGuardian}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 
                     rounded-xl flex items-center justify-center gap-3
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-green-500 hover:to-green-400 transition-all"
        >
          <Play className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-lg">Démarrer le trajet</span>
        </button>
      </div>

      {/* Explication */}
      <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
        <h3 className="text-white font-medium text-sm">ℹ️ Comment ça marche?</h3>
        <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
          <li>Votre gardien est notifié de votre départ</li>
          <li>Des check-ins réguliers vérifient que vous allez bien</li>
          <li>Si vous ne répondez pas, une alerte est envoyée</li>
          <li>À l'arrivée, confirmez et votre gardien est notifié</li>
        </ol>
      </div>

      {/* Historique */}
      <div className="bg-slate-900 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <span className="text-white font-medium">Trajets récents</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-300">
              {journeyHistory.length}
            </span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-slate-800 max-h-48 overflow-y-auto">
            {journeyHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Aucun trajet enregistré
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {journeyHistory.slice(0, 10).map((journey) => (
                  <div key={journey.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{journey.destinationName}</p>
                      <p className="text-slate-400 text-xs">
                        {new Date(journey.startTime).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      journey.status === 'arrived' ? 'bg-green-500/20 text-green-400' :
                      journey.status === 'alert' ? 'bg-red-500/20 text-red-400' :
                      journey.status === 'cancelled' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {journey.status === 'arrived' ? '✓ Arrivé' :
                       journey.status === 'alert' ? '⚠ Alerte' :
                       journey.status === 'cancelled' ? 'Annulé' :
                       'En cours'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyModeTab;