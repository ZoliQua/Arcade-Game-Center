import { useCallback, useRef } from 'react';
import { submitScore, type GameId } from '../services/api';
import { getNickname } from '../services/nickname';

/**
 * Returns a callback the game wrappers call when a run finishes
 * (status === 'gameOver'). Submits the final score to the backend
 * if the player has set a nickname, otherwise no-ops.
 *
 * Dedupes by (game, score) so a single gameOver doesn't submit twice
 * even if the wrapper effect fires more than once.
 */
export function useScoreSubmitter() {
  const lastRef = useRef<{ game: GameId; score: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  return useCallback((game: GameId, score: number) => {
    if (!Number.isFinite(score) || score <= 0) return;

    const last = lastRef.current;
    if (last && last.game === game && last.score === score) return;
    lastRef.current = { game, score };

    const nick = getNickname();
    if (!nick) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    submitScore(game, nick, score, ctrl.signal).catch(() => {
      /* api.ts already swallows network errors; this catch is just defensive */
    });
  }, []);
}
