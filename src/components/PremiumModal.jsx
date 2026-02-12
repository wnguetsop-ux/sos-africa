import React, { useState } from 'react';
import { 
  X, Star, Check, Crown, Zap, Shield, 
  Mic, Users, MessageCircle, Clock,
  ChevronRight, Sparkles
} from 'lucide-react';

const PremiumModal = ({ 
  isOpen, 
  onClose, 
  blockedFeature,
  premiumHook 
}) => {
  const {
    plan: currentPlan,
    PLANS,
    formatPrice,
    getBlockedMessage,
    subscribeToPlan
  } = premiumHook;

  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Icônes des fonctionnalités
  const featureIcons = {
    contacts: Users,
    recording: Mic,
    communityAlerts: Users,
    whatsapp: MessageCircle,
    journey: Shield,
    history: Clock
  };

  // Handler d'achat
  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Simuler le processus de paiement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = await subscribeToPlan(selectedPlan);
    
    setIsProcessing(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 
                      rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto
                      border border-slate-700/50 shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Passer à Premium</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Message de blocage */}
          {blockedFeature && (
            <div className="mt-3 p-3 bg-red-500/20 rounded-xl">
              <p className="text-red-300 text-sm">
                {getBlockedMessage(blockedFeature)}
              </p>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="p-4 space-y-3">
          {/* Plan Basic */}
          <button
            onClick={() => setSelectedPlan('basic')}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedPlan === 'basic'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 border-2 border-blue-400'
                : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-300" />
                <span className="text-white font-bold">Basic</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold text-lg">
                  {formatPrice(PLANS.basic.price, PLANS.basic.currency)}
                </span>
                <span className="text-white/60 text-sm">/mois</span>
              </div>
            </div>
            <ul className="space-y-1">
              {PLANS.basic.features.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>

          {/* Plan Pro - Recommandé */}
          <button
            onClick={() => setSelectedPlan('pro')}
            className={`w-full p-4 rounded-xl text-left transition-all relative ${
              selectedPlan === 'pro'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-2 border-purple-400'
                : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
            }`}
          >
            {/* Badge recommandé */}
            <div className="absolute -top-2 right-4 px-2 py-0.5 bg-yellow-500 rounded-full">
              <span className="text-black text-xs font-bold">POPULAIRE</span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">Pro</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold text-lg">
                  {formatPrice(PLANS.pro.price, PLANS.pro.currency)}
                </span>
                <span className="text-white/60 text-sm">/mois</span>
              </div>
            </div>
            <ul className="space-y-1">
              {PLANS.pro.features.slice(0, 5).map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>

          {/* Plan Entreprise */}
          <div className="p-4 bg-slate-800/50 rounded-xl border border-dashed border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="text-white font-bold">Entreprise</span>
              </div>
              <span className="text-slate-400 text-sm">Sur devis</span>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Solution complète pour les organisations avec dashboard, API et support dédié.
            </p>
            <button className="mt-2 text-blue-400 text-sm flex items-center gap-1">
              Nous contacter <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparaison rapide */}
        <div className="px-4 pb-4">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <h4 className="text-white font-medium text-sm mb-2">
              Comparaison Gratuit vs {selectedPlan === 'basic' ? 'Basic' : 'Pro'}
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="text-slate-400">Fonctionnalité</div>
              <div className="text-slate-400">Gratuit</div>
              <div className="text-yellow-400 font-medium">
                {selectedPlan === 'basic' ? 'Basic' : 'Pro'}
              </div>
              
              <div className="text-left text-slate-300">Contacts</div>
              <div className="text-slate-400">3</div>
              <div className="text-green-400">
                {selectedPlan === 'basic' ? '10' : 'Illimité'}
              </div>
              
              <div className="text-left text-slate-300">Enregistrement</div>
              <div className="text-red-400">✕</div>
              <div className="text-green-400">
                {selectedPlan === 'basic' ? '5min' : '30min'}
              </div>
              
              <div className="text-left text-slate-300">Communauté</div>
              <div className="text-red-400">✕</div>
              <div className="text-green-400">✓</div>
              
              <div className="text-left text-slate-300">WhatsApp</div>
              <div className="text-red-400">✕</div>
              <div className="text-green-400">✓</div>
            </div>
          </div>
        </div>

        {/* Méthodes de paiement */}
        <div className="px-4 pb-4">
          <p className="text-slate-400 text-xs text-center mb-2">
            Méthodes de paiement acceptées
          </p>
          <div className="flex justify-center gap-4">
            <div className="px-3 py-1 bg-orange-500/20 rounded text-orange-400 text-xs">
              Orange Money
            </div>
            <div className="px-3 py-1 bg-yellow-500/20 rounded text-yellow-400 text-xs">
              MTN MoMo
            </div>
            <div className="px-3 py-1 bg-blue-500/20 rounded text-blue-400 text-xs">
              Wave
            </div>
          </div>
        </div>

        {/* Bouton d'achat */}
        <div className="sticky bottom-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 
                       rounded-xl flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:from-yellow-400 hover:to-orange-400 transition-all"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white font-bold">Traitement...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-bold">
                  S'abonner à {PLANS[selectedPlan].name} - {formatPrice(PLANS[selectedPlan].price, PLANS[selectedPlan].currency)}/mois
                </span>
              </>
            )}
          </button>
          
          <p className="text-slate-500 text-xs text-center mt-2">
            Annulation possible à tout moment. Pas d'engagement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;