import React, { useState, useRef, useEffect } from 'react';
import {
  IVideo,
  IMask,
  IPhoneIncoming,
  ISiren,
  IFamily,
  IHistory,
  IBrain,
  IShare,
  IMic,
  ICar,
  IChevronRight,
  IPlay,
  IX,
  ICheck,
  IAlert,
  IClock,
  IPin,
  IPhone,
  ILock,
} from './ui/icons';
import { ScreenHeading } from './ui/atoms';
import AudioSheet from './sheets/AudioSheet';
import VideoSheet from './sheets/VideoSheet';
import FamilySheet from './sheets/FamilySheet';
import AISheet from './sheets/AISheet';
import GeofencesSheet from './sheets/GeofencesSheet';
import TaxiSafeSheet from './sheets/TaxiSafeSheet';
import FakeCompanionSheet from './sheets/FakeCompanionSheet';
import VaultSheet from './sheets/VaultSheet';
import PremiumGate from './ui/PremiumGate';

const ACCENT = {
  red: 'var(--red)',
  green: 'var(--green)',
  amber: 'var(--amber)',
  gold: 'var(--gold)',
  blue: 'var(--blue)',
  purple: 'var(--purple)',
};

const ToolCard = ({ icon: Icn, title, desc, color = 'red', halo, badge, onClick }) => {
  const c = ACCENT[color] || ACCENT.red;
  const haloClass =
    halo ||
    (color === 'red'
      ? 'halo-red'
      : color === 'green'
      ? 'halo-green'
      : color === 'amber' || color === 'gold'
      ? 'halo-gold'
      : color === 'blue'
      ? 'halo-blue'
      : 'halo-purple');
  return (
    <button
      onClick={onClick}
      className={`tap relative glass rounded-2xl p-3.5 text-left flex flex-col gap-2 ${haloClass} overflow-hidden`}
      style={{ borderColor: 'var(--stroke)', minHeight: 148 }}
    >
      <span
        className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{ background: c, boxShadow: `0 0 10px ${c}` }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: `color-mix(in oklab, ${c} 14%, transparent)`,
          color: c,
          border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
          boxShadow: `0 0 18px color-mix(in oklab, ${c} 25%, transparent), inset 0 0 12px color-mix(in oklab, ${c} 18%, transparent)`,
        }}
      >
        <Icn size={22} />
      </div>
      <div className="text-[14px] font-extrabold text-white leading-tight font-display">
        {title}
      </div>
      <div className="text-[11.5px] text-white/55 leading-snug">{desc}</div>
      {badge && (
        <div
          className="absolute bottom-3 left-3 px-1.5 py-0.5 rounded-md text-[9.5px] font-extrabold tracking-wider uppercase"
          style={{
            color: c,
            background: `color-mix(in oklab, ${c} 20%, transparent)`,
            border: `1px solid color-mix(in oklab, ${c} 40%, transparent)`,
          }}
        >
          {badge}
        </div>
      )}
      <div className="absolute bottom-3 right-3 text-white/35">
        <IChevronRight size={14} />
      </div>
    </button>
  );
};

