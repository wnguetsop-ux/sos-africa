import React, { useEffect, useRef, useState } from 'react';
import {
  ICar,
  ICheck,
  IX,
  IPin,
  IAlert,
  ISend,
  IClock,
  IInfo,
  IShare,
  IPlay,
  ICopy,
} from '../ui/icons';
import { storage } from '../../firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const ESTIMATE_PRESETS = [5, 10, 15, 30, 45, 60];

const fmtTime = (ms) =>
  new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const fmtCountdown = (ms) => {
  if (ms <= 0) return '00:00';
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

const TaxiSafeSheet = ({
  contacts = [],
  sendSMS,
  location,
  userProfile,
  taxiRide,
  onClose,
}) => {
  const {
    activeRide,
    history,
    pendingCheckIn,
    pendingCheckInDeadline,
    elapsedMin,
    overdue,
    startRide,
    confirmCheckIn,
    triggerManualAlert,
    endRide,
    cancelRide,
  } = taxiRide;

  // Wizard state for the start flow
  const [step, setStep] = useState('photo'); // 'photo' | 'config'
  const [plateText, setPlateText] = useState('');
  const [plateBlob, setPlateBlob] = useState(null);
  const [plateDataUrl, setPlateDataUrl] = useState(null);
  const [plateUrl, setPlateUrl] = useState(null);
  const [destination, setDestination] = useState('');
  const [estimatedMin, setEstimatedMin] = useState(15);
  const [selectedIds, setSelectedIds] = useState(() => contacts.map((c) => c.id));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const userId =
    userProfile?.firstName ||
    userProfile?.getFullName?.() ||
    'anonyme';

  // Re-render every second when a ride is active (for countdown)
  useEffect(() => {
    if (!activeRide) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [activeRide]);

  // Cleanup camera stream on unmount or when leaving photo step
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  useEffect(() => {
    if (step !== 'photo') {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
  }, [step]);

  const openCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setError('Caméra indisponible — utilise "Importer une photo".');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setPlateBlob(blob);
        setPlateDataUrl(canvas.toDataURL('image/jpeg', 0.85));
        streamRef.current?.getTracks().forEach((t) => t.stop());
      },
      'image/jpeg',
      0.85
    );
  };

  const onFileImport = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPlateBlob(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPlateDataUrl(ev.target.result);
    reader.readAsDataURL(f);
  };

  const retakePhoto = () => {
    setPlateBlob(null);
    setPlateDataUrl(null);
    setPlateUrl(null);
    openCamera();
  };

  const goNext = async () => {
    if (!plateBlob && !plateText.trim()) {
      setError('Photographie ou tape la plaque.');
      return;
    }
    // Try to upload now (best-effort, ride can start even without)
    if (plateBlob && !plateUrl) {
      setUploading(true);
      try {
        const safeUid = userId.replace(/[^a-z0-9]/gi, '_');
        const path = `taxi-rides/${safeUid}/${Date.now()}.jpg`;
        const sref = storageRef(storage, path);
        await uploadBytes(sref, plateBlob, { contentType: 'image/jpeg' });
        const url = await getDownloadURL(sref);
        setPlateUrl(url);
      } catch (err) {
        // Non-blocking — user can still start ride locally
        console.warn('Plate upload failed:', err);
      } finally {
        setUploading(false);
      }
    }
    setStep('config');
    setError(null);
  };

  const onStart = () => {
    if (selectedIds.length === 0) {
      setError('Sélectionne au moins un contact à notifier en cas d\'urgence.');
      return;
    }
    startRide({
      plateText: plateText.trim().toUpperCase(),
      plateUrl,
      destination,
      estimatedMin,
      contactIds: selectedIds,
    });
    setError(null);
  };

  // ──────────────────────────────────────────────────────────
  // ACTIVE RIDE VIEW
  // ──────────────────────────────────────────────────────────
  if (activeRide) {
    const remaining = pendingCheckInDeadline
      ? Math.max(0, pendingCheckInDeadline - Date.now())
      : 0;

    return (
      <div className="space-y-3">
        {/* Pending check-in modal — overrides everything */}
        {pendingCheckIn && (
          <div
            className="rounded-2xl p-5 relative overflow-hidden text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,46,63,.20), rgba(255,46,63,.06))',
              border: '1px solid rgba(255,46,63,.5)',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }}
          >
            <div className="text-3xl mb-2">🚖</div>
            <div className="text-[18px] font-extrabold text-white font-display mb-1">
              Tu vas bien&nbsp;?
            </div>
            <div className="text-[12.5px] text-white/85 mb-3 leading-snug">
              Réponds dans les 60 secondes ou tes contacts seront automatiquement alertés.
            </div>
            <div
              className="font-mono font-extrabold mb-4"
              style={{ fontSize: 36, color: 'var(--red-soft)' }}
            >
              {fmtCountdown(remaining)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={triggerManualAlert}
                className="tap glass py-3 rounded-xl text-[12.5px] font-bold text-[color:var(--red-soft)]"
                style={{ borderColor: 'rgba(255,46,63,.4)' }}
              >
                🚨 Je suis en danger
              </button>
              <button
                onClick={confirmCheckIn}
                className="tap btn-primary-green py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5"
              >
                <ICheck size={15} stroke={3} /> Tout va bien
              </button>
            </div>
          </div>
        )}

        {/* Ride status card */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: overdue
              ? 'linear-gradient(135deg, rgba(255,176,32,.18), rgba(255,176,32,.04))'
              : 'linear-gradient(135deg, rgba(34,214,123,.16), rgba(34,214,123,.04))',
            border: `1px solid ${overdue ? 'rgba(255,176,32,.5)' : 'rgba(34,214,123,.4)'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: overdue ? 'rgba(255,176,32,.16)' : 'rgba(34,214,123,.16)',
                color: overdue ? 'var(--amber)' : 'var(--green)',
                border: `1px solid ${
                  overdue ? 'rgba(255,176,32,.4)' : 'rgba(34,214,123,.4)'
                }`,
              }}
            >
              <ICar size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-bold text-white">
                Trajet en cours
                {overdue && (
                  <span
                    className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[8.5px] font-extrabold"
                    style={{
                      color: 'var(--amber)',
                      background: 'rgba(255,176,32,.14)',
                      border: '1px solid rgba(255,176,32,.4)',
                    }}
                  >
                    EN RETARD
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/65">
                Démarré à {fmtTime(activeRide.startedAt)} ·{' '}
                <span className="font-bold text-white">{elapsedMin} min</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div
              className="rounded-xl p-2.5"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid var(--stroke)',
              }}
            >
              <div className="text-[9.5px] uppercase tracking-wider font-bold text-white/45">
                Plaque
              </div>
              <div className="font-mono font-extrabold text-white text-[14px] tracking-wider truncate">
                {activeRide.plateText || '(photo)'}
              </div>
            </div>
            <div
              className="rounded-xl p-2.5"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid var(--stroke)',
              }}
            >
              <div className="text-[9.5px] uppercase tracking-wider font-bold text-white/45">
                Arrivée prévue
              </div>
              <div className="font-bold text-white text-[14px]">
                {fmtTime(activeRide.expectedArrivalAt)}
              </div>
            </div>
          </div>

          {activeRide.destination && (
            <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-white/75">
              <IPin size={11} className="text-white/55" />
              <span className="truncate">{activeRide.destination}</span>
            </div>
          )}

          {activeRide.plateUrl && (
            <a
              href={activeRide.plateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-white/55"
            >
              <IShare size={10} /> Voir la photo
            </a>
          )}
        </div>

        {/* Next check-in info */}
        {!pendingCheckIn && (
          <div
            className="rounded-xl p-3 flex items-center gap-2"
            style={{
              background: 'rgba(61,139,255,.06)',
              border: '1px solid rgba(61,139,255,.25)',
            }}
          >
            <IClock size={14} className="text-[color:var(--blue)] shrink-0" />
            <div className="flex-1 text-[11.5px] text-white/85 leading-snug">
              Prochain check-in dans{' '}
              <span className="font-bold text-white">
                {Math.max(
                  0,
                  Math.ceil(
                    (activeRide.lastCheckInAt + 3 * 60 * 1000 - Date.now()) / 60000
                  )
                )}{' '}
                min
              </span>
              {' · '}
              {activeRide.checkInsCount} déjà confirmé{activeRide.checkInsCount > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Annuler le trajet sans alerte ? (à utiliser uniquement si tu n'es pas montée dans le taxi)"
                )
              ) {
                cancelRide();
              }
            }}
            className="tap glass py-3 rounded-xl text-[12.5px] font-bold text-white/85"
            style={{ borderColor: 'var(--stroke)' }}
          >
            Annuler trajet
          </button>
          <button
            onClick={triggerManualAlert}
            className="tap btn-primary-red py-3 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-1.5"
          >
            <IAlert size={13} /> Alerte SOS
          </button>
        </div>

        <button
          onClick={() => endRide({ notifyContacts: true })}
          className="tap btn-primary-green w-full py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display"
        >
          <ICheck size={16} stroke={3} /> Je suis bien arrivé·e
        </button>

        {activeRide.lastAlertAt && (
          <div
            className="rounded-xl p-2.5 text-center text-[11px]"
            style={{
              background: 'rgba(255,46,63,.08)',
              color: 'var(--red-soft)',
              border: '1px solid rgba(255,46,63,.3)',
            }}
          >
            ⚠️ Une alerte a été envoyée à tes contacts à {fmtTime(activeRide.lastAlertAt)}.
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // STEP 1 : photographie de la plaque
  // ──────────────────────────────────────────────────────────
  if (step === 'photo') {
    return (
      <div className="space-y-3">
        <div className="text-[12.5px] text-white/65 leading-snug">
          <span className="font-bold text-white">Étape 1/2</span> · Avant de monter dans le taxi,
          photographie ou tape la plaque d'immatriculation.
        </div>

        {/* Camera / Photo preview */}
        <div
          className="relative rounded-2xl overflow-hidden bg-black"
          style={{ aspectRatio: '4 / 3', maxHeight: 240, border: '1px solid var(--stroke)' }}
        >
          {plateDataUrl ? (
            <img
              src={plateDataUrl}
              alt="Plaque"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {!plateDataUrl && !streamRef.current && (
            <button
              onClick={openCamera}
              className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2"
              style={{ background: 'rgba(0,0,0,.6)' }}
            >
              <span className="text-3xl">📸</span>
              <span className="text-[13px] font-bold">Toucher pour ouvrir la caméra</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {!plateDataUrl ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/85"
                style={{ borderColor: 'var(--stroke)' }}
              >
                Importer
              </button>
              <button
                onClick={capturePhoto}
                disabled={!streamRef.current}
                className="tap btn-primary-red flex-1 py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ICheck size={14} /> Capturer
              </button>
            </>
          ) : (
            <button
              onClick={retakePhoto}
              className="tap glass w-full py-2 rounded-xl text-[12px] font-bold text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              Reprendre la photo
            </button>
          )}
        </div>

        {/* Plate text (optional but recommended) */}
        <div>
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
            Numéro de plaque (saisie)
          </label>
          <input
            value={plateText}
            onChange={(e) => setPlateText(e.target.value.toUpperCase())}
            placeholder="ex: AB-123-CD"
            maxLength={20}
            className="w-full px-3 py-3 rounded-xl glass text-center text-[16px] font-mono font-extrabold tracking-wider text-white placeholder-white/30 uppercase"
            style={{ borderColor: 'var(--stroke)' }}
          />
        </div>

        {error && (
          <div className="text-[11px] text-[color:var(--red-soft)] text-center">
            {error}
          </div>
        )}

        <button
          onClick={goNext}
          disabled={uploading}
          className="tap btn-primary-red w-full py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display disabled:opacity-50"
        >
          {uploading ? 'Envoi de la photo…' : 'Continuer →'}
        </button>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // STEP 2 : configuration trajet + contacts
  // ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="text-[12.5px] text-white/65 leading-snug">
        <span className="font-bold text-white">Étape 2/2</span> · Configure le trajet — on te
        demandera de confirmer toutes les 3 minutes.
      </div>

      {plateDataUrl && (
        <div className="flex items-center gap-2.5 glass rounded-xl p-2" style={{ borderColor: 'var(--stroke)' }}>
          <img src={plateDataUrl} alt="Plaque" className="w-12 h-12 object-cover rounded-lg" />
          <div className="flex-1 min-w-0">
            <div className="font-mono font-extrabold text-white text-[14px] tracking-wider truncate">
              {plateText || '(photo seule)'}
            </div>
            <div className="text-[10.5px] text-white/55">
              {plateUrl ? '✅ Sauvegardée en cloud' : '🔒 Locale uniquement'}
            </div>
          </div>
          <button
            onClick={() => setStep('photo')}
            className="tap text-[11px] font-bold text-white/55 px-2"
          >
            Modifier
          </button>
        </div>
      )}

      <div>
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
          Destination
        </label>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="ex: Maison, Bastos, Aéroport"
          maxLength={60}
          className="w-full px-3 py-2.5 rounded-xl glass text-[14px] text-white placeholder-white/40"
          style={{ borderColor: 'var(--stroke)' }}
        />
      </div>

      <div>
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
          Durée estimée : <span className="text-white">{estimatedMin} min</span>
        </label>
        <div className="grid grid-cols-6 gap-1.5">
          {ESTIMATE_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setEstimatedMin(m)}
              className="tap py-2 rounded-lg text-[11.5px] font-bold"
              style={{
                color: estimatedMin === m ? '#fff' : 'rgba(255,255,255,.6)',
                background:
                  estimatedMin === m ? 'rgba(255,46,63,.16)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${
                  estimatedMin === m ? 'rgba(255,46,63,.4)' : 'var(--stroke)'
                }`,
              }}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
          Contacts à alerter ({selectedIds.length}/{contacts.length})
        </label>
        {contacts.length === 0 ? (
          <div
            className="rounded-xl p-3 text-[12px] text-[color:var(--amber)]"
            style={{
              background: 'rgba(255,176,32,.08)',
              border: '1px solid rgba(255,176,32,.3)',
            }}
          >
            ⚠️ Aucun contact d'urgence enregistré. Va dans Contacts pour en ajouter avant de démarrer.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
            {contacts.map((c) => {
              const sel = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    setSelectedIds((cur) =>
                      sel ? cur.filter((x) => x !== c.id) : [...cur, c.id]
                    )
                  }
                  className="tap w-full flex items-center gap-2.5 p-2 rounded-lg text-left"
                  style={{
                    background: sel ? 'rgba(34,214,123,.10)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${
                      sel ? 'rgba(34,214,123,.4)' : 'var(--stroke)'
                    }`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: sel ? 'var(--green)' : 'transparent',
                      border: `1.5px solid ${sel ? 'var(--green)' : 'rgba(255,255,255,.3)'}`,
                    }}
                  >
                    {sel && <ICheck size={12} stroke={3} className="text-[#06281A]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">
                      {c.name || c.phone}
                    </div>
                    {c.phone && (
                      <div className="text-[10.5px] text-white/55 font-mono">{c.phone}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="rounded-xl p-2.5 flex items-start gap-2"
        style={{
          background: 'rgba(255,255,255,.03)',
          border: '1px solid var(--stroke)',
        }}
      >
        <IInfo size={13} className="text-white/55 mt-0.5 shrink-0" />
        <div className="text-[10.5px] text-white/65 leading-snug">
          Pendant le trajet, on te demandera "tu vas bien ?" toutes les 3 min. Si tu ne réponds
          pas dans les 60 s, un SMS est envoyé aux contacts cochés avec la plaque + ta position.
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-[color:var(--red-soft)] text-center">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setStep('photo')}
          className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/85"
          style={{ borderColor: 'var(--stroke)' }}
        >
          Retour
        </button>
        <button
          onClick={onStart}
          disabled={contacts.length === 0 || selectedIds.length === 0}
          className="tap flex-1 py-3 rounded-xl text-[14px] font-extrabold text-white flex items-center justify-center gap-2 font-display disabled:opacity-50"
          style={{
            background: 'linear-gradient(180deg,#FF4252,#D71B2C)',
            boxShadow: '0 8px 24px rgba(255,46,63,.4)',
          }}
        >
          <IPlay size={14} /> Démarrer le trajet
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 mb-2 px-1">
            Historique récent
          </div>
          <div className="space-y-1.5">
            {history.slice(0, 5).map((h) => (
              <div
                key={h.id}
                className="glass rounded-lg p-2 flex items-center gap-2.5"
                style={{ borderColor: 'var(--stroke)' }}
              >
                <span className="text-[15px]">
                  {h.outcome === 'safe' ? '✅' : '🚫'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] font-bold text-white truncate">
                    {h.plateText || '(plaque)'}{' '}
                    {h.destination && (
                      <span className="text-white/55 font-normal">→ {h.destination}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/45">
                    {new Date(h.startedAt).toLocaleString('fr-FR')}
                    {h.endedAt &&
                      ` · ${Math.round((h.endedAt - h.startedAt) / 60000)} min`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxiSafeSheet;
