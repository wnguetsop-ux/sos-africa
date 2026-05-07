import React, { useEffect, useRef, useState } from 'react';
import { IPhone, IPlay, IX, ICheck, IInfo } from '../ui/icons';

const SCENARIOS = [
  {
    id: 'partner_arriving',
    label: '👨 Mon mari arrive me chercher',
    description: 'Conversation forte avec un homme qui dit qu\'il arrive dans 5 min.',
    voicePref: 'male',
    lines: [
      { delay: 200, text: "Allô chérie, tu es où là ?" },
      { delay: 4000, text: "OK je vois, je sors de la maison maintenant." },
      { delay: 8000, text: "Reste où tu es, je suis là dans cinq minutes." },
      { delay: 13000, text: "Je vais raccrocher, je conduis. À tout de suite." },
      { delay: 17000, text: "Si quelqu'un t'embête, dis-lui que je suis policier." },
      { delay: 21000, text: "OK ma chérie, à dans cinq minutes. Je t'aime." },
    ],
  },
  {
    id: 'father_waiting',
    label: '👴 Mon père m\'attend en bas',
    description: 'Voix d\'un père inquiet qui attend devant la maison.',
    voicePref: 'male',
    lines: [
      { delay: 200, text: "Ma fille, je suis devant l'immeuble depuis tout à l'heure." },
      { delay: 5000, text: "Tu fais quoi ? Dépêche-toi, j'attends dans la voiture." },
      { delay: 9000, text: "Bon, je monte te chercher si tu n'arrives pas dans deux minutes." },
      { delay: 14000, text: "Ouais ouais, je suis là, ne t'inquiète pas." },
      { delay: 18000, text: "Allez ma fille, à tout de suite." },
    ],
  },
  {
    id: 'boss_call',
    label: '💼 Mon patron au téléphone',
    description: 'Conversation professionnelle, ton autoritaire.',
    voicePref: 'male',
    lines: [
      { delay: 200, text: "Allô oui, c'est moi." },
      { delay: 3500, text: "Oui patron, je sais, je suis en route au bureau." },
      { delay: 8000, text: "Le client arrive dans dix minutes ? D'accord je serai là." },
      { delay: 13000, text: "Non non, je ne suis pas seule, mon collègue est avec moi." },
      { delay: 17000, text: "OK, à tout de suite chef. Au revoir." },
    ],
  },
  {
    id: 'friend_visio',
    label: '👯 Vidéo-call avec mon amie',
    description: 'Voix féminine, ambiance amicale qui simule un appel vidéo.',
    voicePref: 'female',
    lines: [
      { delay: 200, text: "Ma chérie tu es où là ? Je te vois pas bien !" },
      { delay: 4500, text: "Reste connectée, j'envoie ma localisation à ton frère aussi." },
      { delay: 9000, text: "Je préviens la police quand même au cas où, hein." },
      { delay: 13500, text: "Allez courage, je reste en ligne avec toi jusqu'à ce que tu arrives." },
    ],
  },
];

