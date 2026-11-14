/** Test helpers for the bots: drive a whole deal with bots in every seat (not part of the game bundle). */
import { dealCards, mulberry32, type DealState, type Player } from '../engine';
import { applyAction, type Action } from './actions';
import { decide } from './decide';
import type { Level } from './profiles';
import { toBotView } from './view';

export interface DriveOptions {
  seed: number;
  dealer?: Player;
  levels: readonly [Level, Level, Level];
  /** Called before every decision with the state and the decision maker. */
  onDecision?: (state: DealState, player: Player, action: Action) => void;
}

/** Plays one deal with bots to the end; returns the final state. */
export function driveDeal(o: DriveOptions): DealState {
  let s = dealCards(o.seed, o.dealer ?? 0);
  const rng = mulberry32(o.seed ^ 0x5eed);
  let guard = 0;
  while (s.phase !== 'over') {
    if (++guard > 500) throw new Error('Deal did not finish');
    const p = s.turn;
    const action = decide(toBotView(s, p), o.levels[p], rng);
    o.onDecision?.(s, p, action);
    s = applyAction(s, action);
  }
  return s;
}
