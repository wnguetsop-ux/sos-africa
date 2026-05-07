# SOS Africa — guide projet pour agents Claude

> Lis ce fichier en premier avant toute modification. Il décrit l'intention, le design system et les pièges à éviter pour ne pas casser l'app.

## 🎯 Intention du produit

App de **sécurité personnelle** pour l'Afrique francophone — déclencher une alerte SOS en un geste, partager sa position, et activer des outils discrets en cas de danger. Cible mobile (Android principalement, iOS aussi). Fonctionne **hors ligne** (GPS natif + cache PWA + fallback service worker).

Public type : personnes isolées en milieu urbain (Yaoundé, Abidjan, Dakar…), femmes/enfants, diaspora qui veut suivre ses proches.

## 🧩 Stack technique

- **React 18.2** + **Vite 5** + **Tailwind 3.4**
- **Capacitor 6** pour le wrapper mobile (Android/iOS) — `@capacitor/geolocation`, `motion`, `haptics`, `status-bar`, `app`, `preferences`, `filesystem`, `@byteowls/capacitor-sms`
- **PWA** : service worker `public/sw.js` (cache `sos-africa-v4`), manifest `public/manifest.json`, icônes `/icon.svg` + `/icons/icon-{192,512}.png`
- **Carte** : Leaflet (CDN unpkg) + tuiles Carto Dark, reverse-geocoding via Nominatim (OSM)
- **i18n** maison : `src/i18n/translations.js` + hook `useI18n` (FR/EN, fallback FR si clé manquante)
- **Pas de router** — navigation par onglets via state local dans `App.jsx`
- **Persistance** : `localStorage` (contacts, historique alertes, code-mot, préférences innovations, profil utilisateur)

## 🎨 Design system (préserver fidèlement)

### Tokens (dans `src/index.css`)

```
--bg            #06080F   (fond panneau)
--bg-3          #04060B   (fond global, theme-color)
--panel         rgba(255,255,255,0.04)
--stroke        rgba(255,255,255,0.08)
--stroke-strong rgba(255,255,255,0.14)
--text          #F4F6FB
--red           #FF2E3F  (SOS, halos, accent principal)
--green         #22D67B  (succès, secure route, journey)
--gold          #F4C24B  (Premium, bouclier doré)
--blue          #3D8BFF  (Position, Alertes nav, info)
--purple        #A06BFF  (IA, sirène, secondaire)
--amber         #FFB020  (vigilance, warning)
```

### Typographie

- **Sora** (`font-display`) — titres, boutons CTA, navigation. Weights 400/500/600/700/800.
- **Manrope** — texte courant (déjà sur `body`). Weights 400/500/600/700/800.
- Polices via Google Fonts dans `index.html` (preconnect inclus).

### Utilitaires CSS critiques (ne pas supprimer)

| Classe | Effet |
|---|---|
| `.glass` / `.glass-strong` | Fond translucide + blur 14-16px (panneaux/cards) |
| `.tap` | Hover lift `translateY(-2px) scale(1.02)`, active feedback |
| `.lift` | Variante card avec hover plus prononcé |
| `.halo-{red,green,gold,blue,purple}` | Glow coloré au hover |
| `.btn-primary-{red,green,gold}` | CTA dégradé + ombre colorée |
| `.text-grad-{red,green,gold}` | Titres en dégradé |
| `.ring-{red,green,gold}` | Bordure 1px + glow externe |
| `.screen-in` | Animation d'entrée 0.35s sur changement d'écran |
| `.map-bg` | Grille pointillée (fond carte avant Leaflet) |
| `.route` | Chemin SVG dashed animé (itinéraire vert) |
| `.switch[.green/.amber][.on]` | Toggle iOS-like, accent par couleur |

### Animations clés

- `pulse-ring` (2.4s) — anneaux concentriques expansifs (bouton SOS, GPS pin)
- `pulse-glow` / `pulse-glow-green` / `pulse-glow-gold` (2-2.6s) — halo coloré pulsant
- `screen-in` (0.35s ease-out) — transition entre écrans
- `rays-rot` (22s linear) — rotation des rayons du bouclier Premium
- `dash` (1s linear) — déplacement du tireté de la route sécurisée
- `blink` (1.2-1.4s) — indicateur REC

