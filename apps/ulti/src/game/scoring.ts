import type { RunOutcome } from '../arcade/types';
import type { Level } from '../bots/profiles';

/** Arcade points per net unit won over the session. */
export const POINTS_PER_UNIT = 50;
export const DIFFICULTY_FACTOR: Readonly<Record<Level, number>> = { easy: 1, medium: 1.5, hard: 2 };
/** The portal's `max_score` for `ulti`. */
export const MAX_SCORE = 30000;

/** max(0, netUnits) × 50 × difficulty factor, capped at the arcade maximum. */
export function arcadeScore(netUnits: number, difficulty: Level): number {
  return Math.min(MAX_SCORE, Math.round(Math.max(0, netUnits) * POINTS_PER_UNIT * DIFFICULTY_FACTOR[difficulty]));
}

/** The human (seat 0) wins the session by finishing strictly on top; level with the best bot is a draw. */
export function sessionOutcome(scores: readonly [number, number, number]): RunOutcome {
  const bestBot = Math.max(scores[1], scores[2]);
  if (scores[0] > bestBot) return 'win';
  return scores[0] === bestBot ? 'draw' : 'loss';
}
