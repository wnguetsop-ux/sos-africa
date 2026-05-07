import React, { useState } from 'react';
import {
  IPin,
  IPlus,
  IX,
  ICheck,
  ITrash,
  IInfo,
  IBell,
  IFamily,
} from '../ui/icons';
import LeafletMap from '../ui/LeafletMap';
import { useGeofences } from '../../hooks/useGeofences';

const COLORS = ['#3D8BFF', '#22D67B', '#FFB020', '#A06BFF', '#FF2E3F', '#3BE89A'];
const RADIUS_PRESETS = [50, 100, 200, 500, 1000];
const NOTIFY_OPTIONS = [
  { id: 'enter', label: 'Entrée', emoji: '📍' },
  { id: 'exit', label: 'Sortie', emoji: '🚪' },
  { id: 'both', label: 'Les deux', emoji: '🔔' },
];

const fmtDistance = (m) => {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
};

const GeofencesSheet = ({
  familyId,
  location,
  userProfile,
  notifPermission,
  onRequestNotifPermission,
}) => {
  const userId =
    userProfile?.firstName ||
    userProfile?.getFullName?.() ||
    'anonyme';
  const userName = userProfile?.getFullName?.() || userProfile?.firstName || 'Moi';

  const {
    geofences,
    addGeofence,
    deleteGeofence,
    insideMap,
  } = useGeofences({
    familyId,
    location,
    userId,
    userName,
    enabled: true,
  });

  const [showAdd, setShowAdd] = useState(false);
  const [pickerCenter, setPickerCenter] = useState(null); // {lat, lng} where user tapped
  const [name, setName] = useState('');
  const [radius, setRadius] = useState(100);
  const [color, setColor] = useState(COLORS[0]);
  const [notifyOn, setNotifyOn] = useState('both');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const startAddAtCenter = () => {
    if (!location?.lat) {
      setError('Position GPS requise — active la localisation.');
      return;
    }
    setPickerCenter({ lat: location.lat, lng: location.lng });
    setName('');
    setRadius(100);
    setColor(COLORS[0]);
    setNotifyOn('both');
    setShowAdd(true);
    setError(null);
  };

  const onMapTap = (latlng) => {
    if (showAdd) {
      // Move the picker pin to where the user tapped
      setPickerCenter(latlng);
    }
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setPickerCenter(null);
    setName('');
    setError(null);
  };

  const submit = async () => {
    if (!pickerCenter || !name.trim()) {
      setError('Nom et position requis');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addGeofence({
        name: name.trim(),
        lat: pickerCenter.lat,
        lng: pickerCenter.lng,
        radius,
        color,
        notifyOn,
      });
      cancelAdd();
    } catch (err) {
      console.error(err);
      setError(
        err.code === 'permission-denied'
          ? 'Permission Firestore refusée'
          : 'Erreur, vérifie ta connexion'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // No family yet
  if (!familyId) {
    return (
      <div className="space-y-3">
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(61,139,255,.16), rgba(61,139,255,.04))',
            border: '1px solid rgba(61,139,255,.4)',
          }}
        >
          <IFamily size={28} className="text-[color:var(--blue)] mx-auto mb-2" />
          <div className="text-[14px] font-extrabold text-white font-display mb-1">
            Crée d'abord ta famille
          </div>
          <div className="text-[12px] text-white/65 leading-snug">
            Les zones de confiance sont partagées entre les membres de ton cercle famille. Va dans Outils → Mode famille pour créer ou rejoindre un cercle.
          </div>
        </div>
      </div>
    );
  }

  // Geofences for the map (during creation, also include the pending picker)
  const mapGeofences = showAdd && pickerCenter
    ? [
        ...geofences,
        {
          id: '__pending__',
          name: name || 'Nouvelle zone',
          lat: pickerCenter.lat,
          lng: pickerCenter.lng,
          radius,
          color,
        },
      ]
    : geofences;

  return (
    <div className="space-y-3">
      {/* Notification permission banner */}
      {notifPermission === 'default' && (
        <button
          onClick={onRequestNotifPermission}
          className="w-full rounded-xl p-3 flex items-center gap-2 text-left tap"
          style={{
            background: 'linear-gradient(135deg, rgba(244,194,75,.16), rgba(244,194,75,.04))',
            border: '1px solid rgba(244,194,75,.4)',
          }}
        >
          <IBell size={16} className="text-[color:var(--gold)] shrink-0" />
          <div className="flex-1 text-[12px] text-white/85 leading-snug">
            <span className="font-bold text-white">Active les notifications</span>
            {' '}pour recevoir les alertes d'entrée/sortie de zone.
          </div>
          <span className="text-[11px] font-bold text-[color:var(--gold)] shrink-0">
            Activer
          </span>
        </button>
      )}

      {/* Map */}
      <div
        className="rounded-2xl relative overflow-hidden glass"
        style={{
          height: showAdd ? 320 : 260,
          borderColor: 'var(--stroke)',
          transition: 'height .25s ease',
        }}
      >
        <LeafletMap
          lat={location?.lat}
          lng={location?.lng}
          height={showAdd ? 320 : 260}
          className="w-full h-full"
          geofences={mapGeofences}
          onMapClick={onMapTap}
        />
        {showAdd && (
          <div
            className="absolute top-3 left-3 right-3 px-3 py-2 rounded-lg glass-strong text-[11.5px] text-white/85 z-[1000]"
            style={{ borderColor: 'rgba(61,139,255,.4)' }}
          >
            👆 <b>Touche la carte</b> pour déplacer le centre, puis ajuste le rayon ci-dessous.
          </div>
        )}
      </div>

      {/* Add form (visible during creation) */}
      {showAdd && pickerCenter && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background:
              'linear-gradient(135deg, rgba(61,139,255,.16), rgba(61,139,255,.04))',
            border: '1px solid rgba(61,139,255,.4)',
          }}
        >
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
              Nom de la zone
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: École, Maison, Bureau"
              maxLength={40}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg glass text-[14px] text-white placeholder-white/40"
              style={{ borderColor: 'var(--stroke)' }}
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
              Rayon : <span className="text-white">{radius} m</span>
            </label>
            <input
              type="range"
              min={20}
              max={2000}
              step={10}
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="flex gap-1.5 mt-2">
              {RADIUS_PRESETS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className="tap flex-1 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{
                    color: radius === r ? '#fff' : 'rgba(255,255,255,.6)',
                    background: radius === r ? 'rgba(61,139,255,.25)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${radius === r ? 'rgba(61,139,255,.5)' : 'var(--stroke)'}`,
                  }}
                >
                  {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
              Couleur
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="tap w-8 h-8 rounded-full"
                  style={{
                    background: c,
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: color === c ? `0 0 12px ${c}` : 'none',
                  }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
              Notifier sur
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {NOTIFY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setNotifyOn(opt.id)}
                  className="tap rounded-lg p-2 flex flex-col items-center gap-0.5"
                  style={{
                    background:
                      notifyOn === opt.id ? 'rgba(61,139,255,.20)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${
                      notifyOn === opt.id ? 'rgba(61,139,255,.5)' : 'var(--stroke)'
                    }`,
                  }}
                >
                  <span className="text-[16px]">{opt.emoji}</span>
                  <span
                    className="text-[10.5px] font-bold"
                    style={{
                      color: notifyOn === opt.id ? '#fff' : 'rgba(255,255,255,.65)',
                    }}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-[11px] text-[color:var(--red-soft)] text-center">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={cancelAdd}
              className="tap glass flex-1 py-2.5 rounded-lg text-[13px] font-bold text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              Annuler
            </button>
            <button
              onClick={submit}
              disabled={submitting || !name.trim()}
              className="tap flex-1 py-2.5 rounded-lg text-[13px] font-extrabold text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(180deg,#5B9CFF,#1A4FCC)',
                boxShadow: '0 8px 24px rgba(61,139,255,.35)',
              }}
            >
              {submitting ? 'Création…' : 'Créer la zone'}
            </button>
          </div>
        </div>
      )}

      {/* Add new zone CTA */}
      {!showAdd && (
        <button
          onClick={startAddAtCenter}
          className="tap w-full py-3 rounded-xl text-[13.5px] font-extrabold text-white flex items-center justify-center gap-2 font-display"
          style={{
            background: 'linear-gradient(180deg,#5B9CFF,#1A4FCC)',
            boxShadow: '0 8px 24px rgba(61,139,255,.35)',
          }}
        >
          <IPlus size={15} /> Créer une zone à ma position
        </button>
      )}

      {/* Zones list */}
      {geofences.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 px-1">
            Zones actives ({geofences.length})
          </div>
          {geofences.map((g) => {
            const state = insideMap[g.id];
            const inside = state?.inside;
            return (
              <div
                key={g.id}
                className="glass rounded-xl p-3 flex items-center gap-3"
                style={{ borderColor: 'var(--stroke)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${g.color}22`,
                    border: `1px solid ${g.color}66`,
                    color: g.color,
                  }}
                >
                  <IPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-white truncate flex items-center gap-1.5">
                    {g.name}
                    {inside !== undefined && (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase"
                        style={{
                          color: inside ? 'var(--green)' : 'var(--text-mute)',
                          background: inside ? 'rgba(34,214,123,.14)' : 'rgba(255,255,255,.04)',
                          border: `1px solid ${
                            inside ? 'rgba(34,214,123,.4)' : 'var(--stroke)'
                          }`,
                        }}
                      >
                        {inside ? 'À l\'intérieur' : 'Dehors'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-white/55">
                    Rayon {g.radius >= 1000 ? `${g.radius / 1000} km` : `${g.radius} m`}
                    {state && ` · ${fmtDistance(state.distance)} de toi`}
                    {' · '}
                    {NOTIFY_OPTIONS.find((o) => o.id === (g.notifyOn || 'both'))?.emoji}{' '}
                    {NOTIFY_OPTIONS.find((o) => o.id === (g.notifyOn || 'both'))?.label}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Supprimer la zone "${g.name}" ?`)) {
                      deleteGeofence(g.id);
                    }
                  }}
                  className="tap w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(255,46,63,.10)',
                    color: 'var(--red-soft)',
                    border: '1px solid rgba(255,46,63,.30)',
                  }}
                  aria-label="Supprimer"
                >
                  <ITrash size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {geofences.length === 0 && !showAdd && (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">📍</div>
          <div className="text-[13px] text-white/65 font-bold mb-1">
            Aucune zone créée
          </div>
          <div className="text-[11.5px] text-white/45 leading-snug px-6">
            Définis des zones (école, maison…) pour être notifié dès qu'un membre y entre ou en sort.
          </div>
        </div>
      )}

      {/* Info footer */}
      <div
        className="rounded-xl p-2.5 flex items-start gap-2 mt-2"
        style={{
          background: 'rgba(255,255,255,.03)',
          border: '1px solid var(--stroke)',
        }}
      >
        <IInfo size={12} className="text-white/45 mt-0.5 shrink-0" />
        <div className="text-[10.5px] text-white/55 leading-snug">
          Les zones sont partagées avec ta famille. Chaque entrée/sortie crée
          une notification locale et une trace dans l'historique.
        </div>
      </div>
    </div>
  );
};

export default GeofencesSheet;
