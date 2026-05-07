import React, { useEffect, useState } from 'react';
import { IFamily, ICopy, IShare, IPin, IBell, ICheck, IPlay, IX } from '../ui/icons';
import { db } from '../../firebase/config';
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

// Random short code for invite (6 chars)
const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const FamilySheet = ({ userProfile, location, sendSMS, journeyHook, onClose }) => {
  const [familyId, setFamilyId] = useState(() => localStorage.getItem('sos_family_id') || '');
  const [members, setMembers] = useState([]);
  const [pinging, setPinging] = useState(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState(null);

  const userId =
    userProfile?.firstName ||
    userProfile?.getFullName?.() ||
    'anonyme';
  const userName = userProfile?.getFullName?.() || userProfile?.firstName || 'Moi';

  // Listen to family members
  useEffect(() => {
    if (!familyId) return;
    const unsub = onSnapshot(
      collection(db, 'families', familyId, 'members'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMembers(list);
      },
      (err) => {
        console.error(err);
        setError('Erreur de connexion. Vérifie tes Firestore Rules.');
      }
    );
    return () => unsub();
  }, [familyId]);

  // Push my location periodically while sheet is open
  useEffect(() => {
    if (!familyId || !location) return;
    const push = () => {
      try {
        setDoc(
          doc(db, 'families', familyId, 'members', userId),
          {
            name: userName,
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy || null,
            updatedAt: serverTimestamp(),
            online: true,
          },
          { merge: true }
        ).catch(() => {});
      } catch {}
    };
    push();
    const id = setInterval(push, 30000); // every 30s
    return () => clearInterval(id);
  }, [familyId, location, userId, userName]);

  const createFamily = async () => {
    setCreating(true);
    setError(null);
    try {
      const code = genCode();
      await setDoc(doc(db, 'families', code), {
        owner: userId,
        ownerName: userName,
        createdAt: serverTimestamp(),
      });
      // add self as first member
      await setDoc(doc(db, 'families', code, 'members', userId), {
        name: userName,
        role: 'owner',
        joinedAt: serverTimestamp(),
        online: true,
      });
      localStorage.setItem('sos_family_id', code);
      setFamilyId(code);
    } catch (err) {
      console.error(err);
      setError('Création impossible. Vérifie les Firestore Rules.');
    } finally {
      setCreating(false);
    }
  };

  const joinFamily = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setError(null);
    try {
      // Check family exists
      const fams = await getDocs(
        query(collection(db, 'families'), where('__name__', '==', code))
      );
      if (fams.empty) {
        setError('Code famille invalide.');
        return;
      }
      await setDoc(doc(db, 'families', code, 'members', userId), {
        name: userName,
        role: 'member',
        joinedAt: serverTimestamp(),
        online: true,
      });
      localStorage.setItem('sos_family_id', code);
      setFamilyId(code);
    } catch (err) {
      console.error(err);
      setError('Connexion impossible. Vérifie le code et tes Rules Firestore.');
    }
  };

  const leaveFamily = () => {
    localStorage.removeItem('sos_family_id');
    setFamilyId('');
    setMembers([]);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(familyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const shareInvite = async () => {
    const text = `Rejoins ma famille SOS Africa avec le code : ${familyId}\nhttps://sos-africa.vercel.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SOS Africa Famille', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  };

  const pingMember = async (member) => {
    setPinging(member.id);
    try {
      await addDoc(collection(db, 'families', familyId, 'pings'), {
        from: userId,
        fromName: userName,
        to: member.id,
        toName: member.name,
        message: 'Ça va ? Réponds-moi 🙏',
        sentAt: serverTimestamp(),
        responded: false,
      });
      setTimeout(() => setPinging(null), 1500);
    } catch (err) {
      console.error(err);
      setPinging(null);
      setError('Envoi du ping impossible.');
    }
  };

  const lastSeenLabel = (m) => {
    const ts = m.updatedAt?.toMillis?.() || (m.updatedAt?.seconds ? m.updatedAt.seconds * 1000 : null);
    if (!ts) return 'Hors ligne';
    const diffMin = (Date.now() - ts) / 60000;
    if (diffMin < 1) return 'à l\'instant';
    if (diffMin < 60) return `il y a ${Math.floor(diffMin)} min`;
    if (diffMin < 60 * 24) return `il y a ${Math.floor(diffMin / 60)} h`;
    return `il y a ${Math.floor(diffMin / 60 / 24)} j`;
  };

  // No family yet
  if (!familyId) {
    return (
      <div className="space-y-3">
        <p className="text-[12.5px] text-white/65 leading-snug">
          Crée un cercle famille pour partager ta position en temps réel et envoyer des
          « ça va&nbsp;? » à tes proches.
        </p>

        <button
          onClick={createFamily}
          disabled={creating}
          className="tap btn-primary-green w-full py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display disabled:opacity-50"
        >
          <IFamily size={16} /> {creating ? 'Création…' : 'Créer ma famille'}
        </button>

        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-white/10" />
          <div className="text-[10.5px] text-white/40 font-bold uppercase tracking-wider">
            ou rejoindre
          </div>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Code famille (6 caractères)"
          maxLength={6}
          className="w-full px-3 py-3 rounded-xl glass text-center text-[16px] font-mono font-bold text-white tracking-[0.4em] uppercase placeholder-white/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-[13px]"
          style={{ borderColor: 'var(--stroke)' }}
        />
        <button
          onClick={joinFamily}
          disabled={joinCode.trim().length !== 6}
          className="tap glass w-full py-3 rounded-xl text-[13px] font-bold text-white/90 halo-blue disabled:opacity-50"
          style={{ borderColor: 'var(--stroke)' }}
        >
          Rejoindre la famille
        </button>

        {error && (
          <div className="text-[11px] text-[color:var(--red-soft)] text-center py-1">
            {error}
          </div>
        )}

        <p className="text-[10px] text-white/40">
          Données stockées sur Firebase, accessibles uniquement aux membres de ton cercle.
        </p>
      </div>
    );
  }

  // In family
  return (
    <div className="space-y-3">
      {/* Family code card */}
      <div
        className="rounded-2xl p-3.5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(61,139,255,.16), rgba(61,139,255,.04))',
          border: '1px solid rgba(61,139,255,.4)',
        }}
      >
        <div className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-[color:var(--blue)] mb-1">
          Code famille
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[24px] font-extrabold font-mono text-white tracking-[0.3em] flex-1">
            {familyId}
          </div>
          <button
            onClick={copyCode}
            className="tap glass rounded-lg px-3 py-1.5 text-[11.5px] font-bold text-white/85 halo-blue"
            style={{ borderColor: 'var(--stroke)' }}
          >
            <ICopy size={12} className="inline mr-1" />
            {copied ? 'OK' : 'Copier'}
          </button>
          <button
            onClick={shareInvite}
            className="tap btn-primary-green rounded-lg px-3 py-1.5 text-[11.5px] font-bold flex items-center gap-1"
          >
            <IShare size={12} /> Inviter
          </button>
        </div>
        <div className="text-[10.5px] text-white/55 mt-2">
          {members.length} membre{members.length > 1 ? 's' : ''} dans le cercle
        </div>
      </div>

      {/* Members list */}
      <div className="space-y-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 px-1 mt-1">
          Membres
        </div>
        {members.length === 0 && (
          <p className="text-[12px] text-white/55 text-center py-3">
            En attente de connexion…
          </p>
        )}
        {members.map((m) => {
          const isMe = m.id === userId;
          const hasLocation = m.lat && m.lng;
          const ts = m.updatedAt?.toMillis?.() || (m.updatedAt?.seconds ? m.updatedAt.seconds * 1000 : 0);
          const recent = ts && Date.now() - ts < 5 * 60000; // 5 min
          return (
            <div
              key={m.id}
              className="glass rounded-xl p-3 flex items-center gap-3"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <div className="relative shrink-0">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[14px]"
                  style={{
                    background: isMe
                      ? 'linear-gradient(135deg,#3D8BFF,#1A4080)'
                      : 'linear-gradient(135deg,#A06BFF,#3a1f70)',
                    border: '1px solid rgba(255,255,255,.1)',
                  }}
                >
                  {(m.name || '?').slice(0, 1).toUpperCase()}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0B0F1A]"
                  style={{
                    background: recent ? 'var(--green)' : 'var(--text-mute)',
                    boxShadow: recent ? '0 0 6px var(--green)' : 'none',
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white leading-tight">
                  {m.name || 'Membre'}
                  {isMe && <span className="text-white/45 font-normal"> (moi)</span>}
                  {m.role === 'owner' && (
                    <span
                      className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[8.5px] font-extrabold"
                      style={{
                        color: 'var(--gold)',
                        background: 'rgba(244,194,75,.12)',
                        border: '1px solid rgba(244,194,75,.35)',
                      }}
                    >
                      OWNER
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/55 leading-tight">
                  {hasLocation ? (
                    <>
                      <IPin size={10} className="inline mr-0.5 text-white/45" />
                      {m.lat.toFixed(3)}, {m.lng.toFixed(3)} · {lastSeenLabel(m)}
                    </>
                  ) : (
                    'Position non partagée'
                  )}
                </div>
              </div>
              {!isMe && (
                <>
                  {hasLocation && (
                    <a
                      href={`https://www.google.com/maps?q=${m.lat},${m.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tap w-9 h-9 rounded-full flex items-center justify-center halo-blue shrink-0"
                      style={{
                        background: 'rgba(61,139,255,.12)',
                        color: 'var(--blue)',
                        border: '1px solid rgba(61,139,255,.35)',
                      }}
                      aria-label="Voir sur la carte"
                    >
                      <IPin size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => pingMember(m)}
                    disabled={pinging === m.id}
                    className="tap w-9 h-9 rounded-full flex items-center justify-center halo-gold shrink-0 disabled:opacity-50"
                    style={{
                      background: 'rgba(244,194,75,.12)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(244,194,75,.35)',
                    }}
                    aria-label="Envoyer un ping"
                  >
                    {pinging === m.id ? <ICheck size={14} stroke={3} /> : <IBell size={14} />}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="text-[11px] text-[color:var(--red-soft)] text-center py-1">
          {error}
        </div>
      )}

      {/* Journey integration */}
      {journeyHook && (
        <div className="pt-2">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 px-1 mb-1">
            Mode trajet
          </div>
          {journeyHook.isActive ? (
            <div className="glass rounded-xl p-3 flex items-center justify-between" style={{ borderColor: 'rgba(34,214,123,.4)' }}>
              <div className="text-[12px] text-white/85">
                🚗 En route vers <span className="font-bold text-white">{journeyHook.destination}</span>
              </div>
              <button
                onClick={() => journeyHook.stopJourney(true)}
                className="tap btn-primary-red px-3 py-1.5 rounded-lg text-[11.5px] font-bold"
              >
                Arrivé
              </button>
            </div>
          ) : (
            <p className="text-[11.5px] text-white/55 px-1">
              Active le mode trajet depuis l'onglet Outils pour qu'on soit alerté si tu n'arrives pas.
            </p>
          )}
        </div>
      )}

      <button
        onClick={leaveFamily}
        className="text-[11px] text-white/40 hover:text-white/70 w-full text-center pt-2"
      >
        Quitter ce cercle famille
      </button>
    </div>
  );
};

export default FamilySheet;
