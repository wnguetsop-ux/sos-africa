import React, { useState } from 'react';
import { IAlert, IPin, ICheck, IX } from '../ui/icons';
import { RISK_TYPES } from '../../hooks/useRiskZones';

const RiskReportSheet = ({ location, userProfile, reportZone, onClose }) => {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const userId =
    userProfile?.firstName ||
    userProfile?.getFullName?.() ||
    'anonyme';

  const submit = async () => {
    if (!selected || !location?.lat || !location?.lng) {
      setError('Type et position requis');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await reportZone({
        type: selected.id,
        lat: location.lat,
        lng: location.lng,
        note: note.trim(),
        userId,
      });
      setDone(true);
      // Auto-close after success
      setTimeout(() => onClose && onClose(), 1500);
    } catch (err) {
      setError(
        'Échec. Vérifie ta connexion internet ou réessaie.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{
            background: 'linear-gradient(180deg,#5BF6A8,#14B873)',
            boxShadow: '0 0 30px rgba(34,214,123,.55)',
          }}
        >
          <ICheck size={28} stroke={3.4} className="text-white" />
        </div>
        <div className="text-[15px] font-extrabold text-white font-display mb-1">
          Merci pour le signalement !
        </div>
        <div className="text-[12px] text-white/65 leading-snug">
          Cette zone est ajoutée à la carte.<br />
          D'autres utilisateurs pourront la voir et la confirmer.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-white/65 leading-snug">
        Aide la communauté&nbsp;: signale une zone à risque autour de toi. Plus elle est
        confirmée, plus elle sera visible sur la carte des autres utilisateurs.
      </p>

      {/* Position courante */}
      <div
        className="glass rounded-xl p-3 flex items-center gap-2.5"
        style={{ borderColor: 'var(--stroke)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(61,139,255,.14)',
            color: 'var(--blue)',
            border: '1px solid rgba(61,139,255,.35)',
          }}
        >
          <IPin size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-white">Ta position actuelle</div>
          <div className="text-[10.5px] text-white/55 font-mono">
            {location?.lat
              ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : 'Position GPS requise'}
          </div>
        </div>
      </div>

      {/* Type de risque */}
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 mb-2 px-1">
          Type de signalement
        </div>
        <div className="grid grid-cols-2 gap-2">
          {RISK_TYPES.map((rt) => {
            const isActive = selected?.id === rt.id;
            const c =
              rt.color === 'red'
                ? 'var(--red)'
                : rt.color === 'amber'
                ? 'var(--amber)'
                : 'var(--blue)';
            return (
              <button
                key={rt.id}
                onClick={() => setSelected(rt)}
                className="tap glass rounded-xl p-2.5 flex items-center gap-2 text-left"
                style={{
                  borderColor: isActive
                    ? `color-mix(in oklab, ${c} 60%, transparent)`
                    : 'var(--stroke)',
                  background: isActive
                    ? `color-mix(in oklab, ${c} 12%, transparent)`
                    : undefined,
                }}
              >
                <span className="text-[18px] leading-none">{rt.emoji}</span>
                <span
                  className="text-[12px] font-bold"
                  style={{
                    color: isActive ? c : 'rgba(255,255,255,.85)',
                  }}
                >
                  {rt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note optionnelle */}
      <div>
        <label className="text-[11.5px] text-white/65 font-bold mb-1 block">
          Détails (optionnel)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="ex: 'Plaque AB-123-CD', 'vers le marché Mokolo'…"
          className="w-full px-3 py-2.5 rounded-xl glass text-[13px] text-white/95 placeholder-white/40 resize-none"
          style={{ borderColor: 'var(--stroke)' }}
        />
        <div className="text-[10px] text-white/40 text-right mt-0.5">
          {note.length}/200
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl p-2.5 text-[11.5px] text-center"
          style={{
            background: 'rgba(255,46,63,.10)',
            color: 'var(--red-soft)',
            border: '1px solid rgba(255,46,63,.35)',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/85"
          style={{ borderColor: 'var(--stroke)' }}
        >
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={!selected || submitting || !location?.lat}
          className="tap btn-primary-red flex-1 py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Envoi…' : (
            <>
              <IAlert size={14} /> Signaler
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-white/40 leading-snug">
        Anonyme. Les signalements expirent après 7 jours sauf confirmation par d'autres utilisateurs.
      </p>
    </div>
  );
};

export default RiskReportSheet;
