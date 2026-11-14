/** Test fixtures: real sessions driven to a wanted moment (the "human" is a medium bot). Not part of the bundle. */
import { saveSession } from '../arcade';
import { decide } from '../bots/decide';
import type { Level } from '../bots/profiles';
import { toBotView } from '../bots/view';
import { cardKey, mulberry32, type DealState } from '../engine';
import { act, botStep, isBotTurn, nextDeal, SESSION_SCHEMA, startSession, type UltiSession } from '../game/session';

/** One step of the session: a bot, the medium "human", or the next deal. */
export function step(s: UltiSession): UltiSession {
  if (s.phase === 'dealOver') return nextDeal(s);
  if (isBotTurn(s)) return botStep(s);
  return act(s, decide(toBotView(s.deal, 0), 'medium', mulberry32(s.deal.log.length + s.dealNo * 97)));
}

/** The first state (over seeds, then moves) where `pred` holds. */
export function findSession(pred: (s: UltiSession) => boolean, difficulty: Level = 'medium', maxSeed = 300): UltiSession {
  for (let seed = 1; seed <= maxSeed; seed += 1) {
    let s = startSession({ difficulty, seed });
    for (let guard = 0; guard < 400 && s.phase !== 'finished'; guard += 1) {
      if (pred(s)) return JSON.parse(JSON.stringify(s)) as UltiSession;
      s = step(s);
    }
  }
  throw new Error('No session matches');
}

export const humanTurn = (s: UltiSession, phase: DealState['phase']): boolean =>
  s.phase === 'playing' && s.deal.phase === phase && s.deal.turn === 0;

export function save(s: UltiSession, seconds = 12): void {
  saveSession('ulti', { schema: SESSION_SCHEMA, data: s, seconds, score: 0 });
}

/** Keys of every card the bots hold. */
export const botCards = (s: UltiSession): Set<string> => new Set([...s.deal.hands[1], ...s.deal.hands[2]].map(cardKey));
