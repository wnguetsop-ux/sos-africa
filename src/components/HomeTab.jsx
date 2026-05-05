import React, { useState } from 'react';
import {
  IShieldCheck,
  IPin,
  IBrain,
  IUser,
  IFamily,
  IWifi,
  IWifiOff,
  IMask,
  ILightning,
} from './ui/icons';
import { StatusRow, SectionTitle } from './ui/atoms';
import { useReverseGeocode } from '../hooks/useReverseGeocode';

const SOSButton = ({ onClick, t }) => {
  const [pressed, setPressed] = useState(false);
  const press = () => setPressed(true);
  const release = () => setPressed(false);

  return (
    <div
      className="relative flex items-center justify-center my-2"
      style={{ height: 280 }}
    >
      {/* Static concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full"
          style={{
            width: 240,
            height: 240,
            border: '1px solid rgba(255,46,63,.18)',
          }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full"
          style={{
            width: 200,
            height: 200,
            border: '1px solid rgba(255,46,63,.22)',
          }}
        />
      </div>

      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: '50%',
            border: '2px solid rgba(255,46,63,.55)',
            animation: 'pulse-ring 2.4s ease-out infinite',
          }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: '50%',
            border: '2px solid rgba(255,46,63,.45)',
            animation: 'pulse-ring 2.4s ease-out 1.2s infinite',
          }}
        />
      </div>

      {/* Tick marks */}
      <svg
        className="absolute"
        width="280"
        height="280"
        viewBox="0 0 280 280"
        aria-hidden
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x1 = 140 + Math.cos(a) * 128;
          const y1 = 140 + Math.sin(a) * 128;
          const x2 = 140 + Math.cos(a) * 134;
          const y2 = 140 + Math.sin(a) * 134;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,46,63,.35)"
              strokeWidth="1.2"
            />
          );
        })}
      </svg>

      {/* Inner button */}
      <button
        onMouseDown={press}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={press}
        onTouchEnd={release}
        onClick={onClick}
        className="tap relative rounded-full flex flex-col items-center justify-center select-none"
        style={{
          width: pressed ? 178 : 168,
          height: pressed ? 178 : 168,
          background:
            'radial-gradient(circle at 50% 30%, #FF6E7B 0%, #E8202F 35%, #8C0A14 100%)',
          border: '2px solid rgba(255,255,255,.18)',
          animation: pressed
            ? 'pulse-glow 1.1s ease-in-out infinite'
            : 'pulse-glow 2.4s ease-in-out infinite',
          transition: 'width .2s, height .2s',
        }}
      >
        <div
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,.3), inset 0 -20px 30px rgba(0,0,0,.4)',
          }}
        />
        <div
          className="text-white font-extrabold leading-none font-display"
          style={{
            fontSize: 42,
            letterSpacing: '.04em',
            textShadow: '0 2px 12px rgba(0,0,0,.5)',
          }}
        >
          {t ? t('home.sosButton') : 'SOS'}
        </div>
        <div
          className="text-white/95 text-[11px] font-semibold mt-1.5 px-3 text-center leading-tight"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,.5)' }}
        >
          {t ? t('home.pressInDanger') : "Appuyer en cas\nd'urgence"}
        </div>
      </button>
    </div>
  );
};

const QuickAction = ({ icon: Icn, title, sub, color = 'blue', halo = 'blue', onClick }) => {
  const c =
    color === 'blue'
      ? 'var(--blue)'
      : color === 'purple'
      ? 'var(--purple)'
      : color === 'amber'
      ? 'var(--amber)'
      : 'var(--green)';
  return (
    <button
      onClick={onClick}
      className={`tap relative glass rounded-2xl p-3 text-left flex flex-col gap-1.5 halo-${halo}`}
      style={{ borderColor: 'var(--stroke)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: `color-mix(in oklab, ${c} 16%, transparent)`,
          color: c,
          border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
          boxShadow: `0 0 18px color-mix(in oklab, ${c} 30%, transparent)`,
        }}
      >
        <Icn size={20} />
      </div>
      <div className="text-[12.5px] font-bold text-white leading-tight">{title}</div>
      <div className="text-[10.5px] font-semibold" style={{ color: c }}>
        {sub}
      </div>
    </button>
  );
};