const FakeCompanionSheet = ({ onClose }) => {
  const [running, setRunning] = useState(null); // scenario id
  const [progress, setProgress] = useState(0); // 0..1
  const [voicesReady, setVoicesReady] = useState(false);
  const [error, setError] = useState(null);
  const timeoutsRef = useRef([]);
  const startedAtRef = useRef(0);
  const totalDurationRef = useRef(0);
  const tickRef = useRef(null);

  // Wait for voices to load (Chrome async)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('Synthèse vocale non disponible sur ce navigateur.');
      return;
    }
    const checkVoices = () => {
      const list = window.speechSynthesis.getVoices() || [];
      if (list.length > 0) setVoicesReady(true);
    };
    checkVoices();
    window.speechSynthesis.onvoiceschanged = checkVoices;
    return () => {
      try {
        window.speechSynthesis.onvoiceschanged = null;
      } catch {}
    };
  }, []);

  const pickVoice = (preference) => {
    if (!window.speechSynthesis) return null;
    const all = window.speechSynthesis.getVoices() || [];
    // Prefer French voices first
    const fr = all.filter((v) => /fr/i.test(v.lang));
    const candidates = fr.length ? fr : all;
    if (preference === 'male') {
      // Heuristic — names often contain hints
      const male =
        candidates.find((v) => /male|homme|thomas|nicolas|antoine|paul|daniel/i.test(v.name)) ||
        candidates.find((v) => !/female|femme|amelie|virginie|julie|sophie|marie/i.test(v.name));
      if (male) return male;
    }
    if (preference === 'female') {
      const female = candidates.find((v) =>
        /female|femme|amelie|virginie|julie|sophie|marie/i.test(v.name)
      );
      if (female) return female;
    }
    return candidates[0] || null;
  };

  const stopAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setRunning(null);
    setProgress(0);
  };

  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = (scenario) => {
    setError(null);
    if (!window.speechSynthesis) {
      setError('Synthèse vocale non disponible.');
      return;
    }
    stopAll();
    setRunning(scenario.id);
    startedAtRef.current = Date.now();
    const lastLine = scenario.lines[scenario.lines.length - 1];
    totalDurationRef.current = (lastLine?.delay || 0) + 4000; // approx avg line length

    const voice = pickVoice(scenario.voicePref);

    scenario.lines.forEach((line) => {
      const id = setTimeout(() => {
        try {
          const utter = new SpeechSynthesisUtterance(line.text);
          utter.lang = 'fr-FR';
          if (voice) utter.voice = voice;
          utter.rate = 0.95;
          utter.pitch = scenario.voicePref === 'male' ? 0.85 : 1.05;
          utter.volume = 1.0;
          // iOS Safari quirk: reset queue
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        } catch (err) {
          setError('Erreur de lecture vocale');
        }
      }, line.delay);
      timeoutsRef.current.push(id);
    });

    // End scenario after last line + buffer
    const endTimeout = setTimeout(() => {
      stopAll();
    }, totalDurationRef.current);
    timeoutsRef.current.push(endTimeout);

    // Progress tick (UI)
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setProgress(Math.min(1, elapsed / totalDurationRef.current));
    }, 200);

    // Vibration during
    if (navigator.vibrate) {
      navigator.vibrate([100, 200, 100]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(160,107,255,.18), rgba(160,107,255,.04))',
          border: '1px solid rgba(160,107,255,.4)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(180deg,#A06BFF,#5A37C0)',
              boxShadow: '0 0 18px rgba(160,107,255,.5)',
            }}
          >
            <IPhone size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-extrabold text-white font-display mb-1">
              Faux compagnon vocal
            </div>
            <div className="text-[11.5px] text-white/75 leading-snug">
              Joue à voix haute une conversation simulée pour décourager un agresseur potentiel. Choisis un scénario, l'app parle à ta place pendant que tu marches.
            </div>
          </div>
        </div>
      </div>

      {!voicesReady && !error && (
        <div className="text-[11.5px] text-white/55 text-center py-2">
          Chargement des voix…
        </div>
      )}

      {error && (
        <div
          className="rounded-xl p-3 text-[11.5px] text-center"
          style={{
            background: 'rgba(255,46,63,.10)',
            color: 'var(--red-soft)',
            border: '1px solid rgba(255,46,63,.35)',
          }}
        >
          {error}
        </div>
      )}

      {/* Active scenario player */}
      {running && (
        <div
          className="rounded-2xl p-4 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(34,214,123,.18), rgba(34,214,123,.04))',
            border: '1px solid rgba(34,214,123,.5)',
          }}
        >
          <div
            className="text-3xl mb-2"
            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
          >
            🔊
          </div>
          <div className="text-[14px] font-extrabold text-white font-display mb-1">
            En cours…
          </div>
          <div className="text-[11.5px] text-white/65 mb-3">
            Mets le téléphone près de l'oreille, parle "comme si" tu écoutais.
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,.08)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #22D67B, #14B873)',
              }}
            />
          </div>
          <button
            onClick={stopAll}
            className="tap btn-primary-red w-full mt-4 py-2.5 rounded-xl text-[13px] font-extrabold"
          >
            Arrêter
          </button>
        </div>
      )}

      {/* Scenario list */}
      {!running && (
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45 px-1">
            Scénarios disponibles
          </div>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => start(s)}
              disabled={!voicesReady}
              className="tap glass w-full rounded-xl p-3 flex items-center gap-3 text-left halo-purple disabled:opacity-50"
              style={{ borderColor: 'var(--stroke)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(160,107,255,.16)',
                  color: 'var(--purple)',
                  border: '1px solid rgba(160,107,255,.4)',
                }}
              >
                <IPlay size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white truncate">{s.label}</div>
                <div className="text-[10.5px] text-white/55 leading-snug">
                  {s.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div
        className="rounded-xl p-2.5 flex items-start gap-2 mt-2"
        style={{
          background: 'rgba(255,255,255,.03)',
          border: '1px solid var(--stroke)',
        }}
      >
        <IInfo size={12} className="text-white/45 mt-0.5 shrink-0" />
        <div className="text-[10.5px] text-white/55 leading-snug">
          Astuce&nbsp;: monte le volume au max avant de lancer. Le rendu vocal dépend de ton appareil — sur Android Chrome la qualité est meilleure que sur iOS Safari.
        </div>
      </div>
    </div>
  );
};

export default FakeCompanionSheet;