## 🗂️ Architecture des écrans

5 onglets gérés par `activeTab` dans `App.jsx` :

```
home      → HomeTab        (bouton SOS radar, statut, actions rapides)
map       → LocationTab    (Leaflet carto-dark, itinéraire, couches)
tools     → ToolsTab       (10 cards glassmorphism, sheets)
contacts  → ContactsTab    (liste, partage SMS/WhatsApp, ajout)
profile   → ProfileTab     (Premium gold, settings, suivi enfant, code-mot, innovations)
```

Overlays plein écran (hors onglets, bypassent `BottomNav`) : `OnboardingScreen`, `GhostMode`, `SirenMode`, `FakeCallScreen`, `AdminPage` (5-tap sur logo), `AlertModal` (alerte active + succès), `PremiumModal` (paiements).

`AppHeader` est rendu sur tous les onglets sauf **profile** (qui a son propre header retour).

## 🧠 Hooks (NE PAS modifier la signature)

Dans `src/hooks/` :

- `useGeolocation()` → `{ location: {lat,lng,accuracy}, loading, error, refresh }`
- `useShakeDetection(onShake, enabled)` — DeviceMotion (iOS 13+ permission)
- `useContacts()` → `{ contacts, addContact, updateContact, removeContact, importFromPhone }`
- `useSMS()` → `{ sendSMS, generateSMSLink, sendWhatsAppToAll, shareLocationWhatsApp }`
- `useAudioRecording()` → `{ isRecording, duration, startRecording, stopRecording, ... }`
- `useJourneyMode(location, contacts, sendSMS)` — mode accompagnement avec auto-alerte
- `useCommunityAlert(location)` — alertes communautaires locales
- `usePremium()` — feature flags Premium (à brancher sur backend plus tard)
- `useUserProfile()` → `{ getFullName, generateAlertMessage, isOnboardingComplete, completeOnboarding, isLoading, ... }`
- `useAlertHistory()` → `{ alerts, addAlert, removeAlert, clearAlerts }`
- `useI18n()` → `{ language, setLanguage, t }`
- `useTheme()` → `{ theme, setTheme, isDark }`
- `useAnalytics()` → `{ trackPageView, trackFeature, trackAlert }` (local-only)
- `useReverseGeocode(location)` → `{ info: {city, country, line, raw}, loading }` — Nominatim avec cache mémoire 110m

## 🚨 Flux SOS (à ne pas casser)

1. Trigger : bouton SOS / shake détecté / mot-code / `triggerSOS('xxx')`
2. `setAlertActive(true)` + `setCountDown(5)` + vibration `[500,200,500,200,500]`
3. `AlertModal` rendu en overlay plein écran avec countdown
4. À chaque seconde : `countDown - 1`. À 0 : `executeEmergencyActions()`
5. `executeEmergencyActions()` : génère le message via `userProfile.generateAlertMessage(location)`, `sendSMS(contacts, message)`, log `alertHistory.addAlert({type, status:'sent', location, contacts})`, vibration `[200,100,200,100,1000]`
6. Si `innovations.autoRecord` : démarre `audioRecording.startRecording()` au moment du déclenchement
7. Cancel : `cancelSOS()` → log `status:'cancelled'`, `setAlertActive(false)`, `vibrate(0)`

**Ne jamais retirer les vibrations ni la persistance dans `alertHistory` — c'est ce qui prouve qu'une alerte a eu lieu.**

## 🛡️ Onglet Profil — fonctionnalités spéciales

- **Suivi enfant** (`showChildTracker`) — UI d'invitation par lien/QR, statut "ça va ?", config push. **Backend Firebase requis pour le temps réel** (voir section Backend).
- **Mot-code SOS silencieux** (`showCodeWord`) — saisi en localStorage `sos_code_word`. À déclencher : taper le mot dans n'importe quel champ texte de l'app → trigger silencieux.
- **Innovations** (toggle dans `innovationsState`, persisté `localStorage:sos_innovations`) :
  - `autoRecord` : démarre l'enregistrement audio au déclenchement SOS
  - `batteryLowAlert` : alerte les contacts si batterie < 10%
  - `safeArrival` : timer "j'aurais dû arriver à tel heure", alerte sinon
