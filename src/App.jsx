import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Settings, Home, MapPin, Wrench,
  Wifi, WifiOff, UserPlus, Crown
} from 'lucide-react';

// Hooks
import { useGeolocation } from './hooks/useGeolocation';
import { useShakeDetection } from './hooks/useShakeDetection';
import { useContacts } from './hooks/useContacts';
import { useSMS } from './hooks/useSMS';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useJourneyMode } from './hooks/useJourneyMode';
import { useCommunityAlert } from './hooks/useCommunityAlert';
import { usePremium } from './hooks/usePremium';
import { useUserProfile } from './hooks/useUserProfile';
import { useAlertHistory } from './hooks/useAlertHistory';
import { useI18n } from './hooks/useI18n';
import { useTheme } from './hooks/useTheme';
import { useAnalytics } from './hooks/useAnalytics';

// Composants
import HomeTab from './components/HomeTab';
import LocationTab from './components/LocationTab';
import ToolsTab from './components/ToolsTab';
import SettingsTab from './components/SettingsTab';
import AlertModal from './components/AlertModal';
import GhostMode from './components/GhostMode';
import SirenMode from './components/SirenMode';
import FakeCallScreen from './components/FakeCallTab';
import OnboardingScreen from './components/OnboardingScreen';
import DonationModal from './components/DonationModal';
import AdminPage from './components/AdminPage';

