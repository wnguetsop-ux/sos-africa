import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, MapPin, RefreshCw, 
  Users, Wifi, WifiOff, Zap, ZapOff, Navigation,
  Mic, Route, Globe, Locate
} from 'lucide-react';

// Base de données des pays avec drapeaux et images
const COUNTRIES_DATABASE = {
  'Cameroon': { flag: '🇨🇲', name: 'Cameroun', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80' },
  'France': { flag: '🇫🇷', name: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' },
  'Ivory Coast': { flag: '🇨🇮', name: 'Côte d\'Ivoire', image: 'https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?w=800&q=80' },
  'Côte d\'Ivoire': { flag: '🇨🇮', name: 'Côte d\'Ivoire', image: 'https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?w=800&q=80' },
  'Senegal': { flag: '🇸🇳', name: 'Sénégal', image: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800&q=80' },
  'Gabon': { flag: '🇬🇦', name: 'Gabon', image: 'https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=800&q=80' },
  'Congo': { flag: '🇨🇬', name: 'Congo', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80' },
  'Nigeria': { flag: '🇳🇬', name: 'Nigeria', image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=800&q=80' },
  'Belgium': { flag: '🇧🇪', name: 'Belgique', image: 'https://images.unsplash.com/photo-1559113513-d5e09c78b9dd?w=800&q=80' },
  'Italy': { flag: '🇮🇹', name: 'Italie', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' },
  'United Kingdom': { flag: '🇬🇧', name: 'Royaume-Uni', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' },
  'United States': { flag: '🇺🇸', name: 'États-Unis', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80' },
  'Canada': { flag: '🇨🇦', name: 'Canada', image: 'https://images.unsplash.com/photo-1519178614-68673b201f36?w=800&q=80' },
  'Morocco': { flag: '🇲🇦', name: 'Maroc', image: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80' },
  'South Africa': { flag: '🇿🇦', name: 'Afrique du Sud', image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&q=80' },
  'Germany': { flag: '🇩🇪', name: 'Allemagne', image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80' },
  'Spain': { flag: '🇪🇸', name: 'Espagne', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80' },
  'Switzerland': { flag: '🇨🇭', name: 'Suisse', image: 'https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=800&q=80' },
  'Mali': { flag: '🇲🇱', name: 'Mali', image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80' },
  'Ghana': { flag: '🇬🇭', name: 'Ghana', image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=800&q=80' },
  'Togo': { flag: '🇹🇬', name: 'Togo', image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80' },
  'Benin': { flag: '🇧🇯', name: 'Bénin', image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80' },
  'Chad': { flag: '🇹🇩', name: 'Tchad', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80' },
};

const DEFAULT_LOCATION = {
  city: 'Position actuelle',
  country: 'Monde',
  flag: '🌍',
  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  address: 'Recherche en cours...'
};

const HomeTab = ({ location, gpsLoading, gpsError, refreshGPS, contacts, isOnline, shakeEnabled, setShakeEnabled, onTriggerSOS, isPremium, journeyActive, recordingActive, userName, t, isDark }) => {
  const [locationInfo, setLocationInfo] = useState(DEFAULT_LOCATION);
  const [addressLoading, setAddressLoading] = useState(false);

  // Reverse geocoding - Obtenir l'adresse exacte depuis les coordonnées GPS
  useEffect(() => {
    const fetchAddress = async () => {
      if (!location?.lat || !location?.lng) return;
      
      setAddressLoading(true);
      
      try {
        // API gratuite Nominatim (OpenStreetMap)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        
        if (response.ok) {
          const data = await response.json();
          const addr = data.address || {};
          
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.state || 'Ville';
          const country = addr.country || 'Pays inconnu';
          const road = addr.road || addr.pedestrian || '';
          const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
          const houseNumber = addr.house_number || '';
          
          // Construire l'adresse
          let fullAddress = '';
          if (houseNumber) fullAddress += houseNumber + ' ';
          if (road) fullAddress += road;
          if (neighbourhood && !fullAddress.includes(neighbourhood)) {
            fullAddress += fullAddress ? ', ' + neighbourhood : neighbourhood;
          }
          if (!fullAddress) fullAddress = city;
          
          // Trouver les infos du pays
          const countryInfo = COUNTRIES_DATABASE[country] || { flag: '🌍', name: country, image: DEFAULT_LOCATION.image };
          
          setLocationInfo({
            city,
            country: countryInfo.name,
            flag: countryInfo.flag,
            image: countryInfo.image,
            address: fullAddress
          });
        }
      } catch (error) {
        console.log('Erreur géocodage:', error);
        setLocationInfo({
          ...DEFAULT_LOCATION,
          address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
        });
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddress();
  }, [location?.lat, location?.lng]);

  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Carte de localisation avec image dynamique */}
      <div className="relative rounded-2xl overflow-hidden h-48">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url('${locationInfo.image}')`, filter: 'brightness(0.4)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-white text-xs font-medium">{location ? 'GPS Actif' : 'Recherche...'}</span>
            </div>
            <span className="text-5xl drop-shadow-lg">{locationInfo.flag}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Locate className="w-4 h-4 text-red-400" />
              <span className="text-white/90 text-sm font-medium truncate max-w-[280px]">
                {addressLoading ? 'Localisation...' : locationInfo.address}
              </span>
            </div>
            <h2 className="text-white text-2xl font-bold">{locationInfo.city}</h2>
            <p className="text-white/70 text-sm flex items-center gap-2">
              <Globe className="w-3 h-3" />
              {locationInfo.country}
            </p>
          </div>
        </div>
      </div>

      {/* Bienvenue */}
      <div className="text-center py-2">
        <p className={`${textSecondary} text-sm`}>{t('home.hello')},</p>
        <h1 className={`text-2xl font-bold ${textColor}`}>{userName || 'Utilisateur'}</h1>
      </div>

      {/* Indicateurs actifs */}
      {(journeyActive || recordingActive) && (
        <div className="flex gap-2 justify-center flex-wrap">
          {journeyActive && (
            <div className="px-3 py-1.5 bg-green-500/20 rounded-full flex items-center gap-2">
              <Route className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-medium">Trajet en cours</span>
            </div>
          )}
          {recordingActive && (
            <div className="px-3 py-1.5 bg-red-500/20 rounded-full flex items-center gap-2 animate-pulse">
              <Mic className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-medium">Enregistrement</span>
            </div>
          )}
        </div>
      )}

      {/* Bouton SOS */}
      <div className="flex justify-center py-4">
        <button onClick={onTriggerSOS} className="relative w-56 h-56 rounded-full focus:outline-none active:scale-95 transition-transform">
          <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-red-600/30 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center border-4 border-red-400/30">
            <AlertTriangle className="w-16 h-16 text-white mb-2 drop-shadow-lg" />
            <span className="text-3xl font-black text-white tracking-wider drop-shadow-lg">{t('home.sosButton')}</span>
            <span className="text-sm font-medium text-red-100 mt-1">{t('home.pressInDanger')}</span>
          </div>
        </button>
      </div>

      {/* Shake to Alert */}
      <button onClick={() => setShakeEnabled(!shakeEnabled)} className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${shakeEnabled ? 'bg-yellow-500/20 border-2 border-yellow-500/50' : isDark ? 'bg-slate-800/50 border-2 border-slate-700' : 'bg-slate-100 border-2 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          {shakeEnabled ? <Zap className="w-6 h-6 text-yellow-400" /> : <ZapOff className="w-6 h-6 text-slate-500" />}
          <div className="text-left">
            <p className={`font-semibold ${shakeEnabled ? 'text-yellow-400' : textSecondary}`}>{t('home.shakeToAlert')}</p>
            <p className={`text-xs ${textSecondary}`}>{shakeEnabled ? t('home.shake3Times') : t('home.disabled')}</p>
          </div>
        </div>
        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${shakeEnabled ? 'bg-yellow-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${shakeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </button>

      {/* GPS Status */}
      <div className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${gpsError ? 'text-red-400' : location ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className={`font-semibold ${textColor}`}>{gpsError ? 'Erreur GPS' : location ? 'Position GPS' : 'Recherche GPS'}</span>
          </div>
          <button onClick={refreshGPS} disabled={gpsLoading} className={`p-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg`}>
            <RefreshCw className={`w-4 h-4 ${textSecondary} ${gpsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {location && (
          <div className="grid grid-cols-2 gap-3">
            <div className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-100'} rounded-xl p-3`}>
              <p className={`text-xs ${textSecondary} mb-1`}>Latitude</p>
              <p className={`text-lg font-mono font-bold ${textColor}`}>{location.lat.toFixed(6)}</p>
            </div>
            <div className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-100'} rounded-xl p-3`}>
              <p className={`text-xs ${textSecondary} mb-1`}>Longitude</p>
              <p className={`text-lg font-mono font-bold ${textColor}`}>{location.lng.toFixed(6)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl p-4 border ${isOnline ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-slate-500" />}
            <span className={`font-semibold ${isOnline ? 'text-green-400' : textSecondary}`}>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
        <div className={`rounded-2xl p-4 border ${contacts.length > 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className={`w-5 h-5 ${contacts.length > 0 ? 'text-blue-400' : 'text-red-400'}`} />
            <span className={`font-semibold ${contacts.length > 0 ? 'text-blue-400' : 'text-red-400'}`}>{contacts.length} contacts</span>
          </div>
        </div>
      </div>

      {contacts.length === 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-orange-400">Configuration requise</p>
            <p className={`text-sm ${textSecondary}`}>Ajoutez au moins un contact d'urgence</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;