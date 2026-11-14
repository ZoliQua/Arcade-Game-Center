import { useCallback } from 'react';
import type { ArcadeGameId } from '@arcade/kit';
import { submitScore } from '../services/api';
import { getNickname } from '../services/nickname';

/**
 * Callback for a game's `onGameOver`. Each ranked run is reported exactly once
 * by the kit (`useArcadeRun`), so no dedupe or cancellation is needed here —
 * both used to drop legitimate scores (two runs ending on the same score;
 * quick duel rounds aborting the previous request).
 * A natural game over ranks only a positive score; a run the player finished
 * early (`finished`) ranks its score even when it is 0.
 * Without a nickname nothing is sent; the caller learns that from the result
 * ('needs-nickname') so it can offer one and submit the run afterwards.
 * The promise settles once the request has been answered ('sent' also when the
 * server refused it: there is nothing the player could do about that).
 */
export type SubmitOutcome = 'sent' | 'needs-nickname' | 'ignored';

export function useScoreSubmitter() {
  return useCallback(
    async (game: ArcadeGameId, score: number, nickname?: string, finished = false): Promise<SubmitOutcome> => {
      if (!Number.isFinite(score) || score < 0 || (score === 0 && !finished)) return 'ignored';
      const nick = nickname ?? getNickname();
      if (!nick) return 'needs-nickname';
      await submitScore(game, nick, Math.floor(score));
      return 'sent';
    },
    [],
  );
}
