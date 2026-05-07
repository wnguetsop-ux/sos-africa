import React from 'react';
import { IShield, IBell, IPlus } from './icons';

const AppHeader = ({
  online = true,
  alertsCount = 0,
  userInitial = 'W',
  onLogoTap,
  onBell,
  onAdd,
}) => {
  return (
    <header className="px-5 pt-3 pb-3 flex items-center justify-between flex-shrink-0">
      <button
        onClick={onLogoTap}
        className="flex items-center gap-2.5 text-left"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg,#221016,#0E0608)',
            border: '1px solid rgba(255,46,63,.4)',
            boxShadow:
              '0 0 18px rgba(255,46,63,.35), inset 0 0 12px rgba(255,46,63,.18)',
          }}
        >
          <IShield size={20} className="text-[color:var(--red)]" />
        </div>
        <div className="leading-tight">
          <div
            className="font-extrabold text-[17px] font-display"
            style={{ letterSpacing: '-.01em' }}
          >
            <span className="text-[color:var(--red)]">SOS</span>{' '}
            <span className="text-white">Africa</span>
          </div>
          <div
            className="text-[10.5px] flex items-center gap-1"
            style={{ color: online ? 'var(--green-soft)' : 'var(--amber)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: online ? 'var(--green)' : 'var(--amber)',
                boxShadow: `0 0 8px ${online ? 'var(--green)' : 'var(--amber)'}`,
                animation: !online ? 'blink 1.4s infinite' : 'none',
              }}
            />
            {online ? 'En ligne · sécurisé' : 'Hors ligne · SOS local actif'}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onBell}
          className="tap relative w-9 h-9 rounded-full glass flex items-center justify-center text-white/85 halo-red"
        >
          <IBell size={18} />
          {alertsCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
              style={{
                background: 'linear-gradient(180deg,#FF4252,#D71B2C)',
                color: '#fff',
                boxShadow: '0 0 12px rgba(255,46,63,.7)',
              }}
            >
              {alertsCount}
            </span>
          )}
        </button>
        <button
          onClick={onAdd}
          className="tap relative w-9 h-9 rounded-full overflow-hidden btn-primary-red flex items-center justify-center"
          aria-label="Ajouter un contact"
        >
          <IPlus size={18} />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