// Composant modal pour ajouter un contact rapidement
const QuickAddContactModal = ({ isOpen, onClose, onAdd, onImport, t, isDark }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('famille');

  if (!isOpen) return null;

  const bgCard = isDark ? 'bg-slate-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';

  const handleSubmit = () => {
    if (name.trim() && phone.trim()) {
      onAdd({ name: name.trim(), phone: phone.trim(), relation });
      setName('');
      setPhone('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md ${bgCard} rounded-t-3xl sm:rounded-3xl p-6`}>
        <h2 className={`text-xl font-bold ${textColor} mb-4`}>
          {t('settings.addContact')}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('settings.fullName')}
            className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-red-500`}
          />

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('settings.phoneNumber')}
            className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-red-500`}
          />

          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-red-500`}
          >
            <option value="famille">{t('settings.family')}</option>
            <option value="ami">{t('settings.friend')}</option>
            <option value="collegue">{t('settings.colleague')}</option>
            <option value="voisin">{t('settings.neighbor')}</option>
            <option value="autre">{t('settings.other')}</option>
          </select>

          <div className="flex gap-3">
            <button
              onClick={onImport}
              className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              {t('settings.importContacts')}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl"
            >
              {t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // États principaux
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(true);
  const [alertActive, setAlertActive] = useState(false);
  const [countDown, setCountDown] = useState(5);
  const [ghostMode, setGhostMode] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallData, setFakeCallData] = useState(null);
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  
  // Hooks
  const { location, loading: gpsLoading, error: gpsError, refresh: refreshGPS } = useGeolocation();
  const contactsHook = useContacts();
  const { contacts, addContact, updateContact, removeContact, importFromPhone } = contactsHook;
  const { sendSMS, generateSMSLink, sendWhatsAppToAll, shareLocationWhatsApp } = useSMS();
  const audioRecording = useAudioRecording();
  const journeyHook = useJourneyMode(location, contacts, sendSMS);
  const communityHook = useCommunityAlert(location);
  const premiumHook = usePremium();
  const userProfile = useUserProfile();
  const alertHistory = useAlertHistory();
  const { language, setLanguage, t } = useI18n();
  const { theme, setTheme, isDark, colors } = useTheme();
  const analytics = useAnalytics();

  // Détection du shake
  const handleShake = useCallback(() => {
    if (shakeEnabled && !alertActive && !ghostMode && userProfile.isOnboardingComplete) {
      analytics.trackFeature('shake');
      triggerSOS('shake');
    }
  }, [shakeEnabled, alertActive, ghostMode, userProfile.isOnboardingComplete]);
  
  useShakeDetection(handleShake, shakeEnabled);

  // Gestion online/offline
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compte à rebours SOS
  useEffect(() => {
    let timer;
    if (alertActive && countDown > 0) {
      timer = setTimeout(() => setCountDown(prev => prev - 1), 1000);
    } else if (alertActive && countDown === 0) {
      executeEmergencyActions();
    }
    return () => clearTimeout(timer);
  }, [alertActive, countDown]);

  // Accès admin secret (5 taps sur le logo)
  useEffect(() => {
    if (adminTapCount >= 5) {
      setShowAdmin(true);
      setAdminTapCount(0);
    }
    const timer = setTimeout(() => setAdminTapCount(0), 2000);
    return () => clearTimeout(timer);
  }, [adminTapCount]);

  // Tracker les pages vues
  useEffect(() => {
    analytics.trackPageView(activeTab);
  }, [activeTab]);

  // Déclencher l'alerte SOS
  const triggerSOS = (type = 'sos') => {
    setAlertActive(true);
    setCountDown(5);
    analytics.trackFeature('sos_triggered');
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  };

  // Annuler l'alerte
  const cancelSOS = () => {
    alertHistory.addAlert({
      type: 'sos',
      status: 'cancelled',
      location,
      contacts,
      cancelled: true
    });
    setAlertActive(false);
    setCountDown(5);
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  };

  // Exécuter les actions d'urgence
  const executeEmergencyActions = async () => {
    const message = userProfile.generateAlertMessage(location);

    alertHistory.addAlert({
      type: 'sos',
      status: 'sent',
      location,
      contacts,
      method: 'sms'
    });

    analytics.trackAlert('sos');

    try {
      await sendSMS(contacts, message);
    } catch (error) {
      console.error('Erreur SMS:', error);
    }

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 1000]);
    }
  };

  // Gérer le faux appel
  const handleFakeCall = (caller, delay) => {
    analytics.trackFeature('fakecall');
    setTimeout(() => {
      setFakeCallData(caller);
      setFakeCallActive(true);
    }, delay * 1000);
  };

  // Gérer la sirène
  const handleSiren = () => {
    analytics.trackFeature('siren');
    setSirenActive(true);
  };

  // Gérer le mode ghost
  const handleGhostMode = () => {
    analytics.trackFeature('ghost');
    setGhostMode(true);
  };

  // Loading
  if (userProfile.isLoading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className={colors.text}>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Onboarding
  if (!userProfile.isOnboardingComplete) {
    return <OnboardingScreen onComplete={userProfile.completeOnboarding} t={t} />;
  }

  // Admin Page
  if (showAdmin) {
    return <AdminPage onClose={() => setShowAdmin(false)} />;
  }

  // Ghost Mode
  if (ghostMode) {
    return (
      <GhostMode 
        location={location}
        onExit={() => setGhostMode(false)}
        onTriggerSOS={() => triggerSOS('ghost')}
      />
    );
  }

  // Siren Mode
  if (sirenActive) {
    return <SirenMode onStop={() => setSirenActive(false)} />;
  }

  // Fake Call Screen
  if (fakeCallActive) {
    return (
      <FakeCallScreen 
        caller={fakeCallData}
        onEnd={() => {
          setFakeCallActive(false);
          setFakeCallData(null);
        }}
      />
    );
  }

  // Configuration des tabs
  const tabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'location', icon: MapPin, label: t('nav.location') },
    { id: 'tools', icon: Wrench, label: t('nav.tools') },
    { id: 'settings', icon: Settings, label: t('nav.settings') }
  ];

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col overflow-hidden`}>
      {/* Header - FIXE */}
      <header className={`${colors.bgSecondary} border-b ${colors.border} px-4 py-3 flex items-center justify-between flex-shrink-0`}>
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setAdminTapCount(prev => prev + 1)}
        >
          <Shield className="w-7 h-7 text-red-500" />
          <span className="text-xl font-bold tracking-tight">SOS Africa</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicateur réseau */}
          <div className={`p-1.5 rounded-full ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
          
          {/* Bouton ajouter contact */}
          <button 
            onClick={() => setShowAddContact(true)}
            className="p-2 bg-red-600 rounded-full hover:bg-red-500 transition-colors"
            title={t('settings.addContact')}
          >
            <UserPlus className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Bandeau gratuit - FIXE */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-600/30 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
        <span className="text-xl">🎉</span>
        <span className="text-green-300 text-sm font-medium">
          {language === 'fr' ? '100% Gratuit - Toutes fonctionnalités!' : '100% Free - All features!'}
        </span>
      </div>

      {/* Contenu principal - SCROLLABLE */}
      <main className="flex-1 overflow-y-auto pb-24 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'home' && (
          <HomeTab 
            location={location}
            gpsLoading={gpsLoading}
            gpsError={gpsError}
            refreshGPS={refreshGPS}
            contacts={contacts}
            isOnline={isOnline}
            shakeEnabled={shakeEnabled}
            setShakeEnabled={setShakeEnabled}
            onTriggerSOS={() => triggerSOS('sos')}
            isPremium={true}
            journeyActive={journeyHook.isActive}
            recordingActive={audioRecording.isRecording}
            userName={userProfile.getFullName()}
            t={t}
            isDark={isDark}
          />
        )}
        
        {activeTab === 'location' && (
          <LocationTab 
            location={location}
            gpsLoading={gpsLoading}
            refreshGPS={refreshGPS}
            t={t}
            isDark={isDark}
          />
        )}
        
        {activeTab === 'tools' && (
          <ToolsTab 
            t={t}
            isDark={isDark}
            audioRecording={audioRecording}
            onFakeCall={handleFakeCall}
            onSiren={handleSiren}
            onGhostMode={handleGhostMode}
            communityHook={communityHook}
            journeyHook={journeyHook}
            isPremium={true}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab 
            contacts={contacts}
            addContact={addContact}
            updateContact={updateContact}
            removeContact={removeContact}
            importFromPhone={importFromPhone}
            shakeEnabled={shakeEnabled}
            setShakeEnabled={setShakeEnabled}
            premiumHook={premiumHook}
            userProfile={userProfile}
            alertHistory={alertHistory}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            t={t}
            isDark={isDark}
            onDonate={() => setShowDonation(true)}
          />
        )}
      </main>

      {/* Navigation inférieure - FIXE */}
      <nav className={`fixed bottom-0 left-0 right-0 ${colors.bgSecondary} border-t ${colors.border} px-2 py-2 z-40`}>
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'text-red-500 bg-red-500/10' 
                  : `${colors.textSecondary} hover:${colors.text}`
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal d'alerte SOS */}
      {alertActive && (
        <AlertModal 
          countDown={countDown}
          location={location}
          contacts={contacts}
          onCancel={cancelSOS}
          generateSMSLink={() => generateSMSLink(contacts, location)}
          isPremium={true}
          onWhatsApp={() => sendWhatsAppToAll(contacts, location)}
          userName={userProfile.getFullName()}
          t={t}
          isDark={isDark}
        />
      )}

      {/* Modal ajout contact rapide */}
      <QuickAddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAdd={addContact}
        onImport={async () => {
          await importFromPhone();
          setShowAddContact(false);
        }}
        t={t}
        isDark={isDark}
      />

      {/* Modal de donation */}
      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
        t={t}
        isDark={isDark}
      />
    </div>
  );
};

export default App;