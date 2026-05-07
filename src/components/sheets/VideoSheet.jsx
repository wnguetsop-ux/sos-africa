import React, { useEffect, useRef, useState } from 'react';
import { IVideo, IShare, IX, ICheck } from '../ui/icons';
import { storage } from '../../firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

const VideoSheet = ({ contacts, sendSMS, location, userProfile, onClose }) => {
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [facing, setFacing] = useState('environment'); // or 'user'

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.state === 'recording' && recorderRef.current.stop();
      } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const startCamera = async (mode = facing) => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder à la caméra. Vérifie les autorisations.");
    }
  };

  useEffect(() => {
    startCamera(facing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    await startCamera(next);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    try {
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: mime,
        videoBitsPerSecond: 1_500_000,
      });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      setDuration(0);
      setRecordedBlob(null);
      setRecordedUrl(null);
      setUploadUrl(null);
      setRecording(true);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du démarrage de l\'enregistrement.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  const uploadAndShare = async () => {
    if (!recordedBlob) return;
    setUploading(true);
    setError(null);
    try {
      const userId =
        userProfile?.firstName ||
        userProfile?.getFullName?.() ||
        'anonymous';
      const ts = Date.now();
      const path = `videos/${userId.replace(/[^a-z0-9]/gi, '_')}/${ts}.webm`;
      const sref = storageRef(storage, path);
      const snap = await uploadBytes(sref, recordedBlob, {
        contentType: 'video/webm',
      });
      const url = await getDownloadURL(snap.ref);
      setUploadUrl(url);

      // Send SMS to emergency contacts
      if (contacts?.length && sendSMS) {
        const mapsLink = location
          ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
          : '';
        const message = `🆘 SOS Africa - Vidéo d'urgence: ${url}${
          mapsLink ? `\n📍 Position: ${mapsLink}` : ''
        }`;
        try {
          await sendSMS(contacts, message);
        } catch {}
      }
    } catch (err) {
      console.error(err);
      setError(
        'Échec de l\'envoi. Vérifie ta connexion et réessaie.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-white/65 leading-snug">
        Enregistrement vidéo + audio. Une fois arrêté, la vidéo peut être envoyée à tes contacts d'urgence avec ta position.
      </p>

      {/* Video preview */}
      <div
        className="relative rounded-2xl overflow-hidden bg-black"
        style={{ aspectRatio: '9 / 16', maxHeight: 320, border: '1px solid var(--stroke)' }}
      >
        {recordedUrl ? (
          <video
            src={recordedUrl}
            controls
            playsInline
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

        {/* Overlay : timer + REC */}
        {(recording || duration > 0) && !recordedUrl && (
          <div className="absolute top-2 left-2 flex items-center gap-2">
            {recording && (
              <span
                className="px-2 py-1 rounded-md text-[10.5px] font-extrabold text-white flex items-center gap-1.5"
                style={{
                  background: 'rgba(255,46,63,.85)',
                  boxShadow: '0 0 14px rgba(255,46,63,.7)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white"
                  style={{ animation: 'blink 1.2s infinite' }}
                />
                REC
              </span>
            )}
            <span
              className="px-2 py-1 rounded-md text-[11px] font-mono font-bold text-white tabular-nums"
              style={{ background: 'rgba(0,0,0,.55)' }}
            >
              {fmt(duration)}
            </span>
          </div>
        )}

        {/* Flip cam */}
        {!recordedUrl && (
          <button
            onClick={flipCamera}
            className="tap absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)' }}
            aria-label="Changer de caméra"
          >
            🔄
          </button>
        )}
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

      {/* Controls */}
      {!recordedUrl ? (
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`tap w-full py-3.5 rounded-xl text-[14px] font-extrabold font-display flex items-center justify-center gap-2 ${
            recording ? 'btn-primary-red' : 'btn-primary-red'
          }`}
          style={{ opacity: !streamRef.current ? 0.6 : 1 }}
        >
          {recording ? (
            <>
              <span
                style={{ width: 14, height: 14, background: '#fff', borderRadius: 2 }}
              />
              Arrêter ({fmt(duration)})
            </>
          ) : (
            <>
              <IVideo size={16} /> Démarrer l'enregistrement
            </>
          )}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (recordedUrl) URL.revokeObjectURL(recordedUrl);
                setRecordedBlob(null);
                setRecordedUrl(null);
                setUploadUrl(null);
                setDuration(0);
              }}
              className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              Reprendre
            </button>
            {!uploadUrl ? (
              <button
                onClick={uploadAndShare}
                disabled={uploading}
                className="tap btn-primary-red flex-1 py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? 'Envoi…' : (
                  <>
                    <IShare size={14} /> Envoyer aux contacts
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="tap btn-primary-green flex-1 py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2"
              >
                <ICheck size={15} stroke={3} /> Envoyé
              </button>
            )}
          </div>
          {uploadUrl && (
            <div
              className="glass rounded-xl p-3 text-[11.5px] text-white/85 break-all"
              style={{ borderColor: 'rgba(34,214,123,.4)' }}
            >
              ✅ Vidéo envoyée. SMS avec lien envoyé à {contacts?.length || 0} contact(s).
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-white/40">
        La vidéo est uploadée sur Firebase Storage et un lien sécurisé est partagé par SMS.
      </p>
    </div>
  );
};

export default VideoSheet;
