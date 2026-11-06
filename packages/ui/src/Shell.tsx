import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  formatClock,
  formatNumber,
  gameName,
  LANG_NAMES,
  LANGS,
  useKitMessages,
  useLang,
  useMessages,
  type ArcadeGameId,
  type KitMessageKey,
  type Lang,
  type ArcadeStatus,
  type ArcadeTheme,
  type GameStats,
  type SessionMeta,
} from '@arcade/kit';
import { APP_VERSION, GAMES } from './games';
import { SHELL_MESSAGES } from './i18n';
import { IconChevron, IconGlobe, IconHome, IconKbd, IconLogo, IconMoon, IconSettings, IconSun, IconTrophy } from './Icons';

export type Route =
  | { view: 'home' }
  | { view: 'play'; gameId: ArcadeGameId }
  | { view: 'leaderboard' }
  | { view: 'settings' };

type SidebarProps = {
  route: Route;
  navigate: (route: Route) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  stats: Record<ArcadeGameId, GameStats>;
  sessions: Partial<Record<ArcadeGameId, SessionMeta>>;
};

export function Sidebar({ route, navigate, collapsed, onToggleCollapsed, stats, sessions }: SidebarProps) {
  const [lang] = useLang();
  const t = useMessages(SHELL_MESSAGES);
  return (
    <aside className="sidebar" aria-label={t('mainNav')}>
      <button type="button" className="sidebar__brand" onClick={() => navigate({ view: 'home' })}>
        <span className="sidebar__logo">
          <IconLogo />
        </span>
        <span className="sidebar__title">
          <strong>Zoltan&apos;s Arcade</strong>
          <span>{t('portalVersion', { version: APP_VERSION })}</span>
        </span>
      </button>

      <div className="sidebar__section-label">{t('browse')}</div>
      <NavItem
        label={t('home')}
        icon={<IconHome />}
        active={route.view === 'home'}
        onClick={() => navigate({ view: 'home' })}
      />

      <div className="sidebar__section-label">{t('games')}</div>
      {GAMES.map((g) => {
        const isActive = route.view === 'play' && route.gameId === g.id;
        const best = stats[g.id]?.best ?? 0;
        return (
          <NavItem
            key={g.id}
            label={gameName(g.id, lang)}
            color={g.color}
            icon={<g.Icon />}
            active={isActive}
            onClick={() => navigate({ view: 'play', gameId: g.id })}
            badge={best > 0 ? formatNumber(best, lang) : undefined}
            savedTitle={t('savedRun')}
            saved={Boolean(sessions[g.id]) && !isActive}
          />
        );
      })}

      <div className="sidebar__section-label">{t('more')}</div>
      <NavItem
        label={t('leaderboard')}
        icon={<IconTrophy />}
        active={route.view === 'leaderboard'}
        onClick={() => navigate({ view: 'leaderboard' })}
      />
      <NavItem
        label={t('settings')}
        icon={<IconSettings />}
        active={route.view === 'settings'}
        onClick={() => navigate({ view: 'settings' })}
      />

      <div className="sidebar__spacer" />
      <div className="sidebar__footer">
        <NavItem
          label={collapsed ? t('expand') : t('collapse')}
          icon={
            <span style={{ display: 'grid', transform: collapsed ? 'none' : 'rotate(180deg)' }}>
              <IconChevron />
            </span>
          }
          onClick={onToggleCollapsed}
        />
      </div>
    </aside>
  );
}

function NavItem({
  label,
  icon,
  active = false,
  onClick,
  color,
  badge,
  saved = false,
  savedTitle,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
  color?: string;
  badge?: string;
  saved?: boolean;
  savedTitle?: string;
}) {
  return (
    <button
      type="button"
      className={`nav-item ${active ? 'nav-item--active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={label}
      style={color ? ({ '--game-color': color } as CSSProperties) : undefined}
    >
      <span className="nav-item__icon" style={{ color: active && color ? color : undefined }}>
        {icon}
      </span>
      <span className="nav-item__label">{label}</span>
      {saved && <span className="nav-item__saved" title={savedTitle} />}
      {badge && <span className="nav-item__badge">{badge}</span>}
    </button>
  );
}

export type LiveStatus = { status: ArcadeStatus; seconds: number; score: number } | null;

const STATUS_KEY: Record<ArcadeStatus, KitMessageKey> = {
  idle: 'statusIdle',
  running: 'statusRunning',
  paused: 'statusPaused',
  gameOver: 'statusGameOver',
};

/** Globe + current language code; opens an English / Magyar / Deutsch menu. */
function LangMenu({ lang, onPick, label }: { lang: Lang; onPick: (l: Lang) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="arc-lang header__lang" ref={rootRef}>
      <button
        type="button"
        className="arc-lang__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${LANG_NAMES[lang]}`}
        title={label}
        onClick={() => setOpen((o) => !o)}
      >
        <IconGlobe size={15} />
        <span className="arc-lang__code">{lang.toUpperCase()}</span>
      </button>
      {open && (
        <ul className="arc-menu__list arc-lang__list" role="menu" aria-label={label}>
          {LANGS.map((l) => (
            <li key={l} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l === lang}
                lang={l}
                onClick={() => {
                  onPick(l);
                  setOpen(false);
                }}
              >
                <span className="arc-lang__mark" aria-hidden="true">
                  {l === lang ? '✓' : ''}
                </span>
                {LANG_NAMES[l]}
                <small aria-hidden="true">{l.toUpperCase()}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type HeaderProps = {
  route: Route;
  theme: ArcadeTheme;
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  live: LiveStatus;
};

export function Header({ route, theme, onToggleTheme, onOpenShortcuts, onOpenSettings, live }: HeaderProps) {
  const [lang, setLang] = useLang();
  const t = useMessages(SHELL_MESSAGES);
  const kit = useKitMessages();

  let crumb = '';
  if (route.view === 'play') crumb = gameName(route.gameId, lang);
  else if (route.view === 'leaderboard') crumb = t('leaderboard');
  else if (route.view === 'settings') crumb = t('settings');

  return (
    <header className="header">
      <div className="header__crumbs">
        <strong>Zoltan&apos;s Arcade</strong>
        {route.view !== 'home' && (
          <>
            <span className="sep">/</span>
            <span>{crumb}</span>
          </>
        )}
      </div>

      {route.view === 'play' && live && (
        <span className={`header__chip header__chip--${live.status}`} title={t('liveTitle')} role="status">
          <span className="header__chip-dot" />
          <strong>{kit(STATUS_KEY[live.status])}</strong>
          <span className="sep">·</span>
          <span>{t('points', { n: formatNumber(live.score, lang) })}</span>
          <span className="sep">·</span>
          <span>{formatClock(live.seconds)}</span>
        </span>
      )}

      <div className="header__actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={theme === 'dark' ? kit('switchToLight') : kit('switchToDark')}
          onClick={onToggleTheme}
          title={kit('toggleTheme')}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={t('shortcuts')}
          title={t('shortcutsTitle')}
          onClick={onOpenShortcuts}
        >
          <IconKbd />
        </button>
        <LangMenu lang={lang} onPick={setLang} label={kit('language')} />
        <button
          type="button"
          className="icon-btn"
          aria-label={t('settings')}
          title={t('settings')}
          onClick={onOpenSettings}
          aria-pressed={route.view === 'settings'}
        >
          <IconSettings />
        </button>
      </div>
    </header>
  );
}
