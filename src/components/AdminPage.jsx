import React, { useEffect, useMemo, useState } from 'react';
import {
  IShield,
  IX,
  ICrown,
  ICheck,
  IAlert,
  IBell,
  IPin,
  IUser,
  ISearch,
  ICopy,
  IPlus,
  IRefresh,
  ITrash,
  IInfo,
  IChevronRight,
  IClock,
  IShare,
} from './ui/icons';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';

// PIN admin — peut être surchargé via VITE_ADMIN_PIN dans Vercel.
// Le 5-tap sur le logo donne déjà un accès secret ; ce PIN ajoute une couche.
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026';

// XAF par plan
const PLAN_XAF = { monthly: 1300, yearly: 12500, family: 3300 };
const PLAN_DAYS = { monthly: 30, yearly: 365, family: 30 };
const PLAN_LABEL = { monthly: 'Mensuel', yearly: 'Annuel', family: 'Famille' };

const fmtDate = (ms) => {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const daysLeft = (ms) => {
  if (!ms) return 0;
  return Math.max(0, Math.floor((ms - Date.now()) / (24 * 60 * 60 * 1000)));
};

const fmtRelative = (ms) => {
  if (!ms) return '—';
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
};

const tsToMs = (ts) => ts?.toMillis?.() || ts?.seconds * 1000 || ts || null;

// ════════════════════════════════════════════════════════════
// STAT CARD
// ════════════════════════════════════════════════════════════
const StatCard = ({ icon: Icn, label, value, sub, color = 'red' }) => {
  const c =
    color === 'gold'
      ? 'var(--gold)'
      : color === 'green'
      ? 'var(--green)'
      : color === 'blue'
      ? 'var(--blue)'
      : color === 'amber'
      ? 'var(--amber)'
      : 'var(--red)';
  return (
    <div
      className="rounded-2xl p-3.5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, ${c} 14%, transparent), color-mix(in oklab, ${c} 4%, transparent))`,
        border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: `color-mix(in oklab, ${c} 18%, transparent)`,
            color: c,
            border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
          }}
        >
          <Icn size={16} />
        </div>
        {sub && (
          <div className="text-[10.5px] font-bold" style={{ color: c }}>
            {sub}
          </div>
        )}
      </div>
      <div className="text-[10.5px] uppercase tracking-wider font-bold text-white/55">
        {label}
      </div>
      <div className="text-[20px] font-extrabold text-white font-display leading-tight">
        {value}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// PAYMENT CARD
// ════════════════════════════════════════════════════════════
const PaymentCard = ({ payment, onApprove, onReject }) => {
  const [busy, setBusy] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const ts = tsToMs(payment.createdAt);
  const planLabel = PLAN_LABEL[payment.plan] || payment.plan;
  const amount = payment.amount || PLAN_XAF[payment.plan] || 0;

  const handle = async (action) => {
    setBusy(action);
    try {
      if (action === 'approve') await onApprove(payment);
      else if (action === 'reject') await onReject(payment);
    } finally {
      setBusy(null);
    }
  };

  const statusColor =
    payment.status === 'approved'
      ? 'var(--green)'
      : payment.status === 'rejected'
      ? 'var(--red)'
      : 'var(--amber)';
  const statusLabel =
    payment.status === 'approved'
      ? 'Validé'
      : payment.status === 'rejected'
      ? 'Refusé'
      : 'À valider';

  return (
    <div className="glass rounded-2xl p-3.5" style={{ borderColor: 'var(--stroke)' }}>
      <div className="flex items-start gap-3">
        {/* Screenshot thumb */}
        <button
          onClick={() => payment.screenshotUrl && setShowImage(true)}
          className="tap shrink-0 w-16 h-16 rounded-xl overflow-hidden glass flex items-center justify-center"
          style={{
            borderColor: 'var(--stroke)',
            background: payment.screenshotUrl
              ? `url('${payment.screenshotUrl}') center/cover`
              : 'rgba(255,255,255,.04)',
          }}
        >
          {!payment.screenshotUrl && <span className="text-2xl">📸</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="text-[13.5px] font-bold text-white truncate">
              {payment.userId || 'Anonyme'}
            </div>
            <span
              className="text-[9.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
              style={{
                color: statusColor,
                background: `color-mix(in oklab, ${statusColor} 14%, transparent)`,
                border: `1px solid color-mix(in oklab, ${statusColor} 35%, transparent)`,
              }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="text-[11px] text-white/65 leading-snug">
            <span className="font-bold text-white">{planLabel}</span> ·{' '}
            <span className="font-mono">{amount.toLocaleString('fr-FR')} XAF</span>
          </div>
          <div className="text-[10.5px] text-white/45 leading-tight">
            📞 {payment.phone || '—'} · {fmtRelative(ts)}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(!payment.status || payment.status === 'pending_review') && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handle('reject')}
            disabled={!!busy}
            className="tap glass flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white/85 disabled:opacity-50"
            style={{ borderColor: 'var(--stroke)' }}
          >
            {busy === 'reject' ? '…' : 'Refuser'}
          </button>
          <button
            onClick={() => handle('approve')}
            disabled={!!busy}
            className="tap btn-primary-green flex-1 py-2.5 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {busy === 'approve' ? 'Activation…' : (
              <>
                <ICheck size={13} stroke={3} /> Approuver et activer
              </>
            )}
          </button>
        </div>
      )}

      {/* Image lightbox */}
      {showImage && payment.screenshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.92)' }}
          onClick={() => setShowImage(false)}
        >
          <img
            src={payment.screenshotUrl}
            alt="Capture paiement"
            className="max-w-full max-h-full rounded-xl"
          />
          <button
            onClick={() => setShowImage(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white"
            style={{ borderColor: 'var(--stroke)' }}
          >
            <IX size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// USER CARD
// ════════════════════════════════════════════════════════════
const UserCard = ({ user, onExtend, onRevoke }) => {
  const [busy, setBusy] = useState(null);
  const premium = user.premium || {};
  const until = tsToMs(premium.until);
  const days = daysLeft(until);
  const expSoon = days > 0 && days < 7;

  const handle = async (action, days) => {
    setBusy(action);
    try {
      if (action === 'extend') await onExtend(user, days);
      else if (action === 'revoke') await onRevoke(user);
    } finally {
      setBusy(null);
    }
  };

  const c = !premium.active
    ? 'var(--text-mute)'
    : days === 0
    ? 'var(--red)'
    : expSoon
    ? 'var(--amber)'
    : 'var(--green)';

  return (
    <div className="glass rounded-2xl p-3" style={{ borderColor: 'var(--stroke)' }}>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-[14px]"
          style={{
            background: 'linear-gradient(135deg, #FFD86A, #2a2a2a)',
            border: '1px solid rgba(255,255,255,.1)',
          }}
        >
          {(user.id || '?').slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-bold text-white truncate flex items-center gap-1.5">
            {user.id || 'Sans nom'}
            {premium.active && days > 0 && (
              <ICrown size={11} className="text-[color:var(--gold)] shrink-0" />
            )}
          </div>
          <div className="text-[11px] text-white/65">
            {premium.active ? PLAN_LABEL[premium.plan] || premium.plan : 'Free'}
            {' · '}
            <span style={{ color: c }} className="font-bold">
              {!premium.active
                ? 'inactif'
                : days === 0
                ? 'expiré'
                : `${days} j restants`}
            </span>
          </div>
          <div className="text-[10px] text-white/45">
            Jusqu'au {fmtDate(until)}
          </div>
        </div>
        {premium.active && (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => handle('extend', 30)}
              disabled={!!busy}
              className="tap text-[10px] font-extrabold px-2 py-1 rounded-lg disabled:opacity-50"
              style={{
                color: 'var(--gold)',
                background: 'rgba(244,194,75,.12)',
                border: '1px solid rgba(244,194,75,.35)',
              }}
            >
              {busy === 'extend' ? '…' : '+30j'}
            </button>
            <button
              onClick={() => handle('revoke')}
              disabled={!!busy}
              className="tap text-[10px] font-extrabold px-2 py-1 rounded-lg disabled:opacity-50"
              style={{
                color: 'var(--red-soft)',
                background: 'rgba(255,46,63,.10)',
                border: '1px solid rgba(255,46,63,.30)',
              }}
            >
              {busy === 'revoke' ? '…' : '✕'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// CODE CARD
// ════════════════════════════════════════════════════════════
const CodeCard = ({ code, onCopy, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-2.5" style={{ borderColor: 'var(--stroke)' }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: code.used ? 'rgba(255,255,255,.05)' : 'rgba(244,194,75,.14)',
          color: code.used ? 'var(--text-mute)' : 'var(--gold)',
          border: `1px solid ${code.used ? 'var(--stroke)' : 'rgba(244,194,75,.4)'}`,
        }}
      >
        <ICrown size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[13px] font-extrabold text-white tracking-wider truncate">
          {code.id}
        </div>
        <div className="text-[10.5px] text-white/55">
          {PLAN_LABEL[code.plan] || code.plan} · {code.durationDays || 30}j
          {code.used ? (
            <span className="ml-1 text-[color:var(--text-mute)]">
              · utilisé par {code.usedBy || '?'}
            </span>
          ) : (
            <span className="ml-1 text-[color:var(--green)]">· disponible</span>
          )}
        </div>
      </div>
      {!code.used && (
        <button
          onClick={handleCopy}
          className="tap glass rounded-lg px-2 py-1 text-[10.5px] font-bold text-white/85"
          style={{ borderColor: 'var(--stroke)' }}
        >
          {copied ? '✓' : <ICopy size={11} />}
        </button>
      )}
      {code.used && (
        <button
          onClick={() => onDelete && onDelete(code)}
          className="tap text-white/40 hover:text-white/70 px-1"
        >
          <ITrash size={12} />
        </button>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════
const AdminDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [genPlan, setGenPlan] = useState('monthly');
  const [showGenerator, setShowGenerator] = useState(false);

  // Load payments
  useEffect(() => {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('payments listener:', err)
    );
  }, []);

  // Load users
  useEffect(() => {
    return onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('users listener:', err)
    );
  }, []);

  // Load codes
  useEffect(() => {
    return onSnapshot(
      collection(db, 'premiumCodes'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.used ? 1 : 0) - (b.used ? 1 : 0));
        setCodes(list);
      },
      (err) => console.error('codes listener:', err)
    );
  }, []);

  // ───── Stats ─────
  const stats = useMemo(() => {
    const pendingPayments = payments.filter(
      (p) => !p.status || p.status === 'pending_review'
    );
    const approvedPayments = payments.filter((p) => p.status === 'approved');
    const totalRevenue = approvedPayments.reduce(
      (sum, p) => sum + (p.amount || PLAN_XAF[p.plan] || 0),
      0
    );
    const activePremium = users.filter(
      (u) =>
        u.premium?.active &&
        (!u.premium?.until || tsToMs(u.premium.until) > Date.now())
    );
    const expiringSoon = activePremium.filter((u) => {
      const d = daysLeft(tsToMs(u.premium?.until));
      return d > 0 && d < 7;
    });
    const unusedCodes = codes.filter((c) => !c.used).length;
    return {
      pendingCount: pendingPayments.length,
      revenueXAF: totalRevenue,
      activeCount: activePremium.length,
      expiringCount: expiringSoon.length,
      unusedCodes,
    };
  }, [payments, users, codes]);

  // ───── Actions ─────
  const flashToast = (text, color = 'green') => {
    setToast({ text, color });
    setTimeout(() => setToast(null), 2500);
  };

  // Approve payment + activate user (one-click)
  const approvePayment = async (payment) => {
    const userId = payment.userId || `client_${Date.now()}`;
    const plan = payment.plan || 'monthly';
    const days = PLAN_DAYS[plan] || 30;
    const until = Date.now() + days * 24 * 60 * 60 * 1000;
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          premium: {
            active: true,
            plan,
            until,
            activatedAt: serverTimestamp(),
            activatedBy: 'admin_direct',
            paymentId: payment.id,
          },
        },
        { merge: true }
      );
      await updateDoc(doc(db, 'payments', payment.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
      });
      flashToast(`${userId} activé · ${days} jours`, 'green');
    } catch (err) {
      console.error(err);
      flashToast('Erreur : ' + (err.message || 'inconnue'), 'red');
    }
  };

  const rejectPayment = async (payment) => {
    try {
      await updateDoc(doc(db, 'payments', payment.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
      });
      flashToast('Paiement refusé', 'amber');
    } catch (err) {
      flashToast('Erreur : ' + err.message, 'red');
    }
  };

  const extendUser = async (user, days) => {
    const currentUntil = tsToMs(user.premium?.until) || Date.now();
    const newUntil = Math.max(currentUntil, Date.now()) + days * 24 * 60 * 60 * 1000;
    try {
      await setDoc(
        doc(db, 'users', user.id),
        {
          premium: {
            active: true,
            plan: user.premium?.plan || 'monthly',
            until: newUntil,
          },
        },
        { merge: true }
      );
      flashToast(`+${days}j ajoutés à ${user.id}`, 'green');
    } catch (err) {
      flashToast('Erreur : ' + err.message, 'red');
    }
  };

  const revokeUser = async (user) => {
    try {
      await setDoc(
        doc(db, 'users', user.id),
        {
          premium: {
            active: false,
            plan: 'free',
            until: null,
            revokedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );
      flashToast(`Premium révoqué pour ${user.id}`, 'amber');
    } catch (err) {
      flashToast('Erreur : ' + err.message, 'red');
    }
  };

  const generateCode = async () => {
    const code = 'SOS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const days = PLAN_DAYS[genPlan] || 30;
    try {
      await setDoc(doc(db, 'premiumCodes', code), {
        used: false,
        plan: genPlan,
        durationDays: days,
        createdAt: serverTimestamp(),
        createdBy: 'admin',
      });
      flashToast(`Code créé : ${code}`, 'green');
      setShowGenerator(false);
      try {
        await navigator.clipboard.writeText(code);
      } catch {}
    } catch (err) {
      flashToast('Erreur : ' + err.message, 'red');
    }
  };

  const deleteCode = async (code) => {
    if (!window.confirm(`Supprimer le code ${code.id} ?`)) return;
    try {
      await deleteDoc(doc(db, 'premiumCodes', code.id));
      flashToast('Code supprimé', 'amber');
    } catch (err) {
      flashToast('Erreur : ' + err.message, 'red');
    }
  };

  // ───── Filtered lists ─────
  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (p.userId || '').toLowerCase().includes(s) ||
      (p.phone || '').toLowerCase().includes(s) ||
      (p.plan || '').toLowerCase().includes(s)
    );
  });

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    return (u.id || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'radial-gradient(140% 90% at 50% -20%, rgba(244,194,75,.12), transparent 55%), linear-gradient(180deg, #06080F 0%, #04060B 60%, #03050A 100%)',
        color: 'var(--text)',
      }}
    >
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg,#FFD86A,#D9971C)',
              boxShadow: '0 0 18px rgba(244,194,75,.5)',
            }}
          >
            <IShield size={19} className="text-[#241500]" />
          </div>
          <div>
            <div
              className="font-extrabold text-[16px] font-display"
              style={{ letterSpacing: '-.01em' }}
            >
              <span className="text-grad-gold">Super</span>
              <span className="text-white"> Admin</span>
            </div>
            <div className="text-[10.5px] text-white/55">
              SOS Africa · Console
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <IX size={18} />
        </button>
      </header>

      {/* Stats grid */}
      <div className="px-5 grid grid-cols-2 gap-2.5">
        <StatCard
          icon={IBell}
          label="À valider"
          value={stats.pendingCount}
          color="amber"
          sub={stats.pendingCount > 0 ? 'Action requise' : null}
        />
        <StatCard
          icon={ICrown}
          label="Premium actifs"
          value={stats.activeCount}
          color="gold"
          sub={`${stats.expiringCount} expirent <7j`}
        />
        <StatCard
          icon={IRefresh}
          label="CA validé"
          value={`${stats.revenueXAF.toLocaleString('fr-FR')} XAF`}
          color="green"
        />
        <StatCard
          icon={ICheck}
          label="Codes dispo"
          value={stats.unusedCodes}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <div
          className="glass rounded-xl flex p-1"
          style={{ borderColor: 'var(--stroke)' }}
        >
          {[
            { id: 'payments', label: 'Paiements', count: stats.pendingCount },
            { id: 'users', label: 'Utilisateurs', count: stats.activeCount },
            { id: 'codes', label: 'Codes', count: stats.unusedCodes },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="tap flex-1 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5"
                style={{
                  background: isActive ? 'rgba(244,194,75,.16)' : 'transparent',
                  color: isActive ? 'var(--gold)' : 'rgba(255,255,255,.6)',
                  border: `1px solid ${isActive ? 'rgba(244,194,75,.4)' : 'transparent'}`,
                }}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded"
                    style={{
                      background: isActive
                        ? 'rgba(244,194,75,.25)'
                        : 'rgba(255,255,255,.08)',
                      color: isActive ? 'var(--gold)' : 'rgba(255,255,255,.7)',
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      {(activeTab === 'payments' || activeTab === 'users') && (
        <div className="px-5 mt-3">
          <div
            className="glass rounded-xl flex items-center gap-2 px-3.5 py-2"
            style={{ borderColor: 'var(--stroke)' }}
          >
            <ISearch size={14} className="text-white/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === 'payments'
                  ? 'Rechercher par nom, téléphone, plan…'
                  : 'Rechercher un utilisateur…'
              }
              className="bg-transparent outline-none text-[13px] text-white placeholder-white/40 w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="tap text-white/45">
                <IX size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main
        className="flex-1 min-h-0 overflow-y-auto px-5 mt-3 pb-8 space-y-2"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeTab === 'payments' && (
          <>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">📭</div>
                <div className="text-[13px] text-white/55">
                  {search
                    ? 'Aucun paiement ne correspond.'
                    : 'Aucun paiement reçu pour l\'instant.'}
                </div>
              </div>
            ) : (
              filteredPayments.map((p) => (
                <PaymentCard
                  key={p.id}
                  payment={p}
                  onApprove={approvePayment}
                  onReject={rejectPayment}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">👤</div>
                <div className="text-[13px] text-white/55">
                  {search ? 'Aucun utilisateur trouvé.' : 'Pas encore d\'utilisateurs.'}
                </div>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  onExtend={extendUser}
                  onRevoke={revokeUser}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'codes' && (
          <>
            <button
              onClick={() => setShowGenerator(true)}
              className="tap btn-primary-gold w-full py-3 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 font-display mb-2"
            >
              <IPlus size={15} /> Générer un nouveau code
            </button>
            {codes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🎟️</div>
                <div className="text-[12.5px] text-white/55">
                  Aucun code généré. Crée-en un pour activer un client.
                </div>
              </div>
            ) : (
              codes.map((c) => (
                <CodeCard key={c.id} code={c} onDelete={deleteCode} />
              ))
            )}
          </>
        )}
      </main>

      {/* Generator modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowGenerator(false)}
          />
          <div
            className="relative w-full max-w-md glass-strong rounded-t-3xl p-5 mb-0"
            style={{ borderBottom: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-extrabold text-grad-gold font-display flex items-center gap-2">
                <ICrown size={17} /> Générer un code
              </div>
              <button
                onClick={() => setShowGenerator(false)}
                className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
                style={{ borderColor: 'var(--stroke)' }}
              >
                <IX size={16} />
              </button>
            </div>
            <p className="text-[12px] text-white/65 mb-3 leading-snug">
              Un code unique sera généré et copié. Donne-le au client après vérification du paiement.
            </p>
            <div className="text-[10.5px] uppercase tracking-wider font-bold text-white/55 mb-2">
              Plan
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['monthly', 'yearly', 'family'].map((p) => {
                const isActive = genPlan === p;
                return (
                  <button
                    key={p}
                    onClick={() => setGenPlan(p)}
                    className="tap glass rounded-xl p-2.5 text-center halo-gold"
                    style={{
                      borderColor: isActive ? 'rgba(244,194,75,.5)' : 'var(--stroke)',
                      background: isActive ? 'rgba(244,194,75,.10)' : undefined,
                    }}
                  >
                    <div
                      className="text-[12px] font-bold"
                      style={{
                        color: isActive ? 'var(--gold)' : 'rgba(255,255,255,.85)',
                      }}
                    >
                      {PLAN_LABEL[p]}
                    </div>
                    <div className="text-[10px] text-white/55">
                      {PLAN_DAYS[p]}j · {PLAN_XAF[p].toLocaleString('fr-FR')} XAF
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={generateCode}
              className="tap btn-primary-gold w-full py-3 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display"
            >
              <IPlus size={15} /> Créer et copier le code
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-3 rounded-2xl glass-strong text-[13px] font-bold text-white flex items-center gap-2"
          style={{
            borderColor:
              toast.color === 'red'
                ? 'rgba(255,46,63,.5)'
                : toast.color === 'amber'
                ? 'rgba(255,176,32,.5)'
                : 'rgba(34,214,123,.5)',
            boxShadow: '0 12px 40px rgba(0,0,0,.4)',
          }}
        >
          {toast.color === 'green' && <ICheck size={14} className="text-[color:var(--green)]" />}
          {toast.color === 'red' && <IAlert size={14} className="text-[color:var(--red-soft)]" />}
          {toast.color === 'amber' && <IInfo size={14} className="text-[color:var(--amber)]" />}
          {toast.text}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// PIN GATE
// ════════════════════════════════════════════════════════════
const AdminPage = ({ onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('sos_admin_authed') === '1'
  );

  const submit = (e) => {
    e?.preventDefault?.();
    if (pin === ADMIN_PIN) {
      setAuthed(true);
      sessionStorage.setItem('sos_admin_authed', '1');
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1200);
    }
  };

  if (authed) return <AdminDashboard onClose={onClose} />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background:
          'radial-gradient(140% 90% at 50% -20%, rgba(244,194,75,.18), transparent 55%), linear-gradient(180deg, #06080F 0%, #04060B 60%, #03050A 100%)',
        color: 'var(--text)',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(180deg,#FFD86A,#D9971C)',
              boxShadow: '0 0 36px rgba(244,194,75,.55)',
            }}
          >
            <IShield size={28} className="text-[#241500]" />
          </div>
          <div className="text-[20px] font-extrabold font-display">
            <span className="text-grad-gold">Super</span>{' '}
            <span className="text-white">Admin</span>
          </div>
          <div className="text-[12px] text-white/55 mt-1">
            Accès réservé · PIN requis
          </div>
        </div>

        <form
          onSubmit={submit}
          className="glass-strong rounded-2xl p-5 space-y-3"
          style={{ borderColor: 'var(--stroke)' }}
        >
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            autoFocus
            className="w-full px-3 py-3 rounded-xl glass text-center text-[20px] font-mono font-bold text-white tracking-[0.5em] placeholder-white/25"
            style={{
              borderColor: error ? 'rgba(255,46,63,.5)' : 'var(--stroke)',
              animation: error ? 'shake 0.3s' : 'none',
            }}
          />
          {error && (
            <div className="text-[11.5px] text-[color:var(--red-soft)] text-center">
              PIN incorrect
            </div>
          )}
          <button
            type="submit"
            className="tap btn-primary-gold w-full py-3 rounded-xl text-[13.5px] font-extrabold font-display"
          >
            Entrer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="tap w-full py-2 text-[11.5px] text-white/55 hover:text-white"
          >
            Retour à l'app
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
