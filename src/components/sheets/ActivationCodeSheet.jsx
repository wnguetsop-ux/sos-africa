import React, { useState } from 'react';
import { ICheck, ICrown, IX, IInfo } from '../ui/icons';

const ActivationCodeSheet = ({ activateCode, onClose }) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async () => {
    if (!code.trim()) {
      setError('Entre ton code Premium');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await activateCode(code);
      if (result.ok) {
        const days = Math.floor((result.until - Date.now()) / (24 * 60 * 60 * 1000));
        setSuccess({
          plan: result.plan,
          days,
          until: new Date(result.until).toLocaleDateString('fr-FR'),
        });
        setTimeout(() => {
          onClose && onClose();
        }, 2500);
      } else {
        setError(result.error || 'Code invalide');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{
            background: 'linear-gradient(180deg,#FFD86A,#D9971C)',
            boxShadow: '0 0 36px rgba(244,194,75,.6)',
          }}
        >
          <ICrown size={28} className="text-[#241500]" />
        </div>
        <div className="text-[16px] font-extrabold text-grad-gold font-display mb-1">
          Premium activé !
        </div>
        <div className="text-[12.5px] text-white/70 leading-snug">
          Plan {success.plan === 'family' ? 'Famille' : success.plan === 'yearly' ? 'Annuel' : 'Mensuel'} · {success.days} jours
          <br />
          Actif jusqu'au {success.until}
        </div>
        <div
          className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-white/55 px-3 py-1.5 rounded-full glass"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <ICheck size={11} className="text-[color:var(--green)]" />
          Toutes les fonctions Premium sont débloquées
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-white/65 leading-snug">
        Entre le code Premium reçu après vérification de ton paiement Mobile Money.
      </p>

      <div>
        <label className="text-[11.5px] text-white/65 font-bold mb-1 block">
          Code d'activation
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={20}
          autoFocus
          placeholder="SOS-PREM-XXXX"
          className="w-full px-3 py-3 rounded-xl glass text-center text-[16px] font-mono font-bold text-white tracking-[0.2em] uppercase placeholder-white/25"
          style={{ borderColor: 'var(--stroke)' }}
        />
      </div>

      {error && (
        <div
          className="rounded-xl p-2.5 text-[11.5px] text-center flex items-center justify-center gap-1.5"
          style={{
            background: 'rgba(255,46,63,.10)',
            color: 'var(--red-soft)',
            border: '1px solid rgba(255,46,63,.35)',
          }}
        >
          <IX size={12} /> {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting || !code.trim()}
        className="tap btn-primary-gold w-full py-3 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display disabled:opacity-50"
      >
        {submitting ? 'Vérification…' : (
          <>
            <ICrown size={15} /> Activer Premium
          </>
        )}
      </button>

      <div
        className="rounded-xl p-3 mt-2 flex items-start gap-2"
        style={{
          background: 'rgba(61,139,255,.06)',
          border: '1px solid rgba(61,139,255,.25)',
        }}
      >
        <IInfo size={13} className="text-[color:var(--blue)] shrink-0 mt-0.5" />
        <div className="text-[11px] text-white/65 leading-snug">
          Tu n'as pas encore de code ?{' '}
          <span className="font-bold text-white">
            Fais ton paiement Mobile Money via le bouton « Passer à Premium »
          </span>
          , envoie ta capture, et tu recevras un code par WhatsApp sous 24h.
        </div>
      </div>
    </div>
  );
};

export default ActivationCodeSheet;
