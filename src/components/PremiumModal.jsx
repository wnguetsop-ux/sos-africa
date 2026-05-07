import React, { useState, useRef } from 'react';
import {
  IX,
  ICrown,
  ICheck,
  IShieldCheck,
  ICopy,
} from './ui/icons';
import { storage, db } from '../firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Prix XAF (Franc CFA) pour le Cameroun - 1 EUR ~ 656 XAF
const PLANS = [
  { id: 'monthly', label: 'Mensuel', price: '1 300 XAF', priceEUR: '1,99 €', amount: 1300, sub: '/ mois', save: null },
  { id: 'yearly', label: 'Annuel', price: '12 500 XAF', priceEUR: '19 €', amount: 12500, sub: '/ an', save: '-20%' },
  { id: 'family', label: 'Famille', price: '3 300 XAF', priceEUR: '4,99 €', amount: 3300, sub: '/ mois · 5 comptes', save: 'Best' },
];

const METHODS = [
  { id: 'momo', label: 'Mobile Money', sub: 'MTN · Orange', emoji: '📱' },
  { id: 'card', label: 'Carte bancaire', sub: 'Bientôt', emoji: '💳', disabled: true },
  { id: 'paypal', label: 'PayPal', sub: 'Bientôt', emoji: '🅿️', disabled: true },
];

const MOMO_NUMBER = '651495483';
const MOMO_NAME = 'SOS Africa';
const MOMO_COUNTRY = 'Cameroun (+237)';

