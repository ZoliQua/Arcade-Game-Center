/* Icons.jsx — SVG icons used across the portal */
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };

const IconHome = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>
);
const IconTrophy = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><path d="M7 4h10v3a5 5 0 0 1-10 0z"/><path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3"/><path d="M9 13h6v3H9zM8 20h8M10 16v4M14 16v4"/></svg>
);
const IconSettings = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
);
const IconSun = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
);
const IconMoon = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
);
const IconPause = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
);
const IconPlay = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><path d="M7 5l12 7-12 7z"/></svg>
);
const IconRestart = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
);
const IconChevron = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><path d="M9 6l6 6-6 6"/></svg>
);
const IconClock = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
);
const IconKbd = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></svg>
);

/* Per-game icons */
const IconTetris = ({size=18, color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="3" y="3" width="6" height="6" rx="1"/>
    <rect x="9" y="3" width="6" height="6" rx="1" opacity="0.55"/>
    <rect x="9" y="9" width="6" height="6" rx="1"/>
    <rect x="15" y="9" width="6" height="6" rx="1" opacity="0.7"/>
    <rect x="3" y="15" width="6" height="6" rx="1" opacity="0.7"/>
    <rect x="9" y="15" width="6" height="6" rx="1"/>
  </svg>
);
const IconSnake = ({size=18, color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h6a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h8"/>
    <circle cx="18" cy="18" r="1.6" fill={color}/>
  </svg>
);
const Icon2048 = ({size=18, color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" opacity="0.5"/>
    <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.75"/>
    <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.75"/>
    <rect x="13" y="13" width="8" height="8" rx="1.5"/>
  </svg>
);
const IconLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <rect x="3" y="3" width="8" height="8" rx="1.4"/>
    <rect x="13" y="3" width="8" height="8" rx="1.4" opacity="0.55"/>
    <rect x="3" y="13" width="8" height="8" rx="1.4" opacity="0.55"/>
    <rect x="13" y="13" width="8" height="8" rx="1.4"/>
  </svg>
);

window.Icons = { IconHome, IconTrophy, IconSettings, IconSun, IconMoon, IconPause, IconPlay, IconRestart, IconChevron, IconClock, IconKbd, IconTetris, IconSnake, Icon2048, IconLogo };
