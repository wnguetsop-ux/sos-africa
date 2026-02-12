import React from 'react';
import { 
  AlertTriangle, MapPin, X, MessageSquare, 
  ExternalLink, Copy, CheckCircle, MessageCircle 
} from 'lucide-react';

const AlertModal = ({ 
  countDown, 
  location, 
  contacts, 
  onCancel, 
  generateSMSLink,
  isPremium,
  onWhatsApp
}) => {
  const [copied, setCopied] = React.useState(false);

  // Générer le message d'urgence
  const getMessage = () => {
    const mapsLink = location 
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : "Position GPS indisponible";
    
    const accuracy = location ? `${Math.round(location.accuracy)}m` : "N/A";
    
    return `🆘 URGENCE SOS AFRICA!\n\nJ'ai besoin d'aide immédiate!\n\n📍 Ma position: ${mapsLink}\n📏 Précision: ${accuracy}\n⏰ ${new Date().toLocaleString('fr-FR')}\n\nCe message a été envoyé automatiquement.`;
  };

  // Copier le message
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(getMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Fond pulsant rouge */}
      <div className="absolute inset-0 bg-red-900/50 animate-pulse" />
      
      {/* Contenu */}
      <div className="relative min-h-screen flex flex-col p-4 safe-area-inset">
        {/* Header */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full mb-4 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span className="text-white font-bold">ALERTE EN COURS</span>
          </div>
          
          {location && (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Position GPS capturée</span>
            </div>
          )}
        </div>

        {/* Compte à rebours ou Actions */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {countDown > 0 ? (
            <>
              {/* Cercle de compte à rebours */}
              <div className="relative w-48 h-48 mb-8">
                {/* Cercle de fond */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#ef4444"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={553}
                    strokeDashoffset={553 * (1 - countDown / 5)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                
                {/* Nombre */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl font-black text-white">{countDown}</span>
                </div>
              </div>

              <p className="text-xl text-white font-semibold mb-2">
                Envoi automatique dans...
              </p>
              <p className="text-slate-400 text-center mb-8">
                SMS vers {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
              </p>

              {/* Bouton annuler */}
              <button
                onClick={onCancel}
                className="px-8 py-4 bg-slate-800 border-2 border-slate-600 text-white text-lg font-bold rounded-2xl flex items-center gap-3 hover:bg-slate-700 active:scale-95 transition-all"
              >
                <X className="w-6 h-6" />
                ANNULER L'ALERTE
              </button>
            </>
          ) : (
            <>
              {/* Alerte lancée - Actions */}
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Alerte Lancée!</h2>
              <p className="text-slate-400 mb-8">Actions d'urgence disponibles</p>

              {/* Actions */}
              <div className="w-full max-w-sm space-y-3">
                {/* Envoyer SMS */}
                <a
                  href={generateSMSLink()}
                  className="block w-full py-4 bg-green-600 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-green-500 active:scale-[0.98] transition-all shadow-lg shadow-green-500/30"
                >
                  <MessageSquare className="w-6 h-6" />
                  Envoyer SMS ({contacts.length} contacts)
                </a>

                {/* WhatsApp - Premium */}
                {isPremium && onWhatsApp && (
                  <button
                    onClick={onWhatsApp}
                    className="w-full py-4 bg-[#25D366] text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-[#20bd5a] active:scale-[0.98] transition-all shadow-lg shadow-green-500/30"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Envoyer via WhatsApp
                  </button>
                )}

                {/* Ouvrir Maps */}
                {location && (
                  <a
                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-blue-600 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-500 active:scale-[0.98] transition-all"
                  >
                    <ExternalLink className="w-6 h-6" />
                    Voir sur Google Maps
                  </a>
                )}

                {/* Copier le message */}
                <button
                  onClick={copyMessage}
                  className="w-full py-4 bg-slate-700 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-600 active:scale-[0.98] transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      Message copié!
                    </>
                  ) : (
                    <>
                      <Copy className="w-6 h-6" />
                      Copier le message
                    </>
                  )}
                </button>
              </div>

              {/* Coordonnées */}
              {location && (
                <div className="mt-8 bg-slate-900/50 rounded-xl p-4 w-full max-w-sm">
                  <p className="text-xs text-slate-500 mb-2 text-center">Vos coordonnées exactes</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">{location.lat.toFixed(5)}</p>
                      <p className="text-xs text-slate-500">Latitude</p>
                    </div>
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">{location.lng.toFixed(5)}</p>
                      <p className="text-xs text-slate-500">Longitude</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fermer */}
              <button
                onClick={onCancel}
                className="mt-8 px-8 py-3 text-slate-400 font-medium hover:text-white transition-colors"
              >
                Fermer et revenir à l'accueil
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-600">
            SOS Africa • Votre sécurité, notre priorité
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;