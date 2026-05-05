import React from 'react';
import { IHome, IMap, IBell, IUsers, IUser } from './icons';

const ITEMS = [
  { id: 'home', icon: IHome, label: 'Accueil', accent: 'var(--red)' },
  { id: 'map', icon: IMap, label: 'Carte', accent: 'var(--red)' },
  { id: 'tools', icon: IBell, label: 'Alertes', accent: 'var(--blue)' },
  { id: 'contacts', icon: IUsers, label: 'Contacts', accent: 'var(--red)' },
  { id: 'profile', icon: IUser, label: 'Profil', accent: 'var(--gold)' },
];

const BottomNav = ({ active, onChange, hasAlert = false, labels = {} }) => {
  return (
    <nav
      className="fixed left-0 right-0 bottom-0 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 z-40"
      style={{
        background:
          'linear-gradient(180deg, rgba(6,8,15,0) 0%, rgba(6,8,15,0.85) 28%, rgba(6,8,15,0.96) 100%)',
      }}
    >
      <div
        className="glass rounded-[22px] px-1 py-2 flex items-stretch justify-between gap-1 max-w-lg mx-auto"
        style={{ borderColor: 'rgba(255,255,255,.10)' }}
      >
        {ITEMS.map((it) => {
          const isActive = active === it.id;
          const accent = it.accent;
          const isBlue = accent === 'var(--blue)';
          const label = labels[it.id] || it.label;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className="tap relative flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-2xl"
              style={{
                color: isActive ? accent : 'rgba(255,255,255,.55)',
                background: isActive
                  ? `radial-gradient(60% 100% at 50% 100%, ${
                      isBlue ? 'rgba(61,139,255,.18)' : 'rgba(255,46,63,.16)'
                    }, transparent 70%)`
                  : 'transparent',
                textShadow: isActive
                  ? `0 0 12px ${
                      isBlue ? 'rgba(61,139,255,.7)' : 'rgba(255,46,63,.7)'
                    }`
                  : 'none',
              }}
            >
              <div className="relative">
                <it.icon size={20} stroke={2.1} />
                {isActive && (
                  <span
                    className="absolute -inset-2 rounded-full pointer-events-none"
                    style={{
                      boxShadow: `0 0 18px ${
                        isBlue ? 'rgba(61,139,255,.55)' : 'rgba(255,46,63,.55)'
                      }`,
                    }}
                  />
                )}
                {it.id === 'tools' && hasAlert && !isActive && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{
                      background: 'var(--red)',
                      boxShadow: '0 0 6px var(--red)',
                    }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-semibold leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                style={{ maxWidth: '100%' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
