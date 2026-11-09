import { useCallback } from 'react';
import type { ArcadeGameId } from '@arcade/kit';
import { submitScore } from '../services/api';
import { getNickname } from '../services/nickname';

/**
 * Callback for a game's `onGameOver`. Each finished ranked run is reported
 * exactly once by the kit (`useArcadeRun`), so no dedupe or cancellation is
 * needed here — both used to drop legitimate scores (two runs ending on the
 * same score; quick duel rounds aborting the previous request).
 * Without a nickname nothing is sent; the caller learns that from the result
 * ('needs-nickname') so it can offer one and submit the run afterwards.
 */
export type SubmitOutcome = 'sent' | 'needs-nickname' | 'ignored';

export function useScoreSubmitter() {
  return useCallback((game: ArcadeGameId, score: number, nickname?: string): SubmitOutcome => {
    if (!Number.isFinite(score) || score <= 0) return 'ignored';
    const nick = nickname ?? getNickname();
    if (!nick) return 'needs-nickname';
    void submitScore(game, nick, Math.floor(score));
    return 'sent';
  }, []);
}
