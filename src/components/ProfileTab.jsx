import React, { useEffect, useState } from 'react';
import {
  IShield,
  IBell,
  ICrown,
  IVideo,
  ISparkle,
  IFamily,
  IHistory,
  IInfo,
  IChevronRight,
  IGlobe,
  ISun,
  IMoon,
  IHeart,
  IShare,
  ILightning,
  ILock,
  IPin,
  IMic,
  IPlus,
  ICheck,
  IBrain,
  ISend,
  IClock,
} from './ui/icons';

const PremiumShield = () => (
  <div className="relative flex items-center justify-center my-3" style={{ height: 220 }}>
    <div className="absolute rays-rot" style={{ width: 220, height: 220 }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={110 + Math.cos(a) * 55}
              y1={110 + Math.sin(a) * 55}
              x2={110 + Math.cos(a) * 108}
              y2={110 + Math.sin(a) * 108}
              stroke="rgba(244,194,75,.35)"
              strokeWidth="1.1"
            />
          );
        })}
      </svg>
    </div>
    <div className="absolute rounded-full" style={{ width: 200, height: 200, border: '1px solid rgba(244,194,75,.18)' }} />
    <div className="absolute rounded-full" style={{ width: 160, height: 160, border: '1px solid rgba(244,194,75,.28)' }} />
    <div
      className="absolute rounded-full"
      style={{ width: 130, height: 130, animation: 'pulse-glow-gold 2.6s ease-in-out infinite' }}
    />
    <div className="relative" style={{ width: 108, height: 120 }}>
      <svg viewBox="0 0 108 120" width="108" height="120">
        <defs>
          <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE39A" />
            <stop offset="55%" stopColor="#E0A024" />
            <stop offset="100%" stopColor="#7A5410" />
          </linearGradient>
          <linearGradient id="gold-grad-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD86A" />
            <stop offset="100%" stopColor="#A06C12" />
          </linearGradient>
        </defs>
        <path
          d="M54 4 L98 18 L98 62 C98 92 80 110 54 116 C28 110 10 92 10 62 L10 18 Z"
          fill="url(#gold-grad)"
          stroke="#FFE39A"
          strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 16px rgba(244,194,75,.7))' }}
        />
        <path
          d="M54 12 L90 24 L90 62 C90 86 76 102 54 108 C32 102 18 86 18 62 L18 24 Z"
          fill="none"
          stroke="rgba(255,255,255,.4)"
          strokeWidth="1"
        />
        <g transform="translate(54 60)" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.4))' }}>
          <path
            d="M-22 -6 L-14 4 L-7 -10 L0 6 L7 -10 L14 4 L22 -6 L18 14 L-18 14 Z"
            fill="url(#gold-grad-2)"
            stroke="#FFE39A"
            strokeWidth="1"
          />
          <rect x="-18" y="14" width="36" height="3" rx="1" fill="#FFE39A" />
          <circle cx="0" cy="-10" r="2" fill="#FFE39A" />
        </g>
      </svg>
    </div>
  </div>
);

const ToggleRow = ({ icon: Icn, label, sub, on, onChange, color = 'blue', isLast }) => {
  const c =
    color === 'red'
      ? 'var(--red)'
      : color === 'green'
      ? 'var(--green)'
      : color === 'amber'
      ? 'var(--amber)'
      : 'var(--blue)';
  const cls = color === 'green' ? 'green' : color === 'amber' ? 'amber' : '';
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5"
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.05)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in oklab, ${c} 14%, transparent)`,
          color: c,
          border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
        }}
      >
        <Icn size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-white leading-tight">{label}</div>
        <div className="text-[10.5px] text-white/55 leading-snug">{sub}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`switch ${cls} ${on ? 'on' : ''}`}
        aria-label={label}
        aria-pressed={on}
      />
    </div>
  );
};

const PremiumFeature = ({ icon: Icn, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="tap w-full glass rounded-2xl p-3 flex items-center gap-3 halo-gold text-left"
    style={{ borderColor: 'var(--stroke)' }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: 'rgba(244,194,75,.12)',
        color: 'var(--gold)',
        border: '1px solid rgba(244,194,75,.35)',
        boxShadow: '0 0 12px rgba(244,194,75,.25)',
      }}
    >
      <Icn size={17} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-bold text-white leading-tight">{title}</div>
      <div className="text-[11px] text-white/55 leading-snug">{desc}</div>
    </div>
    <IChevronRight size={14} className="text-white/40" />
  </button>
);

const SettingRow = ({ icon: Icn, label, value, onClick, color = 'blue' }) => {
  const c =
    color === 'gold'
      ? 'var(--gold)'
      : color === 'green'
      ? 'var(--green)'
      : color === 'red'
      ? 'var(--red)'
      : 'var(--blue)';
  return (
    <button
      onClick={onClick}
      className="tap w-full glass rounded-2xl p-3 flex items-center gap-3 halo-blue text-left"
      style={{ borderColor: 'var(--stroke)' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in oklab, ${c} 14%, transparent)`,
          color: c,
          border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
        }}
      >
        <Icn size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-white leading-tight">{label}</div>
        {value && <div className="text-[11px] text-white/55 leading-snug">{value}</div>}
      </div>
      <IChevronRight size={14} className="text-white/40" />
    </button>
  );
};