- **Admin secret** : 5 taps consécutifs sur le logo → `<AdminPage>` (debug interface)

## 💳 Premium (`PremiumModal`)

3 plans (state local `billing`) :
- **Mensuel** — 1,99 €/mois — essai 7j
- **Annuel** — 19 €/an — -20%, économie ~5 €
- **Famille** — 4,99 €/mois — jusqu'à 5 membres, suivi enfant inclus

3 méthodes de paiement (state local `paymentMethod`) :
- **Mobile Money** (Orange / MTN / Wave) — via CinetPay
- **Carte bancaire / PayPal** — via Stripe
- **Virement** (placeholder)

⚠️ **Aucun backend de paiement n'est encore branché** — le bouton "Confirmer" affiche un toast et ne charge rien. Voir section Backend pour les clés à brancher.

## 🌐 Backend (à connecter quand les clés seront disponibles)

| Feature | Service recommandé | Où brancher |
|---|---|---|
| Suivi enfant temps réel | Firebase Realtime Database / Firestore | nouveau hook `useChildTracker(parentId, childId)` à créer |
| Push notifications | Firebase Cloud Messaging (FCM) + Capacitor Push | hook `usePushNotifications` à créer, branché dans `main.jsx` au boot |
| Vidéo SOS live | Daily.co (10K min/mois gratuits) | bouton "Démarrer vidéo live" dans `ToolsTab` (sheet vidéo) |
| Paiements Mobile Money | CinetPay (3,5%/tx) | endpoint `api/payment/cinetpay` (Vercel Function) |
| Paiements cartes | Stripe (2,9% + 0,30€) | endpoint `api/payment/stripe` |
| Assistant IA | Anthropic Claude API ou OpenAI | endpoint `api/chat` (clé serveur, **JAMAIS** côté client) |

**Les clés API doivent vivre dans Vercel Environment Variables**, jamais dans le code client. Les endpoints serveur vont dans `api/` à la racine (Vercel les détecte auto comme Functions).

## 🚀 Déploiement

- **Repo GitHub** : https://github.com/wnguetsop-ux/sos-africa
- **Vercel** : projet `sos-africa`, équipe `ananfack-williams-projects`
- **URL prod** : https://sos-africa.vercel.app
- **Auto-deploy** : tout push sur `main` déclenche un build + deploy auto. Visible dans le dashboard Vercel.
- **Build** : `npm run build` → `dist/` (Vite)
- **Vérif build local** : `npm run build` doit passer sans erreur, puis `npm run dev` sur localhost:3000

⚠️ Vercel est sur le plan **Hobby/Free**. Conséquences :
- `vercel rollback` ne peut remonter qu'un seul cran
- `vercel alias set <url> sos-africa.vercel.app` permet de contourner cette limite, mais **un nouveau push git écrasera l'alias**
- La méthode propre est toujours de **commiter sur main + push** plutôt qu'un alias manuel

## ⚠️ Pièges à éviter (lessons learned)

