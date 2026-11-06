import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyLang, ARCADE_GAMES } from '@arcade/kit';

const fetchAllLeaderboards = vi.fn();

vi.mock('./services/api', () => ({
  apiConfigured: true,
  fetchAllLeaderboards: (signal?: AbortSignal) => fetchAllLeaderboards(signal),
}));

const { Leaderboard } = await import('./Leaderboard');

afterEach(() => {
  fetchAllLeaderboards.mockReset();
  localStorage.clear();
  applyLang('en', { silent: true });
});

describe('Leaderboard', () => {
  it('shows an error state, not "no scores", when the server fails', async () => {
    fetchAllLeaderboards.mockRejectedValue(new Error('http_500'));
    render(<Leaderboard />);
    expect(await screen.findByText('Could not reach leaderboard server')).toBeTruthy();
    expect(screen.getAllByText('Unavailable.').length).toBeGreaterThan(0);
    expect(screen.queryByText(/No scores yet/)).toBeNull();
  });

  it('shows "no scores yet" when the server answers with empty boards', async () => {
    fetchAllLeaderboards.mockResolvedValue(Object.fromEntries(ARCADE_GAMES.map((g) => [g.id, []])));
    render(<Leaderboard />);
    expect((await screen.findAllByText(/No scores yet/)).length).toBeGreaterThan(0);
    expect(screen.queryByText('Unavailable.')).toBeNull();
  });

  it('speaks German, with localized game names and numbers', async () => {
    applyLang('de', { silent: true });
    const boards: Record<string, { name: string; score: number; at: string }[]> = Object.fromEntries(
      ARCADE_GAMES.map((g) => [g.id, []]),
    );
    boards.tetris = [{ name: 'Zoli', score: 12345, at: new Date(Date.now() - 3 * 3600_000).toISOString() }];
    fetchAllLeaderboards.mockResolvedValue(boards);
    render(<Leaderboard />);
    expect(await screen.findByText('Top 10 pro Spiel · weltweit')).toBeTruthy();
    expect(screen.getByText('12.345')).toBeTruthy();
    expect(screen.getByText('vor 3 Std.')).toBeTruthy();
    expect(screen.getByText('1 Eintrag')).toBeTruthy();
    expect(screen.getAllByText('Noch keine Einträge – mach den Anfang!').length).toBeGreaterThan(0);
  });
});
