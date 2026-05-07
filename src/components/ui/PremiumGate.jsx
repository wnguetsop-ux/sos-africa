import React from 'react';
import { ICrown, ILock } from './icons';

/**
 * Wrapper qui affiche un upgrade screen si l'utilisateur n'est pas Premium.
 *
 * Usage:
 *   <PremiumGate isPremium={isPremium} title="..." onUpgrade={...}>
 *     <FeatureComponent />
 *   </PremiumGate>
 */
const PremiumGate = ({
  isPremium,
  title = 'Fonction Premium',
  description = 'Cette fonction est réservée aux abonnés Premium.',
  benefits = [],
  onUpgrade,
  children,
}) => {
  if (isPremium) return children;

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-5 text-center relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(244,194,75,.16), rgba(244,194,75,.04))',
          border: '1px solid rgba(244,194,75,.4)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(140% 100% at 50% -20%, rgba(244,194,75,.2), transparent 60%)',
          }}
        />
        <div className="relative">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(180deg,#FFD86A,#D9971C)',
              boxShadow: '0 0 28px rgba(244,194,75,.45)',
            }}
          >
            <ICrown size={26} className="text-[#241500]" />
          </div>
          <div className="text-[16px] font-extrabold text-grad-gold font-display mb-1">
            {title}
          </div>
          <div className="text-[12.5px] text-white/70 leading-snug mb-3">
            {description}
          </div>
        </div>
      </div>

      {benefits.length > 0 && (
        <div className="space-y-1.5">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[12.5px] text-white/85"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                style={{
                  background: 'rgba(244,194,75,.16)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(244,194,75,.4)',
                }}
              >
                ✓
              </span>
              {b}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onUpgrade}
        className="tap btn-primary-gold w-full py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 font-display"
      >
        <ICrown size={16} /> Passer à Premium · 1 300 XAF / mois
      </button>
      <p className="text-[10.5px] text-white/45 text-center">
        Mobile Money Cameroun · Activation manuelle sous 24h
      </p>
    </div>
  );
};

export default PremiumGate;
