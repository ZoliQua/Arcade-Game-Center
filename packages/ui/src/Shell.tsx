import type { CSSProperties, ReactNode } from 'react';
import {
  formatClock,
  type ArcadeGameId,
  type ArcadeStatus,
  type ArcadeTheme,
  type GameStats,
  type SessionMeta,
} from '@arcade/kit';
import { APP_VERSION, GAMES } from './games';
import { IconChevron, IconHome, IconKbd, IconLogo, IconMoon, IconSettings, IconSun, IconTrophy } from './Icons';

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
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button type="button" className="sidebar__brand" onClick={() => navigate({ view: 'home' })}>
        <span className="sidebar__logo">
          <IconLogo />
        </span>
        <span className="sidebar__title">
          <strong>Zoltan&apos;s Arcade</strong>
          <span>Portal · v{APP_VERSION}</span>
        </span>
      </button>

      <div className="sidebar__section-label">Browse</div>
      <NavItem
        label="Home"
        icon={<IconHome />}
        active={route.view === 'home'}
        onClick={() => navigate({ view: 'home' })}
      />

      <div className="sidebar__section-label">Games</div>
      {GAMES.map((g) => {
        const isActive = route.view === 'play' && route.gameId === g.id;
        const best = stats[g.id]?.best ?? 0;
        return (
          <NavItem
            key={g.id}
            label={g.name}
            color={g.color}
            icon={<g.Icon />}
            active={isActive}
            onClick={() => navigate({ view: 'play', gameId: g.id })}
            badge={best > 0 ? best.toLocaleString() : undefined}
            saved={Boolean(sessions[g.id]) && !isActive}
          />
        );
      })}

      <div className="sidebar__section-label">More</div>
      <NavItem
        label="Leaderboard"
        icon={<IconTrophy />}
        active={route.view === 'leaderboard'}
        onClick={() => navigate({ view: 'leaderboard' })}
      />
      <NavItem
        label="Settings"
        icon={<IconSettings />}
        active={route.view === 'settings'}
        onClick={() => navigate({ view: 'settings' })}
      />

      <div className="sidebar__spacer" />
      <div className="sidebar__footer">
        <NavItem
          label={collapsed ? 'Expand' : 'Collapse'}
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
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
  color?: string;
  badge?: string;
  saved?: boolean;
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
      {saved && <span className="nav-item__saved" title="Saved run — continue where you left off" />}
      {badge && <span className="nav-item__badge">{badge}</span>}
    </button>
  );
}

export type LiveStatus = { status: ArcadeStatus; seconds: number; score: number } | null;

const STATUS_TEXT: Record<ArcadeStatus, string> = {
  idle: 'Ready',
  running: 'Playing',
  paused: 'Paused',
  gameOver: 'Game over',
};

type HeaderProps = {
  route: Route;
  theme: ArcadeTheme;
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  live: LiveStatus;
};

export function Header({ route, theme, onToggleTheme, onOpenShortcuts, onOpenSettings, live }: HeaderProps) {
  const game = route.view === 'play' ? GAMES.find((g) => g.id === route.gameId) : undefined;

  let crumb = '';
  if (route.view === 'play') crumb = game?.name ?? '';
  else if (route.view === 'leaderboard') crumb = 'Leaderboard';
  else if (route.view === 'settings') crumb = 'Settings';

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
        <span className={`header__chip header__chip--${live.status}`} title="Status · score · run time" role="status">
          <span className="header__chip-dot" />
          <strong>{STATUS_TEXT[live.status]}</strong>
          <span className="sep">·</span>
          <span>{live.score.toLocaleString()} pts</span>
          <span className="sep">·</span>
          <span>{formatClock(live.seconds)}</span>
        </span>
      )}

      <div className="header__actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          onClick={onToggleTheme}
          title="Toggle theme (T)"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
          onClick={onOpenShortcuts}
        >
          <IconKbd />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Settings"
          title="Settings"
          onClick={onOpenSettings}
          aria-pressed={route.view === 'settings'}
        >
          <IconSettings />
        </button>
      </div>
    </header>
  );
}
