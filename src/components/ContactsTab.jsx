import React, { useState } from 'react';
import {
  IPhone,
  IMessage,
  IWhatsapp,
  ICopy,
  IShare,
  IPlus,
  ITrash,
  IEdit,
  IX,
  ICheck,
} from './ui/icons';
import { Tag, ScreenHeading } from './ui/atoms';

const PALETTE = ['#FF7B9C', '#7B9CFF', '#9C7BFF', '#FFB07B', '#FF5B5B', '#5BFFA9'];

const ContactRow = ({ contact, accent, onCall, onSMS, onEdit, onDelete }) => {
  const initials = (contact.name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const ready = !!contact.phone;
  const c = ready ? 'var(--green)' : 'var(--amber)';
  return (
    <div
      className="glass rounded-2xl p-3 flex items-center gap-3 lift halo-green"
      style={{ borderColor: 'var(--stroke)' }}
    >
      <div className="relative shrink-0">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[13px]"
          style={{
            background: `linear-gradient(135deg, ${accent}, #1a1a1a)`,
            border: '1px solid rgba(255,255,255,.1)',
          }}
        >
          {initials}
        </div>
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0B0F1A]"
          style={{ background: c, boxShadow: `0 0 6px ${c}` }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-bold text-white leading-tight truncate">
          {contact.name}
        </div>
        <div className="text-[11px] text-white/55 truncate">
          {contact.relation ? `${contact.relation} · ` : ''}
          {contact.phone || 'Sans numéro'}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onCall}
          className="tap w-9 h-9 rounded-full flex items-center justify-center halo-green"
          style={{
            background: 'rgba(34,214,123,.12)',
            color: 'var(--green)',
            border: '1px solid rgba(34,214,123,.35)',
          }}
        >
          <IPhone size={15} />
        </button>
        <button
          onClick={onSMS}
          className="tap w-9 h-9 rounded-full flex items-center justify-center halo-blue"
          style={{
            background: 'rgba(61,139,255,.12)',
            color: 'var(--blue)',
            border: '1px solid rgba(61,139,255,.35)',
          }}
        >
          <IMessage size={15} />
        </button>
        <button
          onClick={onEdit}
          className="tap w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,.04)',
            color: 'rgba(255,255,255,.7)',
            border: '1px solid var(--stroke)',
          }}
        >
          <IEdit size={14} />
        </button>
        <button
          onClick={onDelete}
          className="tap w-9 h-9 rounded-full flex items-center justify-center halo-red"
          style={{
            background: 'rgba(255,46,63,.10)',
            color: 'var(--red-soft)',
            border: '1px solid rgba(255,46,63,.30)',
          }}
        >
          <ITrash size={14} />
        </button>
      </div>
    </div>
  );
};

