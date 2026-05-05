import React from 'react';

// Reusable atoms used across screens.

export const Card = ({ children, className = '', halo = 'red', ...rest }) => (
  <div className={`glass rounded-2xl p-4 lift halo-${halo} ${className}`} {...rest}>
    {children}
  </div>
);

const accentVar = (color) => {
  switch (color) {
    case 'red':
      return 'var(--red)';
    case 'green':
      return 'var(--green)';
    case 'amber':
      return 'var(--amber)';
    case 'gold':
      return 'var(--gold)';
    case 'blue':
      return 'var(--blue)';
    case 'purple':
      return 'var(--purple)';
    default:
      return 'var(--red)';
  }
};

export const Tag = ({ children, color = 'red', className = '' }) => {
  const c = accentVar(color);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${className}`}
      style={{
        color: c,
        background: `color-mix(in oklab, ${c} 14%, transparent)`,
        border: `1px solid color-mix(in oklab, ${c} 30%, transparent)`,
      }}
    >
      {children}
    </span>
  );
};

export const CornerDot = ({ color = 'red' }) => {
  const c = accentVar(color);
  return (
    <span
      className="absolute top-3 right-3 w-2 h-2 rounded-full"
      style={{ background: c, boxShadow: `0 0 10px ${c}` }}
    />
  );
};

export const StatusRow = ({ icon: Icn, label, value, color = 'green' }) => {
  const c = accentVar(color);
  return (
    <div
      className="flex items-center justify-between py-3 px-3.5 rounded-xl tap halo-green"
      style={{
        background: 'rgba(255,255,255,.03)',
        border: '1px solid var(--stroke)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `color-mix(in oklab, ${c} 14%, transparent)`,
            color: c,
            border: `1px solid color-mix(in oklab, ${c} 35%, transparent)`,
          }}
        >
          <Icn size={16} />
        </div>
        <div className="text-[13.5px] font-semibold text-white/90">{label}</div>
      </div>
      <div
        className="flex items-center gap-1.5 text-[12px] font-semibold"
        style={{ color: c }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: c, boxShadow: `0 0 8px ${c}` }}
        />
        {value}
      </div>
    </div>
  );
};

export const SectionTitle = ({ children, className = '' }) => (
  <div
    className={`text-[13px] font-bold text-white/85 mb-2 font-display ${className}`}
  >
    {children}
  </div>
);

export const ScreenHeading = ({ title, subtitle, right }) => (
  <div className="px-5 pb-3 flex items-end justify-between">
    <div>
      <div
        className="text-[22px] font-extrabold text-white leading-tight font-display"
        style={{ letterSpacing: '-.01em' }}
      >
        {title}
      </div>
      {subtitle && (
        <div className="text-[12.5px] text-white/60 mt-0.5">{subtitle}</div>
      )}
    </div>
    {right}
  </div>
);