const ProfileTab = ({
  language,
  setLanguage,
  theme,
  setTheme,
  isDark,
  userProfile,
  alertHistory,
  onDonate,
  onUpgrade,
  onShareApp,
  onAlertHistory,
  onAdminTap,
  innovationsState,
  setInnovationsState,
  t,
}) => {
  const [billing, setBilling] = useState('monthly');
  const [showChildTracker, setShowChildTracker] = useState(false);
  const [showCodeWord, setShowCodeWord] = useState(false);
  const [codeWord, setCodeWord] = useState(
    () => localStorage.getItem('sos_code_word') || ''
  );
  const innovations = innovationsState || {
    autoRecord: true,
    batteryLowAlert: true,
    safeArrival: false,
  };
  const updateInnov = (key, val) => {
    if (setInnovationsState) setInnovationsState({ ...innovations, [key]: val });
  };

  const saveCodeWord = (val) => {
    setCodeWord(val);
    localStorage.setItem('sos_code_word', val);
  };

  const userName = userProfile?.getFullName ? userProfile.getFullName() : userProfile?.firstName || '';

  const shareApp = async () => {
    if (onShareApp) return onShareApp();
    const data = {
      title: 'SOS Africa',
      text: '🛡️ Découvre SOS Africa — sécurité personnelle, gratuit.',
      url: 'https://sos-africa.vercel.app',
    };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(`${data.text}\n\n${data.url}`);
    } catch {}
  };

  return (
    <div className="screen-in pb-32">
      {/* Header (logo + name) */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-2">
        <button onClick={onAdminTap} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg,#221016,#0E0608)',
              border: '1px solid rgba(255,46,63,.4)',
            }}
          >
            <IShield size={18} className="text-[color:var(--red)]" />
          </div>
          <div className="font-extrabold text-[16px] font-display">
            <span className="text-[color:var(--red)]">SOS</span>{' '}
            <span className="text-white">Africa</span>
          </div>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={shareApp}
            className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85 halo-blue"
            style={{ borderColor: 'var(--stroke)' }}
            aria-label="Partager"
          >
            <IShare size={16} />
          </button>
          <button
            className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
            style={{ borderColor: 'var(--stroke)' }}
            aria-label="Notifications"
          >
            <IBell size={16} />
          </button>
        </div>
      </div>

      {/* User identity */}
      {userName && (
        <div className="px-5 mt-1 mb-2">
          <div className="glass rounded-2xl p-3 flex items-center gap-3" style={{ borderColor: 'var(--stroke)' }}>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[14px]"
              style={{
                background: 'linear-gradient(135deg, #FF7B5B, #2a2a2a)',
                border: '1px solid rgba(255,255,255,.1)',
              }}
            >
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-white leading-tight truncate">
                {userName}
              </div>
              <div className="text-[11.5px] text-white/55">
                {t ? t('profile.greeting') || 'Membre · Édition gratuite' : 'Membre · Édition gratuite'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium hero */}
      <div className="px-5 pt-2 text-center">
        <div
          className="text-[24px] font-extrabold text-grad-gold font-display"
          style={{ letterSpacing: '-.015em' }}
        >
          {t ? t('profile.upgradeTitle') || 'Passer à Premium' : 'Passer à Premium'}
        </div>
        <div className="text-[12.5px] text-white/65 mt-0.5">
          {t
            ? t('profile.upgradeSubtitle') ||
              'Débloquez la protection maximale pour vous et vos proches.'
            : 'Débloquez la protection maximale pour vous et vos proches.'}
        </div>
      </div>

      <PremiumShield />

      <div className="px-5 flex flex-col gap-2">
        <PremiumFeature
          icon={IVideo}
          title="SOS vidéo illimité"
          desc="Diffusion live pour vos contacts pendant toute l'alerte."
        />
        <PremiumFeature
          icon={ISparkle}
          title="Assistant IA d'urgence"
          desc="Conseils instantanés 24/7 pour réagir en sécurité."
        />
        <PremiumFeature
          icon={IBell}
          title="Alertes en temps réel"
          desc="Notifications push instantanées vers vos proches."
        />
        <PremiumFeature
          icon={IFamily}
          title="Mode famille · Suivi enfant"
          desc="Suivez la position de vos enfants en direct, recevez une alerte s'ils entrent dans une zone isolée."
          onClick={() => setShowChildTracker(true)}
        />
        <PremiumFeature
          icon={ILock}
          title="Mot de code SOS silencieux"
          desc="Tapez votre mot secret n'importe où pour déclencher une alerte sans bruit."
          onClick={() => setShowCodeWord(true)}
        />
        <PremiumFeature
          icon={IMic}
          title="Auto-enregistrement audio"
          desc="L'audio démarre automatiquement dès qu'un SOS est lancé."
        />
        <PremiumFeature
          icon={ILightning}
          title="Alerte batterie faible"
          desc="Vos contacts sont prévenus avant que votre batterie ne meure."
        />
        <PremiumFeature
          icon={IClock}
          title="Auto-arrivée sécurisée"
          desc="Définissez un trajet : si vous n'arrivez pas à temps, alerte automatique."
        />
        <PremiumFeature
          icon={IHistory}
          title="Preuves sécurisées"
          desc="Enregistrements et rapports stockés et chiffrés."
          onClick={onAlertHistory}
        />
        <PremiumFeature
          icon={IInfo}
          title="Support prioritaire 24/7"
          desc="Une équipe dédiée, toujours là."
        />
      </div>

      {/* Pricing CTA */}
      <div className="px-5 mt-4">
        <div className="glass-strong rounded-2xl p-4 ring-gold relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(120% 80% at 50% -20%, rgba(244,194,75,.18), transparent 60%)',
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setBilling('monthly')}
                className="tap flex-1 py-2 rounded-xl text-[12px] font-bold"
                style={{
                  color: billing === 'monthly' ? 'var(--gold)' : 'rgba(255,255,255,.6)',
                  background: billing === 'monthly' ? 'rgba(244,194,75,.12)' : 'transparent',
                  border: `1px solid ${billing === 'monthly' ? 'rgba(244,194,75,.4)' : 'var(--stroke)'}`,
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className="tap flex-1 py-2 rounded-xl text-[12px] font-bold"
                style={{
                  color: billing === 'yearly' ? 'var(--gold)' : 'rgba(255,255,255,.6)',
                  background: billing === 'yearly' ? 'rgba(244,194,75,.12)' : 'transparent',
                  border: `1px solid ${billing === 'yearly' ? 'rgba(244,194,75,.4)' : 'var(--stroke)'}`,
                }}
              >
                Annuel <span className="text-[10px] font-extrabold ml-1" style={{ color: 'var(--green)' }}>-20%</span>
              </button>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-[26px] font-extrabold text-grad-gold font-display leading-none">
                {billing === 'monthly' ? '1 300' : '12 500'}
              </div>
              <div className="text-[14px] text-grad-gold font-bold">XAF</div>
              <div className="text-[13px] text-white/65 font-semibold ml-1">
                / {billing === 'monthly' ? 'mois' : 'an'}
              </div>
            </div>
            <div className="text-[11.5px] text-white/55 mb-3">
              {t ? t('profile.cancelAnytime') || 'Annulation possible à tout moment.' : 'Annulation possible à tout moment.'}
            </div>
            <button
              onClick={onUpgrade || onDonate}
              className="tap btn-primary-gold w-full py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display"
            >
              {t ? t('profile.upgradeCTA') || 'Passer à Premium' : 'Passer à Premium'}{' '}
              <ICrown size={16} />
            </button>
            <div className="text-[10.5px] text-white/45 text-center mt-2">
              {t ? t('profile.trial') || 'Essai gratuit 7 jours · Sans engagement' : 'Essai gratuit 7 jours · Sans engagement'}
            </div>
          </div>
        </div>
      </div>

      {/* Innovations toggles */}
      <div className="px-5 mt-5">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 mb-2 px-1 font-display">
          Innovations sécurité
        </div>
        <div className="glass rounded-2xl p-1" style={{ borderColor: 'var(--stroke)' }}>
          <ToggleRow
            icon={IMic}
            label="Auto-enregistrement audio"
            sub="Démarre dès qu'un SOS est déclenché"
            on={innovations.autoRecord}
            onChange={(v) => updateInnov('autoRecord', v)}
            color="red"
          />
          <ToggleRow
            icon={ILightning}
            label="Alerte batterie faible"
            sub="Prévient vos contacts si batterie < 15 %"
            on={innovations.batteryLowAlert}
            onChange={(v) => updateInnov('batteryLowAlert', v)}
            color="amber"
          />
          <ToggleRow
            icon={IClock}
            label="Auto-arrivée sécurisée"
            sub="Alerte si vous n'arrivez pas à temps"
            on={innovations.safeArrival}
            onChange={(v) => updateInnov('safeArrival', v)}
            color="green"
            isLast
          />
        </div>
      </div>

      {/* Settings condensed */}
      <div className="px-5 mt-5">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 mb-2 px-1 font-display">
          {t ? t('profile.settings') || 'Réglages' : 'Réglages'}
        </div>
        <div className="flex flex-col gap-2">
          <SettingRow
            icon={IGlobe}
            label={t ? t('profile.language') || 'Langue' : 'Langue'}
            value={language === 'fr' ? 'Français' : 'English'}
            onClick={() => setLanguage && setLanguage(language === 'fr' ? 'en' : 'fr')}
            color="blue"
          />
          <SettingRow
            icon={isDark ? IMoon : ISun}
            label={t ? t('profile.theme') || 'Thème' : 'Thème'}
            value={isDark ? (t ? t('profile.darkMode') || 'Sombre' : 'Sombre') : (t ? t('profile.lightMode') || 'Clair' : 'Clair')}
            onClick={() => setTheme && setTheme(isDark ? 'light' : 'dark')}
            color="gold"
          />
          <SettingRow
            icon={IHistory}
            label={t ? t('profile.alertHistory') || 'Historique des alertes' : 'Historique des alertes'}
            value={`${alertHistory?.alerts?.length || 0} ${t ? t('profile.entries') || 'entrées' : 'entrées'}`}
            onClick={onAlertHistory}
            color="blue"
          />
          <SettingRow
            icon={IHeart}
            label={t ? t('profile.donate') || 'Soutenir le projet' : 'Soutenir le projet'}
            value={t ? t('profile.donateDesc') || 'Aidez-nous à protéger plus de personnes' : 'Aidez-nous à protéger plus de personnes'}
            onClick={onDonate}
            color="red"
          />
          <SettingRow
            icon={IShare}
            label={t ? t('profile.shareApp') || "Partager l'application" : "Partager l'application"}
            onClick={shareApp}
            color="blue"
          />
          <SettingRow
            icon={ILock}
            label={t ? t('profile.privacy') || 'Vie privée & sécurité' : 'Vie privée & sécurité'}
            value={t ? t('profile.privacyDesc') || 'Données stockées localement' : 'Données stockées localement'}
            color="green"
          />
          <SettingRow
            icon={IInfo}
            label={t ? t('profile.about') || 'À propos' : 'À propos'}
            value="SOS Africa v2.1.0"
            color="blue"
          />
        </div>
      </div>

      {/* Child tracker preview modal */}
      {showChildTracker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowChildTracker(false)}
          />
          <div className="relative w-full max-w-md glass-strong rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IFamily size={18} className="text-[color:var(--blue)]" />
                <div className="text-[16px] font-extrabold text-white font-display">
                  Suivi enfant · Mode famille
                </div>
              </div>
              <button
                onClick={() => setShowChildTracker(false)}
                className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
                style={{ borderColor: 'var(--stroke)' }}
              >
                <ICrown size={14} className="text-[color:var(--gold)]" />
              </button>
            </div>

            <p className="text-[12px] text-white/65 mb-3">
              Reliez les téléphones de vos enfants pour voir leur position en direct, recevoir une alerte s'ils s'éloignent d'une zone définie ou s'ils restent immobiles trop longtemps dans un endroit isolé.
            </p>

            <div className="space-y-2 mb-4">
              {[
                { name: 'Aïcha (10 ans)', place: 'École Saint-Joseph, Yaoundé', status: 'En sécurité', color: 'var(--green)', icon: '👧' },
                { name: 'Théo (14 ans)', place: 'Quartier Bastos · zone surveillée', status: 'Hors zone', color: 'var(--amber)', icon: '👦' },
              ].map((child, i) => (
                <div key={i} className="glass rounded-2xl p-3 flex items-center gap-3"
                     style={{ borderColor: 'var(--stroke)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
                       style={{
                         background: `linear-gradient(135deg, ${child.color}, #1a1a1a)`,
                       }}>
                    {child.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold text-white truncate">{child.name}</div>
                    <div className="text-[11px] text-white/55 truncate">
                      <IPin size={10} className="inline mr-0.5" />
                      {child.place}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            color: child.color,
                            background: `color-mix(in oklab, ${child.color} 14%, transparent)`,
                            border: `1px solid color-mix(in oklab, ${child.color} 35%, transparent)`,
                          }}>
                      {child.status}
                    </span>
                    <button className="tap w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: 'rgba(61,139,255,.14)',
                              color: 'var(--blue)',
                              border: '1px solid rgba(61,139,255,.35)',
                            }}
                            aria-label="Envoyer un signal">
                      <ISend size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-3 mb-3" style={{ borderColor: 'var(--stroke)' }}>
              <div className="text-[12px] font-bold text-white mb-1">Push « ça va ? »</div>
              <div className="text-[11px] text-white/60 mb-2">
                Envoyez un signal à votre enfant : il reçoit une notification et doit confirmer qu'il va bien. Sans réponse en 5 min, ses contacts d'urgence sont alertés.
              </div>
              <button className="tap btn-primary-gold w-full py-2.5 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-1.5">
                <ISend size={14} /> Envoyer maintenant
              </button>
            </div>

            <button
              onClick={onUpgrade}
              className="tap btn-primary-gold w-full py-3 rounded-xl text-[13.5px] font-extrabold flex items-center justify-center gap-2 font-display"
            >
              <ICrown size={15} /> Activer Premium pour suivre vos enfants
            </button>
            <div className="text-[10.5px] text-white/45 text-center mt-2">
              Données fictives · Premium requis pour la connexion réelle
            </div>
          </div>
        </div>
      )}

      {/* Code-word SOS modal */}
      {showCodeWord && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowCodeWord(false)}
          />
          <div className="relative w-full max-w-md glass-strong rounded-t-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ILock size={18} className="text-[color:var(--red)]" />
                <div className="text-[16px] font-extrabold text-white font-display">
                  Mot de code SOS
                </div>
              </div>
              <button
                onClick={() => setShowCodeWord(false)}
                className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
                style={{ borderColor: 'var(--stroke)' }}
              >
                <ICheck size={14} stroke={3} className="text-[color:var(--green)]" />
              </button>
            </div>
            <p className="text-[12.5px] text-white/65 mb-3">
              Choisissez un mot que vous pouvez taper ou prononcer discrètement n'importe où dans l'app pour déclencher une alerte SOS silencieuse vers vos contacts.
            </p>
            <input
              value={codeWord}
              onChange={(e) => saveCodeWord(e.target.value)}
              placeholder="Ex: ananas"
              className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40 mb-3"
              style={{ borderColor: 'var(--stroke)' }}
              maxLength={32}
            />
            <div className="text-[11px] text-white/55 mb-3">
              Astuce : choisissez un mot inhabituel mais facile à mémoriser. Il ne sera jamais affiché dans les notifications.
            </div>
            <button
              onClick={() => setShowCodeWord(false)}
              className="tap btn-primary-red w-full py-3 rounded-xl text-[13.5px] font-bold"
            >
              {codeWord ? 'Enregistré' : 'Plus tard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
