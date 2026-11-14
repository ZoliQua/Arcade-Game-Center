import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import {
  formatClock,
  formatNumber,
  gameName,
  LangMenu,
  useKitMessages,
  useLang,
  useMessages,
  type ArcadeGameId,
  type KitMessageKey,
  type ArcadeStatus,
  type ArcadeTheme,
  type GameStats,
  type SessionMeta,
} from '@arcade/kit';
import { APP_VERSION, GAMES } from './games';
import { SHELL_MESSAGES } from './i18n';
import { NARROW_QUERY, useMediaQuery } from './media';
import {
  IconChevron,
  IconClose,
  IconHome,
  IconKbd,
  IconMenu,
  IconMoon,
  IconSettings,
  IconSun,
  IconTrophy,
} from './Icons';

const SIDEBAR_ID = 'arcade-sidebar';
const MENU_BUTTON_ID = 'arcade-menu-button';

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
  /** Only the active game stays listed (`arcade.sidebarGamesCollapsed`). */
  gamesCollapsed: boolean;
  onToggleGames: () => void;
  stats: Record<ArcadeGameId, GameStats>;
  sessions: Partial<Record<ArcadeGameId, SessionMeta>>;
  /** On narrow screens: the drawer is open (ignored on wide screens, where the sidebar is always shown). */
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
};

export function Sidebar({
  route,
  navigate,
  collapsed,
  onToggleCollapsed,
  gamesCollapsed,
  onToggleGames,
  stats,
  sessions,
  drawerOpen = false,
  onCloseDrawer,
}: SidebarProps) {
  const [lang] = useLang();
  const t = useMessages(SHELL_MESSAGES);
  const narrow = useMediaQuery(NARROW_QUERY);
  const drawer = narrow && drawerOpen;
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onCloseDrawer);
  closeRef.current = onCloseDrawer;

  // The open drawer is modal: focus moves in, Tab stays inside, Escape and the backdrop close it.
  useEffect(() => {
    if (!drawer) return;
    const aside = asideRef.current;
    aside?.focus();
    const close = () => {
      closeRef.current?.();
      document.getElementById(MENU_BUTTON_ID)?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab' || !aside) return;
      const items = Array.from(aside.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && (document.activeElement === first || document.activeElement === aside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [drawer]);

  const games = gamesCollapsed
    ? GAMES.filter((g) => route.view === 'play' && route.gameId === g.id)
    : GAMES;

  return (
    <>
      {drawer && (
        <div
          className="sidebar-backdrop"
          data-testid="drawer-backdrop"
          aria-hidden="true"
          onClick={() => {
            onCloseDrawer?.();
            document.getElementById(MENU_BUTTON_ID)?.focus();
          }}
        />
      )}
      <aside
        ref={asideRef}
        id={SIDEBAR_ID}
        className="sidebar"
        aria-label={t('mainNav')}
        role={drawer ? 'dialog' : undefined}
        aria-modal={drawer ? true : undefined}
        tabIndex={drawer ? -1 : undefined}
        data-drawer={narrow ? (drawerOpen ? 'open' : 'closed') : undefined}
      >
        <div className="sidebar__top">
          <button type="button" className="sidebar__brand" onClick={() => navigate({ view: 'home' })}>
            <span className="sidebar__logo">
              <img className="sidebar__logo-img" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
            </span>
            <span className="sidebar__title">
              <strong>Zoltan&apos;s Arcade</strong>
              <span>{t('portalVersion', { version: APP_VERSION })}</span>
            </span>
          </button>
          {drawer && (
            <button
              type="button"
              className="icon-btn sidebar__close"
              aria-label={t('closeMenu')}
              title={t('closeMenu')}
              onClick={() => {
                onCloseDrawer?.();
                document.getElementById(MENU_BUTTON_ID)?.focus();
              }}
            >
              <IconClose />
            </button>
          )}
        </div>

        <div className="sidebar__section-label">{t('browse')}</div>
        <NavItem
          label={t('home')}
          icon={<IconHome />}
          active={route.view === 'home'}
          onClick={() => navigate({ view: 'home' })}
        />

        <button
          type="button"
          className="sidebar__section-label sidebar__section-toggle"
          aria-expanded={!gamesCollapsed}
          aria-controls="arcade-sidebar-games"
          title={gamesCollapsed ? t('showGames') : t('hideGames')}
          onClick={onToggleGames}
        >
          <span className="sidebar__section-text">{t('games')}</span>
          {gamesCollapsed && (
            <span className="sidebar__section-count" aria-hidden="true">
              {formatNumber(GAMES.length, lang)}
            </span>
          )}
          <span className="sidebar__section-chevron" aria-hidden="true">
            <IconChevron />
          </span>
        </button>
        <div id="arcade-sidebar-games" className="sidebar__games">
          {games.map((g) => {
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
        </div>

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
    </>
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

type HeaderProps = {
  route: Route;
  theme: ArcadeTheme;
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  live: LiveStatus;
  /** Opens the sidebar drawer; the button is only shown below 900 px. */
  onOpenMenu?: () => void;
  menuOpen?: boolean;
};

export function Header({
  route,
  theme,
  onToggleTheme,
  onOpenShortcuts,
  onOpenSettings,
  live,
  onOpenMenu,
  menuOpen = false,
}: HeaderProps) {
  const [lang, setLang] = useLang();
  const t = useMessages(SHELL_MESSAGES);
  const kit = useKitMessages();

  let crumb = '';
  if (route.view === 'play') crumb = gameName(route.gameId, lang);
  else if (route.view === 'leaderboard') crumb = t('leaderboard');
  else if (route.view === 'settings') crumb = t('settings');

  return (
    <header className="header">
      <button
        type="button"
        id={MENU_BUTTON_ID}
        className="icon-btn header__menu"
        aria-label={t('menu')}
        title={t('menu')}
        aria-controls={SIDEBAR_ID}
        aria-expanded={menuOpen}
        onClick={onOpenMenu}
      >
        <IconMenu />
      </button>
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
          className="icon-btn header__shortcuts"
          aria-label={t('shortcuts')}
          title={t('shortcutsTitle')}
          onClick={onOpenShortcuts}
        >
          <IconKbd />
        </button>
        <LangMenu lang={lang} onPick={setLang} label={kit('language')} className="header__lang" />
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