const PremiumModal = ({ isOpen, onClose, t, userProfile }) => {
  const [plan, setPlan] = useState('monthly');
  const [method, setMethod] = useState('momo');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'pay' | 'pending' | 'done'
  const [copied, setCopied] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const selected = PLANS.find((p) => p.id === plan);

  const close = () => {
    setStep('select');
    setPhone('');
    setScreenshot(null);
    setUploadError(null);
    onClose();
  };
  const proceedToPay = () => setStep('pay');

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(MOMO_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setScreenshot(f);
    setUploadError(null);
  };

  const submitPayment = async () => {
    if (method === 'momo') {
      if (!screenshot || !phone.trim()) {
        setUploadError('Numéro et capture requis');
        return;
      }
      setUploading(true);
      setUploadError(null);
      try {
        const userId = userProfile?.firstName || userProfile?.getFullName?.() || 'anonymous';
        const ts = Date.now();
        const path = `payments/${userId.replace(/[^a-z0-9]/gi, '_')}/${ts}_${screenshot.name}`;
        const sref = storageRef(storage, path);
        const snap = await uploadBytes(sref, screenshot, {
          contentType: screenshot.type || 'image/jpeg',
        });
        const url = await getDownloadURL(snap.ref);
        await addDoc(collection(db, 'payments'), {
          userId,
          plan: selected.id,
          amount: selected.amount,
          currency: 'XAF',
          phone: phone.trim(),
          method: 'mobile_money',
          provider: 'mtn_orange_cameroon',
          screenshotUrl: url,
          status: 'pending_review',
          createdAt: serverTimestamp(),
        });
        setStep('pending');
      } catch (err) {
        console.error('Upload failed:', err);
        setUploadError(
          'Échec de l\'envoi. Vérifie ta connexion ou réessaie.'
        );
      } finally {
        setUploading(false);
      }
    } else {
      setStep('pending');
      setTimeout(() => setStep('done'), 1800);
    }
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
                      <div className="text-right">
                        <div className="text-[18px] font-extrabold text-grad-gold leading-none">
                          {selected.price}
                        </div>
                        <div className="text-[11px] text-white/45">≈ {selected.priceEUR}</div>
                      </div>
                    </div>
                  </div>

                  {method === 'momo' && (
                    <>
                      <div
                        className="rounded-2xl p-4 mb-3 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,176,32,.16), rgba(244,194,75,.06))',
                          border: '1px solid rgba(255,176,32,.4)',
                        }}
                      >
                        <div className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-[color:var(--amber)] mb-2">
                          Étape 1 · Faire le transfert
                        </div>
                        <div className="text-[12.5px] text-white/85 mb-3 leading-snug">
                          Envoie <span className="font-bold text-white">{selected.price}</span> par
                          MTN MoMo / Orange Money au numéro :
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 glass rounded-xl px-3 py-2.5" style={{ borderColor: 'var(--stroke)' }}>
                            <div className="text-[18px] font-extrabold font-mono text-white tracking-wider">
                              {MOMO_NUMBER}
                            </div>
                            <div className="text-[10.5px] text-white/55">{MOMO_COUNTRY} · {MOMO_NAME}</div>
                          </div>
                          <button
                            onClick={copyNumber}
                            className="tap glass rounded-xl px-3 py-2.5 flex items-center gap-1.5 halo-gold text-white/85 text-[12px] font-bold"
                            style={{ borderColor: 'var(--stroke)' }}
                          >
                            <ICopy size={13} />
                            {copied ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                      </div>

                      <label className="text-[11.5px] text-white/65 font-bold mb-1 block">
                        Étape 2 · Ton numéro de transfert
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        placeholder="+237 6XX XX XX XX"
                        className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40 mb-3"
                        style={{ borderColor: 'var(--stroke)' }}
                      />

                      <label className="text-[11.5px] text-white/65 font-bold mb-1 block">
                        Étape 3 · Capture de la confirmation
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onFile}
                        className="hidden"
                      />
                      {!screenshot ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="tap w-full glass rounded-xl py-4 px-3 flex flex-col items-center gap-1 halo-gold text-white/75"
                          style={{ borderColor: 'var(--stroke)', borderStyle: 'dashed' }}
                        >
                          <div className="text-[20px]">📸</div>
                          <div className="text-[12.5px] font-bold">Choisir la capture d'écran</div>
                          <div className="text-[10.5px] text-white/45">JPG, PNG · 5 Mo max</div>
                        </button>
                      ) : (
                        <div
                          className="glass rounded-xl p-3 flex items-center gap-2 mb-1"
                          style={{ borderColor: 'rgba(34,214,123,.4)' }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[color:var(--green)]"
                            style={{ background: 'rgba(34,214,123,.15)' }}
                          >
                            <ICheck size={15} stroke={3} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-bold text-white truncate">
                              {screenshot.name}
                            </div>
                            <div className="text-[10.5px] text-white/55">
                              {(screenshot.size / 1024).toFixed(0)} Ko · prêt à envoyer
                            </div>
                          </div>
                          <button
                            onClick={() => setScreenshot(null)}
                            className="tap text-white/55 px-2"
                            aria-label="Retirer"
                          >
                            <IX size={14} />
                          </button>
                        </div>
                      )}
                      {uploadError && (
                        <div className="text-[11px] text-[color:var(--red-soft)] mt-2 text-center">
                          {uploadError}
                        </div>
                      )}
                      <div className="text-[10.5px] text-white/45 mt-2 mb-3 leading-snug">
                        Activation manuelle sous 24h après vérification du transfert.
                      </div>
                    </>
                  )}

                  {method === 'card' && (
                    <div className="text-[12.5px] text-white/65 mb-3 text-center py-4">
                      🚧 Paiement par carte arrive bientôt — utilise Mobile Money en attendant.
                    </div>
                  )}

                  {method === 'paypal' && (
                    <div className="text-[12.5px] text-white/65 mb-3 text-center py-4">
                      🚧 PayPal arrive bientôt — utilise Mobile Money en attendant.
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
                      disabled={uploading || (method === 'momo' && (!screenshot || !phone.trim()))}
                      className="tap btn-primary-gold flex-1 py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5 font-display disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Envoi…' : 'Envoyer la preuve'}
                    </button>
                  </div>
                </>
              )}

              {step === 'pending' && (
                <div className="text-center py-6">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'rgba(244,194,75,.18)',
                      border: '1px solid rgba(244,194,75,.5)',
                      boxShadow: '0 0 30px rgba(244,194,75,.35)',
                    }}
                  >
                    <span style={{ fontSize: 28 }}>⏳</span>
                  </div>
                  <div className="text-[15px] font-extrabold text-white mb-1 font-display">
                    Preuve reçue !
                  </div>
                  <div className="text-[12.5px] text-white/65 mb-4 leading-snug">
                    Ton paiement est en cours de vérification.<br />
                    Premium sera activé sous 24h après confirmation du transfert.
                  </div>
                  <button
                    onClick={close}
                    className="tap btn-primary-gold w-full py-3 rounded-xl text-[13.5px] font-bold"
                  >
                    Fermer
                  </button>
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
