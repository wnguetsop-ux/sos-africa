import React, { useEffect, useRef, useState } from 'react';
import {
  IBrain,
  ISend,
  IShield,
  ISiren,
  IPin,
  IPhoneIncoming,
  IMask,
  IMic,
  IVideo,
  IFamily,
  IAlert,
} from '../ui/icons';

const SUGGESTIONS = [
  '🚖 On essaie de monter dans mon taxi',
  '🩺 Premiers secours pour saignement important',
  '🌙 Je crois qu\'on me suit le soir',
  '😰 Comment me calmer en panique ?',
  '☎️ Numéros d\'urgence à Yaoundé',
];

const ACTION_META = {
  siren: { label: 'Activer la sirène', icon: ISiren, color: 'amber' },
  'share-location': { label: 'Partager ma position', icon: IPin, color: 'blue' },
  'fake-call': { label: 'Lancer un faux appel', icon: IPhoneIncoming, color: 'green' },
  ghost: { label: 'Mode furtif', icon: IMask, color: 'amber' },
  sos: { label: 'Déclencher SOS', icon: IShield, color: 'red' },
  video: { label: 'Vidéo SOS', icon: IVideo, color: 'red' },
  'audio-record': { label: 'Enregistrement audio', icon: IMic, color: 'red' },
  family: { label: 'Mode famille', icon: IFamily, color: 'blue' },
};

const ActionButton = ({ id, onClick }) => {
  const meta = ACTION_META[id];
  if (!meta) return null;
  const Icn = meta.icon;
  const c =
    meta.color === 'red' ? 'var(--red)' :
    meta.color === 'green' ? 'var(--green)' :
    meta.color === 'amber' ? 'var(--amber)' :
    meta.color === 'blue' ? 'var(--blue)' : 'var(--purple)';
  return (
    <button
      onClick={() => onClick(id)}
      className="tap glass rounded-xl px-3 py-2 flex items-center gap-2 text-[12px] font-bold halo-red"
      style={{
        borderColor: `color-mix(in oklab, ${c} 35%, transparent)`,
        background: `color-mix(in oklab, ${c} 10%, transparent)`,
        color: c,
      }}
    >
      <Icn size={14} />
      {meta.label}
    </button>
  );
};

const Bubble = ({ role, content, actions, onAction }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
            isUser ? 'btn-primary-red' : 'glass'
          }`}
          style={
            isUser
              ? {}
              : {
                  borderColor: 'var(--stroke)',
                  color: 'rgba(255,255,255,.92)',
                }
          }
        >
          {content.split('\n').map((line, i) => (
            <div key={i} style={{ minHeight: line.trim() ? undefined : 4 }}>
              {line}
            </div>
          ))}
        </div>
        {!isUser && actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {actions.map((a) => (
              <ActionButton key={a} id={a} onClick={onAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AISheet = ({ location, language = 'fr', onAction }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          location,
          language,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 503) {
          throw new Error(
            'L\'assistant IA n\'est pas encore configuré. Réessaie dans quelques minutes.'
          );
        }
        throw new Error(err.error || `Erreur ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content || 'Désolé, je n\'ai pas pu répondre.',
          actions: data.actions || [],
        },
      ]);
    } catch (err) {
      console.error('AI chat error:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
      // Refocus input
      inputRef.current?.focus();
    }
  };

  const handleSuggestion = (text) => {
    send(text.replace(/^[^\w]+/, '').trim());
  };

  const handleAction = (actionId) => {
    if (typeof onAction === 'function') {
      onAction(actionId);
    }
  };

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col" style={{ height: '70vh', maxHeight: 600 }}>
      {/* Header info */}
      <div
        className="rounded-2xl p-3 mb-2 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(160,107,255,.16), rgba(61,139,255,.06))',
          border: '1px solid rgba(160,107,255,.4)',
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(160,107,255,.16)',
            color: 'var(--purple)',
            border: '1px solid rgba(160,107,255,.4)',
            boxShadow: '0 0 16px rgba(160,107,255,.35)',
          }}
        >
          <IBrain size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-white font-display">
            Assistant Sécurité
          </div>
          <div className="text-[10.5px] text-white/55">
            Disponible 24h/24 · Conseils, premiers secours, anti-stress
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="tap text-[11px] text-white/55 hover:text-white/85 px-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-[12px] text-white/55 px-1 mb-3">
              Commence par une question ou choisis-en une&nbsp;:
            </p>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s)}
                className="tap glass w-full text-left rounded-xl px-3 py-2.5 text-[12.5px] text-white/85 halo-purple"
                style={{ borderColor: 'var(--stroke)' }}
              >
                {s}
              </button>
            ))}
            <div
              className="rounded-xl p-3 mt-2 text-[11px] text-white/55 leading-snug"
              style={{
                background: 'rgba(255,176,32,.08)',
                border: '1px solid rgba(255,176,32,.25)',
              }}
            >
              ⚠️ En cas de danger immédiat, appelle directement la police
              (Cameroun&nbsp;: <span className="font-bold text-white">117</span>) avant tout.
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble
            key={i}
            role={m.role}
            content={m.content}
            actions={m.actions}
            onAction={handleAction}
          />
        ))}

        {loading && (
          <div className="flex justify-start mb-2">
            <div className="glass rounded-2xl px-3.5 py-2.5 flex items-center gap-2"
                 style={{ borderColor: 'var(--stroke)' }}>
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white/70"
                  style={{ animation: 'pulse 1.4s ease-in-out infinite' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white/70"
                  style={{ animation: 'pulse 1.4s ease-in-out 0.2s infinite' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white/70"
                  style={{ animation: 'pulse 1.4s ease-in-out 0.4s infinite' }}
                />
              </div>
              <span className="text-[11px] text-white/55">L'assistant réfléchit…</span>
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl p-2.5 text-[11.5px] text-center mb-2"
            style={{
              background: 'rgba(255,46,63,.10)',
              color: 'var(--red-soft)',
              border: '1px solid rgba(255,46,63,.35)',
            }}
          >
            <IAlert size={12} className="inline mr-1" /> {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 mt-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Décris ta situation…"
          rows={1}
          className="flex-1 px-3 py-2.5 rounded-2xl glass text-[13.5px] text-white/95 placeholder-white/40 resize-none"
          style={{
            borderColor: 'var(--stroke)',
            maxHeight: 100,
            minHeight: 42,
          }}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="tap btn-primary-red rounded-2xl w-12 h-[42px] flex items-center justify-center disabled:opacity-50 shrink-0"
          aria-label="Envoyer"
        >
          <ISend size={16} />
        </button>
      </div>
      <div className="text-[9.5px] text-white/35 text-center mt-1.5 leading-snug">
        Conseils non médicaux · En urgence vitale, appelle directement les secours.
      </div>
    </div>
  );
};

export default AISheet;
