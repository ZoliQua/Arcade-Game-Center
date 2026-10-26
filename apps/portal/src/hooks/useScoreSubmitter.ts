import { useCallback } from 'react';
import type { ArcadeGameId } from '@arcade/kit';
import { submitScore } from '../services/api';
import { getNickname } from '../services/nickname';

/**
 * Callback for a game's `onGameOver`. Each finished ranked run is reported
 * exactly once by the kit (`useArcadeRun`), so no dedupe or cancellation is
 * needed here — both used to drop legitimate scores (two runs ending on the
 * same score; quick duel rounds aborting the previous request).
 * Without a nickname nothing is sent.
 */
export function useScoreSubmitter() {
  return useCallback((game: ArcadeGameId, score: number) => {
    if (!Number.isFinite(score) || score <= 0) return;
    const nick = getNickname();
    if (!nick) return;
    void submitScore(game, nick, Math.floor(score));
  }, []);
}