1. **Ne jamais déployer en prod via `vercel --prod` depuis le main repo si l'utilisateur a des modifs locales non commitées** — ça pousse des fichiers de travail. Toujours commiter + pousser sur GitHub, laisser Vercel auto-déployer.
2. **Ne pas changer le nom des hooks ni leurs signatures** — les écrans s'attendent aux clés exactes (`location.lat`, `audioRecording.isRecording`, `journeyHook.startJourney(...)`).
3. **Ne pas casser le service worker** — l'app fonctionne hors ligne, c'est critique pour le cas d'usage. Si on bump la version SW (`sos-africa-vN`), ne PAS oublier `caches.delete()` des anciennes versions dans `activate`.
4. **Ne pas supprimer les utilitaires CSS** (`glass`, `tap`, `halo-*`, `btn-primary-*`) — toute l'UI s'écroule.
5. **`color-mix(in oklab, …)`** est utilisé partout pour les teintes accent — supporté Chrome 111+, Safari 16.2+, Firefox 113+. Ça va. Ne pas remplacer par des hex statiques.
6. **`backdrop-filter: blur()`** est essentiel pour le glassmorphism — supporté Capacitor WebView et navigateurs récents.
7. **Le bottom nav doit garder les labels visibles sur mobile 320-414px** — `flex-1 min-w-0 px-1` + `whitespace-nowrap text-ellipsis`. Ne pas re-mettre du `px-3` qui rogne les écritures.
8. **Le bundle Claude Design** (deux fois identique : `AXf25RTzuJCaKCwVjcZY8A` et `TooAeoneCHxRUemuZlupuw`) est implémenté dans cette branche. Inutile de le re-implémenter — vérifier juste que les écrans matchent.

## 📁 Fichiers critiques à connaître

```
src/
├── App.jsx                          # Tab routing, flux SOS, overlays
├── main.jsx                         # Bootstrap + Capacitor init + SW register
├── index.css                        # Tokens, animations, glass utilitaires
├── components/
│   ├── HomeTab.jsx                  # Bouton SOS radar, quick actions, statut
│   ├── LocationTab.jsx              # Leaflet map, route sécurisée, couches
│   ├── ToolsTab.jsx                 # Grille 10 outils, bottom sheets
│   ├── ContactsTab.jsx              # Liste contacts, partage, ajout/edit
│   ├── ProfileTab.jsx               # Premium hero, child tracker, code-word, innovations, settings
│   ├── AlertModal.jsx               # Écran alerte active + écran succès
│   ├── PremiumModal.jsx             # Plans + paiements (modal global)
│   ├── GhostMode.jsx                # Mode furtif (déjà existant)
│   ├── SirenMode.jsx                # Sirène (déjà existant)
│   ├── FakeCallTab.jsx              # Faux appel (déjà existant, alias FakeCallScreen)
│   ├── OnboardingScreen.jsx         # Onboarding initial
│   ├── AdminPage.jsx                # 5-tap secret debug
│   ├── DonationModal.jsx            # Don existant
│   └── ui/
│       ├── AppHeader.jsx            # Logo + statut + cloche + bouton +
│       ├── BottomNav.jsx            # 5 onglets glass pill
│       ├── LeafletMap.jsx           # Wrapper Leaflet (carto dark)
│       ├── atoms.jsx                # Card, Tag, StatusRow, ScreenHeading
│       └── icons.jsx                # ~50 icônes SVG inline (IShield, IBell, IMap, etc.)
├── hooks/                           # Voir liste plus haut
└── i18n/translations.js             # FR + EN (EN tombe sur FR si manquant)
```

## ✅ Quick smoke-test après modif

```bash
npm install      # si node_modules manquant
npm run build    # doit passer sans erreur
npm run dev      # http://localhost:3000
```

Vérifier dans l'ordre :
1. Onboarding s'affiche au premier lancement, puis disparaît
2. Onglet Accueil : bouton SOS rouge pulsant, click → countdown 5s → écran succès vert
3. Onglet Carte : Leaflet charge, position bleue pulse, recentrer fonctionne
4. Onglet Alertes : 10 cards, click "Faux appel" / "Sirène" / "Mode furtif" → overlays plein écran
5. Onglet Contacts : ajout via "+" en haut, partage SMS/WhatsApp/Copier
6. Onglet Profil : bouclier doré tourne, plans Premium toggle Mensuel/Annuel/Famille, settings (langue, thème) fonctionnent
7. PWA : `npm run build` puis ouvrir en `chrome://inspect` ou Lighthouse → "Installable" doit être vert

---

**Dernière mise à jour** : refonte design dark/red/glass + Leaflet + Premium plans + child tracker + innovations toggles + PWA fix (icon.svg, manifest, SW v4). Commit `057f9e1` sur `main`.
