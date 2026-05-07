import React, { useEffect, useState } from 'react';
import {
  ILock,
  IPlus,
  IX,
  ICheck,
  ITrash,
  IShare,
  IInfo,
  ICopy,
} from '../ui/icons';
import { storage, db } from '../../firebase/config';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

// Document categories with icons
const CATEGORIES = [
  { id: 'id', label: 'Pièce identité', emoji: '🪪' },
  { id: 'passport', label: 'Passeport', emoji: '🛂' },
  { id: 'license', label: 'Permis de conduire', emoji: '🚗' },
  { id: 'medical', label: 'Médical', emoji: '🏥' },
  { id: 'vaccine', label: 'Vaccins', emoji: '💉' },
  { id: 'insurance', label: 'Assurance', emoji: '📋' },
  { id: 'contract', label: 'Contrat', emoji: '📄' },
  { id: 'family', label: 'Famille', emoji: '👨‍👩‍👧' },
  { id: 'other', label: 'Autre', emoji: '📁' },
];

const FREE_LIMIT = 3;
const PREMIUM_LIMIT = 100;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB par fichier

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
};

const fmtDate = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const VaultSheet = ({ userProfile, isPremium, onUpgrade }) => {
  const userId =
    userProfile?.firstName ||
    userProfile?.getFullName?.() ||
    'anonyme';
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('id');
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const safeUid = userId.replace(/[^a-z0-9]/gi, '_');
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

  // PIN stored in localStorage (4 digits, simple lock — pas une vraie crypto)
  const STORED_PIN_KEY = `sos_vault_pin_${safeUid}`;
  const hasPin = typeof window !== 'undefined' && !!localStorage.getItem(STORED_PIN_KEY);

  useEffect(() => {
    if (!unlocked) return;
    const q = query(
      collection(db, 'users', safeUid, 'vault'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('vault listener:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [unlocked, safeUid]);

  const handleUnlock = (e) => {
    e?.preventDefault?.();
    const stored = localStorage.getItem(STORED_PIN_KEY);
    if (!stored) {
      // First time — set PIN
      if (pin.length !== 4) {
        setPinError(true);
        setTimeout(() => setPinError(false), 1200);
        return;
      }
      localStorage.setItem(STORED_PIN_KEY, pin);
      setUnlocked(true);
    } else if (pin === stored) {
      setUnlocked(true);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1200);
      setPin('');
    }
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      setError(`Fichier trop gros (max ${fmtSize(MAX_FILE_SIZE)})`);
      return;
    }
    setPendingFile(f);
    setName(f.name.replace(/\.[^.]+$/, ''));
    setShowAdd(true);
    setError(null);
  };

  const upload = async () => {
    if (!pendingFile || !name.trim()) return;
    if (files.length >= limit) {
      setError(
        `Limite atteinte (${limit} fichiers max). ${
          !isPremium ? 'Passe à Premium pour 100 fichiers.' : ''
        }`
      );
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const id = `doc_${Date.now()}`;
      const ext = pendingFile.name.split('.').pop()?.toLowerCase() || 'bin';
      const path = `vault/${safeUid}/${id}.${ext}`;
      const sref = storageRef(storage, path);
      const snap = await uploadBytes(sref, pendingFile, {
        contentType: pendingFile.type,
      });
      const url = await getDownloadURL(snap.ref);
      await setDoc(doc(db, 'users', safeUid, 'vault', id), {
        id,
        name: name.trim(),
        category,
        path,
        url,
        size: pendingFile.size,
        type: pendingFile.type,
        createdAt: serverTimestamp(),
      });
      setShowAdd(false);
      setPendingFile(null);
      setName('');
      setCategory('id');
    } catch (err) {
      console.error('vault upload:', err);
      setError(
        err.code === 'permission-denied'
          ? 'Permission Storage refusée — vérifie tes Storage Rules.'
          : 'Erreur d\'envoi — vérifie ta connexion'
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const removeFile = async (file) => {
    if (!window.confirm(`Supprimer "${file.name}" du coffre ?`)) return;
    try {
      await deleteDoc(doc(db, 'users', safeUid, 'vault', file.id));
      try {
        await deleteObject(storageRef(storage, file.path));
      } catch {}
    } catch (err) {
      setError('Suppression impossible');
    }
  };

  // ──────────────────────────────────────────────────
  // PIN GATE
  // ──────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="space-y-3 max-w-sm mx-auto">
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(61,139,255,.16), rgba(61,139,255,.04))',
            border: '1px solid rgba(61,139,255,.4)',
          }}
        >
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(180deg,#3D8BFF,#1A4080)',
              boxShadow: '0 0 24px rgba(61,139,255,.5)',
            }}
          >
            <ILock size={22} className="text-white" />
          </div>
          <div className="text-[16px] font-extrabold text-white font-display mb-1">
            Coffre-fort de documents
          </div>
          <div className="text-[12px] text-white/65 leading-snug">
            {hasPin
              ? 'Entre ton PIN à 4 chiffres pour déverrouiller le coffre.'
              : 'Crée un PIN à 4 chiffres pour protéger l\'accès à tes documents sensibles.'}
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="PIN 4 chiffres"
            maxLength={4}
            autoFocus
            className="w-full px-3 py-3 rounded-xl glass text-center text-[24px] font-mono font-bold text-white tracking-[0.6em] placeholder-white/25"
            style={{
              borderColor: pinError ? 'rgba(255,46,63,.5)' : 'var(--stroke)',
              animation: pinError ? 'shake 0.3s' : 'none',
            }}
          />
          {pinError && (
            <div className="text-[11.5px] text-[color:var(--red-soft)] text-center">
              PIN incorrect
            </div>
          )}
          <button
            type="submit"
            disabled={pin.length !== 4}
            className="tap w-full py-3 rounded-xl text-[14px] font-extrabold text-white font-display disabled:opacity-50"
            style={{
              background: 'linear-gradient(180deg,#5B9CFF,#1A4FCC)',
              boxShadow: '0 8px 24px rgba(61,139,255,.35)',
            }}
          >
            {hasPin ? 'Déverrouiller' : 'Créer le PIN'}
          </button>
        </form>

        <div
          className="rounded-xl p-2.5 flex items-start gap-2"
          style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid var(--stroke)',
          }}
        >
          <IInfo size={12} className="text-white/45 mt-0.5 shrink-0" />
          <div className="text-[10.5px] text-white/55 leading-snug">
            Le PIN est stocké localement. Si tu l'oublies, tu peux toujours accéder à tes documents via la console Firebase.
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────
  // VAULT VIEW
  // ──────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(34,214,123,.16), rgba(34,214,123,.04))',
          border: '1px solid rgba(34,214,123,.4)',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(34,214,123,.16)',
            color: 'var(--green)',
            border: '1px solid rgba(34,214,123,.4)',
          }}
        >
          <ICheck size={15} stroke={3} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-white">
            Coffre déverrouillé
          </div>
          <div className="text-[10.5px] text-white/55">
            {files.length}/{limit} fichiers · {fmtSize(
              files.reduce((s, f) => s + (f.size || 0), 0)
            )} utilisés
          </div>
        </div>
        <button
          onClick={() => {
            setUnlocked(false);
            setPin('');
          }}
          className="tap text-[10.5px] font-bold text-white/55 px-2"
        >
          Verrouiller
        </button>
      </div>

      {/* Upload form */}
      {showAdd && pendingFile && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: 'linear-gradient(135deg, rgba(61,139,255,.16), rgba(61,139,255,.04))',
            border: '1px solid rgba(61,139,255,.4)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-bold text-white truncate">
                {pendingFile.name}
              </div>
              <div className="text-[10.5px] text-white/55">
                {fmtSize(pendingFile.size)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
              Nom
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: CNI Jean Dupont"
              maxLength={60}
              className="w-full px-3 py-2.5 rounded-lg glass text-[14px] text-white placeholder-white/40"
              style={{ borderColor: 'var(--stroke)' }}
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-white/55 mb-1.5 block">
              Catégorie
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="tap rounded-lg p-2 flex flex-col items-center gap-0.5"
                  style={{
                    background:
                      category === c.id ? 'rgba(61,139,255,.20)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${
                      category === c.id ? 'rgba(61,139,255,.5)' : 'var(--stroke)'
                    }`,
                  }}
                >
                  <span className="text-[16px]">{c.emoji}</span>
                  <span
                    className="text-[9.5px] font-bold leading-tight text-center"
                    style={{
                      color: category === c.id ? '#fff' : 'rgba(255,255,255,.65)',
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAdd(false);
                setPendingFile(null);
              }}
              className="tap glass flex-1 py-2.5 rounded-lg text-[13px] font-bold text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              Annuler
            </button>
            <button
              onClick={upload}
              disabled={uploading || !name.trim()}
              className="tap flex-1 py-2.5 rounded-lg text-[13px] font-extrabold text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(180deg,#5B9CFF,#1A4FCC)',
                boxShadow: '0 8px 24px rgba(61,139,255,.35)',
              }}
            >
              {uploading ? 'Envoi…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showAdd && (
        <>
          <input
            id="vault-file-input"
            type="file"
            accept="image/*,application/pdf"
            onChange={onPickFile}
            className="hidden"
          />
          <button
            onClick={() => {
              if (files.length >= limit && !isPremium) {
                onUpgrade && onUpgrade();
                return;
              }
              document.getElementById('vault-file-input')?.click();
            }}
            disabled={files.length >= limit && isPremium}
            className="tap w-full py-3 rounded-xl text-[13.5px] font-extrabold text-white flex items-center justify-center gap-2 font-display"
            style={{
              background: 'linear-gradient(180deg,#5B9CFF,#1A4FCC)',
              boxShadow: '0 8px 24px rgba(61,139,255,.35)',
            }}
          >
            <IPlus size={15} /> Ajouter un document
          </button>
          {!isPremium && files.length >= FREE_LIMIT && (
            <div
              className="rounded-xl p-2.5 flex items-center gap-2"
              style={{
                background: 'rgba(244,194,75,.10)',
                border: '1px solid rgba(244,194,75,.35)',
              }}
            >
              <span className="text-base">👑</span>
              <div className="flex-1 text-[11px] text-white/85">
                Limite gratuite atteinte ({FREE_LIMIT}). Premium = 100 documents.
              </div>
              <button
                onClick={onUpgrade}
                className="tap btn-primary-gold px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold"
              >
                Passer
              </button>
            </div>
          )}
        </>
      )}

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

      {/* Files list */}
      <div className="space-y-1.5">
        {loading && (
          <div className="text-center py-4 text-[12px] text-white/55">
            Chargement…
          </div>
        )}
        {!loading && files.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🔐</div>
            <div className="text-[12.5px] text-white/65 px-4 leading-snug">
              Coffre vide. Ajoute ta carte d'identité, ton passeport ou tes ordonnances pour les avoir toujours sous la main, où que tu sois.
            </div>
          </div>
        )}
        {files.map((f) => {
          const cat = CATEGORIES.find((c) => c.id === f.category) || CATEGORIES[CATEGORIES.length - 1];
          const ts = f.createdAt?.toMillis?.() || f.createdAt?.seconds * 1000;
          return (
            <div
              key={f.id}
              className="glass rounded-xl p-2.5 flex items-center gap-2.5"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[18px]"
                style={{
                  background: 'rgba(61,139,255,.12)',
                  border: '1px solid rgba(61,139,255,.3)',
                }}
              >
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-bold text-white truncate">
                  {f.name}
                </div>
                <div className="text-[10.5px] text-white/55 truncate">
                  {cat.label} · {fmtSize(f.size || 0)}
                  {ts && ` · ${fmtDate(ts)}`}
                </div>
              </div>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tap w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(61,139,255,.12)',
                  color: 'var(--blue)',
                  border: '1px solid rgba(61,139,255,.3)',
                }}
                aria-label="Ouvrir"
              >
                <IShare size={12} />
              </a>
              <button
                onClick={() => removeFile(f)}
                className="tap w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(255,46,63,.10)',
                  color: 'var(--red-soft)',
                  border: '1px solid rgba(255,46,63,.30)',
                }}
                aria-label="Supprimer"
              >
                <ITrash size={11} />
              </button>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl p-2.5 flex items-start gap-2 mt-2"
        style={{
          background: 'rgba(255,255,255,.03)',
          border: '1px solid var(--stroke)',
        }}
      >
        <IInfo size={12} className="text-white/45 mt-0.5 shrink-0" />
        <div className="text-[10.5px] text-white/55 leading-snug">
          Documents stockés sur Firebase Storage avec ton identifiant unique. Image et PDF acceptés. Max 10 Mo par fichier.
        </div>
      </div>
    </div>
  );
};

export default VaultSheet;