const HomeTab = ({
  location,
  contacts,
  isOnline,
  shakeEnabled,
  setShakeEnabled,
  onTriggerSOS,
  onTriggerSilent,
  onNav,
  userName,
  journeyActive,
  recordingActive,
  t,
}) => {
  const { info: geoInfo } = useReverseGeocode(location);
  const placeShort =
    geoInfo?.neighbourhood ||
    geoInfo?.city ||
    (location ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : '');
  const placeFull =
    geoInfo?.city && geoInfo?.country
      ? `${geoInfo.city}, ${geoInfo.country}`
      : geoInfo?.line || placeShort;

  return (
    <div className="screen-in flex flex-col px-0 pb-32">
      <div className="px-5 pb-2">
        <div
          className="text-[22px] font-extrabold text-white leading-tight font-display"
          style={{ letterSpacing: '-.01em' }}
        >
          {`Salut, ${userName || ''}`}
        </div>
        <div className="flex items-center gap-1.5 text-[12.5px] text-white/65">
          {t ? t('home.protectedStatus') : 'Vous êtes protégé'}
          <IShieldCheck size={14} className="text-[color:var(--green)]" />
        </div>
        {placeShort && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-white/55">
            <IPin size={12} className="text-[color:var(--blue)]" />
            <span className="truncate">{placeFull || placeShort}</span>
          </div>
        )}
      </div>

      {(journeyActive || recordingActive) && (
        <div className="px-5 mb-1 flex gap-2 justify-center flex-wrap">
          {journeyActive && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                  style={{ color: 'var(--green)', background: 'rgba(34,214,123,.12)', border: '1px solid rgba(34,214,123,.35)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
              {t ? t('home.journeyInProgress') : 'Trajet en cours'}
            </span>
          )}
          {recordingActive && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                  style={{ color: 'var(--red-soft)', background: 'rgba(255,46,63,.12)', border: '1px solid rgba(255,46,63,.35)', animation: 'blink 1.4s infinite' }}>
              ● REC
            </span>
          )}
        </div>
      )}

      <SOSButton onClick={onTriggerSOS} t={t} />

      <div className="px-5 -mt-1 mb-3 flex justify-center gap-2">
        <button
          onClick={onTriggerSilent}
          className="tap glass rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold flex items-center gap-1.5 halo-red"
          style={{ borderColor: 'rgba(255,46,63,.4)', color: '#FF7884' }}
        >
          <IMask size={13} /> {t ? t('home.silentSOS') || 'SOS silencieux' : 'SOS silencieux'}
        </button>
        <button
          onClick={() => setShakeEnabled(!shakeEnabled)}
          className="tap glass rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold flex items-center gap-1.5 halo-gold"
          style={{
            borderColor: shakeEnabled ? 'rgba(244,194,75,.5)' : 'var(--stroke)',
            color: shakeEnabled ? 'var(--gold)' : 'rgba(255,255,255,.55)',
          }}
        >
          <ILightning size={13} />
          {shakeEnabled
            ? t ? t('home.shakeOn') || 'Secousse ON' : 'Secousse ON'
            : t ? t('home.shakeOff') || 'Secousse OFF' : 'Secousse OFF'}
        </button>
      </div>

      <div className="px-5 mb-3">
        <SectionTitle>{t ? t('home.quickActions') || 'Actions rapides' : 'Actions rapides'}</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5">
          <QuickAction
            icon={IPin}
            title={t ? t('home.shareLocation') || 'Partager position' : 'Partager position'}
            sub={t ? t('home.realtime') || 'En temps réel' : 'En temps réel'}
            color="blue"
            halo="blue"
            onClick={() => onNav && onNav('map')}
          />
          <QuickAction
            icon={IBrain}
            title={t ? t('home.aiAssistant') || 'Assistant IA' : 'Assistant IA'}
            sub={t ? t('home.smartHelp') || 'Aide intelligente' : 'Aide intelligente'}
            color="purple"
            halo="purple"
            onClick={() => onNav && onNav('tools')}
          />
          <QuickAction
            icon={IUser}
            title={t ? t('home.followed') || 'Je me sens suivi' : 'Je me sens suivi'}
            sub={t ? t('home.discreetAlert') || 'Alerte discrète' : 'Alerte discrète'}
            color="amber"
            halo="gold"
            onClick={onTriggerSilent}
          />
        </div>
      </div>

      <div className="px-5">
        <div className="glass rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[13px] font-bold text-white/90 font-display">
              {t ? t('home.systemStatus') || 'Statut du système' : 'Statut du système'}
            </div>
            <div
              className="text-[10.5px] font-semibold flex items-center gap-1"
              style={{ color: 'var(--green)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }}
              />
              {t ? t('home.allActive') || 'Tout est actif' : 'Tout est actif'}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <StatusRow
              icon={IPin}
              label={t ? t('home.gpsPosition') : 'Position GPS'}
              value={
                location
                  ? placeShort || (t ? t('home.gpsActive') || 'Active' : 'Active')
                  : t ? t('home.searchingGps') || 'Recherche...' : 'Recherche...'
              }
              color={location ? 'green' : 'amber'}
            />
            <StatusRow
              icon={IFamily}
              label={t ? t('home.contactsLabel') || "Contacts d'urgence" : "Contacts d'urgence"}
              value={
                contacts.length > 0
                  ? `${contacts.length} ${t ? t('home.contactsReady') || 'prêts' : 'prêts'}`
                  : t ? t('home.contactsAddRequired') || 'À ajouter' : 'À ajouter'
              }
              color={contacts.length > 0 ? 'green' : 'red'}
            />
            <StatusRow
              icon={isOnline ? IWifi : IWifiOff}
              label={t ? t('home.connection') || 'Connexion' : 'Connexion'}
              value={
                isOnline
                  ? t ? t('home.online') || 'En ligne' : 'En ligne'
                  : t ? t('home.offline') || 'Hors ligne' : 'Hors ligne'
              }
              color={isOnline ? 'blue' : 'amber'}
            />
          </div>
        </div>
      </div>

      {contacts.length === 0 && (
        <div className="px-5 mt-3">
          <div
            className="rounded-2xl p-3.5 flex items-start gap-3"
            style={{
              background: 'rgba(255,176,32,.10)',
              border: '1px solid rgba(255,176,32,.35)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(255,176,32,.18)',
                color: 'var(--amber)',
                border: '1px solid rgba(255,176,32,.4)',
              }}
            >
              <IShieldCheck size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-white">
                {t ? t('home.configRequired') || 'Configuration requise' : 'Configuration requise'}
              </div>
              <div className="text-[12px] text-white/60">
                {t ? t('home.addContactsMessage') || "Ajoutez au moins un contact d'urgence." : "Ajoutez au moins un contact d'urgence."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
