import React, { useState } from 'react';
import { 
  Users, Plus, Trash2, Edit2, Save, X, Phone, 
  User, Shield, Zap, Info, ChevronRight,
  Check, AlertCircle, Palette, 
  Globe, Clock, HelpCircle, FileText, Bell,
  Moon, Sun, Smartphone, Heart, ExternalLink,
  Upload, Gift
} from 'lucide-react';

const RELATIONS = [
  { value: 'famille', label: 'Family', labelFr: 'Famille', icon: '👨‍👩‍👧' },
  { value: 'ami', label: 'Friend', labelFr: 'Ami(e)', icon: '🧑‍🤝‍🧑' },
  { value: 'voisin', label: 'Neighbor', labelFr: 'Voisin(e)', icon: '🏠' },
  { value: 'collegue', label: 'Colleague', labelFr: 'Collègue', icon: '💼' },
  { value: 'urgence', label: 'Emergency', labelFr: 'Service d\'urgence', icon: '🚨' },
  { value: 'autre', label: 'Other', labelFr: 'Autre', icon: '📞' },
];

const SettingsTab = ({ 
  contacts = [], 
  addContact, 
  updateContact, 
  removeContact,
  importFromPhone,
  shakeEnabled,
  setShakeEnabled,
  premiumHook,
  userProfile,
  alertHistory,
  language = 'fr',
  setLanguage,
  theme = 'dark',
  setTheme,
  t,
  isDark,
  onDonate
}) => {
  // États locaux
  const [activeSection, setActiveSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: 'famille'
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [importingContacts, setImportingContacts] = useState(false);

  const bgCard = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  // Gestion des contacts
  const openAddForm = () => {
    setFormData({ name: '', phone: '', relation: 'famille' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation || 'autre'
    });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(language === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields');
      return;
    }

    if (editingId) {
      await updateContact(editingId, formData);
    } else {
      await addContact(formData);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', relation: 'famille' });
  };

  const handleDelete = async (id) => {
    await removeContact(id);
    setDeleteConfirm(null);
  };

  const handleImport = async () => {
    setImportingContacts(true);
    try {
      await importFromPhone?.();
    } catch (err) {
      console.error('Erreur import:', err);
    } finally {
      setImportingContacts(false);
    }
  };

  const getRelationLabel = (value) => {
    const rel = RELATIONS.find(r => r.value === value);
    return language === 'fr' ? (rel?.labelFr || value) : (rel?.label || value);
  };

  // Section principale
  if (activeSection === 'contacts') {
    return (
      <div className="p-4 pb-24">
        <button 
          onClick={() => setActiveSection(null)}
          className={`flex items-center gap-2 ${textSecondary} mb-4`}
        >
          ← {t('common.back')}
        </button>

        <h2 className={`text-2xl font-bold ${textColor} mb-4`}>{t('settings.emergencyContacts')}</h2>

        {/* Boutons d'action */}
        <div className="flex gap-3 mb-4">
          <button 
            onClick={openAddForm}
            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('settings.addContact')}
          </button>
          <button 
            onClick={handleImport}
            disabled={importingContacts}
            className={`flex-1 py-3 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} ${textColor} font-bold rounded-xl flex items-center justify-center gap-2`}
          >
            {importingContacts ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {t('settings.importContacts')}
          </button>
        </div>

        {/* Liste des contacts */}
        {contacts.length === 0 ? (
          <div className={`${bgCard} rounded-2xl p-8 text-center border ${borderColor}`}>
            <Users className={`w-12 h-12 ${textSecondary} mx-auto mb-3`} />
            <p className={`${textColor} font-medium`}>{t('settings.noContacts')}</p>
            <p className={`${textSecondary} text-sm mt-1`}>{t('settings.noContactsMessage')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div key={contact.id} className={`${bgCard} rounded-xl p-4 border ${borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${index === 0 ? 'bg-red-500' : 'bg-slate-600'} flex items-center justify-center text-white font-bold`}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-semibold ${textColor}`}>{contact.name}</p>
                      <p className={`text-sm ${textSecondary}`}>{contact.phone}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {RELATIONS.find(r => r.value === contact.relation)?.icon} {getRelationLabel(contact.relation)}
                        {index === 0 && <span className="ml-2 text-red-400">• {t('settings.primary')}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditForm(contact)}
                      className={`p-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg`}
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(contact.id)}
                      className={`p-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg`}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Confirmation suppression */}
                {deleteConfirm === contact.id && (
                  <div className="mt-3 p-3 bg-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm mb-2">{t('settings.deleteConfirm')}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                      >
                        {t('settings.delete')}
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(null)}
                        className={`flex-1 py-2 ${isDark ? 'bg-slate-700' : 'bg-slate-300'} ${textColor} rounded-lg text-sm font-medium`}
                      >
                        {t('settings.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal formulaire */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowForm(false)} />
            <div className={`relative w-full max-w-md ${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl sm:rounded-3xl p-6`}>
              <h3 className={`text-xl font-bold ${textColor} mb-4`}>
                {editingId ? t('settings.editContact') : t('settings.newContact')}
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t('settings.fullName')}
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}
                />
                
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder={t('settings.phoneNumber')}
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}
                />
                
                <select
                  value={formData.relation}
                  onChange={(e) => setFormData({...formData, relation: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}
                >
                  {RELATIONS.map(rel => (
                    <option key={rel.value} value={rel.value}>
                      {rel.icon} {language === 'fr' ? rel.labelFr : rel.label}
                    </option>
                  ))}
                </select>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className={`flex-1 py-3 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} ${textColor} rounded-xl font-medium`}
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold"
                  >
                    {t('settings.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Section aide
  if (activeSection === 'help') {
    return (
      <div className="p-4 pb-24">
        <button 
          onClick={() => setActiveSection(null)}
          className={`flex items-center gap-2 ${textSecondary} mb-4`}
        >
          ← {t('common.back')}
        </button>

        <h2 className={`text-2xl font-bold ${textColor} mb-4`}>{t('settings.helpSupport')}</h2>

        <div className="space-y-4">
          {/* Guide d'utilisation - Lien vers la landing page */}
          <a 
            href="https://landing-sos.vercel.app" 
            target="_blank"
            rel="noopener noreferrer"
            className={`${bgCard} rounded-2xl p-4 border ${borderColor} flex items-center gap-4`}
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className={`font-bold ${textColor}`}>{t('help.completeGuide')}</p>
              <p className={`text-sm ${textSecondary}`}>{t('help.visitWebsite')}</p>
            </div>
            <ExternalLink className="w-5 h-5 text-blue-400" />
          </a>

          {/* WhatsApp Support */}
          <a 
            href="https://wa.me/393299639430" 
            target="_blank"
            rel="noopener noreferrer"
            className={`${bgCard} rounded-2xl p-4 border ${borderColor} flex items-center gap-4`}
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className={`font-bold ${textColor}`}>WhatsApp</p>
              <p className={`text-sm ${textSecondary}`}>+39 329 963 9430</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </a>

          {/* Email Support */}
          <a 
            href="mailto:wnguetsop@gmail.com" 
            className={`${bgCard} rounded-2xl p-4 border ${borderColor} flex items-center gap-4`}
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className={`font-bold ${textColor}`}>Email</p>
              <p className={`text-sm ${textSecondary}`}>wnguetsop@gmail.com</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </a>

          {/* Numéros d'urgence */}
          <div className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
            <h3 className={`font-bold ${textColor} mb-3`}>
              {language === 'fr' ? 'Numéros d\'urgence' : 'Emergency Numbers'}
            </h3>
            <div className="space-y-2 text-sm">
              <p className={textSecondary}>🇨🇲 Cameroun: 117, 118, 119</p>
              <p className={textSecondary}>🇨🇮 Côte d'Ivoire: 110, 170, 180</p>
              <p className={textSecondary}>🇸🇳 Sénégal: 17, 18, 1515</p>
              <p className={textSecondary}>🇬🇦 Gabon: 1730, 18</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page principale des réglages
  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Titre */}
      <h1 className={`text-2xl font-bold ${textColor} mb-2`}>{t('settings.title')}</h1>

      {/* Section Contacts */}
      <div className={`${bgCard} rounded-2xl border ${borderColor} overflow-hidden`}>
        <button 
          onClick={() => setActiveSection('contacts')}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-left">
              <p className={`font-semibold ${textColor}`}>{t('settings.emergencyContacts')}</p>
              <p className={`text-sm ${textSecondary}`}>{contacts.length} {t('home.contacts')}</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
        </button>
      </div>

      {/* Section Sécurité */}
      <div className={`${bgCard} rounded-2xl border ${borderColor} overflow-hidden`}>
        <div className="p-4">
          <h3 className={`font-semibold ${textColor} mb-3 flex items-center gap-2`}>
            <Shield className="w-4 h-4 text-yellow-400" />
            {t('settings.security')}
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={textColor}>{t('settings.shakeToAlert')}</p>
              <p className={`text-xs ${textSecondary}`}>{t('home.shake3Times')}</p>
            </div>
            <button
              onClick={() => setShakeEnabled(!shakeEnabled)}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                shakeEnabled ? 'bg-yellow-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                shakeEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Section Apparence */}
      <div className={`${bgCard} rounded-2xl border ${borderColor} overflow-hidden`}>
        <div className="p-4">
          <h3 className={`font-semibold ${textColor} mb-3 flex items-center gap-2`}>
            <Palette className="w-4 h-4 text-purple-400" />
            {t('settings.appearance')}
          </h3>

          {/* Thème */}
          <div className="mb-4">
            <p className={`text-sm ${textSecondary} mb-2`}>{t('settings.theme')}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', icon: Moon, label: t('settings.dark') },
                { id: 'light', icon: Sun, label: t('settings.light') },
                { id: 'auto', icon: Smartphone, label: t('settings.auto') }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    theme === item.id
                      ? 'bg-purple-500 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Langue */}
          <div>
            <p className={`text-sm ${textSecondary} mb-2`}>{t('settings.language')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  language === 'fr'
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span>🇫🇷</span>
                <span className="text-sm font-medium">{t('settings.french')}</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  language === 'en'
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span>🇬🇧</span>
                <span className="text-sm font-medium">{t('settings.english')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Aide */}
      <div className={`${bgCard} rounded-2xl border ${borderColor} overflow-hidden`}>
        <button 
          onClick={() => setActiveSection('help')}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className={`font-semibold ${textColor}`}>{t('settings.helpSupport')}</p>
              <p className={`text-sm ${textSecondary}`}>{t('settings.faqTutorials')}</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
        </button>
      </div>

      {/* Section Don */}
      <button
        onClick={onDonate}
        className="w-full bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-2xl p-4 flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-pink-500/30 rounded-xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-pink-400" />
        </div>
        <div className="flex-1 text-left">
          <p className={`font-bold ${textColor}`}>{t('settings.supportUs')}</p>
          <p className={`text-sm ${textSecondary}`}>{t('settings.donateDesc')}</p>
        </div>
        <Gift className="w-5 h-5 text-pink-400" />
      </button>

      {/* Version gratuite */}
      <div className={`${bgCard} rounded-2xl p-4 border border-green-500/30 bg-green-500/10`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className={`font-bold ${textColor}`}>{t('settings.freeVersion')}</p>
            <p className={`text-sm text-green-400`}>{t('settings.allFeatures')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            t('settings.unlimitedContacts'),
            t('settings.audioRecording'),
            t('settings.communityAlerts'),
            t('settings.whatsappShare'),
            t('settings.unlimitedJourneys'),
            t('settings.noAds')
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span className={textSecondary}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* À propos */}
      <div className={`${bgCard} rounded-2xl p-4 border ${borderColor}`}>
        <p className={`text-sm ${textSecondary} text-center`}>
          {t('settings.aboutText')}
        </p>
        <p className="text-center mt-2 text-sm">{t('settings.madeWithLove')}</p>
        <p className={`text-center mt-1 text-xs ${textSecondary}`}>v2.3 • {t('settings.freeVersion')}</p>
      </div>
    </div>
  );
};

export default SettingsTab;