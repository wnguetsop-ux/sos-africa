import React, { useState, useEffect } from 'react';
import {
  IPin,
  ISend,
  IVideo,
  ISiren,
  ICheck,
  IMic,
  IArrowRight,
  IWhatsapp,
  IMessage,
  ICopy,
} from './ui/icons';

const AlertRow = ({
  icon: Icn,
  color = 'green',
  title,
  sub,
  right,
  right2,
  pulseRed,
}) => {
  const c =
    color === 'green'
      ? 'var(--green)'
      : color === 'red'
      ? 'var(--red)'
      : color === 'amber'
      ? 'var(--amber)'
      : color === 'purple'
      ? 'var(--purple)'
      : 'var(--blue)';
  return (
    <div
      className="glass rounded-2xl px-3.5 py-3 flex items-center gap-3"
      style={{ borderColor: 'var(--stroke)' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in oklab, ${c} 14%, transparent)`,
          color: c,
          border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
          animation: pulseRed ? 'pulse-glow 1.6s ease-in-out infinite' : 'none',
          boxShadow: `0 0 14px color-mix(in oklab, ${c} 30%, transparent)`,
        }}
      >
        <Icn size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-white leading-tight">
          {title}
        </div>
        <div className="text-[11px] text-white/55 truncate">{sub}</div>
      </div>
      <div className="text-right">
        {right}
        {right2 && (
          <div className="text-[10px] font-mono text-white/50 mt-0.5">
            {right2}
          </div>
        )}
      </div>
    </div>
  );
};

const AlertActiveScreen = ({
  countDown,
  location,
  contacts,
  onCancel,
  onSent,
  t,
}) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const lat = location?.lat ?? null;
  const lng = location?.lng ?? null;
  const accuracy = location?.accuracy ? Math.round(location.accuracy) : null;

  return (
    <div className="screen-in flex flex-col h-full px-0 pb-32">
      <div className="px-5 pt-2 pb-2 text-center">
        <div
          className="text-[20px] font-extrabold text-grad-red font-display"
          style={{ letterSpacing: '-.01em' }}
        >
          {t ? t('alert.inProgress') || 'Alerte en cours' : 'Alerte en cours'}
        </div>
        <div className="text-[12px] text-white/65 mt-0.5">
          {countDown > 0
            ? t ? t('alert.autoSendIn', { n: countDown }) || `Envoi automatique dans ${countDown}s…` : `Envoi automatique dans ${countDown}s…`
            : t ? t('alert.notifying') || 'Les secours ont été notifiés.' : 'Les secours ont été notifiés.'}
          <br />
          {t ? t('alert.staySafe') || 'Restez en sécurité, nous agissons.' : 'Restez en sécurité, nous agissons.'}
        </div>
      </div>

      {/* Live SOS bubble */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 240 }}
      >
        <svg
          className="absolute"
          width="240"
          height="240"
          viewBox="0 0 240 240"
          aria-hidden
        >
          {Array.from({ length: 32 }).map((_, i) => {
            const a = (i / 32) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={120 + Math.cos(a) * 108}
                y1={120 + Math.sin(a) * 108}
                x2={120 + Math.cos(a) * 116}
                y2={120 + Math.sin(a) * 116}
                stroke="rgba(255,46,63,.45)"
                strokeWidth="1.2"
              />
            );
          })}
          <circle
            cx="120"
            cy="120"
            r="98"
            fill="none"
            stroke="rgba(255,46,63,.25)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              border: '2px solid rgba(255,46,63,.65)',
              animation: 'pulse-ring 2.0s ease-out infinite',
            }}
          />
        </div>
        <div
          className="rounded-full flex flex-col items-center justify-center"
          style={{
            width: 160,
            height: 160,
            background:
              'radial-gradient(circle at 50% 30%, #FF6E7B 0%, #E8202F 40%, #8C0A14 100%)',
            border: '2px solid rgba(255,255,255,.18)',
            animation: 'pulse-glow 1.4s ease-in-out infinite',
          }}
        >
          <div
            className="text-white font-extrabold leading-none font-display"
            style={{ fontSize: 38, letterSpacing: '.04em' }}
          >
            {countDown > 0 ? countDown : 'SOS'}
          </div>
          <div className="text-white/95 text-[10.5px] font-bold mt-1.5 uppercase tracking-widest">
            {countDown > 0
              ? t ? t('alert.sendingIn') || 'Envoi imminent' : 'Envoi imminent'
              : t ? t('alert.activeAlert') || 'Alerte active' : 'Alerte active'}
          </div>
          <div className="text-white text-[13.5px] font-mono mt-1 tabular-nums">
            00:{mm}:{ss}
          </div>
        </div>
      </div>

      {/* Status rows */}
      <div className="px-5 mt-2 flex flex-col gap-2">
        <AlertRow
          icon={IPin}
          color="green"
          title={t ? t('alert.gpsCaptured') || 'Position GPS capturée' : 'Position GPS capturée'}
          right={
            <span
              className="text-[11px] font-bold flex items-center gap-1"
              style={{ color: 'var(--green)' }}
            >
              <ICheck size={12} /> OK
            </span>
          }
          sub={
            accuracy
              ? `${t ? t('alert.precision') || 'Précision' : 'Précision'} : ${accuracy} m`
              : t ? t('alert.precisionUnknown') || 'Précision en cours…' : 'Précision en cours…'
          }
          right2={
            lat !== null && lng !== null
              ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              : null
          }
        />
        <AlertRow
          icon={ISend}
          color="red"
          title={t ? t('alert.sending') || "Alertes en cours d'envoi" : "Alertes en cours d'envoi"}
          right={
            <span
              className="text-[11px] font-bold"
              style={{ color: 'var(--red-soft)' }}
            >
              {t ? t('alert.sendingShort') || 'Envoi…' : 'Envoi…'}
            </span>
          }
          sub={`${contacts.length} ${t ? t('alert.contactsTarget') || "contacts d'urgence" : "contacts d'urgence"}`}
          pulseRed
        />
        <AlertRow
          icon={IVideo}
          color="purple"
          title={t ? t('alert.recording') || 'Enregistrement audio & vidéo' : 'Enregistrement audio & vidéo'}
          right={
            <span
              className="text-[11px] font-bold flex items-center gap-1"
              style={{ color: '#FF7884' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'var(--red)',
                  animation: 'blink 1.2s infinite',
                }}
              />
              REC
            </span>
          }
          sub={t ? t('alert.capturing') || 'Capture en cours…' : 'Capture en cours…'}
          right2={`00:${mm}:${ss}`}
        />
        <AlertRow
          icon={ISiren}
          color="amber"
          title={t ? t('alert.sirenActive') || 'Sirène active' : 'Sirène active'}
          right={
            <span
              className="text-[11px] font-bold flex items-center gap-1"
              style={{ color: 'var(--amber)' }}
            >
              ON <IMic size={11} />
            </span>
          }
          sub={t ? t('alert.audioSignal') || 'Signal sonore pour alerter' : 'Signal sonore pour alerter'}
        />
      </div>

      {/* Action row */}
      <div className="px-5 mt-3 flex gap-2.5">
        <button
          onClick={onCancel}
          className="tap flex-1 py-3.5 rounded-2xl text-[13.5px] font-bold text-white/85 glass halo-red"
          style={{ borderColor: 'var(--stroke-strong)' }}
        >
          {t ? t('alert.stop') || "Arrêter l'alerte" : "Arrêter l'alerte"}
        </button>
        <button
          onClick={onSent}
          className="tap flex-1 py-3.5 rounded-2xl text-[13.5px] font-bold btn-primary-red flex items-center justify-center gap-1.5"
        >
          <ISend size={15} />{' '}
          {t ? t('alert.sendNow') || 'Envoyer maintenant' : 'Envoyer maintenant'}
        </button>
      </div>
    </div>
  );
};

const AlertSuccessScreen = ({
  contacts,
  location,
  generateSMSLink,
  onWhatsApp,
  onClose,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const copyMessage = async () => {
    try {
      const mapsLink = location
        ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
        : '';
      const msg = `🆘 SOS Africa — J'ai besoin d'aide. Position : ${mapsLink}`;
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="screen-in flex flex-col h-full px-0 pb-32">
      <div className="px-5 pt-2 text-center">
        <div
          className="inline-flex items-center gap-1.5 text-[13px] font-bold"
          style={{ color: 'var(--green)' }}
        >
          <ICheck size={14} />{' '}
          {t ? t('alert.sentSuccess') || 'Alerte envoyée avec succès' : 'Alerte envoyée avec succès'}
        </div>
      </div>

      <div
        className="relative flex items-center justify-center"
        style={{ height: 260 }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: '2px solid rgba(34,214,123,.45)',
              animation: 'pulse-ring 2.4s ease-out infinite',
            }}
          />
        </div>
        <svg width="240" height="240" viewBox="0 0 240 240" className="absolute" aria-hidden>
          {Array.from({ length: 32 }).map((_, i) => {
            const a = (i / 32) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={120 + Math.cos(a) * 102}
                y1={120 + Math.sin(a) * 102}
                x2={120 + Math.cos(a) * 112}
                y2={120 + Math.sin(a) * 112}
                stroke="rgba(34,214,123,.4)"
                strokeWidth="1.2"
              />
            );
          })}
        </svg>
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 160,
            height: 160,
            background:
              'radial-gradient(circle at 50% 30%, #5BF6A8 0%, #14B873 40%, #064E2C 100%)',
            border: '2px solid rgba(255,255,255,.18)',
            animation: 'pulse-glow-green 2s ease-in-out infinite',
          }}
        >
          <ICheck size={64} stroke={3.4} className="text-white" />
        </div>
      </div>

      <div className="px-8 text-center">
        <div className="text-[14px] text-white/85 font-semibold leading-tight">
          {t ? t('alert.notifying') || 'Les secours ont été notifiés.' : 'Les secours ont été notifiés.'}
          <br />
          {t ? t('alert.staySafeShort') || 'Restez en sécurité.' : 'Restez en sécurité.'}
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="glass rounded-2xl p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/55 mb-2">
            {t ? t('alert.recipients') || 'Destinataires alertés' : 'Destinataires alertés'}
          </div>
          <div className="flex items-center gap-1.5">
            {(contacts || [])
              .slice(0, 4)
              .map((c, i) => (
                <div
                  key={c.id || i}
                  className="w-8 h-8 rounded-full border-2 border-[#0B0F1A] flex items-center justify-center text-[11px] font-bold text-white/85"
                  style={{
                    background: `linear-gradient(135deg, ${
                      ['#7B5BFF', '#FF7B5B', '#5BFFA9', '#FFC861'][i % 4]
                    }, #2a2a2a)`,
                  }}
                >
                  {(c.name || '?').slice(0, 1)}
                </div>
              ))}
            {contacts && contacts.length > 4 && (
              <div className="ml-1 text-[12px] font-bold text-white/85">
                +{contacts.length - 4}
              </div>
            )}
            {(!contacts || contacts.length === 0) && (
              <div className="text-[12px] text-white/55">—</div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 mt-3 grid grid-cols-3 gap-2">
        <a
          href={generateSMSLink ? generateSMSLink() : '#'}
          className="tap glass rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 halo-green text-white/90"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <IMessage size={14} /> SMS
        </a>
        {onWhatsApp && (
          <button
            onClick={onWhatsApp}
            className="tap glass rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 halo-green text-white/90"
            style={{ borderColor: 'var(--stroke)' }}
          >
            <IWhatsapp size={14} className="text-[color:var(--green)]" /> WhatsApp
          </button>
        )}
        <button
          onClick={copyMessage}
          className="tap glass rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 halo-blue text-white/90"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <ICopy size={14} />{' '}
          {copied
            ? t ? t('alert.copied') || 'Copié!' : 'Copié!'
            : t ? t('alert.copy') || 'Copier' : 'Copier'}
        </button>
      </div>

      <div className="px-5 mt-3">
        <button
          onClick={onClose}
          className="tap btn-primary-green w-full py-3.5 rounded-2xl text-[13.5px] font-bold flex items-center justify-center gap-2"
        >
          {t ? t('alert.backHome') || "Retour à l'accueil" : "Retour à l'accueil"}{' '}
          <IArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

const AlertModal = ({
  countDown,
  location,
  contacts,
  onCancel,
  generateSMSLink,
  onWhatsApp,
  isPremium,
  t,
}) => {
  const [phase, setPhase] = useState('active'); // 'active' | 'success'

  // When countDown reaches 0, parent's executeEmergencyActions runs.
  // Show "success" once countDown has finished its run.
  useEffect(() => {
    if (countDown === 0 && phase === 'active') {
      // small delay so the user sees the SOS bubble settle
      const id = setTimeout(() => setPhase('success'), 600);
      return () => clearTimeout(id);
    }
  }, [countDown, phase]);

  const skipToSuccess = () => setPhase('success');

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center"
         style={{
           background:
             'radial-gradient(140% 90% at 50% -20%, rgba(255,46,63,.18), transparent 55%), linear-gradient(180deg, #06080F 0%, #04060B 60%, #03050A 100%)',
         }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
           style={{
             backgroundImage:
               'repeating-linear-gradient(0deg, rgba(255,255,255,.7) 0 1px, transparent 1px 3px)',
             mixBlendMode: 'overlay',
           }} />
      <div className="relative w-full max-w-md mx-auto safe-area-inset overflow-y-auto no-scrollbar">
        {phase === 'active' ? (
          <AlertActiveScreen
            countDown={countDown}
            location={location}
            contacts={contacts}
            onCancel={onCancel}
            onSent={skipToSuccess}
            t={t}
          />
        ) : (
          <AlertSuccessScreen
            contacts={contacts}
            location={location}
            generateSMSLink={generateSMSLink}
            onWhatsApp={onWhatsApp}
            onClose={onCancel}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default AlertModal;