const ToolsTab = ({
  t,
  audioRecording,
  onFakeCall,
  onSiren,
  onGhostMode,
  onShareLocation,
  communityHook,
  journeyHook,
  alertHistory,
  contacts,
  sendSMS,
  location,
  userProfile,
  isPremium = false,
  premiumLimits = null,
  onUpgrade,
  taxiRide,
  pendingSheet,
  onPendingSheetConsumed,
}) => {
  const [activeSheet, setActiveSheet] = useState(null);
  const [selectedCaller, setSelectedCaller] = useState('Maman');
  const [callDelay, setCallDelay] = useState(5);
  const [journeyDest, setJourneyDest] = useState('');
  const [journeyTime, setJourneyTime] = useState(30);
  const [platePhoto, setPlatePhoto] = useState(null);
  const [plateNote, setPlateNote] = useState('');
  const [plateAlertMode, setPlateAlertMode] = useState(false);
  const [plateSentToast, setPlateSentToast] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const callers = [
    { id: 'mom', name: 'Maman', emoji: '👩' },
    { id: 'dad', name: 'Papa', emoji: '👨' },
    { id: 'boss', name: 'Patron', emoji: '👔' },
    { id: 'friend', name: 'Ami(e)', emoji: '👋' },
    { id: 'doctor', name: 'Médecin', emoji: '👨‍⚕️' },
    { id: 'taxi', name: 'Taxi', emoji: '🚕' },
  ];

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      alert("Impossible d'accéder à la caméra");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setPlatePhoto(canvas.toDataURL('image/jpeg', 0.8));
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
  };

  const savePlatePhoto = () => {
    if (!platePhoto) return;
    const stamp = new Date().toISOString();
    const entry = {
      id: Date.now(),
      photo: platePhoto,
      note: plateNote,
      timestamp: stamp,
      location: location ? { lat: location.lat, lng: location.lng } : null,
      alertSent: plateAlertMode,
    };
    const saved = JSON.parse(localStorage.getItem('sos_plate_photos') || '[]');
    saved.push(entry);
    localStorage.setItem('sos_plate_photos', JSON.stringify(saved));

    // Auto-send SMS to contacts when alert mode is on
    if (plateAlertMode && sendSMS && contacts && contacts.length) {
      const mapsLink = location
        ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
        : '';
      const msg =
        `🆘 SOS Africa — Plaque relevée par sécurité.\n` +
        (plateNote ? `Note : ${plateNote}\n` : '') +
        (mapsLink ? `Position : ${mapsLink}\n` : '') +
        `Heure : ${new Date().toLocaleString('fr-FR')}\n` +
        `Si je ne donne pas de nouvelles, contactez la police.`;
      try {
        sendSMS(contacts, msg);
      } catch {}
      if (alertHistory?.addAlert) {
        alertHistory.addAlert({
          type: 'plate',
          status: 'sent',
          location,
          contacts,
          method: 'sms',
          note: plateNote,
        });
      }
    }

    setPlatePhoto(null);
    setPlateNote('');
    const wasAlert = plateAlertMode;
    setPlateAlertMode(false);
    setActiveSheet(null);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    if (wasAlert) {
      setPlateSentToast(true);
      setTimeout(() => setPlateSentToast(false), 3000);
    }
  };

  // Honor pending sheet from external nav (e.g. from ChildTracker → 'family')
  useEffect(() => {
    if (pendingSheet) {
      setActiveSheet(pendingSheet);
      onPendingSheetConsumed && onPendingSheetConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSheet]);

  // Lock body scroll + force scroll-top quand une sheet s'ouvre, restore a la fermeture
  useEffect(() => {
    if (activeSheet) {
      const prevOverflow = document.body.style.overflow;
      const prevScrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      // Le contenu de la sheet doit demarrer en haut
      window.scrollTo({ top: 0, behavior: 'instant' });
      return () => {
        document.body.style.overflow = prevOverflow;
        window.scrollTo({ top: prevScrollY, behavior: 'instant' });
      };
    }
  }, [activeSheet]);

  const closeSheet = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    setActiveSheet(null);
    setPlatePhoto(null);
  };

  const cards = [
    {
      id: 'video',
      icon: IVideo,
      color: 'red',
      title: t ? t('tools.videoLive') || 'SOS vidéo live' : 'SOS vidéo live',
      badge: !isPremium ? 'PREMIUM' : null,
      desc: t
        ? t('tools.videoLiveDesc') || 'Diffusez votre vidéo en direct.'
        : 'Diffusez votre vidéo en direct.',
      onClick: () => setActiveSheet('video'),
    },
    {
      id: 'ghost',
      icon: IMask,
      color: 'amber',
      title: t ? t('tools.ghost') || 'Mode furtif' : 'Mode furtif',
      desc: t
        ? t('tools.ghostDesc') || "Masquez l'app, alertes discrètes."
        : "Masquez l'app, alertes discrètes.",
      onClick: onGhostMode,
    },
    {
      id: 'fakecall',
      icon: IPhoneIncoming,
      color: 'green',
      title: t ? t('tools.fakeCall') || 'Faux appel' : 'Faux appel',
      desc: t
        ? t('tools.fakeCallDesc') || 'Simulez un appel entrant.'
        : 'Simulez un appel entrant.',
      onClick: () => setActiveSheet('fakecall'),
    },
    {
      id: 'siren',
      icon: ISiren,
      color: 'purple',
      title: t ? t('tools.siren') || "Sirène d'urgence" : "Sirène d'urgence",
      desc: t
        ? t('tools.sirenDesc') || 'Alarme puissante pour attirer l\'attention.'
        : 'Alarme puissante pour attirer l\'attention.',
      onClick: onSiren,
    },
    {
      id: 'geofences',
      icon: IPin,
      color: 'blue',
      title: 'Zones de confiance',
      desc: 'École, maison, bureau — alerte auto sur entrée/sortie.',
      onClick: () => setActiveSheet('geofences'),
      badge: !isPremium ? 'PREMIUM' : null,
    },
    {
      id: 'taxi',
      icon: ICar,
      color: 'amber',
      title: 'Mode Taxi Safe',
      desc: 'Avant de monter : photo plaque + check-in toutes les 3 min.',
      onClick: () => setActiveSheet('taxi'),
      badge: taxiRide?.activeRide
        ? 'EN COURS'
        : !isPremium
        ? 'PREMIUM'
        : null,
    },
    {
      id: 'companion',
      icon: IPhone,
      color: 'purple',
      title: 'Faux compagnon vocal',
      desc: 'Voix qui parle "comme si" pour décourager les agresseurs.',
      onClick: () => setActiveSheet('companion'),
      badge: !isPremium ? 'PREMIUM' : null,
    },
    {
      id: 'vault',
      icon: ILock,
      color: 'blue',
      title: 'Coffre-fort documents',
      desc: 'Pièces ID, vaccins, contrats — toujours sous la main.',
      onClick: () => setActiveSheet('vault'),
      badge: !isPremium ? '3 GRATUITS' : null,
    },
    {
      id: 'family',
      icon: IFamily,
      color: 'blue',
      title: t ? t('tools.family') || 'Mode famille' : 'Mode famille',
      desc: t
        ? t('tools.familyDesc') || 'Restez connecté à vos proches.'
        : 'Restez connecté à vos proches.',
      onClick: () => setActiveSheet('family'),
      badge: journeyHook?.isActive ? 'ACTIF' : null,
    },
    {
      id: 'history',
      icon: IHistory,
      color: 'amber',
      title: t ? t('tools.history') || 'Historique' : 'Historique',
      desc: t
        ? t('tools.historyDesc') || 'Vos alertes et activités passées.'
        : 'Vos alertes et activités passées.',
      onClick: () => setActiveSheet('history'),
    },
    {
      id: 'audio',
      icon: IMic,
      color: 'red',
      title: t ? t('tools.audio') || 'Enregistrement' : 'Enregistrement',
      desc: t
        ? t('tools.audioDesc') || 'Capturez de l\'audio discrètement.'
        : 'Capturez de l\'audio discrètement.',
      onClick: () => setActiveSheet('audio'),
      badge: audioRecording?.isRecording ? '● REC' : null,
    },
    {
      id: 'plate',
      icon: ICar,
      color: 'purple',
      title: t ? t('tools.plate') || 'Photo plaque' : 'Photo plaque',
      desc: t
        ? t('tools.plateDesc') || 'Photographier une plaque.'
        : 'Photographier une plaque.',
      onClick: () => setActiveSheet('plate'),
    },
    {
      id: 'ai',
      icon: IBrain,
      color: 'purple',
      title: t ? t('tools.ai') || 'Assistant IA' : 'Assistant IA',
      desc: t
        ? t('tools.aiDesc') || 'Conseils intelligents et contextuels.'
        : 'Conseils intelligents et contextuels.',
      onClick: () => setActiveSheet('ai'),
    },
    {
      id: 'share',
      icon: IShare,
      color: 'blue',
      title: t ? t('tools.share') || 'Partager position' : 'Partager position',
      desc: t
        ? t('tools.shareDesc') || 'En temps réel à vos contacts.'
        : 'En temps réel à vos contacts.',
      onClick: onShareLocation,
    },
  ];

  return (
    <div className="screen-in pb-32">
      <ScreenHeading
        title={t ? t('tools.title') || 'Outils de sécurité' : 'Outils de sécurité'}
        subtitle={
          t
            ? t('tools.subtitle') || 'Des outils puissants pour vous protéger.'
            : 'Des outils puissants pour vous protéger.'
        }
      />

      <div className="px-5 grid grid-cols-2 gap-2.5">
        {cards.map((card) => (
          <ToolCard key={card.id} {...card} />
        ))}
      </div>

      {plateSentToast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 px-4 py-3 rounded-2xl glass-strong text-[13px] font-bold text-white flex items-center gap-2"
             style={{ borderColor: 'rgba(34,214,123,.4)', boxShadow: '0 12px 40px rgba(34,214,123,.3)' }}>
          <ICheck size={16} className="text-[color:var(--green)]" /> Plaque sauvegardée et SMS envoyé aux contacts
        </div>
      )}

      {/* Full-screen modal sheets — visible immediately, no scroll needed */}
      {activeSheet && (
        <div
          className="fixed inset-0 z-40 flex flex-col"
          style={{
            background:
              'radial-gradient(140% 90% at 50% -20%, rgba(255,46,63,.10), transparent 55%), linear-gradient(180deg, #06080F 0%, #04060B 60%, #03050A 100%)',
            animation: 'screen-in 0.25s ease-out both',
          }}
        >
          <div
            className="relative w-full max-w-md mx-auto px-4 pt-3 pb-4 flex flex-col flex-1 min-h-0"
            style={{ borderBottom: 0 }}>
            <div className="flex items-center gap-2 mb-3 flex-shrink-0 pt-1">
              <button onClick={closeSheet} className="tap w-10 h-10 rounded-full glass flex items-center justify-center text-white/85"
                      style={{ borderColor: 'var(--stroke)' }} aria-label="Retour">
                <IChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <div className="text-[18px] font-extrabold text-white font-display flex-1">
                {activeSheet === 'fakecall' ? 'Faux appel' : null}
                {activeSheet === 'plate' ? 'Photo plaque' : null}
                {activeSheet === 'family' ? 'Mode famille' : null}
                {activeSheet === 'audio' ? 'Enregistrement audio' : null}
                {activeSheet === 'history' ? 'Historique' : null}
                {activeSheet === 'video' ? 'SOS vidéo live' : null}
                {activeSheet === 'ai' ? 'Assistant IA' : null}
                {activeSheet === 'geofences' ? 'Zones de confiance' : null}
                {activeSheet === 'taxi' ? 'Mode Taxi Safe' : null}
                {activeSheet === 'companion' ? 'Faux compagnon' : null}
                {activeSheet === 'vault' ? 'Coffre-fort' : null}
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-6"
                 style={{ WebkitOverflowScrolling: 'touch' }}>

            {activeSheet === 'fakecall' && (
              <div className="space-y-4">
                <p className="text-[12.5px] text-white/65">
                  Choisissez un correspondant et un délai.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {callers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCaller(c.name)}
                      className="tap glass rounded-xl p-2.5 flex flex-col items-center gap-1 halo-green"
                      style={{
                        borderColor:
                          selectedCaller === c.name
                            ? 'rgba(34,214,123,.5)'
                            : 'var(--stroke)',
                        background:
                          selectedCaller === c.name
                            ? 'rgba(34,214,123,.10)'
                            : undefined,
                      }}
                    >
                      <span className="text-2xl">{c.emoji}</span>
                      <span className="text-[11px] font-bold text-white/85">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div>
                  <div className="text-[11.5px] text-white/55 mb-2">Délai</div>
                  <div className="flex gap-2">
                    {[5, 10, 30, 60].map((d) => (
                      <button
                        key={d}
                        onClick={() => setCallDelay(d)}
                        className="tap flex-1 py-2 rounded-xl text-[12px] font-bold halo-green"
                        style={{
                          color: callDelay === d ? 'var(--green)' : 'rgba(255,255,255,.6)',
                          background:
                            callDelay === d ? 'rgba(34,214,123,.12)' : 'transparent',
                          border: `1px solid ${
                            callDelay === d ? 'rgba(34,214,123,.4)' : 'var(--stroke)'
                          }`,
                        }}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onFakeCall && onFakeCall({ name: selectedCaller }, callDelay);
                    closeSheet();
                  }}
                  className="tap btn-primary-green w-full py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2"
                >
                  <IPhoneIncoming size={16} /> Programmer l'appel
                </button>
              </div>
            )}

            {activeSheet === 'plate' && (
              <div className="space-y-3">
                <p className="text-[12px] text-white/60">
                  📸 Photographiez la plaque avant de monter dans un taxi ou véhicule. Activez « Envoyer aux contacts » si vous sentez un danger : la photo sera sauvegardée et un SMS partira automatiquement à vos proches avec votre position.
                </p>
                {!platePhoto ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-48 bg-black rounded-xl object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <button onClick={openCamera} className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/90 halo-purple"
                              style={{ borderColor: 'var(--stroke)' }}>
                        Ouvrir caméra
                      </button>
                      <button onClick={capturePhoto} className="tap btn-primary-green flex-1 py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5">
                        <ICheck size={15} /> Capturer
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={platePhoto} alt="Plaque" className="w-full h-48 object-cover rounded-xl" />
                    <input
                      type="text"
                      value={plateNote}
                      onChange={(e) => setPlateNote(e.target.value)}
                      placeholder="Note (ex: Taxi jaune, direction aéroport…)"
                      className="w-full px-3 py-2.5 rounded-xl glass text-[13px] text-white/90 placeholder-white/40"
                      style={{ borderColor: 'var(--stroke)' }}
                    />

                    <button
                      onClick={() => setPlateAlertMode(!plateAlertMode)}
                      className="w-full glass rounded-xl p-3 flex items-center justify-between halo-red"
                      style={{
                        borderColor: plateAlertMode ? 'rgba(255,46,63,.45)' : 'var(--stroke)',
                        background: plateAlertMode ? 'rgba(255,46,63,.10)' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: plateAlertMode ? 'rgba(255,46,63,.18)' : 'rgba(255,255,255,.06)',
                            color: plateAlertMode ? 'var(--red)' : 'rgba(255,255,255,.6)',
                            border: `1px solid ${plateAlertMode ? 'rgba(255,46,63,.4)' : 'var(--stroke)'}`,
                          }}
                        >
                          <IAlert size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-white">Envoyer aux contacts</div>
                          <div className="text-[11px] text-white/55">
                            {contacts?.length || 0} contact(s) recevront un SMS de sécurité.
                          </div>
                        </div>
                      </div>
                      <span className={`switch ${plateAlertMode ? 'on' : ''}`} aria-hidden />
                    </button>

                    <div className="flex gap-2">
                      <button onClick={() => setPlatePhoto(null)} className="tap glass flex-1 py-3 rounded-xl text-[13px] font-bold text-white/90"
                              style={{ borderColor: 'var(--stroke)' }}>
                        Reprendre
                      </button>
                      <button
                        onClick={savePlatePhoto}
                        className={`tap flex-1 py-3 rounded-xl text-[13px] font-bold ${
                          plateAlertMode ? 'btn-primary-red' : 'btn-primary-green'
                        }`}
                      >
                        {plateAlertMode ? 'Sauvegarder & alerter' : 'Sauvegarder'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeSheet === 'family' && (
              <FamilySheet
                userProfile={userProfile}
                location={location}
                sendSMS={sendSMS}
                journeyHook={journeyHook}
                isPremium={isPremium}
                maxMembers={premiumLimits?.family?.maxMembers || 2}
                onUpgrade={() => {
                  closeSheet();
                  setTimeout(() => onUpgrade && onUpgrade(), 80);
                }}
                onClose={closeSheet}
              />
            )}

            {activeSheet === 'companion' && (
              <PremiumGate
                isPremium={isPremium}
                title="Faux compagnon vocal"
                description="Une voix qui parle à voix haute comme si quelqu'un t'attendait. Idéal quand tu rentres seule la nuit ou que tu te sens suivie."
                benefits={[
                  '4 scénarios de conversation réalistes',
                  'Voix masculine ou féminine selon contexte',
                  'Lecture sans connexion internet',
                  'Volume max conseillé',
                ]}
                onUpgrade={() => {
                  closeSheet();
                  setTimeout(() => onUpgrade && onUpgrade(), 80);
                }}
              >
                <FakeCompanionSheet onClose={closeSheet} />
              </PremiumGate>
            )}

            {activeSheet === 'vault' && (
              <VaultSheet
                userProfile={userProfile}
                isPremium={isPremium}
                onUpgrade={() => {
                  closeSheet();
                  setTimeout(() => onUpgrade && onUpgrade(), 80);
                }}
              />
            )}

            {activeSheet === 'taxi' && (
              <PremiumGate
                isPremium={isPremium}
                title="Mode Taxi Safe"
                description="Pour ne plus jamais monter dans un taxi sans filet : photo de la plaque + suivi auto + alerte si tu ne réponds pas."
                benefits={[
                  'Photo plaque sauvegardée en cloud',
                  'Check-in auto toutes les 3 min',
                  'SMS d\'alerte automatique si pas de réponse',
                  'Historique de tous tes trajets',
                  'Bouton SOS d\'urgence pendant le trajet',
                ]}
                onUpgrade={() => {
                  closeSheet();
                  setTimeout(() => onUpgrade && onUpgrade(), 80);
                }}
              >
                <TaxiSafeSheet
                  contacts={contacts}
                  sendSMS={sendSMS}
                  location={location}
                  userProfile={userProfile}
                  taxiRide={taxiRide}
                  onClose={closeSheet}
                />
              </PremiumGate>
            )}

            {activeSheet === 'geofences' && (
              <PremiumGate
                isPremium={isPremium}
                title="Zones de confiance"
                description="Définis des zones (école, maison, bureau) et reçois une notification dès qu'un membre de ta famille y entre ou en sort."
                benefits={[
                  'Jusqu\'à 10 zones par famille',
                  'Alertes instantanées (entrée et sortie)',
                  'Historique des passages',
                  'Couleurs personnalisées par zone',
                ]}
                onUpgrade={() => {
                  closeSheet();
                  setTimeout(() => onUpgrade && onUpgrade(), 80);
                }}
              >
                <GeofencesSheet
                  familyId={
                    typeof window !== 'undefined'
                      ? localStorage.getItem('sos_family_id') || ''
                      : ''
                  }
                  location={location}
                  userProfile={userProfile}
                  notifPermission={
                    typeof Notification !== 'undefined'
                      ? Notification.permission
                      : 'default'
                  }
                  onRequestNotifPermission={async () => {
                    if (typeof Notification === 'undefined') return;
                    try {
                      await Notification.requestPermission();
                    } catch {}
                  }}
                />
              </PremiumGate>
            )}

            {activeSheet === 'audio' && (
              <AudioSheet
                audioRecording={audioRecording}
                contacts={contacts}
                sendSMS={sendSMS}
                location={location}
                onClose={closeSheet}
              />
            )}

            {activeSheet === 'history' && (
              <div className="space-y-2">
                {alertHistory?.alerts?.length ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] text-white/60">
                        {alertHistory.alerts.length} alerte(s) enregistrée(s)
                      </p>
                      {alertHistory.clearAll && (
                        <button
                          onClick={() => alertHistory.clearAll()}
                          className="text-[11px] font-bold text-white/55 hover:text-white"
                        >
                          Vider
                        </button>
                      )}
                    </div>
                    {[...alertHistory.alerts]
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .slice(0, 30)
                      .map((alert) => {
                        const sent = alert.status === 'sent';
                        const c = sent
                          ? 'var(--green)'
                          : alert.status === 'cancelled'
                          ? 'var(--amber)'
                          : 'var(--red)';
                        return (
                          <div
                            key={alert.id}
                            className="glass rounded-xl p-3 flex items-center gap-3"
                            style={{ borderColor: 'var(--stroke)' }}
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                background: `color-mix(in oklab, ${c} 14%, transparent)`,
                                color: c,
                                border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
                              }}
                            >
                              {alert.type === 'plate' ? <ICar size={15} /> : <IAlert size={15} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] font-bold text-white leading-tight">
                                {alert.type === 'plate'
                                  ? 'Photo plaque'
                                  : alert.type === 'sos'
                                  ? 'Alerte SOS'
                                  : alert.type}
                                {' · '}
                                <span style={{ color: c }}>
                                  {alert.status === 'sent'
                                    ? 'envoyée'
                                    : alert.status === 'cancelled'
                                    ? 'annulée'
                                    : alert.status}
                                </span>
                              </div>
                              <div className="text-[10.5px] text-white/55 truncate">
                                {new Date(alert.timestamp).toLocaleString('fr-FR')}
                                {alert.contacts?.length
                                  ? ` · ${alert.contacts.length} contact(s)`
                                  : ''}
                              </div>
                            </div>
                            {alertHistory.removeAlert && (
                              <button
                                onClick={() => alertHistory.removeAlert(alert.id)}
                                className="tap text-white/40 hover:text-white/70"
                                aria-label="Supprimer"
                              >
                                <IX size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </>
                ) : (
                  <p className="text-[12px] text-white/55 text-center py-8">
                    Aucune alerte enregistrée pour l'instant.
                  </p>
                )}
              </div>
            )}

            {activeSheet === 'video' && (
              <PremiumGate
                isPremium={isPremium}
                title="SOS Vidéo Live"
                description="Diffuse une vidéo en direct à tes contacts d'urgence — uniquement pour les membres Premium."
                benefits={[
                  'Vidéo + audio HD jusqu\'à 10 minutes',
                  'Upload automatique sur cloud sécurisé',
                  'Lien partagé par SMS aux contacts',
                  'Caméra avant ou arrière',
                ]}
                onUpgrade={() => {
                  closeSheet();
                  setTimeout(() => onUpgrade && onUpgrade(), 80);
                }}
              >
                <VideoSheet
                  contacts={contacts}
                  sendSMS={sendSMS}
                  location={location}
                  userProfile={userProfile}
                  onClose={closeSheet}
                />
              </PremiumGate>
            )}

            {activeSheet === 'ai' && (
              <AISheet
                location={location}
                language={t ? 'fr' : 'fr'}
                isPremium={isPremium}
                onUpgrade={() => {
                  closeSheet();
                  setTimeout(() => onUpgrade && onUpgrade(), 80);
                }}
                onAction={(actionId) => {
                  // Map AI suggested actions to app handlers
                  if (actionId === 'siren') {
                    onSiren?.();
                    closeSheet();
                  } else if (actionId === 'share-location') {
                    onShareLocation?.();
                    closeSheet();
                  } else if (actionId === 'fake-call') {
                    closeSheet();
                    setTimeout(() => setActiveSheet('fakecall'), 80);
                  } else if (actionId === 'ghost') {
                    onGhostMode?.();
                    closeSheet();
                  } else if (actionId === 'video') {
                    closeSheet();
                    setTimeout(() => setActiveSheet('video'), 80);
                  } else if (actionId === 'audio-record') {
                    closeSheet();
                    setTimeout(() => setActiveSheet('audio'), 80);
                  } else if (actionId === 'family') {
                    closeSheet();
                    setTimeout(() => setActiveSheet('family'), 80);
                  } else if (actionId === 'sos') {
                    // Bubble up via window event to App.jsx
                    window.dispatchEvent(new CustomEvent('sos-africa:trigger-sos'));
                    closeSheet();
                  }
                }}
              />
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsTab;
