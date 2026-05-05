import React from 'react';

// Premium inline SVG icon set tuned for SOS Africa dark theme.
// All icons use currentColor stroke so they pick up text color.
export const Icon = ({
  size = 22,
  stroke = 1.8,
  className = '',
  children,
  fill = 'none',
  viewBox = '0 0 24 24',
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {children}
  </svg>
);

export const IShield = (p) => (
  <Icon {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
  </Icon>
);
export const IShieldCheck = (p) => (
  <Icon {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
    <path d="M9 12l2.2 2.2L15.5 10" />
  </Icon>
);
export const IBell = (p) => (
  <Icon {...p}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Icon>
);
export const IHome = (p) => (
  <Icon {...p}>
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-9z" />
  </Icon>
);
export const IMap = (p) => (
  <Icon {...p}>
    <path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.6" />
  </Icon>
);
export const IUsers = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <circle cx="17" cy="8.5" r="2.6" />
    <path d="M15.5 20a5 5 0 0 1 6.5-4.7" />
  </Icon>
);
export const IUser = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const ISettings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Icon>
);
export const ICrown = (p) => (
  <Icon {...p}>
    <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z" />
    <path d="M5 19h14" />
  </Icon>
);
export const IWifi = (p) => (
  <Icon {...p}>
    <path d="M2 8.5a16 16 0 0 1 20 0" />
    <path d="M5 12a11 11 0 0 1 14 0" />
    <path d="M8.5 15.5a6 6 0 0 1 7 0" />
    <circle cx="12" cy="19" r="1.2" fill="currentColor" />
  </Icon>
);
export const IWifiOff = (p) => (
  <Icon {...p}>
    <path d="M2 8.5a16 16 0 0 1 13 -4.4" />
    <path d="M19 12a11 11 0 0 0-3-2" />
    <path d="M3 3l18 18" />
    <circle cx="12" cy="19" r="1.2" fill="currentColor" />
  </Icon>
);
export const IPin = (p) => (
  <Icon {...p}>
    <path d="M12 22s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12z" />
    <circle cx="12" cy="10" r="2.6" />
  </Icon>
);
export const IPhone = (p) => (
  <Icon {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Icon>
);
export const IPhoneIncoming = (p) => (
  <Icon {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    <path d="M16 8l4-4M20 4h-4M20 4v4" />
  </Icon>
);
export const IVideo = (p) => (
  <Icon {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="M16 10l5-3v10l-5-3z" />
  </Icon>
);
export const IMask = (p) => (
  <Icon {...p}>
    <path d="M3 9c0-1.5 1-2.5 3-2.5 1.5 0 3 .8 3 2 .5-.7 1.5-1 3-1s2.5.3 3 1c0-1.2 1.5-2 3-2 2 0 3 1 3 2.5 0 4-2.5 8-6 8-1.7 0-2.5-1-3-2-.5 1-1.3 2-3 2-3.5 0-6-4-6-8z" />
    <circle cx="8" cy="11" r="1.2" fill="currentColor" />
    <circle cx="16" cy="11" r="1.2" fill="currentColor" />
  </Icon>
);
export const ISiren = (p) => (
  <Icon {...p}>
    <path d="M5 18h14v-2a7 7 0 0 0-14 0v2z" />
    <path d="M12 4v3M5 9l-2-1M19 9l2-1" />
    <path d="M3 21h18" />
  </Icon>
);
export const IClock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
export const IBrain = (p) => (
  <Icon {...p}>
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3 3 3 0 0 0 6 0 3 3 0 0 0 3-3 3 3 0 0 0 2-5 3 3 0 0 0-2-5 3 3 0 0 0-3-3 3 3 0 0 0-6 0z" />
    <path d="M9 9v6M15 9v6M9 12h6" />
  </Icon>
);
export const IShare = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.2 11l7.6-4M8.2 13l7.6 4" />
  </Icon>
);
export const ISend = (p) => (
  <Icon {...p}>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </Icon>
);
export const IMic = (p) => (
  <Icon {...p}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </Icon>
);
export const IPlay = (p) => (
  <Icon {...p}>
    <path d="M7 4l13 8-13 8V4z" fill="currentColor" />
  </Icon>
);
export const ICheck = (p) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Icon>
);
export const IX = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const IChevronRight = (p) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
export const IChevronLeft = (p) => (
  <Icon {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);
export const IChevronDown = (p) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);
export const IPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const ISearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);
export const IAlert = (p) => (
  <Icon {...p}>
    <path d="M12 3l10 18H2L12 3z" />
    <path d="M12 10v5M12 18h.01" />
  </Icon>
);
export const ILock = (p) => (
  <Icon {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Icon>
);
export const ILightning = (p) => (
  <Icon {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </Icon>
);
export const IHistory = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </Icon>
);
export const IFamily = (p) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="2.6" />
    <circle cx="16" cy="8" r="2.6" />
    <path d="M3 19a5 5 0 0 1 10 0M11 19a5 5 0 0 1 10 0" />
  </Icon>
);
export const ISparkle = (p) => (
  <Icon {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
    <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
  </Icon>
);
export const IRefresh = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
    <path d="M3 21v-5h5" />
  </Icon>
);
export const ICar = (p) => (
  <Icon {...p}>
    <path d="M5 16h14v-4l-2-5H7l-2 5v4z" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" />
  </Icon>
);
export const ILayers = (p) => (
  <Icon {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Icon>
);
export const ICopy = (p) => (
  <Icon {...p}>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
  </Icon>
);
export const IWhatsapp = (p) => (
  <Icon {...p}>
    <path d="M20.5 12.5a8.5 8.5 0 1 1-15.5 5L3 21l3.6-1.9a8.5 8.5 0 0 0 13.9-6.6z" />
    <path d="M8.5 9.5c.3 2 2 4.5 4 5.5 1.2.6 1.7-.3 2.3-.6.4-.2 1.1-.2 1.6.4l.5.7c.3.4.2.9-.2 1.2-1.2 1-3 .5-4.6-.4-1.7-1-3-2.6-3.7-4-.6-1.3-.7-2.6.2-3.4.3-.3.7-.3 1 0l1 1.4c.3.5.2.9 0 1.2z" />
  </Icon>
);
export const IMessage = (p) => (
  <Icon {...p}>
    <path d="M4 5h16v11H8l-4 4V5z" />
  </Icon>
);
export const IBattery = (p) => (
  <Icon {...p}>
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <path d="M22 11v2" />
    <rect x="4" y="9" width="13" height="6" rx="1" fill="currentColor" />
  </Icon>
);
export const ISignal = (p) => (
  <Icon {...p}>
    <rect x="3" y="14" width="3" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="10" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="15" y="6" width="3" height="14" rx="1" fill="currentColor" />
  </Icon>
);
export const IEye = (p) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
export const IBookmark = (p) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-6-4-6 4V3z" />
  </Icon>
);
export const ICompass = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5l-2 5-5 2 2-5 5-2z" fill="currentColor" />
  </Icon>
);
export const IRoute = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M6 8.5v3a4 4 0 0 0 4 4h4" />
    <path d="M6 8.5c0 4 4 5 8 7" />
  </Icon>
);
export const IInfo = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01M11 12h1v5h1" />
  </Icon>
);
export const IGlobe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Icon>
);
export const IRadar = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 12L19 8" />
  </Icon>
);
export const IStar = (p) => (
  <Icon {...p}>
    <path d="M12 3l2.7 5.6L21 9.6l-4.5 4.4 1 6.4-5.5-3-5.5 3 1-6.4L3 9.6l6.3-1L12 3z" fill="currentColor" />
  </Icon>
);
export const IArrowRight = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Icon>
);
export const IArrowLeft = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 5l-7 7 7 7" />
  </Icon>
);
export const IHeart = (p) => (
  <Icon {...p}>
    <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9z" />
  </Icon>
);
export const ISun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Icon>
);
export const IMoon = (p) => (
  <Icon {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
);
export const ITrash = (p) => (
  <Icon {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
  </Icon>
);
export const IEdit = (p) => (
  <Icon {...p}>
    <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);
