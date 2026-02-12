import React from 'react';
import { 
  AlertTriangle, MapPin, RefreshCw, Smartphone, 
  Users, Wifi, WifiOff, Zap, ZapOff, Navigation,
  Mic, Route, Building2
} from 'lucide-react';

const HomeTab = ({ 
  location, 
  gpsLoading, 
  gpsError, 
  refreshGPS,
  contacts, 
  isOnline,
  shakeEnabled,
  setShakeEnabled,
  onTriggerSOS,
  isPremium,
  journeyActive,
  recordingActive,
  userName,
  t,
  isDark
}) => {
  // Villes du Cameroun pour affichage fictif
  const cameroonCities = [
    { name: 'Douala', region: 'Littoral', lat: 4.0511, lng: 9.7679 },
    { name: 'Yaoundé', region: 'Centre', lat: 3.8480, lng: 11.5021 },
    { name: 'Bafoussam', region: 'Ouest', lat: 5.4737, lng: 10.4179 },
    { name: 'Bamenda', region: 'Nord-Ouest', lat: 5.9631, lng: 10.1591 },
    { name: 'Garoua', region: 'Nord', lat: 9.3000, lng: 13.4000 },
  ];

  // Sélectionner une ville (basée sur l'heure pour varier)
  const cityIndex = new Date().getHours() % cameroonCities.length;
  const currentCity = cameroonCities[cityIndex];
  
  // Classes selon le thème
  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="p-4 space-y-4">
      {/* Carte de localisation avec image ville */}
      <div className="relative rounded-2xl overflow-hidden h-40">
        {/* Image de fond - Skyline Cameroun */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80')`,
            filter: 'brightness(0.4)'
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        {/* Contenu */}
        <div className="relative h-full flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-white text-xs font-medium">
                {location ? t('home.gpsActive') : t('home.searching')}
              </span>
            </div>
            <span className="text-2xl">🇨🇲</span>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">{t('home.estimatedPosition')}</span>
            </div>
            <h2 className="text-white text-2xl font-bold">{currentCity.name}</h2>
            <p className="text-white/60 text-sm">Région {currentCity.region}, Cameroun</p>
          </div>
        </div>
      </div>

      {/* Message de bienvenue */}
      <div className="text-center py-2">
        <p className={textSecondary + " text-sm"}>{t('home.hello')},</p>
        <h1 className={`text-2xl font-bold ${textColor}`}>{userName || 'Utilisateur'}</h1>
      </div>

      {/* Indicateurs actifs */}
      {(journeyActive || recordingActive) && (
        <div className="flex gap-2 justify-center">
          {journeyActive && (
            <div className="px-3 py-1.5 bg-green-500/20 rounded-full flex items-center gap-2">
              <Route className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-medium">{t('home.journeyInProgress')}</span>
            </div>
          )}
          {recordingActive && (
            <div className="px-3 py-1.5 bg-red-500/20 rounded-full flex items-center gap-2 animate-pulse">
              <Mic className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-medium">{t('home.recording')}</span>
            </div>
          )}
        </div>
      )}

      {/* Bouton SOS Principal */}
      <div className="flex justify-center py-4">
        <button
          onClick={onTriggerSOS}
          className="relative w-56 h-56 rounded-full focus:outline-none focus:ring-4 focus:ring-red-500/50 active:scale-95 transition-transform"
          aria-label="SOS Alert"
        >
          {/* Cercles d'animation */}
          <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-red-600/30 animate-pulse" />
          
          {/* Bouton principal */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center border-4 border-red-400/30">
            <AlertTriangle className="w-16 h-16 text-white mb-2 drop-shadow-lg" />
            <span className="text-3xl font-black text-white tracking-wider drop-shadow-lg">{t('home.sosButton')}</span>
            <span className="text-sm font-medium text-red-100 mt-1">{t('home.pressInDanger')}</span>
          </div>
        </button>
      </div>

      {/* Statut Shake to Alert */}
      <button
        onClick={() => setShakeEnabled(!shakeEnabled)}
        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
          shakeEnabled 
            ? 'bg-yellow-500/20 border-2 border-yellow-500/50' 
            : isDark ? 'bg-slate-800/50 border-2 border-slate-700' : 'bg-slate-100 border-2 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {shakeEnabled ? (
            <Zap className="w-6 h-6 text-yellow-400" />
          ) : (
            <ZapOff className="w-6 h-6 text-slate-500" />
          )}
          <div className="text-left">
            <p className={`font-semibold ${shakeEnabled ? 'text-yellow-400' : textSecondary}`}>
              {t('home.shakeToAlert')}
            </p>
            <p className={`text-xs ${textSecondary}`}>
              {shakeEnabled ? t('home.shake3Times') : t('home.disabled')}
            </p>
          </div>
        </div>
        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
          shakeEnabled ? 'bg-yellow-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
        }`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
            shakeEnabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </button>

      {/* Carte de statut GPS */}
      <div className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${gpsError ? 'text-red-400' : location ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className={`font-semibold ${textColor}`}>
              {gpsError ? t('home.gpsError') : location ? t('home.gpsPosition') : t('home.searchingGps')}
            </span>
          </div>
          <button 
            onClick={refreshGPS}
            disabled={gpsLoading}
            className={`p-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg disabled:opacity-50 transition-colors`}
          >
            <RefreshCw className={`w-4 h-4 ${textSecondary} ${gpsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {gpsError ? (
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
            <p className="text-red-400 text-sm">{gpsError}</p>
          </div>
        ) : location ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-100'} rounded-xl p-3`}>
                <p className={`text-xs ${textSecondary} mb-1`}>{t('home.latitude')}</p>
                <p className={`text-lg font-mono font-bold ${textColor}`}>{location.lat.toFixed(6)}</p>
              </div>
              <div className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-100'} rounded-xl p-3`}>
                <p className={`text-xs ${textSecondary} mb-1`}>{t('home.longitude')}</p>
                <p className={`text-lg font-mono font-bold ${textColor}`}>{location.lng.toFixed(6)}</p>
              </div>
            </div>
            <div className={`flex items-center justify-between ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'} rounded-xl p-3`}>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className={`text-sm ${textSecondary}`}>{t('home.accuracy')}</span>
              </div>
              <span className={`font-semibold ${
                location.accuracy <= 10 ? 'text-green-400' : 
                location.accuracy <= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {Math.round(location.accuracy)} {t('home.meters')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm ${textSecondary}`}>{t('home.searchingGps')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Cartes de statut */}
      <div className="grid grid-cols-2 gap-3">
        {/* Statut réseau */}
        <div className={`rounded-2xl p-4 border ${
          isOnline 
            ? 'bg-green-500/10 border-green-500/30' 
            : isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-slate-500" />
            )}
            <span className={`font-semibold ${isOnline ? 'text-green-400' : textSecondary}`}>
              {isOnline ? t('home.online') : t('home.offline')}
            </span>
          </div>
          <p className={`text-xs ${textSecondary}`}>
            {isOnline ? t('home.activeConnection') : t('home.gpsOnlyMode')}
          </p>
        </div>

        {/* Nombre de contacts */}
        <div className={`rounded-2xl p-4 border ${
          contacts.length > 0 
            ? 'bg-blue-500/10 border-blue-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className={`w-5 h-5 ${contacts.length > 0 ? 'text-blue-400' : 'text-red-400'}`} />
            <span className={`font-semibold ${contacts.length > 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {contacts.length} {contacts.length !== 1 ? t('home.contacts') : t('home.contact')}
            </span>
          </div>
          <p className={`text-xs ${textSecondary}`}>
            {contacts.length > 0 ? t('home.readyToAlert') : t('home.addContacts')}
          </p>
        </div>
      </div>

      {/* Avertissement si pas de contacts */}
      {contacts.length === 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-400">{t('home.configRequired')}</p>
            <p className={`text-sm ${textSecondary} mt-1`}>
              {t('home.addContactsMessage')}
            </p>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="text-center pt-4 pb-2">
        <p className={`text-xs ${textSecondary}`}>
          🛡️ {t('home.worksOffline')}
        </p>
      </div>
    </div>
  );
};

export default HomeTab;