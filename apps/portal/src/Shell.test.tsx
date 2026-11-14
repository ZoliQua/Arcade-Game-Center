import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyDental,
  applyLang,
  ARCADE_GAMES,
  emptyStats,
  gameName,
  type ArcadeGameId,
  type GameStats,
} from '@arcade/kit';
import { Header, Sidebar, type Route } from '@arcade/ui';
import App from './App';

// The App tests below need the shell only, not the real games.
vi.mock('./games', () => ({
  GAME_MODULES: new Proxy({}, { get: () => ({ Game: () => null, Demo: () => null }) }),
}));

const stats = Object.fromEntries(ARCADE_GAMES.map((g) => [g.id, emptyStats()])) as Record<ArcadeGameId, GameStats>;

function Shell({ route = { view: 'home' } as Route }) {
  return (
    <>
      <Sidebar
        route={route}
        navigate={() => {}}
        collapsed={false}
        onToggleCollapsed={() => {}}
        gamesCollapsed={false}
        onToggleGames={() => {}}
        stats={stats}
        sessions={{}}
      />
      <Header
        route={route}
        theme="dark"
        onToggleTheme={() => {}}
        onOpenShortcuts={() => {}}
        onOpenSettings={() => {}}
        live={null}
      />
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
});

describe('portal shell language switcher', () => {
  it('sits immediately before the Settings button in the header', () => {
    render(<Shell />);
    const header = screen.getByRole('banner');
    const lang = within(header).getByRole('button', { name: /language/i });
    const settings = within(header).getByRole('button', { name: 'Settings' });
    // The button lives in its menu wrapper; that wrapper is the Settings button's previous sibling.
    const control = lang.closest('.arc-lang') ?? lang;
    expect(control.nextElementSibling).toBe(settings);
    expect(lang.textContent).toContain('EN');
  });

  it('switches the whole shell to German', () => {
    render(<Shell />);
    const nav = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(within(nav).getByRole('button', { name: 'Settings' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /language/i }));
    fireEvent.click(screen.getByRole('button', { name: /Deutsch/ }));

    const navDe = screen.getByRole('complementary', { name: 'Hauptnavigation' });
    expect(within(navDe).getByRole('button', { name: 'Einstellungen' })).toBeTruthy();
    expect(localStorage.getItem('arcade.lang')).toBe('de');
    expect(screen.getByRole('button', { name: /sprache/i }).textContent).toContain('DE');
  });

  it('localizes the breadcrumb and badge numbers', () => {
    applyLang('hu', { silent: true });
    const big = { ...stats, tetris: { ...emptyStats(), best: 12345 } };
    render(
      <Sidebar
        route={{ view: 'leaderboard' }}
        navigate={() => {}}
        collapsed={false}
        onToggleCollapsed={() => {}}
        gamesCollapsed={false}
        onToggleGames={() => {}}
        stats={big}
        sessions={{}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Ranglista' })).toBeTruthy();
    expect(screen.getByText(/12\s345/)).toBeTruthy();
  });

  it('Escape closes the language list without reaching the game, focus back on the trigger', () => {
    const onEsc = vi.fn((e: KeyboardEvent) => e.key === 'Escape');
    window.addEventListener('keydown', onEsc);
    render(<Shell />);
    const trigger = screen.getByRole('button', { name: /language/i });
    fireEvent.click(trigger);
    const list = screen.getByRole('list', { name: 'Language' });
    const english = within(list).getByRole('button', { name: /English/ });
    expect(english.getAttribute('aria-pressed')).toBe('true');
    expect(within(list).getByRole('button', { name: /Deutsch/ }).getAttribute('aria-pressed')).toBe('false');
    english.focus();
    fireEvent.keyDown(english, { key: 'Escape' });
    expect(onEsc).not.toHaveBeenCalled();
    expect(screen.queryByRole('list', { name: 'Language' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(onEsc).toHaveBeenCalledTimes(1);
    window.removeEventListener('keydown', onEsc);
  });
});

/** jsdom has no layout: fake the window width and answer `(max-width: …)` / `(min-width: …)` queries from it. */
function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => {
      const max = /max-width:\s*([\d.]+)px/.exec(query);
      const min = /min-width:\s*([\d.]+)px/.exec(query);
      const matches = max ? width <= Number(max[1]) : min ? width >= Number(min[1]) : false;
      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      };
    },
  });
}

const gameButtonNames = ARCADE_GAMES.map((g) => gameName(g.id, 'en'));

function gameItems(nav: HTMLElement) {
  return within(nav)
    .queryAllByRole('button')
    .filter((b) => gameButtonNames.includes(b.getAttribute('title') ?? ''));
}

describe('collapsible game list', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    applyDental(false, { silent: true });
    localStorage.setItem('arcade.nickPromptDismissed', '1');
    setViewport(1440);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.location.hash = '';
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('hides every game but the active one, and the choice survives a remount', () => {
    window.location.hash = '#/play/snake';
    const { unmount } = render(<App />);
    const nav = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(gameItems(nav)).toHaveLength(ARCADE_GAMES.length);

    const toggle = within(nav).getByRole('button', { name: 'Games' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(gameItems(nav).map((b) => b.getAttribute('title'))).toEqual(['Snake']);
    expect(localStorage.getItem('arcade.sidebarGamesCollapsed')).toBe('1');

    unmount();
    render(<App />);
    const nav2 = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(within(nav2).getByRole('button', { name: 'Games' }).getAttribute('aria-expanded')).toBe('false');
    expect(gameItems(nav2).map((b) => b.getAttribute('title'))).toEqual(['Snake']);

    fireEvent.click(within(nav2).getByRole('button', { name: 'Games' }));
    expect(gameItems(nav2)).toHaveLength(ARCADE_GAMES.length);
    expect(localStorage.getItem('arcade.sidebarGamesCollapsed')).toBe('0');
  });

  it('shows no game items when collapsed and no game is open', () => {
    localStorage.setItem('arcade.sidebarGamesCollapsed', '1');
    render(<App />);
    const nav = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(gameItems(nav)).toHaveLength(0);
    expect(within(nav).getByRole('button', { name: 'Home' })).toBeTruthy();
    expect(within(nav).getByRole('button', { name: 'Leaderboard' })).toBeTruthy();
  });
});

describe('mobile drawer', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    applyDental(false, { silent: true });
    localStorage.setItem('arcade.nickPromptDismissed', '1');
    setViewport(390);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.location.hash = '';
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('opens from the menu button, closes on Escape with focus back on the button', () => {
    render(<App />);
    expect(screen.queryByRole('dialog')).toBeNull();
    const menu = screen.getByRole('button', { name: 'Menu' });
    expect(menu.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(menu);
    const drawer = screen.getByRole('dialog', { name: 'Main navigation' });
    expect(drawer.getAttribute('aria-modal')).toBe('true');
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    expect(within(drawer).getByRole('button', { name: 'Leaderboard' })).toBeTruthy();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(menu);
  });

  it('closes on the backdrop and after navigating', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    fireEvent.click(screen.getByTestId('drawer-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const drawer = screen.getByRole('dialog', { name: 'Main navigation' });
    await act(async () => {
      fireEvent.click(within(drawer).getByRole('button', { name: 'Tetris' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(window.location.hash).toBe('#/play/tetris'));
  });

  it('is a plain sidebar, not a modal, on a wide screen', () => {
    setViewport(1440);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('complementary', { name: 'Main navigation' })).toBeTruthy();
  });
});
