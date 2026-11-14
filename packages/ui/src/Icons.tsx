import type { CSSProperties } from 'react';

type IconProps = {
  size?: number;
  color?: string;
  style?: CSSProperties;
};

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const IconHome = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const IconTrophy = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M7 4h10v3a5 5 0 0 1-10 0z" />
    <path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3" />
    <path d="M9 13h6v3H9zM8 20h8M10 16v4M14 16v4" />
  </svg>
);

export const IconSettings = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const IconGlobe = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" />
  </svg>
);

export const IconSun = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const IconMoon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const IconPause = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export const IconPlay = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M7 5l12 7-12 7z" />
  </svg>
);

export const IconRestart = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

export const IconChevron = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconClock = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconKbd = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
  </svg>
);

export const IconTetris = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="9" y="3" width="6" height="6" rx="1" opacity="0.55" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <rect x="15" y="9" width="6" height="6" rx="1" opacity="0.7" />
    <rect x="3" y="15" width="6" height="6" rx="1" opacity="0.7" />
    <rect x="9" y="15" width="6" height="6" rx="1" />
  </svg>
);

export const IconSnake = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6h6a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h8" />
    <circle cx="18" cy="18" r="1.6" fill={color} />
  </svg>
);

export const Icon2048 = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" opacity="0.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.75" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.75" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

export const IconPacman = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 12 L22 6 A11 11 0 1 0 22 18 Z" />
    <circle cx="11" cy="7.5" r="1.4" fill="var(--bg, #0b0b12)" />
  </svg>
);

export const IconGomoku = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
    <path d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16" opacity="0.45" />
    <circle cx="8" cy="8" r="2.4" fill={color} />
    <circle cx="12" cy="12" r="2.4" fill={color} />
    <circle cx="16" cy="16" r="2.4" fill={color} />
    <circle cx="16" cy="8" r="2.2" fill="none" />
  </svg>
);

export const IconTicTacToe = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" opacity="0.5" />
    <path d="M4.5 4.5l3 3M7.5 4.5l-3 3" />
    <circle cx="12" cy="12" r="1.7" />
    <path d="M16.5 16.5l3 3M19.5 16.5l-3 3" />
  </svg>
);

export const IconBreakout = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="2" y="3" width="6" height="3.2" rx="0.8" />
    <rect x="9" y="3" width="6" height="3.2" rx="0.8" />
    <rect x="16" y="3" width="6" height="3.2" rx="0.8" />
    <rect x="2" y="7.4" width="6" height="3.2" rx="0.8" />
    <rect x="16" y="7.4" width="6" height="3.2" rx="0.8" />
    <circle cx="14" cy="14.5" r="1.9" />
    <rect x="6" y="19" width="10" height="2.6" rx="1.3" />
  </svg>
);

export const IconInvaders = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M5 4h2v2h-2zM17 4h2v2h-2zM7 6h2v2h-2zM15 6h2v2h-2zM5 8h14v2h-14zM3 10h4v2h-4zM9 10h6v2h-6zM17 10h4v2h-4zM1 12h22v2h-22zM1 14h2v2h-2zM5 14h14v2h-14zM21 14h2v2h-2zM1 16h2v2h-2zM5 16h2v2h-2zM17 16h2v2h-2zM21 16h2v2h-2zM7 18h4v2h-4zM13 18h4v2h-4z" />
  </svg>
);

export const IconConnectFour = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
    <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
    <circle cx="7" cy="9" r="1.9" />
    <circle cx="12" cy="9" r="1.9" />
    <circle cx="17" cy="9" r="1.9" fill={color} />
    <circle cx="7" cy="15" r="1.9" fill={color} />
    <circle cx="12" cy="15" r="1.9" fill={color} />
    <circle cx="17" cy="15" r="1.9" />
  </svg>
);

export const IconNutSort = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
    <path d="M12 2.5v9" />
    <path d="M10.5 4.5l3 1M10.5 7l3 1M10.5 9.5l3 1" />
    <path d="M5.5 13h13l1.5 3-1.5 3h-13L4 16z" fill={color} fillOpacity="0.25" />
    <path d="M9.5 13v6M14.5 13v6" />
    <path d="M3 21.5h18" />
  </svg>
);

export const IconHoldem = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
    <rect x="3.5" y="4" width="8" height="12" rx="1.3" transform="rotate(-14 7.5 10)" />
    <rect x="8" y="3" width="8" height="12" rx="1.3" fill={color} fillOpacity="0.25" transform="rotate(10 12 9)" />
    <path d="M12 7.2l1.2 1.6-1.2 1.6-1.2-1.6z" transform="rotate(10 12 9)" />
    <circle cx="17" cy="17.5" r="4" />
    <circle cx="17" cy="17.5" r="2" strokeDasharray="1.6 1.6" />
  </svg>
);

export const IconMinesweeper = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
    <circle cx="10" cy="14" r="5" fill={color} fillOpacity="0.25" />
    <path d="M10 6.5v2M10 19.5v2M2.5 14h2M15.5 14h2M4.7 8.7l1.4 1.4M13.9 17.9l1.4 1.4M4.7 19.3l1.4-1.4M13.9 10.1l1.4-1.4" />
    <circle cx="8.3" cy="12.3" r="1" fill={color} stroke="none" />
    <path d="M17 2.5v8" />
    <path d="M17 2.5l4.5 2-4.5 2" fill={color} />
  </svg>
);

export const IconSolitaire = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
    <rect x="3.5" y="5" width="9" height="13.5" rx="1.4" transform="rotate(-12 8 11.75)" />
    <rect x="10" y="4.5" width="9" height="13.5" rx="1.4" fill={color} fillOpacity="0.25" transform="rotate(12 14.5 11.25)" />
    <path d="M14.6 8.6c-1.4 1.2-2.6 2.2-2.6 3.3 0 .9 1.2 1.4 2.1.6.2 1-.3 1.6-.8 2h2.6c-.5-.4-1-1-.8-2 .9.8 2.1.3 2.1-.6 0-1.1-1.2-2.1-2.6-3.3z" transform="rotate(12 14.5 11.25)" />
  </svg>
);

export const IconUlti = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4">
    <rect x="5" y="2.5" width="14" height="19" rx="1.8" />
    <path d="M8.6 11.2c0-1.9 1.5-3 3.4-3s3.4 1.1 3.4 3z" fill={color} fillOpacity="0.4" />
    <path d="M9.2 11.2c0 3 1.2 5.3 2.8 5.3s2.8-2.3 2.8-5.3" />
    <path d="M12 8.2V6.4M12 6.6c.8-.8 1.8-.9 2.6-.6" />
  </svg>
);

export const IconSave = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M5 3h11l3 3v15H5z" />
    <path d="M8 3v5h7V3M8 21v-7h8v7" />
  </svg>
);

export const IconLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <rect x="3" y="3" width="8" height="8" rx="1.4" />
    <rect x="13" y="3" width="8" height="8" rx="1.4" opacity="0.55" />
    <rect x="3" y="13" width="8" height="8" rx="1.4" opacity="0.55" />
    <rect x="13" y="13" width="8" height="8" rx="1.4" />
  </svg>
);
