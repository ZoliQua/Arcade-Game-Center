import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { applyLang, ARCADE_GAMES, emptyStats, type ArcadeGameId, type GameStats } from '@arcade/kit';
import { Header, Sidebar, type Route } from '@arcade/ui';

const stats = Object.fromEntries(ARCADE_GAMES.map((g) => [g.id, emptyStats()])) as Record<ArcadeGameId, GameStats>;

function Shell({ route = { view: 'home' } as Route }) {
  return (
    <>
      <Sidebar route={route} navigate={() => {}} collapsed={false} onToggleCollapsed={() => {}} stats={stats} sessions={{}} />
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
    fireEvent.click(screen.getByRole('menuitemradio', { name: /Deutsch/ }));

    const navDe = screen.getByRole('complementary', { name: 'Hauptnavigation' });
    expect(within(navDe).getByRole('button', { name: 'Einstellungen' })).toBeTruthy();
    expect(localStorage.getItem('arcade.lang')).toBe('de');
    expect(screen.getByRole('button', { name: /sprache/i }).textContent).toContain('DE');
  });

  it('localizes the breadcrumb and badge numbers', () => {
    applyLang('hu', { silent: true });
    const big = { ...stats, tetris: { ...emptyStats(), best: 12345 } };
    render(
      <Sidebar route={{ view: 'leaderboard' }} navigate={() => {}} collapsed={false} onToggleCollapsed={() => {}} stats={big} sessions={{}} />,
    );
    expect(screen.getByRole('button', { name: 'Ranglista' })).toBeTruthy();
    expect(screen.getByText(/12\s345/)).toBeTruthy();
  });
});
