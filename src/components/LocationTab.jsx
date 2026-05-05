import React, { useState } from 'react';
import {
  ISearch,
  IX,
  IAlert,
  IBell,
  ICar,
  IRoute,
  ILayers,
  IPin,
  IRefresh,
  IArrowRight,
  IShare,
  IWhatsapp,
  IMessage,
  ICopy,
} from './ui/icons';
import { Tag } from './ui/atoms';
import LeafletMap from './ui/LeafletMap';
import { useReverseGeocode } from '../hooks/useReverseGeocode';

const LayerRow = ({ icon: Icn, color, label, defOn = false, onChange }) => {
  const [on, setOn] = useState(defOn);
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
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: `color-mix(in oklab, ${c} 14%, transparent)`,
            color: c,
            border: `1px solid color-mix(in oklab, ${c} 32%, transparent)`,
          }}
        >
          <Icn size={14} />
        </div>
        <div className="text-[13px] text-white/85">{label}</div>
      </div>
      <button
        onClick={() => {
          const next = !on;
          setOn(next);
          onChange && onChange(next);
        }}
        className={`switch ${cls} ${on ? 'on' : ''}`}
        aria-label={label}
      />
    </div>
  );
};

const LocationTab = ({ location, gpsLoading, refreshGPS, contacts, sendSMS, t }) => {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const lat = location?.lat;
  const lng = location?.lng;
  const accuracy = location?.accuracy ? Math.round(location.accuracy) : null;
  const { info, loading: geoLoading } = useReverseGeocode(location);

  const placeLine =
    info?.line ||
    (info?.neighbourhood
      ? `${info.neighbourhood}${info.city ? ', ' + info.city : ''}`
      : info?.city
      ? `${info.city}${info.country ? ', ' + info.country : ''}`
      : lat && lng
      ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      : '');

  const placeTitle = info?.neighbourhood || info?.city || '';
  const placeSub = [info?.city, info?.country].filter(Boolean).join(', ');

  const mapsLink =
    lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;
  const directionsLink =
    lat && lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : '#';

  const handleCopy = async () => {
    if (!mapsLink) return;
    try {
      await navigator.clipboard.writeText(`📍 Ma position SOS Africa : ${mapsLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleSMSAll = () => {
    if (!sendSMS || !contacts || contacts.length === 0 || !mapsLink) return;
    sendSMS(contacts, `📍 SOS Africa — Ma position : ${mapsLink}`);
  };

  const handleWhatsApp = () => {
    if (!mapsLink) return;
    const text = encodeURIComponent(`📍 SOS Africa — Ma position : ${mapsLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="screen-in pb-32">
      {/* Search / current address */}
      <div className="px-5 pb-3">
        <div
          className="glass rounded-2xl flex items-center gap-2 px-3.5 py-2.5"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <ISearch size={16} className="text-white/55" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-[13.5px] text-white placeholder-white/40 w-full"
            placeholder={
              placeLine ||
              (t ? t('location.searchPlaceholder') || 'Rechercher un lieu' : 'Rechercher un lieu')
            }
          />
          {search && (
            <button onClick={() => setSearch('')} className="tap text-white/45">
              <IX size={14} />
            </button>
          )}
        </div>

        {(placeTitle || placeSub) && (
          <div className="mt-2 flex items-center gap-2 px-1">
            <IPin size={13} className="text-[color:var(--blue)]" />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-bold text-white truncate">
                {placeTitle || (geoLoading ? 'Recherche…' : '—')}
              </div>
              {placeSub && (
                <div className="text-[10.5px] text-white/55 truncate">{placeSub}</div>
              )}
            </div>
            {accuracy && (
              <div
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{
                  color: 'var(--green)',
                  background: 'rgba(34,214,123,.10)',
                  border: '1px solid rgba(34,214,123,.30)',
                }}
              >
                ±{accuracy}m
              </div>
            )}
          </div>
        )}
      </div>

      {/* Real interactive map */}
      <div
        className="mx-5 rounded-2xl relative overflow-hidden glass"
        style={{ height: 380, borderColor: 'var(--stroke)' }}
      >
        <LeafletMap lat={lat} lng={lng} height={380} className="w-full h-full" />
        {gpsLoading && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1.5 glass z-[1000]"
            style={{ color: 'var(--amber)', borderColor: 'rgba(255,176,32,.35)' }}
          >
            <IRefresh size={11} className="animate-spin" />
            {t ? t('location.searching') || 'Recherche GPS…' : 'Recherche GPS…'}
          </div>
        )}
        <button
          onClick={refreshGPS}
          className="tap absolute right-3 bottom-3 w-10 h-10 rounded-full glass flex items-center justify-center text-white halo-blue z-[1000]"
          style={{ borderColor: 'rgba(255,255,255,.12)' }}
          aria-label="Recentrer"
          disabled={gpsLoading}
        >
          <IRefresh size={18} className={gpsLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Share location */}
      <div className="px-5 mt-3">
        <div className="glass rounded-2xl p-3.5" style={{ borderColor: 'var(--stroke)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(61,139,255,.15)',
                  color: 'var(--blue)',
                  border: '1px solid rgba(61,139,255,.35)',
                }}
              >
                <IShare size={14} />
              </div>
              <div className="text-[13px] font-bold text-white">
                {t ? t('contacts.shareLocation') || 'Partager ma position' : 'Partager ma position'}
              </div>
            </div>
            <Tag color="blue">Live</Tag>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSMSAll}
              disabled={!mapsLink || !contacts?.length}
              className="tap glass rounded-xl py-2 text-[11.5px] font-bold flex items-center justify-center gap-1.5 halo-green text-white/85 disabled:opacity-50"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <IMessage size={13} /> SMS
            </button>
            <button
              onClick={handleWhatsApp}
              disabled={!mapsLink}
              className="tap glass rounded-xl py-2 text-[11.5px] font-bold flex items-center justify-center gap-1.5 halo-green text-white/85 disabled:opacity-50"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <IWhatsapp size={13} className="text-[color:var(--green)]" /> WhatsApp
            </button>
            <button
              onClick={handleCopy}
              disabled={!mapsLink}
              className="tap glass rounded-xl py-2 text-[11.5px] font-bold flex items-center justify-center gap-1.5 halo-blue text-white/85 disabled:opacity-50"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <ICopy size={13} /> {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
        </div>
      </div>

      {/* Secure route */}
      <div className="px-5 mt-3">
        <div className="glass rounded-2xl p-3.5 ring-green relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(34,214,123,.16)',
                  color: 'var(--green)',
                  border: '1px solid rgba(34,214,123,.4)',
                }}
              >
                <IRoute size={15} />
              </div>
              <div className="text-[13.5px] font-bold text-white">
                {t ? t('location.secureRoute') || 'Itinéraire sécurisé' : 'Itinéraire sécurisé'}
              </div>
            </div>
            <Tag color="green">
              {t ? t('location.recommended') || 'Recommandé' : 'Recommandé'}
            </Tag>
          </div>
          <div className="text-[12px] text-white/60 mb-3">
            {t
              ? t('location.routeDesc') ||
                'Ouvre Google Maps avec votre destination pour le trajet le plus sûr.'
              : 'Ouvre Google Maps avec votre destination pour le trajet le plus sûr.'}
          </div>
          <a
            href={directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="tap btn-primary-green w-full py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2"
          >
            {t ? t('location.openRoute') || "Voir l'itinéraire" : "Voir l'itinéraire"}{' '}
            <IArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Layers */}
      <div className="px-5 mt-3">
        <div className="glass rounded-2xl p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <ILayers size={15} className="text-white/70" />
            <div className="text-[13px] font-bold text-white/90">
              {t ? t('location.layers') || 'Couches de la carte' : 'Couches de la carte'}
            </div>
          </div>
          <LayerRow icon={IAlert} color="red" label={t ? t('location.riskZones') || 'Zones à risque' : 'Zones à risque'} defOn />
          <LayerRow icon={IAlert} color="amber" label={t ? t('location.cautionZones') || 'Zones de vigilance' : 'Zones de vigilance'} defOn />
          <LayerRow icon={IRoute} color="green" label={t ? t('location.secureRoutes') || 'Itinéraires sécurisés' : 'Itinéraires sécurisés'} defOn />
          <LayerRow icon={IBell} color="red" label={t ? t('location.liveAlerts') || 'Alertes en direct' : 'Alertes en direct'} defOn />
          <LayerRow icon={ICar} color="blue" label={t ? t('location.traffic') || 'Trafic en temps réel' : 'Trafic en temps réel'} />
        </div>
      </div>

      {/* Coords */}
      {lat !== undefined && lng !== undefined && (
        <div className="px-5 mt-3">
          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-bold text-white/90">
                {t ? t('location.coords') || 'Coordonnées GPS' : 'Coordonnées GPS'}
              </div>
              <button
                onClick={refreshGPS}
                className="tap w-8 h-8 rounded-lg glass flex items-center justify-center text-white/70 halo-blue"
                style={{ borderColor: 'var(--stroke)' }}
                disabled={gpsLoading}
              >
                <IRefresh size={14} className={gpsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--stroke)' }}
              >
                <div className="text-[10.5px] text-white/55 mb-1 uppercase tracking-wider font-bold">
                  Latitude
                </div>
                <div className="text-[16px] font-mono font-bold text-white">{lat.toFixed(6)}</div>
              </div>
              <div
                className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--stroke)' }}
              >
                <div className="text-[10.5px] text-white/55 mb-1 uppercase tracking-wider font-bold">
                  Longitude
                </div>
                <div className="text-[16px] font-mono font-bold text-white">{lng.toFixed(6)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTab;
