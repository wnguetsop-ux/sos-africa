import React, { useState } from 'react';
import { 
  User, Phone, Trash2, Plus, Edit2, Check, X,
  Moon, Sun, Monitor, Globe, ChevronRight,
  Heart, HelpCircle, Shield, Share2, ExternalLink,
  Bell, Lock, Smartphone
} from 'lucide-react';

const SettingsTab = ({
  contacts,
  addContact,
  updateContact,
  removeContact,
  importFromPhone,
  shakeEnabled,
  setShakeEnabled,
  premiumHook,
  userProfile,
  alertHistory,
  language,
  setLanguage,
  theme,
  setTheme,
  t,
  isDark,
  onDonate
}) => {
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'famille' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  // Partager l'application
  const shareApp = async () => {
    const shareData = {
      title: 'SOS Africa',
      text: '🛡️ Découvre SOS Africa - L\'app de sécurité personnelle gratuite! Alerte tes proches en cas de danger avec un simple bouton.',
      url: 'https://sos-africa.vercel.app'
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copier le lien
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        alert('✅ Lien copié! Partagez-le avec vos amis.');
      }
    } catch (error) {
      console.log('Erreur partage:', error);
    }
  };

  // Ajouter un contact
  const handleAddContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      addContact(newContact);
      setNewContact({ name: '', phone: '', relation: 'famille' });
      setShowAddForm(false);
    }
  };

  // Relations disponibles
  const relations = [
    { id: 'famille', label: t('settings.family'), emoji: '👨‍👩‍👧' },
    { id: 'ami', label: t('settings.friend'), emoji: '👋' },
    { id: 'collegue', label: t('settings.colleague'), emoji: '💼' },
    { id: 'voisin', label: t('settings.neighbor'), emoji: '🏠' },
    { id: 'autre', label: t('settings.other'), emoji: '👤' },
  ];

  return (
    <div className="p-4 space-y-6 pb-28">
      {/* Section Contacts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-bold ${textColor}`}>📞 {t('settings.emergencyContacts')}</h2>
          <span className={`text-sm ${textSecondary}`}>{contacts.length}/10</span>
        </div>

        {/* Liste des contacts */}
        <div className="space-y-2">
          {contacts.map((contact, index) => (
            <div key={contact.id || index} className={`${bgCard} rounded-xl p-3 border ${borderColor} flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center`}>
                <span className="text-lg">
                  {relations.find(r => r.id === contact.relation)?.emoji || '👤'}
                </span>
              </div>
              <div className="flex-1">
                <p className={`font-medium ${textColor}`}>{contact.name}</p>
                <p className={`text-sm ${textSecondary}`}>{contact.phone}</p>
              </div>
              <button
                onClick={() => removeContact(contact.id || index)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {contacts.length === 0 && (
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} text-center`}>
              <p className={textSecondary}>Aucun contact d'urgence</p>
              <p className={`text-sm ${textSecondary} mt-1`}>Ajoutez au moins un contact</p>
            </div>
          )}
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm ? (
          <div className={`${bgCard} rounded-xl p-4 border ${borderColor} mt-3 space-y-3`}>
            <input
              type="text"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder={t('settings.fullName')}
              className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
            />
            <input
              type="tel"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              placeholder={t('settings.phoneNumber')}
              className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
            />
            <select
              value={newContact.relation}
              onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
            >
              {relations.map((rel) => (
                <option key={rel.id} value={rel.id}>{rel.emoji} {rel.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'} ${textColor}`}
              >
                Annuler
              </button>
              <button
                onClick={handleAddContact}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl"
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('settings.addContact')}
            </button>
            <button
              onClick={importFromPhone}
              className={`py-3 px-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'} ${textColor}`}
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* Section Apparence */}
      <section className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <h3 className={`font-bold ${textColor} mb-4`}>🎨 {t('settings.appearance')}</h3>
        
        {/* Thème */}
        <div className="mb-4">
          <p className={`text-sm ${textSecondary} mb-2`}>{t('settings.theme')}</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dark', icon: Moon, label: t('settings.dark') },
              { id: 'light', icon: Sun, label: t('settings.light') },
              { id: 'auto', icon: Monitor, label: t('settings.auto') },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                  theme === item.id
                    ? 'border-red-500 bg-red-500/20'
                    : `${borderColor} ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`
                }`}
              >
                <item.icon className={`w-5 h-5 ${theme === item.id ? 'text-red-500' : textSecondary}`} />
                <span className={`text-xs ${theme === item.id ? 'text-red-500' : textColor}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Langue */}
        <div>
          <p className={`text-sm ${textSecondary} mb-2`}>{t('settings.language')}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'fr', flag: '🇫🇷', label: 'Français' },
              { id: 'en', flag: '🇬🇧', label: 'English' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLanguage(item.id)}
                className={`p-3 rounded-xl flex items-center gap-3 border-2 transition-all ${
                  language === item.id
                    ? 'border-red-500 bg-red-500/20'
                    : `${borderColor} ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`
                }`}
              >
                <span className="text-2xl">{item.flag}</span>
                <span className={language === item.id ? 'text-red-500 font-medium' : textColor}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section Partager */}
      <section className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <h3 className={`font-bold ${textColor} mb-3`}>📤 Partager l'application</h3>
        <p className={`text-sm ${textSecondary} mb-3`}>
          Aidez vos proches à rester en sécurité en partageant SOS Africa
        </p>
        <button
          onClick={shareApp}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Partager avec un ami
        </button>
      </section>

      {/* Section Nous Soutenir */}
      <section className={`bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-2xl p-4 border border-pink-500/30`}>
        <h3 className={`font-bold ${textColor} mb-2`}>❤️ {t('settings.supportUs')}</h3>
        <p className={`text-sm ${textSecondary} mb-3`}>
          {t('settings.supportDescription')}
        </p>
        <button
          onClick={onDonate}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5" />
          {t('settings.donate')}
        </button>
      </section>

      {/* Section Aide */}
      <section className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <h3 className={`font-bold ${textColor} mb-3`}>❓ {t('settings.help')}</h3>
        
        <a 
          href="https://landing-sos.vercel.app" 
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} mb-2`}
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span className={textColor}>Guide d'utilisation</span>
          </div>
          <ExternalLink className={`w-4 h-4 ${textSecondary}`} />
        </a>

        <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-400" />
            <span className={textColor}>Version 3.0</span>
          </div>
          <span className={`text-xs ${textSecondary}`}>100% Gratuit</span>
        </div>
      </section>

      {/* Section Légal */}
      <section className="text-center pt-4">
        <p className={`text-xs ${textSecondary}`}>
          © 2024 SOS Africa - Votre sécurité, notre priorité
        </p>
        <p className={`text-xs ${textSecondary} mt-1`}>
          Conçu avec ❤️ pour l'Afrique
        </p>
      </section>
    </div>
  );
};

export default SettingsTab;