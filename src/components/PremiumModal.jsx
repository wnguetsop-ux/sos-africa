import React, { useState } from 'react';
import {
  IX,
  ICrown,
  ICheck,
  IShieldCheck,
} from './ui/icons';

const PLANS = [
  { id: 'monthly', label: 'Mensuel', price: '1,99 €', sub: '/ mois', save: null },
  { id: 'yearly', label: 'Annuel', price: '19 €', sub: '/ an', save: '-20%' },
  { id: 'family', label: 'Famille', price: '3,99 €', sub: '/ mois · 5 comptes', save: 'Best' },
];

const METHODS = [
  { id: 'momo', label: 'Mobile Money', sub: 'Orange · MTN · Wave', emoji: '📱' },
  { id: 'card', label: 'Carte bancaire', sub: 'Visa · Mastercard', emoji: '💳' },
  { id: 'paypal', label: 'PayPal', sub: 'Compte PayPal', emoji: '🅿️' },
];

const PremiumModal = ({ isOpen, onClose, t }) => {
  const [plan, setPlan] = useState('monthly');
  const [method, setMethod] = useState('momo');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'pay' | 'pending' | 'done'

  if (!isOpen) return null;

  const selected = PLANS.find((p) => p.id === plan);

  const close = () => {
    setStep('select');
    setPhone('');
    onClose();
  };
  const proceedToPay = () => setStep('pay');
  const submitPayment = () => {
    setStep('pending');
    setTimeout(() => setStep('done'), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)' }}
        onClick={close}
      />
      <div className="relative w-full max-w-md mx-auto safe-area-inset overflow-y-auto no-scrollbar">
        <div className="p-4 pt-6">
          <div className="glass-strong rounded-3xl p-5 ring-gold relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(120% 80% at 50% -20%, rgba(244,194,75,.18), transparent 60%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ICrown size={18} className="text-[color:var(--gold)]" />
                  <div className="text-[16px] font-extrabold text-grad-gold font-display">
                    Passer à Premium
                  </div>
                </div>
                <button
                  onClick={close}
                  className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
                  style={{ borderColor: 'var(--stroke)' }}
                  aria-label="Fermer"
                >
                  <IX size={16} />
                </button>
              </div>

              {step === 'select' && (
                <>
                  <p className="text-[12.5px] text-white/65 mb-3">
                    Choisissez votre formule. Annulation à tout moment.
                  </p>
                  <div className="space-y-2 mb-4">
                    {PLANS.map((p) => {
                      const isActive = plan === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPlan(p.id)}
                          className="w-full glass rounded-2xl p-3 flex items-center gap-3 text-left tap halo-gold"
                          style={{
                            borderColor: isActive ? 'rgba(244,194,75,.5)' : 'var(--stroke)',
                            background: isActive ? 'rgba(244,194,75,.10)' : undefined,
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: isActive
                                ? 'linear-gradient(180deg,#FFD86A,#D9971C)'
                                : 'rgba(255,255,255,.05)',
                              color: isActive ? '#241500' : 'rgba(255,255,255,.55)',
                              border: '1px solid rgba(244,194,75,.35)',
                            }}
                          >
                            {isActive ? <ICheck size={14} stroke={3} /> : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-white">{p.label}</div>
                            <div className="text-[11px] text-white/55">
                              {p.price} {p.sub}
                            </div>
                          </div>
                          {p.save && (
                            <span
                              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                              style={{
                                color: 'var(--green)',
                                background: 'rgba(34,214,123,.15)',
                                border: '1px solid rgba(34,214,123,.35)',
                              }}
                            >
                              {p.save}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mb-3">
                    <div className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-white/50 mb-2 px-1">
                      Méthode de paiement
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {METHODS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMethod(m.id)}
                          className="tap glass rounded-xl py-2.5 flex flex-col items-center gap-0.5 halo-gold"
                          style={{
                            borderColor:
                              method === m.id ? 'rgba(244,194,75,.5)' : 'var(--stroke)',
                            background: method === m.id ? 'rgba(244,194,75,.08)' : undefined,
                          }}
                        >
                          <div className="text-xl leading-none">{m.emoji}</div>
                          <div className="text-[10.5px] font-bold text-white/85 text-center leading-tight">
                            {m.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={proceedToPay}
                    className="tap btn-primary-gold w-full py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display"
                  >
                    Continuer · {selected.price} <ICrown size={16} />
                  </button>
                  <div className="text-[10.5px] text-white/45 text-center mt-2">
                    Essai gratuit 7 jours · Sans engagement
                  </div>
                </>
              )}

              {step === 'pay' && (
                <>
                  <div className="glass rounded-2xl p-3 mb-3" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="text-[11px] uppercase tracking-wider text-white/55 font-bold mb-1">
                      Récap
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] text-white">{selected.label}</div>
                      <div className="text-[16px] font-extrabold text-grad-gold">
                        {selected.price}
                        <span className="text-[12px] text-white/55 ml-1">{selected.sub}</span>
                      </div>
                    </div>
                  </div>

                  {method === 'momo' && (
                    <>
                      <label className="text-[11.5px] text-white/65 font-bold mb-1 block">
                        Numéro Mobile Money
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        placeholder="+237 6XX XX XX XX"
                        className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40 mb-2"
                        style={{ borderColor: 'var(--stroke)' }}
                      />
                      <div className="text-[10.5px] text-white/45 mb-3">
                        Vous recevrez un code de validation sur votre téléphone.
                      </div>
                    </>
                  )}

                  {method === 'card' && (
                    <>
                      <label className="text-[11.5px] text-white/65 font-bold mb-1 block">
                        Saisie carte bancaire
                      </label>
                      <div className="grid gap-2 mb-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Numéro de carte"
                          className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40"
                          style={{ borderColor: 'var(--stroke)' }}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM/AA"
                            className="px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40"
                            style={{ borderColor: 'var(--stroke)' }}
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            className="px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40"
                            style={{ borderColor: 'var(--stroke)' }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10.5px] text-white/55 mb-3">
                        <IShieldCheck size={11} className="text-[color:var(--green)]" />
                        Paiement chiffré · 3-D Secure
                      </div>
                    </>
                  )}

                  {method === 'paypal' && (
                    <div className="text-[12.5px] text-white/65 mb-3">
                      Vous serez redirigé vers PayPal pour valider le paiement.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('select')}
                      className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/85"
                      style={{ borderColor: 'var(--stroke)' }}
                    >
                      Retour
                    </button>
                    <button
                      onClick={submitPayment}
                      className="tap btn-primary-gold flex-1 py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5 font-display"
                    >
                      Payer {selected.price}
                    </button>
                  </div>
                </>
              )}

              {step === 'pending' && (
                <div className="text-center py-6">
                  <div
                    className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'rgba(244,194,75,.12)',
                      border: '1px solid rgba(244,194,75,.4)',
                    }}
                  >
                    <div className="spinner" />
                  </div>
                  <div className="text-[14px] font-bold text-white mb-1">Paiement en cours…</div>
                  <div className="text-[12px] text-white/60">Veuillez patienter quelques secondes.</div>
                </div>
              )}

              {step === 'done' && (
                <div className="text-center py-6">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'linear-gradient(180deg,#5BF6A8,#14B873)',
                      boxShadow: '0 0 40px rgba(34,214,123,.55)',
                    }}
                  >
                    <ICheck size={32} stroke={3.4} className="text-white" />
                  </div>
                  <div className="text-[16px] font-extrabold text-white mb-1 font-display">
                    Bienvenue dans Premium !
                  </div>
                  <div className="text-[12.5px] text-white/65 mb-4">
                    Vos fonctionnalités Premium sont actives.
                  </div>
                  <button
                    onClick={close}
                    className="tap btn-primary-green w-full py-3 rounded-xl text-[13.5px] font-bold"
                  >
                    Commencer
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/40">
                <IShieldCheck size={11} /> Sécurisé · Aucune donnée bancaire stockée
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
