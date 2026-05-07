import React, { useEffect, useState } from 'react';
import {
  IFamily,
  IPin,
  ISend,
  IX,
  ICrown,
  IAlert,
  ICheck,
  IInfo,
  IShare,
  IPlus,
} from '../ui/icons';
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendServerPush } from '../../hooks/useServerPush';

const tsToMs = (ts) => ts?.toMillis?.() || ts?.seconds * 1000 || ts || null;

const fmtRelative = (ms) => {
  if (!ms) return 'Hors ligne';
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
};

const ChildTrackerSheet = ({ userProfile, isPremium, onUpgrade, onClose }) => {
  const userId =
    userProfile?.firstName ||
    userProfile?.getFullName?.() ||
    'anonyme';
  const userName = userProfile?.getFullName?.() || userProfile?.firstName || 'Moi';

  const [familyId, setFamilyId] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('sos_family_id') || ''
      : ''
  );
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(null);
  const [error, setError] = useState(null);

  // Subscribe to family members in real-time
  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      collection(db, 'families', familyId, 'members'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((m) => m.id !== userId); // exclude self
        setMembers(list);
        setLoading(false);
      },
      (err) => {
        console.error('child tracker listener:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [familyId, userId]);

  const sendPing = async (member) => {
    if (!isPremium) {
      onUpgrade && onUpgrade();
      return;
    }
    setPinging(member.id);
    try {
      // Log ping in Firestore
      await addDoc(collection(db, 'families', familyId, 'pings'), {
        from: userId,
        fromName: userName,
        to: member.id,
        toName: member.name,
        message: 'Ça va ? Réponds-moi 🙏',
        sentAt: serverTimestamp(),
        responded: false,
      });
      // Server push to recipient
      await sendServerPush({
        userIds: [member.id],
        title: `🙏 ${userName} demande de tes nouvelles`,
        body: 'Touche pour répondre depuis SOS Africa.',
        data: { url: '/?tab=tools' },
      });
      setTimeout(() => setPinging(null), 1500);
    } catch (err) {
      console.error('ping error:', err);
      setPinging(null);
      setError('Envoi du ping impossible. Vérifie ta connexion.');
    }
  };

  // No family yet → propose to go to Mode famille
  const noFamily = !familyId;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      />
      <div className="relative w-full max-w-md glass-strong rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IFamily size={18} className="text-[color:var(--blue)]" />
            <div className="text-[16px] font-extrabold text-white font-display">
              Suivi enfants
            </div>
            {isPremium && (
              <span
                className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                style={{
                  color: '#241500',
                  background: 'linear-gradient(180deg,#FFD86A,#D9971C)',
                }}
              >
                <ICrown size={9} className="inline" /> Premium
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
            style={{ borderColor: 'var(--stroke)' }}
          >
            <IX size={16} />
          </button>
        </div>

        {/* No family yet */}
        {noFamily && (
          <div
            className="rounded-2xl p-4 text-center mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(61,139,255,.16), rgba(61,139,255,.04))',
              border: '1px solid rgba(61,139,255,.4)',
            }}
          >
            <div className="text-3xl mb-2">👨‍👩‍👧</div>
            <div className="text-[14px] font-extrabold text-white font-display mb-1">
              Crée ta famille d'abord
            </div>
            <div className="text-[11.5px] text-white/65 leading-snug mb-3">
              Pour suivre tes enfants, va dans <b>Outils → Mode famille</b>, crée un cercle, et invite-les par WhatsApp.
            </div>
            <button
              onClick={() => {
                onClose && onClose();
                // Ask App.jsx to open tools tab via custom event
                window.dispatchEvent(
                  new CustomEvent('sos-africa:nav', { detail: { tab: 'tools', sheet: 'family' } })
                );
              }}
              className="tap w-full py-2.5 rounded-xl text-[13px] font-extrabold text-white"
              style={{
                background: 'linear-gradient(180deg,#5B9CFF,#1A4FCC)',
                boxShadow: '0 8px 24px rgba(61,139,255,.35)',
              }}
            >
              Aller au Mode famille
            </button>
          </div>
        )}

        {/* Has family — show members */}
        {!noFamily && (
          <>
            <p className="text-[12px] text-white/65 mb-3 leading-snug">
              Vois la position en direct des membres de ta famille et envoie un ping <b>« Ça va ? »</b> qui demande une confirmation. Sans réponse en 5 min, ses contacts d'urgence sont alertés.
            </p>

            {loading && (
              <div className="text-center py-6 text-[12px] text-white/55">
                Chargement…
              </div>
            )}

            {!loading && members.length === 0 && (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">😶</div>
                <div className="text-[12.5px] text-white/65 leading-snug px-2">
                  Personne n'a encore rejoint ton cercle famille. Va dans <b>Outils → Mode famille</b> pour les inviter.
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {members.map((m) => {
                const lastSeenMs = tsToMs(m.updatedAt);
                const recent = lastSeenMs && Date.now() - lastSeenMs < 5 * 60000;
                const hasLocation = m.lat != null && m.lng != null;
                return (
                  <div
                    key={m.id}
                    className="glass rounded-2xl p-3 flex items-center gap-3"
                    style={{ borderColor: 'var(--stroke)' }}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[14px] shrink-0"
                      style={{
                        background: recent
                          ? 'linear-gradient(135deg,#22D67B,#0a4a2c)'
                          : 'linear-gradient(135deg,#9AA3B6,#1a1a1a)',
                        border: '1px solid rgba(255,255,255,.1)',
                      }}
                    >
                      {(m.name || '?').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold text-white truncate">
                        {m.name || 'Sans nom'}
                      </div>
                      <div className="text-[11px] text-white/55 truncate flex items-center gap-1">
                        {hasLocation && <IPin size={10} className="text-white/45" />}
                        {hasLocation
                          ? `${m.lat.toFixed(3)}, ${m.lng.toFixed(3)}`
                          : 'Position non partagée'}
                        {' · '}
                        <span style={{ color: recent ? 'var(--green)' : 'var(--text-mute)' }}>
                          {fmtRelative(lastSeenMs)}
                        </span>
                      </div>
                    </div>
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
                      onClick={() => sendPing(m)}
                      disabled={pinging === m.id}
                      className="tap w-9 h-9 rounded-full flex items-center justify-center halo-gold shrink-0 disabled:opacity-50"
                      style={{
                        background: 'rgba(244,194,75,.14)',
                        color: 'var(--gold)',
                        border: '1px solid rgba(244,194,75,.4)',
                      }}
                      aria-label="Envoyer un ping ça va ?"
                    >
                      {pinging === m.id ? (
                        <ICheck size={14} stroke={3} />
                      ) : (
                        <ISend size={13} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Info Premium si pas Premium */}
            {!isPremium && members.length > 0 && (
              <div
                className="rounded-xl p-3 flex items-start gap-2 mb-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(244,194,75,.16), rgba(244,194,75,.04))',
                  border: '1px solid rgba(244,194,75,.4)',
                }}
              >
                <ICrown size={14} className="text-[color:var(--gold)] shrink-0 mt-0.5" />
                <div className="flex-1 text-[11.5px] text-white/85 leading-snug">
                  <b className="text-white">Premium</b> débloque les pings « ça va ? » illimités, les zones de confiance auto, et jusqu'à 5 membres famille.
                </div>
              </div>
            )}

            {error && (
              <div
                className="rounded-xl p-2.5 text-[11.5px] text-center mb-3"
                style={{
                  background: 'rgba(255,46,63,.10)',
                  color: 'var(--red-soft)',
                  border: '1px solid rgba(255,46,63,.35)',
                }}
              >
                {error}
              </div>
            )}

            {!isPremium ? (
              <button
                onClick={onUpgrade}
                className="tap btn-primary-gold w-full py-3 rounded-xl text-[13.5px] font-extrabold flex items-center justify-center gap-2 font-display"
              >
                <ICrown size={15} /> Activer Premium · 1 300 XAF / mois
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose && onClose();
                  window.dispatchEvent(
                    new CustomEvent('sos-africa:nav', { detail: { tab: 'tools', sheet: 'geofences' } })
                  );
                }}
                className="tap w-full py-3 rounded-xl text-[13.5px] font-extrabold text-white flex items-center justify-center gap-2 font-display"
                style={{
                  background: 'linear-gradient(180deg,#5B9CFF,#1A4FCC)',
                  boxShadow: '0 8px 24px rgba(61,139,255,.35)',
                }}
              >
                <IPin size={15} /> Configurer les zones de confiance
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChildTrackerSheet;
