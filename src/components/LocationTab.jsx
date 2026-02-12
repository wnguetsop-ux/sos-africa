import React, { useState } from 'react';
import { 
  MapPin, Share2, Copy, Phone, MessageCircle, 
  Navigation, ExternalLink, Check, RefreshCw,
  Shield, AlertTriangle
} from 'lucide-react';

const LocationTab = ({ location, gpsLoading, refreshGPS, t, isDark }) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Numéros d'urgence par pays
  const emergencyNumbers = [
    {
      country: 'Cameroun',
      flag: '🇨🇲',
      numbers: [
        { service: t('location.police'), number: '117', color: 'blue' },
        { service: t('location.firemen'), number: '118', color: 'red' },
        { service: t('location.gendarmerie'), number: '119', color: 'green' }
      ]
    },
    {
      country: t('location.ivoryCoast'),
      flag: '🇨🇮',
      numbers: [
        { service: t('location.police'), number: '110', color: 'blue' },
        { service: t('location.firemen'), number: '180', color: 'red' },
        { service: 'SAMU', number: '185', color: 'green' }
      ]
    },
    {
      country: t('location.senegal'),
      flag: '🇸🇳',
      numbers: [
        { service: t('location.police'), number: '17', color: 'blue' },
        { service: t('location.firemen'), number: '18', color: 'red' },
        { service: 'SAMU', number: '1515', color: 'green' }
      ]
    },
    {
      country: 'Gabon',
      flag: '🇬🇦',
      numbers: [
        { service: t('location.police'), number: '1730', color: 'blue' },
        { service: t('location.firemen'), number: '18', color: 'red' }
      ]
    },
    {
      country: 'Congo',
      flag: '🇨🇬',
      numbers: [
        { service: t('location.police'), number: '117', color: 'blue' },
        { service: t('location.firemen'), number: '118', color: 'red' }
      ]
    }
  ];

  // Générer le lien Google Maps
  const getMapsLink = () => {
    if (!location) return '#';
    return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  };

  // Générer le message de partage
  const getShareMessage = () => {
    if (!location) return '';
    return `📍 Ma position actuelle:\n\nLatitude: ${location.lat.toFixed(6)}\nLongitude: ${location.lng.toFixed(6)}\nPrécision: ${Math.round(location.accuracy)}m\n\n🗺️ Google Maps: ${getMapsLink()}\n\nEnvoyé via SOS Africa`;
  };

  // Copier la position
  const copyPosition = async () => {
    try {
      await navigator.clipboard.writeText(getShareMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = getShareMessage();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Partager via SMS
  const shareSMS = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`sms:?body=${message}`, '_blank');
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  // Partager via WhatsApp
  const shareWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  // Appeler un numéro
  const callNumber = (number) => {
    window.open(`tel:${number}`, '_blank');
  };

  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Titre */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <MapPin className="w-5 h-5 text-blue-400" />
        </div>
        <h1 className={`text-2xl font-bold ${textColor}`}>{t('location.title')}</h1>
      </div>

      {/* Carte de position */}
      <div className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${textColor}`}>{t('location.currentPosition')}</h3>
          <button 
            onClick={refreshGPS}
            disabled={gpsLoading}
            className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${gpsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {location ? (
          <div className="space-y-3">
            {/* Coordonnées */}
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

            {/* Précision */}
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

            {/* Lien Google Maps */}
            <a
              href={getMapsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('alert.viewOnMaps')}
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className={textSecondary}>{t('home.searchingGps')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Partager la position */}
      {location && (
        <div className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
          <h3 className={`font-semibold ${textColor} mb-3 flex items-center gap-2`}>
            <Share2 className="w-4 h-4 text-green-400" />
            {t('location.sharePosition')}
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {/* SMS */}
            <button
              onClick={shareSMS}
              className="flex flex-col items-center gap-2 p-3 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-blue-400" />
              <span className={`text-xs ${textColor}`}>{t('location.sms')}</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center gap-2 p-3 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
              <span className={`text-xs ${textColor}`}>{t('location.whatsapp')}</span>
            </button>

            {/* Copier */}
            <button
              onClick={copyPosition}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                copied 
                  ? 'bg-green-500/20' 
                  : isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'
              }`}
            >
              {copied ? (
                <Check className="w-6 h-6 text-green-400" />
              ) : (
                <Copy className="w-6 h-6 text-slate-400" />
              )}
              <span className={`text-xs ${textColor}`}>
                {copied ? t('location.copied') : t('location.copy')}
              </span>
            </button>
          </div>

          {shareSuccess && (
            <div className="mt-3 p-2 bg-green-500/20 rounded-lg text-center">
              <p className="text-green-400 text-sm">{t('location.positionShared')}</p>
            </div>
          )}
        </div>
      )}

      {/* Numéros d'urgence */}
      <div className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}>
          <AlertTriangle className="w-4 h-4 text-red-400" />
          {t('location.emergencyNumbers')}
        </h3>

        <div className="space-y-4">
          {emergencyNumbers.map((country, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{country.flag}</span>
                <span className={`font-medium ${textColor}`}>{country.country}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {country.numbers.map((num, nIdx) => (
                  <button
                    key={nIdx}
                    onClick={() => callNumber(num.number)}
                    className={`p-2 rounded-xl text-center transition-all hover:scale-105 ${
                      num.color === 'blue' ? 'bg-blue-500/20 hover:bg-blue-500/30' :
                      num.color === 'red' ? 'bg-red-500/20 hover:bg-red-500/30' :
                      'bg-green-500/20 hover:bg-green-500/30'
                    }`}
                  >
                    <p className={`text-lg font-bold ${
                      num.color === 'blue' ? 'text-blue-400' :
                      num.color === 'red' ? 'text-red-400' :
                      'text-green-400'
                    }`}>
                      {num.number}
                    </p>
                    <p className={`text-[10px] ${textSecondary}`}>{num.service}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2">
        <p className={`text-xs ${textSecondary}`}>
          🛡️ {t('home.worksOffline')}
        </p>
      </div>
    </div>
  );
};

export default LocationTab;