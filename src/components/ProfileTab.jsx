import React, { useEffect, useState } from 'react';
import ActivationCodeSheet from './sheets/ActivationCodeSheet';
import ChildTrackerSheet from './sheets/ChildTrackerSheet';
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
  IPhone,
  IX,
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
  premiumStatus,
  pushNotifs,
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
  const [showActivation, setShowActivation] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushToast, setPushToast] = useState(null);
  const [showPhoneSetup, setShowPhoneSetup] = useState(false);
  const [phoneInput, setPhoneInput] = useState(
    () => userProfile?.profile?.phone || userProfile?.phone || ''
  );
  const currentPhone =
    userProfile?.profile?.phone || userProfile?.phone || '';
  const [codeWord, setCodeWord] = useState(
    () => localStorage.getItem('sos_code_word') || ''
  );
  const isPremium = premiumStatus?.isPremium || false;
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
              <div className="text-[14px] font-bold text-white leading-tight truncate flex items-center gap-1.5">
                {userName}
                {isPremium && (
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase tracking-wider"
                    style={{
                      background: 'linear-gradient(180deg,#FFD86A,#D9971C)',
                      color: '#241500',
                      boxShadow: '0 0 10px rgba(244,194,75,.5)',
                    }}
                  >
                    <ICrown size={9} /> Premium
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-white/55">
                {isPremium && premiumStatus?.until
                  ? `Premium · jusqu'au ${new Date(
                      premiumStatus.until
                    ).toLocaleDateString('fr-FR')}`
                  : 'Membre · Édition gratuite'}
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
            {isPremium ? (
              <div
                className="rounded-xl p-3 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,214,123,.16), rgba(34,214,123,.04))',
                  border: '1px solid rgba(34,214,123,.4)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(180deg,#5BF6A8,#14B873)',
                    boxShadow: '0 0 18px rgba(34,214,123,.5)',
                  }}
                >
                  <ICheck size={16} stroke={3} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-white">
                    Premium actif
                  </div>
                  <div className="text-[11px] text-white/60">
                    Plan {premiumStatus?.plan === 'family' ? 'Famille' : premiumStatus?.plan === 'yearly' ? 'Annuel' : 'Mensuel'} jusqu'au{' '}
                    {premiumStatus?.until ? new Date(premiumStatus.until).toLocaleDateString('fr-FR') : ''}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onUpgrade || onDonate}
                  className="tap btn-primary-gold w-full py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display"
                >
                  {t ? t('profile.upgradeCTA') || 'Passer à Premium' : 'Passer à Premium'}{' '}
                  <ICrown size={16} />
                </button>
                <button
                  onClick={() => setShowActivation(true)}
                  className="tap glass w-full mt-2 py-2.5 rounded-xl text-[12.5px] font-bold text-white/85 halo-gold"
                  style={{ borderColor: 'var(--stroke)' }}
                >
                  J'ai déjà un code d'activation
                </button>
                <div className="text-[10.5px] text-white/45 text-center mt-2">
                  Mobile Money Cameroun · Activation manuelle sous 24h
                </div>
              </>
            )}
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
          {/* Numero de telephone - critique pour recevoir les SOS des contacts */}
          <SettingRow
            icon={IPhone}
            label="Mon numéro de téléphone"
            value={
              currentPhone
                ? `${currentPhone} · touche pour modifier`
                : '⚠️ Requis pour recevoir les SOS — touche pour saisir'
            }
            onClick={() => {
              setPhoneInput(currentPhone);
              setShowPhoneSetup(true);
            }}
            color={currentPhone ? 'green' : 'amber'}
          />
          <SettingRow
            icon={IBell}
            label="Notifications push"
            value={
              pushBusy
                ? 'Activation en cours…'
                : !currentPhone
                ? '⚠️ Saisir d\'abord ton numéro ci-dessus'
                : pushNotifs?.permission === 'granted' && pushNotifs?.token
                ? '✅ Activées · prêt à recevoir les alertes'
                : pushNotifs?.permission === 'granted'
                ? '⚠️ Permission OK mais token manquant — touche pour réessayer'
                : pushNotifs?.permission === 'denied'
                ? '⚠️ Refusées dans le navigateur'
                : 'Touche pour activer'
            }
            onClick={async () => {
              if (pushBusy) return;
              if (!currentPhone) {
                setPushToast({
                  type: 'error',
                  text: 'Saisis d\'abord ton numéro de téléphone (ligne au-dessus).',
                });
                setTimeout(() => setPushToast(null), 5000);
                return;
              }
              setPushBusy(true);
              setPushToast({ type: 'info', text: 'Activation…' });
              try {
                const t = await pushNotifs?.requestPermission?.();
                if (t) {
                  setPushToast({
                    type: 'success',
                    text: '✅ Notifications activées avec le numéro ' + currentPhone,
                  });
                } else if (pushNotifs?.error) {
                  setPushToast({ type: 'error', text: pushNotifs.error });
                } else if (pushNotifs?.permission === 'denied') {
                  setPushToast({
                    type: 'error',
                    text: 'Notifications refusées. Va dans les paramètres du navigateur.',
                  });
                } else {
                  setPushToast({
                    type: 'error',
                    text:
                      "Échec. Sur iPhone : ajoute l'app à l'écran d'accueil d'abord.",
                  });
                }
              } catch (err) {
                setPushToast({
                  type: 'error',
                  text: err?.message || 'Erreur',
                });
              } finally {
                setPushBusy(false);
                setTimeout(() => setPushToast(null), 5000);
              }
            }}
            color={
              !currentPhone
                ? 'amber'
                : pushNotifs?.permission === 'granted' && pushNotifs?.token
                ? 'green'
                : 'gold'
            }
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
      {/* Phone setup modal */}
      {showPhoneSetup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowPhoneSetup(false)}
          />
          <div className="relative w-full max-w-md glass-strong rounded-t-3xl sm:rounded-3xl p-5 sm:m-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IPhone size={18} className="text-[color:var(--blue)]" />
                <div className="text-[16px] font-extrabold text-white font-display">
                  Mon numéro de téléphone
                </div>
              </div>
              <button
                onClick={() => setShowPhoneSetup(false)}
                className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
                style={{ borderColor: 'var(--stroke)' }}
              >
                <IX size={16} />
              </button>
            </div>
            <p className="text-[12px] text-white/65 mb-3 leading-snug">
              Ce numéro est utilisé pour <b>recevoir les alertes SOS</b> que tes proches t'envoient depuis leur app. Sans ce numéro, ils ne pourront pas te joindre automatiquement.
            </p>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+237 6XX XX XX XX"
              autoFocus
              className="w-full px-3 py-3 rounded-xl glass text-[16px] font-mono text-white placeholder-white/40 mb-3"
              style={{ borderColor: 'var(--stroke)' }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowPhoneSetup(false)}
                className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/85"
                style={{ borderColor: 'var(--stroke)' }}
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const cleaned = phoneInput.trim();
                  if (!cleaned || cleaned.replace(/\D/g, '').length < 8) {
                    setPushToast({ type: 'error', text: 'Numéro invalide' });
                    setTimeout(() => setPushToast(null), 3000);
                    return;
                  }
                  // Save phone in userProfile
                  if (userProfile?.saveProfile) {
                    await userProfile.saveProfile({ phone: cleaned });
                  } else if (userProfile?.updateProfile) {
                    await userProfile.updateProfile({ phone: cleaned });
                  }
                  setShowPhoneSetup(false);
                  setPushToast({
                    type: 'success',
                    text: 'Numéro enregistré. Active maintenant les notifications push.',
                  });
                  setTimeout(() => setPushToast(null), 5000);
                }}
                className="tap btn-primary-green flex-1 py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5"
              >
                <ICheck size={14} stroke={3} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast push */}
      {pushToast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 px-4 py-3 rounded-2xl glass-strong text-[12.5px] font-bold text-white max-w-[340px] text-center"
          style={{
            borderColor:
              pushToast.type === 'error'
                ? 'rgba(255,46,63,.5)'
                : pushToast.type === 'success'
                ? 'rgba(34,214,123,.5)'
                : 'rgba(61,139,255,.5)',
            boxShadow: '0 12px 40px rgba(0,0,0,.4)',
          }}
        >
          {pushToast.text}
        </div>
      )}

      {showChildTracker && (
        <ChildTrackerSheet
          userProfile={userProfile}
          isPremium={isPremium}
          onUpgrade={() => {
            setShowChildTracker(false);
            setTimeout(() => onUpgrade && onUpgrade(), 100);
          }}
          onClose={() => setShowChildTracker(false)}
        />
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

      {/* Activation Premium par code */}
      {showActivation && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowActivation(false)}
          />
          <div
            className="relative w-full max-w-md glass-strong rounded-t-3xl p-5"
            style={{ borderBottom: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ICrown size={18} className="text-[color:var(--gold)]" />
                <div className="text-[16px] font-extrabold text-grad-gold font-display">
                  Activer Premium
                </div>
              </div>
              <button
                onClick={() => setShowActivation(false)}
                className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
                style={{ borderColor: 'var(--stroke)' }}
              >
                <IX size={16} />
              </button>
            </div>
            <ActivationCodeSheet
              activateCode={premiumStatus?.activateCode}
              onClose={() => setShowActivation(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
