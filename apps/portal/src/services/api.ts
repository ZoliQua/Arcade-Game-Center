import { ARCADE_GAMES, type ArcadeGameId } from '@arcade/kit';

export type GameId = ArcadeGameId;

export type LeaderboardEntry = {
  name: string;
  score: number;
  at: string;
};

const BASE = (import.meta.env.VITE_ARCADE_API_BASE ?? '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_ARCADE_API_KEY ?? '';

export const apiConfigured = BASE !== '' && KEY !== '';

type SubmitResult =
  | { ok: true; rank: number; id: number }
  | { ok: false; error: string };

export async function submitScore(
  game: GameId,
  name: string,
  score: number,
  signal?: AbortSignal,
): Promise<SubmitResult> {
  if (!apiConfigured) return { ok: false, error: 'api_not_configured' };

  try {
    const res = await fetch(`${BASE}/score.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': KEY,
      },
      body: JSON.stringify({ game, name, score }),
      signal,
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return { ok: false, error: String(data['error'] ?? `http_${res.status}`) };
    }
    return {
      ok: true,
      rank: typeof data['rank'] === 'number' ? data['rank'] : 0,
      id: typeof data['id'] === 'number' ? data['id'] : 0,
    };
  } catch (e) {
    if ((e as { name?: string }).name === 'AbortError') {
      return { ok: false, error: 'aborted' };
    }
    return { ok: false, error: 'network_error' };
  }
}

/**
 * Top scores of one game. Throws when the server answers with an error or an
 * unexpected payload, so callers can tell "no scores yet" from "server down".
 */
export async function fetchLeaderboard(
  game: GameId,
  limit = 10,
  signal?: AbortSignal,
): Promise<LeaderboardEntry[]> {
  if (!apiConfigured) return [];

  const url = `${BASE}/leaderboard.php?game=${encodeURIComponent(game)}&limit=${limit}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`http_${res.status}`);
  const data = (await res.json()) as { ok?: boolean; top?: LeaderboardEntry[] };
  if (!data.ok || !Array.isArray(data.top)) throw new Error('bad_payload');
  return data.top;
}

/** Top scores of every game in one request. Throws like {@link fetchLeaderboard}. */
export async function fetchAllLeaderboards(
  signal?: AbortSignal,
): Promise<Record<GameId, LeaderboardEntry[]>> {
  const empty = Object.fromEntries(ARCADE_GAMES.map((g) => [g.id, []])) as unknown as Record<
    GameId,
    LeaderboardEntry[]
  >;
  if (!apiConfigured) return empty;

  const res = await fetch(`${BASE}/leaderboard.php`, { signal });
  if (!res.ok) throw new Error(`http_${res.status}`);
  const data = (await res.json()) as {
    ok?: boolean;
    leaderboards?: Record<GameId, LeaderboardEntry[]>;
  };
  if (!data.ok || !data.leaderboards) throw new Error('bad_payload');
  return { ...empty, ...data.leaderboards };
}
