import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ARCADE_GAMES } from '@arcade/kit';

const fetchAllLeaderboards = vi.fn();

vi.mock('./services/api', () => ({
  apiConfigured: true,
  fetchAllLeaderboards: (signal?: AbortSignal) => fetchAllLeaderboards(signal),
}));

const { Leaderboard } = await import('./Leaderboard');

afterEach(() => {
  fetchAllLeaderboards.mockReset();
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
});
