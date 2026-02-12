import React, { useState } from 'react';
import { 
  Heart, X, CreditCard, Smartphone, Check,
  ExternalLink, Gift, Star
} from 'lucide-react';

const DonationModal = ({ isOpen, onClose, t, isDark }) => {
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobilemoney');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const presetAmounts = [500, 1000, 2000, 5000];

  const bgCard = isDark ? 'bg-slate-800' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  const handleDonate = async () => {
    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    
    if (finalAmount < 100) {
      alert('Montant minimum: 100 FCFA');
      return;
    }

    setProcessing(true);

    // Simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (paymentMethod === 'stripe') {
      // Rediriger vers Stripe
      window.open('https://buy.stripe.com/9B6dR1ao5aKCczq3LuaVa01', '_blank');
    } else if (paymentMethod === 'mobilemoney') {
      // Instructions Mobile Money
      alert(`Pour faire un don de ${finalAmount} FCFA via Mobile Money:\n\n📱 MTN Mobile Money:\nNuméro: 00237 651 495 483\n\n1. Composez *126#\n2. Choisissez "Transfert d'argent"\n3. Entrez le numéro: 651495483\n4. Montant: ${finalAmount} FCFA\n\nMerci pour votre soutien! 🙏`);
    }

    setProcessing(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md ${bgCard} rounded-3xl overflow-hidden`}>
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('donation.title')}</h2>
              <p className="text-white/80 text-sm">{t('donation.subtitle')}</p>
            </div>
          </div>
        </div>

        {success ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className={`text-xl font-bold ${textColor} mb-2`}>{t('donation.thankYou')}</h3>
            <p className={textSecondary}>{t('donation.thankYouMessage')}</p>
          </div>
        ) : (
          /* Form */
          <div className="p-6 space-y-6">
            {/* Description */}
            <p className={`text-sm ${textSecondary}`}>
              {t('donation.description')}
            </p>

            {/* Montants prédéfinis */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t('donation.amount')} (FCFA)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      amount === preset && !customAmount
                        ? 'bg-red-500 text-white'
                        : isDark 
                          ? 'bg-slate-700 text-white hover:bg-slate-600' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={t('donation.customAmount')}
                className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${
                  isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>

            {/* Méthode de paiement */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t('donation.paymentMethod')}
              </label>
              <div className="space-y-2">
                {/* Mobile Money */}
                <button
                  onClick={() => setPaymentMethod('mobilemoney')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    paymentMethod === 'mobilemoney'
                      ? 'border-orange-500 bg-orange-500/10'
                      : `${borderColor} ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === 'mobilemoney' ? 'bg-orange-500' : 'bg-orange-500/20'
                  }`}>
                    <Smartphone className={`w-6 h-6 ${paymentMethod === 'mobilemoney' ? 'text-white' : 'text-orange-500'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-semibold ${textColor}`}>{t('donation.mobileMoney')}</p>
                    <p className={`text-xs ${textSecondary}`}>MTN Mobile Money Cameroun</p>
                  </div>
                  {paymentMethod === 'mobilemoney' && (
                    <Check className="w-5 h-5 text-orange-500" />
                  )}
                </button>

                {/* Stripe */}
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-purple-500 bg-purple-500/10'
                      : `${borderColor} ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    paymentMethod === 'stripe' ? 'bg-purple-500' : 'bg-purple-500/20'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'stripe' ? 'text-white' : 'text-purple-500'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-semibold ${textColor}`}>Stripe</p>
                    <p className={`text-xs ${textSecondary}`}>Carte bancaire sécurisée</p>
                  </div>
                  {paymentMethod === 'stripe' && (
                    <Check className="w-5 h-5 text-purple-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Numéro MTN */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
              <p className={`text-xs ${textSecondary}`}>
                📱 MTN Mobile Money: <span className={`${textColor} font-bold`}>+237 651 495 483</span>
              </p>
            </div>

            {/* Bouton Donner */}
            <button
              onClick={handleDonate}
              disabled={processing}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                processing
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600'
              }`}
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('donation.processing')}
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  {t('donation.donate')} {customAmount || amount} FCFA
                </>
              )}
            </button>

            {/* Note */}
            <p className={`text-center text-xs ${textSecondary}`}>
              🙏 Merci de soutenir SOS Africa • Chaque don compte
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal;