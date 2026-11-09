import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Api = typeof import('./api');

/** Re-import api.ts with the given build-time env, as Vite would bake it in. */
async function loadApi(base: string, key = 'k'): Promise<Api> {
  vi.resetModules();
  vi.stubEnv('VITE_ARCADE_API_BASE', base);
  vi.stubEnv('VITE_ARCADE_API_KEY', key);
  return import('./api');
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('api with a same-origin relative base', () => {
  it('is configured and calls /arcade/api/… on the current host', async () => {
    const api = await loadApi('/arcade/api/');
    expect(api.apiConfigured).toBe(true);

    fetchMock.mockResolvedValueOnce(json({ ok: true, rank: 3, id: 7 }));
    expect(await api.submitScore('snake', 'Zoli', 42)).toEqual({ ok: true, rank: 3, id: 7 });
    expect(fetchMock.mock.calls[0][0]).toBe('/arcade/api/score.php');

    fetchMock.mockResolvedValueOnce(json({ ok: true, top: [] }));
    await api.fetchLeaderboard('tetris', 5);
    expect(fetchMock.mock.calls[1][0]).toBe('/arcade/api/leaderboard.php?game=tetris&limit=5');

    fetchMock.mockResolvedValueOnce(json({ ok: true, leaderboards: {} }));
    await api.fetchAllLeaderboards();
    expect(fetchMock.mock.calls[2][0]).toBe('/arcade/api/leaderboard.php');
  });

  it('is not configured without a base', async () => {
    const api = await loadApi('');
    expect(api.apiConfigured).toBe(false);
  });

  it('ships a relative base in .env.example, so apex and www both reach their own API', () => {
    const example = readFileSync(resolve(__dirname, '../../.env.example'), 'utf8');
    expect(example).toMatch(/^VITE_ARCADE_API_BASE=\/arcade\/api$/m);
  });
});
