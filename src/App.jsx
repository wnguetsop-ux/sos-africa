import React, { useState, useEffect, useCallback } from 'react';

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
import { usePremiumStatus } from './hooks/usePremiumStatus';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useGeofences } from './hooks/useGeofences';
import { useTaxiRide } from './hooks/useTaxiRide';

// New design components
import AppHeader from './components/ui/AppHeader';
import BottomNav from './components/ui/BottomNav';
import { IShield, IPlus, IX, ICheck } from './components/ui/icons';

// Screens
import HomeTab from './components/HomeTab';
import LocationTab from './components/LocationTab';
import ToolsTab from './components/ToolsTab';
import ContactsTab from './components/ContactsTab';
import ProfileTab from './components/ProfileTab';
import AlertModal from './components/AlertModal';
import GhostMode from './components/GhostMode';
import SirenMode from './components/SirenMode';
import FakeCallScreen from './components/FakeCallTab';
import OnboardingScreen from './components/OnboardingScreen';
import DonationModal from './components/DonationModal';
import PremiumModal from './components/PremiumModal';
import AdminPage from './components/AdminPage';

// Quick add contact modal — restyled to match design
const QuickAddContactModal = ({ isOpen, onClose, onAdd, onImport, t }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('famille');

  if (!isOpen) return null;

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
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="relative w-full max-w-md glass-strong rounded-t-3xl sm:rounded-3xl p-5 sm:m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-extrabold text-white font-display">
            {t('settings.addContact')}
          </h2>
          <button
            onClick={onClose}
            className="tap w-9 h-9 rounded-full glass flex items-center justify-center text-white/85"
            style={{ borderColor: 'var(--stroke)' }}
          >
            <IX size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('settings.fullName')}
            className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40"
            style={{ borderColor: 'var(--stroke)' }}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('settings.phoneNumber')}
            className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95 placeholder-white/40"
            style={{ borderColor: 'var(--stroke)' }}
          />
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl glass text-[13.5px] text-white/95"
            style={{ borderColor: 'var(--stroke)', background: 'rgba(255,255,255,.04)' }}
          >
            <option value="famille">{t('settings.family')}</option>
            <option value="ami">{t('settings.friend')}</option>
            <option value="collegue">{t('settings.colleague')}</option>
            <option value="voisin">{t('settings.neighbor')}</option>
            <option value="autre">{t('settings.other')}</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={onImport}
              className="tap flex-1 py-3 glass rounded-xl text-[13px] font-bold text-white/85"
              style={{ borderColor: 'var(--stroke)' }}
            >
              {t('settings.importContacts')}
            </button>
            <button
              onClick={handleSubmit}
              className="tap flex-1 py-3 btn-primary-red rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5"
            >
              <ICheck size={15} /> {t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // Tab state — 5 tabs per the new design
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
  const [showPremium, setShowPremium] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [innovationsState, setInnovationsState] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('sos_innovations') || 'null') || {
          autoRecord: true,
          batteryLowAlert: true,
          safeArrival: false,
        }
      );
    } catch {
      return { autoRecord: true, batteryLowAlert: true, safeArrival: false };
    }
  });

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
  const { theme, setTheme, isDark } = useTheme();
  const analytics = useAnalytics();
  // Premium status (manual code activation)
  const userId =
    userProfile?.firstName ||
    userProfile?.getFullName?.() ||
    'anonyme';
  const premiumStatus = usePremiumStatus(userId);
  const { isPremium, limits: premiumLimits } = premiumStatus;
  // Push notifications (FCM) - only request when user is interactive,
  // so we don't spam permission popup at boot.
  // On passe aussi le numero de telephone pour permettre le lookup par phone
  // depuis les SOS d'autres utilisateurs.
  // userProfile.profile contient le vrai shape (firstName, lastName, phone, ...)
  const userPhoneFromProfile =
    userProfile?.profile?.phone ||
    userProfile?.phone ||
    null;
  const pushNotifs = usePushNotifications(userId, userPhoneFromProfile);

  // Always-on geofence monitoring (Premium only)
  // Works as long as the app/PWA tab is open in foreground.
  const familyId = typeof window !== 'undefined'
    ? localStorage.getItem('sos_family_id') || ''
    : '';
  useGeofences({
    familyId,
    location,
    userId,
    userName: userProfile.getFullName?.() || userProfile.firstName || userId,
    enabled: isPremium && !!familyId,
  });

  // Taxi ride monitoring (always-on, persisted in localStorage)
  const taxiRide = useTaxiRide({ contacts, sendSMS, location });

  // Shake detection
  const handleShake = useCallback(() => {
    if (shakeEnabled && !alertActive && !ghostMode && userProfile.isOnboardingComplete) {
      analytics.trackFeature('shake');
      triggerSOS('shake');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeEnabled, alertActive, ghostMode, userProfile.isOnboardingComplete]);

  useShakeDetection(handleShake, shakeEnabled);

  // Online / offline
  useEffect(() => {
    if (typeof navigator !== 'undefined') setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // SOS countdown
  useEffect(() => {
    let timer;
    if (alertActive && countDown > 0) {
      timer = setTimeout(() => setCountDown((p) => p - 1), 1000);
    } else if (alertActive && countDown === 0) {
      executeEmergencyActions();
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertActive, countDown]);

  // Admin secret access
  useEffect(() => {
    if (adminTapCount >= 5) {
      setShowAdmin(true);
      setAdminTapCount(0);
    }
    const timer = setTimeout(() => setAdminTapCount(0), 2000);
    return () => clearTimeout(timer);
  }, [adminTapCount]);

  // Page view tracking
  useEffect(() => {
    analytics.trackPageView(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Innovation: battery-low alert. Notifies contacts once when battery drops under 15%.
  useEffect(() => {
    if (!innovationsState?.batteryLowAlert) return;
    if (!navigator.getBattery) return;
    let cancelled = false;
    let battery;
    const onChange = () => {
      if (!battery || cancelled) return;
      const lowKey = 'sos_battery_low_sent';
      const today = new Date().toDateString();
      const sentToday = localStorage.getItem(lowKey) === today;
      if (battery.level < 0.15 && !battery.charging && !sentToday && contacts?.length) {
        const mapsLink = location
          ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
          : '';
        const msg =
          `🔋 SOS Africa — Batterie faible (${Math.round(battery.level * 100)}%). ` +
          `Position : ${mapsLink}. Si je deviens injoignable, contactez-moi.`;
        try {
          sendSMS && sendSMS(contacts, msg);
          localStorage.setItem(lowKey, today);
        } catch {}
      }
    };
    navigator.getBattery().then((b) => {
      if (cancelled) return;
      battery = b;
      onChange();
      b.addEventListener('levelchange', onChange);
      b.addEventListener('chargingchange', onChange);
    });
    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener?.('levelchange', onChange);
        battery.removeEventListener?.('chargingchange', onChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innovationsState?.batteryLowAlert, contacts, location]);

  // Innovation: code-word silent SOS. If user types the code anywhere in the app, trigger silent SOS.
  useEffect(() => {
    const code = (localStorage.getItem('sos_code_word') || '').trim().toLowerCase();
    if (!code || code.length < 3) return;
    let buf = '';
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key && e.key.length === 1) {
        buf = (buf + e.key.toLowerCase()).slice(-32);
        if (buf.endsWith(code)) {
          buf = '';
          if (!alertActive && !ghostMode) {
            analytics.trackFeature('codeword_sos');
            setGhostMode(true);
            setTimeout(() => triggerSOS('codeword'), 200);
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertActive, ghostMode]);

  // Listen for AI-triggered SOS event
  useEffect(() => {
    const onAiSos = () => triggerSOS('ai');
    window.addEventListener('sos-africa:trigger-sos', onAiSos);
    return () => window.removeEventListener('sos-africa:trigger-sos', onAiSos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for cross-tab navigation events
  const [pendingSheet, setPendingSheet] = useState(null);
  useEffect(() => {
    const onNav = (e) => {
      const { tab, sheet } = e.detail || {};
      if (tab) setActiveTab(tab);
      if (sheet) setPendingSheet(sheet);
    };
    window.addEventListener('sos-africa:nav', onNav);
    return () => window.removeEventListener('sos-africa:nav', onNav);
  }, []);

  // Trigger SOS
  const triggerSOS = (type = 'sos') => {
    setAlertActive(true);
    setCountDown(5);
    analytics.trackFeature('sos_triggered');
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    // Innovation: auto-start audio recording when alert is triggered
    if (
      innovationsState?.autoRecord &&
      audioRecording &&
      !audioRecording.isRecording &&
      typeof audioRecording.startRecording === 'function'
    ) {
      try {
        audioRecording.startRecording();
      } catch {}
    }
  };

  // Cancel SOS
  const cancelSOS = () => {
    alertHistory.addAlert({
      type: 'sos',
      status: 'cancelled',
      location,
      contacts,
      cancelled: true,
    });
    setAlertActive(false);
    setCountDown(5);
    if (navigator.vibrate) navigator.vibrate(0);
  };

  // Execute emergency actions — automatique sans page blanche
  const executeEmergencyActions = async () => {
    const message = userProfile.generateAlertMessage(location);
    alertHistory.addAlert({
      type: 'sos',
      status: 'sent',
      location,
      contacts,
      method: 'sms',
    });
    analytics.trackAlert('sos');

    // 1) Push FCM + 2) SMS Africa's Talking en PARALLELE
    //    Push: gratuit, instantane, pour ceux qui ont l'app
    //    SMS: garanti 100% delivery meme sans app, ~6 XAF/SMS
    const phones = (contacts || []).map((c) => c.phone).filter(Boolean);
    const userIds = (contacts || [])
      .map((c) => c.id || c.name)
      .filter(Boolean);

    // 1) Push FCM (gratuit, ne pas attendre)
    try {
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phones,
          userIds,
          familyId,
          title: '🆘 ALERTE SOS',
          body: `${userProfile.getFullName?.() || userId} a déclenché une alerte d'urgence — touche pour voir la position`,
          data: {
            url: location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : '/',
            type: 'sos',
            urgent: 'true',
          },
        }),
      })
        .then((r) => r.json())
        .then((res) => console.log('[SOS] push delivery:', res))
        .catch(() => {});
    } catch {}

    // 2) SMS automatique Africa's Talking (en parallele, payant ~6 XAF/SMS)
    if (phones.length > 0) {
      try {
        const mapsLink = location
          ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
          : '';
        const senderName = userProfile.getFullName?.() || userId || 'Utilisateur';
        // Message court (<160 chars idealement, mais AT supporte >700)
        const smsMessage =
          `🆘 SOS Africa: ${senderName} a declenche une alerte d urgence!\n` +
          (mapsLink ? `Position: ${mapsLink}\n` : '') +
          `Heure: ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\n` +
          `Merci d agir rapidement.`;

        fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phones, message: smsMessage }),
        })
          .then((r) => r.json())
          .then((res) => console.log('[SOS] SMS delivery:', res))
          .catch(() => {});
      } catch {}
    }

    // 2) Logger dans Firestore pour les contacts qui n'ont pas l'app (admin verra)
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('./firebase/config');
      addDoc(collection(db, 'sosAlerts'), {
        userId,
        userName: userProfile.getFullName?.() || userId,
        message,
        location: location || null,
        contactIds: userIds,
        sentAt: serverTimestamp(),
        method: 'auto_push',
      }).catch(() => {});
    } catch {}

    // 3) Vibration confirmation
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 1000]);

    // PAS de window.open(sms:) → plus de page blanche
    // L'utilisateur peut envoyer SMS/WhatsApp manuellement depuis l'écran de succès
  };

  const handleFakeCall = (caller, delay) => {
    analytics.trackFeature('fakecall');
    setTimeout(() => {
      setFakeCallData(caller);
      setFakeCallActive(true);
    }, delay * 1000);
  };

  const handleSiren = () => {
    analytics.trackFeature('siren');
    setSirenActive(true);
  };

  const handleGhostMode = () => {
    analytics.trackFeature('ghost');
    setGhostMode(true);
  };

  const handleShareLocation = () => {
    if (location) {
      shareLocationWhatsApp(contacts, location);
    } else {
      setActiveTab('map');
    }
  };

  const handleSilentSOS = () => {
    analytics.trackFeature('silent_sos');
    setGhostMode(true);
  };

  // Loading
  if (userProfile.isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-3)', color: 'var(--text)' }}
      >
        <div className="text-center">
          <IShield size={56} className="text-[color:var(--red)] mx-auto mb-4" />
          <p className="text-white/70">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Onboarding
  if (!userProfile.isOnboardingComplete) {
    return <OnboardingScreen onComplete={userProfile.completeOnboarding} t={t} />;
  }

  // Admin
  if (showAdmin) {
    return <AdminPage onClose={() => setShowAdmin(false)} />;
  }

  // Ghost mode
  if (ghostMode) {
    return (
      <GhostMode
        location={location}
        onExit={() => setGhostMode(false)}
        onTriggerSOS={() => triggerSOS('ghost')}
      />
    );
  }

  // Siren
  if (sirenActive) {
    return <SirenMode onStop={() => setSirenActive(false)} />;
  }

  // Fake call
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

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100dvh',
        minHeight: '100vh',
        background:
          'radial-gradient(140% 90% at 50% -20%, rgba(255,46,63,.10), transparent 55%), linear-gradient(180deg, #06080F 0%, #04060B 60%, #03050A 100%)',
        color: 'var(--text)',
      }}
    >
      {activeTab !== 'profile' && (
        <AppHeader
          online={isOnline}
          alertsCount={alertHistory?.alerts?.filter((a) => a.status === 'sent').length || 0}
          userInitial={(userProfile.getFullName?.() || 'W').slice(0, 1).toUpperCase()}
          onLogoTap={() => setAdminTapCount((p) => p + 1)}
          onBell={() => setActiveTab('tools')}
          onAdd={() => setShowAddContact(true)}
        />
      )}

      <main
        className="flex-1 min-h-0 overflow-y-auto pb-28 overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {activeTab === 'home' && (
          <HomeTab
            location={location}
            contacts={contacts}
            isOnline={isOnline}
            shakeEnabled={shakeEnabled}
            setShakeEnabled={setShakeEnabled}
            onTriggerSOS={() => triggerSOS('sos')}
            onTriggerSilent={handleSilentSOS}
            onNav={setActiveTab}
            onOpenTaxi={() => setActiveTab('tools')}
            userName={userProfile.getFullName?.()}
            journeyActive={journeyHook.isActive}
            recordingActive={audioRecording.isRecording}
            taxiRide={taxiRide}
            t={t}
          />
        )}

        {activeTab === 'map' && (
          <LocationTab
            location={location}
            gpsLoading={gpsLoading}
            refreshGPS={refreshGPS}
            contacts={contacts}
            sendSMS={sendSMS}
            userProfile={userProfile}
            t={t}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsTab
            t={t}
            audioRecording={audioRecording}
            onFakeCall={handleFakeCall}
            onSiren={handleSiren}
            onGhostMode={handleGhostMode}
            onShareLocation={handleShareLocation}
            communityHook={communityHook}
            journeyHook={journeyHook}
            alertHistory={alertHistory}
            contacts={contacts}
            sendSMS={sendSMS}
            location={location}
            userProfile={userProfile}
            isPremium={isPremium}
            premiumLimits={premiumLimits}
            onUpgrade={() => setShowPremium(true)}
            taxiRide={taxiRide}
            pendingSheet={pendingSheet}
            onPendingSheetConsumed={() => setPendingSheet(null)}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            addContact={addContact}
            updateContact={updateContact}
            removeContact={removeContact}
            importFromPhone={importFromPhone}
            location={location}
            sendSMS={sendSMS}
            shareLocationWhatsApp={shareLocationWhatsApp}
            generateSMSLink={generateSMSLink}
            t={t}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            isDark={isDark}
            userProfile={userProfile}
            alertHistory={alertHistory}
            premiumStatus={premiumStatus}
            pushNotifs={pushNotifs}
            onDonate={() => setShowDonation(true)}
            onUpgrade={() => setShowPremium(true)}
            onAdminTap={() => setAdminTapCount((p) => p + 1)}
            innovationsState={innovationsState}
            setInnovationsState={(next) => {
              setInnovationsState(next);
              try {
                localStorage.setItem('sos_innovations', JSON.stringify(next));
              } catch {}
            }}
            t={t}
          />
        )}
      </main>

      <BottomNav
        active={activeTab}
        onChange={setActiveTab}
        hasAlert={(alertHistory?.alerts?.length || 0) > 0}
        labels={{
          home: t('nav.home'),
          map: t('nav.location'),
          tools: t('nav.tools'),
          contacts: t('nav.contacts') || 'Contacts',
          profile: t('nav.profile') || 'Profil',
        }}
      />

      {/* Active SOS overlay */}
      {alertActive && (
        <AlertModal
          countDown={countDown}
          location={location}
          contacts={contacts}
          onCancel={cancelSOS}
          generateSMSLink={() => generateSMSLink(contacts, location)}
          isPremium={true}
          onWhatsApp={() => sendWhatsAppToAll(contacts, location)}
          t={t}
        />
      )}

      <QuickAddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAdd={addContact}
        onImport={async () => {
          await importFromPhone();
          setShowAddContact(false);
        }}
        t={t}
      />

      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
        t={t}
        isDark={isDark}
      />

      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        t={t}
        userProfile={userProfile}
      />
    </div>
  );
};

export default App;
