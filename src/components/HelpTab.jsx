import React, { useState } from 'react';
import { 
  HelpCircle, ChevronDown, ChevronUp, Mail, MessageCircle,
  Phone, Play, Book, Shield, AlertTriangle, X, 
  ExternalLink, FileText, Video, Headphones, Send
} from 'lucide-react';

const HelpTab = ({ onClose }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: ''
  });
  const [formSent, setFormSent] = useState(false);

  // FAQ Data
  const faqData = [
    {
      category: 'Utilisation de base',
      icon: '📱',
      questions: [
        {
          q: 'Comment déclencher une alerte SOS ?',
          a: 'Appuyez sur le gros bouton rouge au centre de l\'écran d\'accueil. Un compte à rebours de 5 secondes démarre. Si vous ne l\'annulez pas, l\'alerte est envoyée automatiquement à tous vos contacts d\'urgence avec votre position GPS.'
        },
        {
          q: 'Comment annuler une alerte en cours ?',
          a: 'Pendant le compte à rebours de 5 secondes, appuyez sur "ANNULER L\'ALERTE". Si l\'alerte a déjà été envoyée, contactez directement vos proches pour les rassurer.'
        },
        {
          q: 'L\'app fonctionne-t-elle sans internet ?',
          a: 'Oui ! Le GPS fonctionne hors ligne. Les SMS sont envoyés via votre opérateur mobile. Seules les fonctionnalités WhatsApp et communautaires nécessitent internet.'
        },
        {
          q: 'Comment ajouter des contacts d\'urgence ?',
          a: 'Allez dans Réglages > Contacts d\'urgence > bouton "+". Entrez le nom, numéro et relation. Vous pouvez ajouter jusqu\'à 3 contacts (gratuit) ou illimité (Premium).'
        }
      ]
    },
    {
      category: 'Fonctionnalités avancées',
      icon: '⚡',
      questions: [
        {
          q: 'Comment fonctionne le mode "Secouer pour alerter" ?',
          a: 'Secouez violemment votre téléphone 3 fois en 1.5 seconde. L\'alerte SOS se déclenche automatiquement. Activez/désactivez cette fonction dans Réglages.'
        },
        {
          q: 'Qu\'est-ce que le Mode Furtif (Ghost Mode) ?',
          a: 'L\'écran devient noir comme si le téléphone était éteint, mais le GPS continue. Double-tap en haut à gauche pour voir vos coordonnées. Triple-tap en bas à droite pour déclencher SOS. Balayez avec 3 doigts vers le haut pour quitter.'
        },
        {
          q: 'Comment utiliser le Faux Appel ?',
          a: 'Allez dans l\'onglet "Appel". Choisissez un appelant (Maman, Papa, etc.) et un délai. Un faux appel entrant s\'affiche pour vous aider à quitter une situation inconfortable.'
        },
        {
          q: 'Comment fonctionne le Mode Accompagnement ?',
          a: 'Dans l\'onglet "Trajet", entrez votre destination et durée estimée. Choisissez un gardien parmi vos contacts. Il sera notifié de votre départ, recevra des check-ins réguliers, et sera alerté si vous ne confirmez pas votre arrivée.'
        }
      ]
    },
    {
      category: 'Premium & Compte',
      icon: '👑',
      questions: [
        {
          q: 'Quelles sont les différences entre Gratuit et Premium ?',
          a: 'Gratuit: 3 contacts, alertes basiques. Premium Basic (2000 XOF/mois): 10 contacts, enregistrement audio 5min, alertes communautaires, WhatsApp, sans pub. Premium Pro (5000 XOF/mois): tout illimité, enregistrement 30min, support prioritaire.'
        },
        {
          q: 'Comment payer l\'abonnement Premium ?',
          a: 'Nous acceptons Orange Money, MTN Mobile Money, Wave, et cartes bancaires. Allez dans Réglages > Abonnement > Choisissez votre plan.'
        },
        {
          q: 'Comment annuler mon abonnement ?',
          a: 'Allez dans Réglages > Abonnement > Gérer > Annuler. Vous conservez l\'accès jusqu\'à la fin de la période payée. Aucun remboursement partiel.'
        }
      ]
    },
    {
      category: 'Problèmes techniques',
      icon: '🔧',
      questions: [
        {
          q: 'Le GPS ne fonctionne pas, que faire ?',
          a: '1) Vérifiez que la localisation est activée dans les paramètres du téléphone. 2) Accordez les permissions GPS à SOS Africa. 3) Sortez à l\'extérieur (le GPS fonctionne mal en intérieur). 4) Redémarrez l\'app.'
        },
        {
          q: 'Les SMS ne s\'envoient pas',
          a: 'Vérifiez: 1) Vous avez du crédit SMS. 2) L\'app a la permission d\'envoyer des SMS. 3) Le numéro du contact est correct avec l\'indicatif pays (+225, +221, etc.).'
        },
        {
          q: 'L\'app consomme trop de batterie',
          a: 'Le GPS haute précision consomme de l\'énergie. Pour économiser: désactivez le mode communautaire quand non nécessaire, utilisez le GPS uniquement pendant les alertes.'
        },
        {
          q: 'Comment réinstaller l\'app sans perdre mes données ?',
          a: 'Vos contacts et paramètres sont sauvegardés localement. Après réinstallation, reconnectez-vous avec le même appareil. Premium Pro inclut la sauvegarde cloud.'
        }
      ]
    }
  ];

  // Tutoriels vidéo
  const videoTutorials = [
    { id: 1, title: 'Premiers pas avec SOS Africa', duration: '2:30', thumbnail: '🎬' },
    { id: 2, title: 'Configurer vos contacts d\'urgence', duration: '1:45', thumbnail: '👥' },
    { id: 3, title: 'Utiliser le Mode Furtif', duration: '2:00', thumbnail: '🌙' },
    { id: 4, title: 'Mode Accompagnement expliqué', duration: '3:15', thumbnail: '🚶' },
    { id: 5, title: 'Enregistrement audio discret', duration: '1:30', thumbnail: '🎙️' }
  ];

  // Envoyer le formulaire de contact
  const handleSubmitContact = () => {
    // Simuler l'envoi
    console.log('Contact form:', contactForm);
    setFormSent(true);
    setTimeout(() => {
      setShowContactForm(false);
      setFormSent(false);
      setContactForm({ subject: '', message: '', email: '' });
    }, 2000);
  };

  // Ouvrir un email
  const openEmail = () => {
    window.open('mailto:wnguetsop@gmail.com?subject=Demande%20de%20support%20SOS%20Africa', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-400" />
          Aide & Support
        </h1>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.open('mailto:wnguetsop@gmail.com', '_blank')}
            className="p-4 bg-slate-800 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <Mail className="w-8 h-8 text-blue-400" />
            <span className="text-white font-medium text-sm">Email Support</span>
            <span className="text-slate-500 text-xs">wnguetsop@gmail.com</span>
          </button>

          <button
            onClick={() => setShowContactForm(true)}
            className="p-4 bg-slate-800 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <MessageCircle className="w-8 h-8 text-green-400" />
            <span className="text-white font-medium text-sm">Formulaire</span>
            <span className="text-slate-500 text-xs">Réponse sous 24h</span>
          </button>

          <button
            onClick={() => window.open('tel:+393299639430', '_blank')}
            className="p-4 bg-slate-800 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <Phone className="w-8 h-8 text-orange-400" />
            <span className="text-white font-medium text-sm">Téléphone</span>
            <span className="text-slate-500 text-xs">+39 329 963 9430</span>
          </button>

          <button
            onClick={() => window.open('https://wa.me/393299639430', '_blank')}
            className="p-4 bg-slate-800 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
            <span className="text-white font-medium text-sm">WhatsApp</span>
            <span className="text-slate-500 text-xs">Chat en direct</span>
          </button>
        </div>

        {/* Tutoriels vidéo */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Video className="w-5 h-5 text-red-400" />
            Tutoriels vidéo
          </h2>
          <div className="space-y-2">
            {videoTutorials.map((video) => (
              <button
                key={video.id}
                className="w-full p-3 bg-slate-800 rounded-xl flex items-center gap-3 hover:bg-slate-700 transition-colors"
              >
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center text-2xl">
                  {video.thumbnail}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium text-sm">{video.title}</p>
                  <p className="text-slate-500 text-xs">{video.duration}</p>
                </div>
                <Play className="w-5 h-5 text-red-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Guide utilisateur */}
        <a 
          href="https://landing-sos.vercel.app" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl flex items-center gap-4"
        >
          <Book className="w-10 h-10 text-blue-400" />
          <div className="flex-1 text-left">
            <p className="text-white font-bold">Guide d'utilisation complet</p>
            <p className="text-slate-400 text-sm">Visitez notre site web officiel</p>
          </div>
          <ExternalLink className="w-5 h-5 text-blue-400" />
        </a>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            {faqData.map((category, catIndex) => (
              <div key={catIndex} className="space-y-2">
                <h3 className="text-slate-400 text-sm font-medium flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.category}
                </h3>
                
                {category.questions.map((faq, faqIndex) => {
                  const faqId = `${catIndex}-${faqIndex}`;
                  const isExpanded = expandedFaq === faqId;
                  
                  return (
                    <div 
                      key={faqIndex}
                      className="bg-slate-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                        className="w-full p-4 flex items-center justify-between text-left"
                      >
                        <span className="text-white text-sm font-medium pr-4">{faq.q}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-700">
                          <p className="text-slate-300 text-sm pt-3 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Urgence */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-bold mb-1">En cas d'urgence réelle</h3>
              <p className="text-slate-300 text-sm">
                Si vous êtes en danger immédiat, appelez les numéros d'urgence locaux :
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-white text-sm">🇨🇲 Cameroun: 117 (Police), 118 (Pompiers), 119 (Gendarmerie)</p>
                <p className="text-white text-sm">🇨🇮 Côte d'Ivoire: 110, 170, 180</p>
                <p className="text-white text-sm">🇸🇳 Sénégal: 17, 18, 1515</p>
                <p className="text-white text-sm">🇲🇱 Mali: 17, 18, 15</p>
                <p className="text-white text-sm">🇧🇫 Burkina Faso: 17, 18</p>
                <p className="text-white text-sm">🇬🇦 Gabon: 1730, 18</p>
                <p className="text-white text-sm">🇨🇬 Congo: 117, 118</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal formulaire de contact */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowContactForm(false)}
          />
          
          <div className="relative w-full max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Contacter le support</h2>
              <button 
                onClick={() => setShowContactForm(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Message envoyé !</h3>
                <p className="text-slate-400">Nous vous répondrons sous 24h.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Votre email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl
                               text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Sujet</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl
                               text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="bug">Signaler un bug</option>
                    <option value="feature">Suggestion de fonctionnalité</option>
                    <option value="billing">Problème de paiement</option>
                    <option value="account">Problème de compte</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Décrivez votre problème ou question..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl
                               text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500
                               resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmitContact}
                  disabled={!contactForm.email || !contactForm.message}
                  className="w-full py-4 bg-red-600 text-white font-bold rounded-xl
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Envoyer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTab;