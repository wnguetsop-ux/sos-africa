import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, MapPin, RefreshCw, 
  Users, Wifi, WifiOff, Zap, ZapOff, Navigation,
  Mic, Route, Building2
} from 'lucide-react';

// Base de données des villes avec images et drapeaux
const CITIES_DATABASE = [
  // Cameroun
  { name: 'Douala', country: 'Cameroun', flag: '🇨🇲', lat: 4.0511, lng: 9.7679, radius: 80, image: 'https://images.unsplash.com/photo-1591778636355-8b11e3a30a47?w=800&q=80', landmark: 'Port de Douala' },
  { name: 'Yaoundé', country: 'Cameroun', flag: '🇨🇲', lat: 3.8480, lng: 11.5021, radius: 80, image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80', landmark: 'Capitale du Cameroun' },
  { name: 'Bafoussam', country: 'Cameroun', flag: '🇨🇲', lat: 5.4737, lng: 10.4179, radius: 50, image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80', landmark: 'Région de l\'Ouest' },
  { name: 'Bamenda', country: 'Cameroun', flag: '🇨🇲', lat: 5.9631, lng: 10.1591, radius: 50, image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80', landmark: 'Nord-Ouest Cameroun' },
  { name: 'Garoua', country: 'Cameroun', flag: '🇨🇲', lat: 9.3000, lng: 13.4000, radius: 60, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80', landmark: 'Nord Cameroun' },
  { name: 'Kribi', country: 'Cameroun', flag: '🇨🇲', lat: 2.9400, lng: 9.9100, radius: 40, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', landmark: 'Plages de Kribi' },
  // Côte d'Ivoire
  { name: 'Abidjan', country: 'Côte d\'Ivoire', flag: '🇨🇮', lat: 5.3600, lng: -4.0083, radius: 80, image: 'https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?w=800&q=80', landmark: 'Plateau d\'Abidjan' },
  { name: 'Yamoussoukro', country: 'Côte d\'Ivoire', flag: '🇨🇮', lat: 6.8276, lng: -5.2893, radius: 50, image: 'https://images.unsplash.com/photo-1568739253582-1a8d5c4eb46d?w=800&q=80', landmark: 'Basilique Notre-Dame' },
  // Sénégal
  { name: 'Dakar', country: 'Sénégal', flag: '🇸🇳', lat: 14.7167, lng: -17.4677, radius: 60, image: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800&q=80', landmark: 'Monument Renaissance' },
  // Gabon
  { name: 'Libreville', country: 'Gabon', flag: '🇬🇦', lat: 0.4162, lng: 9.4673, radius: 50, image: 'https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=800&q=80', landmark: 'Bord de mer' },
  // Congo
  { name: 'Brazzaville', country: 'Congo', flag: '🇨🇬', lat: -4.2634, lng: 15.2429, radius: 50, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80', landmark: 'Fleuve Congo' },
  { name: 'Kinshasa', country: 'RD Congo', flag: '🇨🇩', lat: -4.4419, lng: 15.2663, radius: 80, image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80', landmark: 'Capitale RDC' },
  // Nigeria
  { name: 'Lagos', country: 'Nigeria', flag: '🇳🇬', lat: 6.5244, lng: 3.3792, radius: 80, image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=800&q=80', landmark: 'Victoria Island' },
  // France
  { name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.8566, lng: 2.3522, radius: 80, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', landmark: 'Tour Eiffel' },
  { name: 'Marseille', country: 'France', flag: '🇫🇷', lat: 43.2965, lng: 5.3698, radius: 50, image: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&q=80', landmark: 'Vieux Port' },
  { name: 'Lyon', country: 'France', flag: '🇫🇷', lat: 45.7640, lng: 4.8357, radius: 50, image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&q=80', landmark: 'Basilique Fourvière' },
  { name: 'Toulouse', country: 'France', flag: '🇫🇷', lat: 43.6047, lng: 1.4442, radius: 50, image: 'https://images.unsplash.com/photo-1582531489571-45a566c24f08?w=800&q=80', landmark: 'Ville Rose' },
  // Belgique
  { name: 'Bruxelles', country: 'Belgique', flag: '🇧🇪', lat: 50.8503, lng: 4.3517, radius: 50, image: 'https://images.unsplash.com/photo-1559113513-d5e09c78b9dd?w=800&q=80', landmark: 'Grand-Place' },
  // Italie
  { name: 'Rome', country: 'Italie', flag: '🇮🇹', lat: 41.9028, lng: 12.4964, radius: 60, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', landmark: 'Colisée' },
  { name: 'Milan', country: 'Italie', flag: '🇮🇹', lat: 45.4642, lng: 9.1900, radius: 50, image: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&q=80', landmark: 'Duomo di Milano' },
  // UK
  { name: 'Londres', country: 'Royaume-Uni', flag: '🇬🇧', lat: 51.5074, lng: -0.1278, radius: 80, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', landmark: 'Big Ben' },
  // USA
  { name: 'New York', country: 'États-Unis', flag: '🇺🇸', lat: 40.7128, lng: -74.0060, radius: 80, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', landmark: 'Statue de la Liberté' },
  // Canada
  { name: 'Montréal', country: 'Canada', flag: '🇨🇦', lat: 45.5017, lng: -73.5673, radius: 60, image: 'https://images.unsplash.com/photo-1519178614-68673b201f36?w=800&q=80', landmark: 'Mont Royal' },
  // Maroc
  { name: 'Casablanca', country: 'Maroc', flag: '🇲🇦', lat: 33.5731, lng: -7.5898, radius: 60, image: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80', landmark: 'Mosquée Hassan II' },
  // Afrique du Sud
  { name: 'Johannesburg', country: 'Afrique du Sud', flag: '🇿🇦', lat: -26.2041, lng: 28.0473, radius: 80, image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&q=80', landmark: 'City of Gold' },
  // Allemagne
  { name: 'Berlin', country: 'Allemagne', flag: '🇩🇪', lat: 52.5200, lng: 13.4050, radius: 60, image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80', landmark: 'Porte de Brandebourg' },
  // Espagne
  { name: 'Madrid', country: 'Espagne', flag: '🇪🇸', lat: 40.4168, lng: -3.7038, radius: 60, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80', landmark: 'Plaza Mayor' },
  { name: 'Barcelone', country: 'Espagne', flag: '🇪🇸', lat: 41.3851, lng: 2.1734, radius: 50, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80', landmark: 'Sagrada Familia' },
  // Suisse
  { name: 'Genève', country: 'Suisse', flag: '🇨🇭', lat: 46.2044, lng: 6.1432, radius: 40, image: 'https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=800&q=80', landmark: 'Jet d\'eau' },
];

// Ville par défaut
const DEFAULT_CITY = { name: 'Votre Position', country: 'Monde', flag: '🌍', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', landmark: 'GPS Activé' };

// Calculer la distance entre deux points GPS (en km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Trouver la ville la plus proche
const findNearestCity = (lat, lng) => {
  let nearest = null;
  let minDist = Infinity;
  for (const city of CITIES_DATABASE) {
    const dist = calculateDistance(lat, lng, city.lat, city.lng);
    if (dist < city.radius && dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }
  return nearest || DEFAULT_CITY;
};

const HomeTab = ({ location, gpsLoading, gpsError, refreshGPS, contacts, isOnline, shakeEnabled, setShakeEnabled, onTriggerSOS, isPremium, journeyActive, recordingActive, userName, t, isDark }) => {
  const [currentCity, setCurrentCity] = useState(DEFAULT_CITY);

  useEffect(() => {
    if (location?.lat && location?.lng) {
      setCurrentCity(findNearestCity(location.lat, location.lng));
    }
  }, [location]);

  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Carte dynamique selon la position */}
      <div className="relative rounded-2xl overflow-hidden h-44">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url('${currentCity.image}')`, filter: 'brightness(0.4)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-white text-xs font-medium">{location ? t('home.gpsActive') : t('home.searching')}</span>
            </div>
            <span className="text-4xl drop-shadow-lg animate-pulse">{currentCity.flag}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">{currentCity.landmark}</span>
            </div>
            <h2 className="text-white text-2xl font-bold">{currentCity.name}</h2>
            <p className="text-white/60 text-sm">{currentCity.country}</p>
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
        <div className="flex gap-2 justify-center">
          {journeyActive && <div className="px-3 py-1.5 bg-green-500/20 rounded-full flex items-center gap-2"><Route className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-medium">{t('home.journeyInProgress')}</span></div>}
          {recordingActive && <div className="px-3 py-1.5 bg-red-500/20 rounded-full flex items-center gap-2 animate-pulse"><Mic className="w-4 h-4 text-red-400" /><span className="text-red-400 text-xs font-medium">{t('home.recording')}</span></div>}
        </div>
      )}

      {/* Bouton SOS */}
      <div className="flex justify-center py-4">
        <button onClick={onTriggerSOS} className="relative w-56 h-56 rounded-full focus:outline-none focus:ring-4 focus:ring-red-500/50 active:scale-95 transition-transform">
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
            <span className={`font-semibold ${textColor}`}>{gpsError ? t('home.gpsError') : location ? t('home.gpsPosition') : t('home.searchingGps')}</span>
          </div>
          <button onClick={refreshGPS} disabled={gpsLoading} className={`p-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg disabled:opacity-50 transition-colors`}>
            <RefreshCw className={`w-4 h-4 ${textSecondary} ${gpsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {location ? (
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
              <span className={`font-semibold ${location.accuracy <= 10 ? 'text-green-400' : location.accuracy <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{Math.round(location.accuracy)} {t('home.meters')}</span>
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

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl p-4 border ${isOnline ? 'bg-green-500/10 border-green-500/30' : isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-slate-500" />}
            <span className={`font-semibold ${isOnline ? 'text-green-400' : textSecondary}`}>{isOnline ? t('home.online') : t('home.offline')}</span>
          </div>
          <p className={`text-xs ${textSecondary}`}>{isOnline ? t('home.activeConnection') : t('home.gpsOnlyMode')}</p>
        </div>
        <div className={`rounded-2xl p-4 border ${contacts.length > 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className={`w-5 h-5 ${contacts.length > 0 ? 'text-blue-400' : 'text-red-400'}`} />
            <span className={`font-semibold ${contacts.length > 0 ? 'text-blue-400' : 'text-red-400'}`}>{contacts.length} {contacts.length !== 1 ? t('home.contacts') : t('home.contact')}</span>
          </div>
          <p className={`text-xs ${textSecondary}`}>{contacts.length > 0 ? t('home.readyToAlert') : t('home.addContacts')}</p>
        </div>
      </div>

      {/* Warning */}
      {contacts.length === 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-400">{t('home.configRequired')}</p>
            <p className={`text-sm ${textSecondary} mt-1`}>{t('home.addContactsMessage')}</p>
          </div>
        </div>
      )}

      <div className="text-center pt-4 pb-2">
        <p className={`text-xs ${textSecondary}`}>🛡️ {t('home.worksOffline')}</p>
      </div>
    </div>
  );
};

export default HomeTab;