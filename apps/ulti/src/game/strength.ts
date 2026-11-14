import type { Level } from '../bots/profiles';
import { playBotSession } from './session';

/** Result of one strength pairing (A vs B with a medium bot in the third seat). */
export interface Tally {
  wins: number;
  ties: number;
  sessions: number;
  unitsA: number;
  unitsB: number;
}

export const STRENGTH_BASE_SEED = 90_000;
export const STRENGTH_THRESHOLD = 0.6;

export const emptyTally = (): Tally => ({ wins: 0, ties: 0, sessions: 0, unitsA: 0, unitsB: 0 });

export const addTally = (x: Tally, y: Tally): Tally => ({
  wins: x.wins + y.wins,
  ties: x.ties + y.ties,
  sessions: x.sessions + y.sessions,
  unitsA: x.unitsA + y.unitsA,
  unitsB: x.unitsB + y.unitsB,
});

/**
 * Sessions `shard`, `shard + shards`, … below `sessions`: A and B at seats 0 and 1, medium at seat 2; odd sessions
 * replay the previous seed with A and B swapped. A wins a session by ending with more units than B.
 */
export function strengthTally(a: Level, b: Level, sessions: number, shard = 0, shards = 1): Tally {
  const t = emptyTally();
  for (let i = shard; i < sessions; i += shards) {
    const swapped = i % 2 === 1;
    const seed = STRENGTH_BASE_SEED + Math.floor(i / 2);
    const end = playBotSession(swapped ? [b, a, 'medium'] : [a, b, 'medium'], seed);
    const ua = end.scores[swapped ? 1 : 0];
    const ub = end.scores[swapped ? 0 : 1];
    t.sessions += 1;
    t.unitsA += ua;
    t.unitsB += ub;
    if (ua > ub) t.wins += 1;
    else if (ua === ub) t.ties += 1;
  }
  return t;
}