const EditContactSheet = ({ initial, onCancel, onSave, t }) => {
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [relation, setRelation] = useState(initial?.relation || 'famille');

  const submit = () => {
    if (!name.trim() || !phone.trim()) return;
    onSave({ ...initial, name: name.trim(), phone: phone.trim(), relation });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)' }}
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md glass-strong rounded-t-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[16px] font-extrabold text-white font-display">
            {initial?.id
              ? t ? t('contacts.edit') || 'Modifier le contact' : 'Modifier le contact'
              : t ? t('contacts.add') || 'Ajouter un contact' : 'Ajouter un contact'}
          </div>
          <button
            onClick={onCancel}
            className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
            style={{ borderColor: 'var(--stroke)' }}
          >
            <IX size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t ? t('contacts.fullName') || 'Nom complet' : 'Nom complet'}
            className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40"
            style={{ borderColor: 'var(--stroke)' }}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t ? t('contacts.phone') || 'Numéro de téléphone' : 'Numéro de téléphone'}
            className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40"
            style={{ borderColor: 'var(--stroke)' }}
          />
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95"
            style={{ borderColor: 'var(--stroke)', background: 'rgba(255,255,255,.04)' }}
          >
            <option value="famille">Famille</option>
            <option value="ami">Ami</option>
            <option value="collegue">Collègue</option>
            <option value="voisin">Voisin</option>
            <option value="autre">Autre</option>
          </select>
          <button
            onClick={submit}
            className="tap btn-primary-red w-full py-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
          >
            <ICheck size={15} /> {t ? t('contacts.save') || 'Enregistrer' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactsTab = ({
  contacts = [],
  addContact,
  updateContact,
  removeContact,
  importFromPhone,
  location,
  sendSMS,
  shareLocationWhatsApp,
  generateSMSLink,
  t,
}) => {
  const [editing, setEditing] = useState(null); // contact or 'new' or null
  const [copied, setCopied] = useState(false);

  const handleCall = (c) => {
    if (c.phone) window.location.href = `tel:${c.phone}`;
  };
  const handleSMS = (c) => {
    if (!c.phone) return;
    const mapsLink = location
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : '';
    const body = encodeURIComponent(`SOS Africa — Position : ${mapsLink}`);
    window.location.href = `sms:${c.phone}?body=${body}`;
  };

  const onCopy = async () => {
    const mapsLink = location
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : 'Position indisponible';
    try {
      await navigator.clipboard.writeText(`📍 Ma position SOS Africa : ${mapsLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const onWhatsAppAll = () => {
    if (shareLocationWhatsApp) shareLocationWhatsApp(contacts, location);
  };

  const onSMSAll = () => {
    if (generateSMSLink) {
      const link = generateSMSLink(contacts, location);
      if (link) window.location.href = link;
    } else if (sendSMS) {
      const mapsLink = location
        ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
        : '';
      sendSMS(contacts, `SOS Africa — Position : ${mapsLink}`);
    }
  };

  return (
    <div className="screen-in pb-32">
      <ScreenHeading
        title={t ? t('contacts.title') || "Contacts d'urgence" : "Contacts d'urgence"}
        subtitle={
          contacts.length > 0
            ? `${contacts.length} ${
                t ? t('contacts.ready') || 'prêts à recevoir vos alertes.' : 'prêts à recevoir vos alertes.'
              }`
            : t ? t('contacts.empty') || 'Ajoutez votre premier contact.' : 'Ajoutez votre premier contact.'
        }
        right={
          <button
            onClick={() => setEditing({})}
            className="tap w-10 h-10 rounded-full btn-primary-red flex items-center justify-center"
            aria-label="Ajouter"
          >
            <IPlus size={18} />
          </button>
        }
      />

      <div className="px-5 mb-3">
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
            <Tag color="blue">
              {t ? t('contacts.realtime') || 'Temps réel' : 'Temps réel'}
            </Tag>
          </div>
          <div className="text-[11.5px] text-white/55 mb-2.5">
            {t
              ? t('contacts.shareDesc') || 'Vos proches peuvent vous suivre en direct.'
              : 'Vos proches peuvent vous suivre en direct.'}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onSMSAll}
              className="tap glass rounded-xl py-2 text-[11.5px] font-bold flex items-center justify-center gap-1.5 halo-green text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <IMessage size={13} /> SMS
            </button>
            <button
              onClick={onWhatsAppAll}
              className="tap glass rounded-xl py-2 text-[11.5px] font-bold flex items-center justify-center gap-1.5 halo-green text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <IWhatsapp size={13} className="text-[color:var(--green)]" /> WhatsApp
            </button>
            <button
              onClick={onCopy}
              className="tap glass rounded-xl py-2 text-[11.5px] font-bold flex items-center justify-center gap-1.5 halo-blue text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <ICopy size={13} /> {copied ? 'Copié!' : 'Copier'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-2">
        {contacts.map((c, i) => (
          <ContactRow
            key={c.id || i}
            contact={c}
            accent={PALETTE[i % PALETTE.length]}
            onCall={() => handleCall(c)}
            onSMS={() => handleSMS(c)}
            onEdit={() => setEditing(c)}
            onDelete={() => removeContact && removeContact(c.id)}
          />
        ))}

        {contacts.length === 0 && (
          <button
            onClick={() => setEditing({})}
            className="tap glass rounded-2xl p-6 flex flex-col items-center gap-2 halo-red"
            style={{ borderColor: 'var(--stroke-strong)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,46,63,.10)',
                color: 'var(--red)',
                border: '1px solid rgba(255,46,63,.35)',
              }}
            >
              <IPlus size={20} />
            </div>
            <div className="text-[14px] font-extrabold text-white font-display">
              {t ? t('contacts.addFirst') || 'Ajouter votre premier contact' : 'Ajouter votre premier contact'}
            </div>
            <div className="text-[12px] text-white/55 text-center">
              {t
                ? t('contacts.addFirstDesc') ||
                  'Au moins un contact est requis pour activer le SOS.'
                : 'Au moins un contact est requis pour activer le SOS.'}
            </div>
          </button>
        )}

        {importFromPhone && (
          <button
            onClick={importFromPhone}
            className="tap glass rounded-2xl p-3 flex items-center justify-center gap-2 halo-blue text-white/85 text-[13px] font-bold"
            style={{ borderColor: 'var(--stroke)' }}
          >
            {t ? t('contacts.import') || 'Importer depuis le téléphone' : 'Importer depuis le téléphone'}
          </button>
        )}
      </div>

      {editing && (
        <EditContactSheet
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(c) => {
            if (c.id) updateContact && updateContact(c.id, c);
            else addContact && addContact(c);
            setEditing(null);
          }}
          t={t}
        />
      )}
    </div>
  );
};

export default ContactsTab;
