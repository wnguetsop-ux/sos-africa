import React, { useEffect, useState } from 'react';
import { IMic, IPlay, ICheck, IX, IShare, ITrash } from '../ui/icons';

// Format mm:ss
const fmt = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

const STORAGE_KEY = 'sos_audio_recordings';

const AudioSheet = ({ audioRecording, contacts, sendSMS, location, onClose }) => {
  const [recordings, setRecordings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [playingId, setPlayingId] = useState(null);

  // Persist whenever audioRecording produces a new blob
  useEffect(() => {
    const blob = audioRecording?.lastRecording || audioRecording?.audioBlob;
    const dur = audioRecording?.duration || 0;
    if (!blob || audioRecording?.isRecording) return;
    // Only push if truly new
    const id = `rec_${Date.now()}`;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const next = [
        { id, dataUrl, duration: dur, timestamp: Date.now() },
        ...recordings,
      ].slice(0, 30);
      setRecordings(next);
      try {
        // dataURLs can be heavy — truncate localStorage list to avoid quota issues
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 5)));
      } catch {}
    };
    try {
      reader.readAsDataURL(blob);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRecording?.lastRecording, audioRecording?.audioBlob, audioRecording?.isRecording]);

  const isRecording = !!audioRecording?.isRecording;
  const duration = audioRecording?.duration || 0;

  const start = () => {
    if (typeof audioRecording?.startRecording === 'function') {
      audioRecording.startRecording();
    }
  };
  const stop = () => {
    if (typeof audioRecording?.stopRecording === 'function') {
      audioRecording.stopRecording();
    }
  };

  const removeRec = (id) => {
    const next = recordings.filter((r) => r.id !== id);
    setRecordings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 5)));
    } catch {}
    if (playingId === id) setPlayingId(null);
  };

  const sharePosition = () => {
    if (!contacts?.length) {
      alert("Aucun contact d'urgence configuré.");
      return;
    }
    const mapsLink = location
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : '';
    const message = `🎙️ SOS Africa : enregistrement audio en cours. Position : ${mapsLink}`;
    sendSMS && sendSMS(contacts, message);
  };

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-white/65 leading-snug">
        Capture discrète. Lancement et arrêt manuels — l'enregistrement reste sur ton téléphone et peut être partagé.
      </p>

      {/* Recorder card */}
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: isRecording
            ? 'linear-gradient(135deg, rgba(255,46,63,.18), rgba(255,46,63,.04))'
            : 'rgba(255,255,255,.03)',
          border: `1px solid ${isRecording ? 'rgba(255,46,63,.4)' : 'var(--stroke)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: isRecording
                ? 'linear-gradient(180deg,#FF4252,#D71B2C)'
                : 'rgba(255,46,63,.12)',
              color: isRecording ? '#fff' : 'var(--red)',
              border: '1px solid rgba(255,46,63,.4)',
              boxShadow: isRecording
                ? '0 0 30px rgba(255,46,63,.6)'
                : '0 0 12px rgba(255,46,63,.2)',
              animation: isRecording ? 'pulse-glow 1.6s ease-in-out infinite' : 'none',
            }}
          >
            <IMic size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold text-white font-display">
              {isRecording ? 'Enregistrement…' : 'Prêt à enregistrer'}
            </div>
            <div className="text-[12px] font-mono tabular-nums text-white/70">
              {fmt(duration)}
              {isRecording && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full ml-2 align-middle"
                  style={{
                    background: 'var(--red)',
                    animation: 'blink 1.2s infinite',
                  }}
                />
              )}
            </div>
          </div>
          {isRecording ? (
            <button
              onClick={stop}
              className="tap btn-primary-red w-12 h-12 rounded-2xl flex items-center justify-center"
              aria-label="Arrêter"
            >
              <span style={{ width: 14, height: 14, background: '#fff', borderRadius: 2 }} />
            </button>
          ) : (
            <button
              onClick={start}
              className="tap btn-primary-red w-12 h-12 rounded-2xl flex items-center justify-center"
              aria-label="Démarrer"
            >
              <IPlay size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Quick action: alert contacts that I'm recording */}
      <button
        onClick={sharePosition}
        className="tap glass w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 halo-blue text-white/90"
        style={{ borderColor: 'var(--stroke)' }}
      >
        <IShare size={14} /> Notifier mes contacts (SMS + position)
      </button>

      {/* Recordings list */}
      {recordings.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 px-1 mt-2">
            Enregistrements récents
          </div>
          {recordings.slice(0, 5).map((r) => (
            <div
              key={r.id}
              className="glass rounded-xl p-3 flex items-center gap-3"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <button
                onClick={() => setPlayingId(playingId === r.id ? null : r.id)}
                className="tap w-10 h-10 rounded-full flex items-center justify-center halo-red shrink-0"
                style={{
                  background: 'rgba(255,46,63,.12)',
                  color: 'var(--red)',
                  border: '1px solid rgba(255,46,63,.35)',
                }}
                aria-label="Lire"
              >
                <IPlay size={14} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-bold text-white">
                  {fmt(r.duration || 0)}
                </div>
                <div className="text-[10.5px] text-white/55 truncate">
                  {new Date(r.timestamp).toLocaleString('fr-FR')}
                </div>
                {playingId === r.id && (
                  <audio
                    src={r.dataUrl}
                    autoPlay
                    controls
                    className="w-full mt-2"
                    style={{ height: 28 }}
                    onEnded={() => setPlayingId(null)}
                  />
                )}
              </div>
              <button
                onClick={() => removeRec(r.id)}
                className="tap w-9 h-9 rounded-full flex items-center justify-center halo-red shrink-0"
                style={{
                  background: 'rgba(255,46,63,.10)',
                  color: 'var(--red-soft)',
                  border: '1px solid rgba(255,46,63,.30)',
                }}
                aria-label="Supprimer"
              >
                <ITrash size={14} />
              </button>
            </div>
          ))}
          <p className="text-[10px] text-white/40 px-1">
            Les enregistrements sont stockés localement (5 derniers conservés).
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioSheet;
