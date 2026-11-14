import { describe, expect, it } from 'vitest';
import { loadSession, saveSession } from '../arcade';
import { decide } from '../bots/decide';
import { toBotView } from '../bots/view';
import { mulberry32, type Player } from '../engine';
import {
  act, botRng, DEALS_PER_SESSION, dealerFor, isBotTurn, isUltiSession, nextDeal, playBotSession, runBots, SESSION_SCHEMA, sessionScore,
  startSession, type UltiSession,
} from './session';

const clone = (s: UltiSession): UltiSession => JSON.parse(JSON.stringify(s));

/** The "human" in tests: a medium bot deciding for seat 0. */
function humanMove(s: UltiSession): UltiSession {
  return act(s, decide(toBotView(s.deal, 0), 'medium', mulberry32(s.deal.log.length + s.dealNo * 97)));
}

/** Plays the whole session (human = medium heuristics) and returns every intermediate state. */
function playSession(seed: number, difficulty: UltiSession['difficulty'] = 'medium'): UltiSession[] {
  const states: UltiSession[] = [];
  let s = startSession({ difficulty, seed });
  let guard = 0;
  while (s.phase !== 'finished') {
    if (++guard > 5000) throw new Error('Session did not finish');
    states.push(s);
    if (s.phase === 'dealOver') s = nextDeal(s);
    else if (isBotTurn(s)) s = runBots(s);
    else s = humanMove(s);
  }
  states.push(s);
  return states;
}

describe('session', () => {
  it('seats the human at 0 and two bots of the difficulty; the dealer rotates every deal', () => {
    const s = startSession({ difficulty: 'hard', seed: 3 });
    expect(s.seats).toEqual(['human', 'hard', 'hard']);
    expect(s.dealNo).toBe(1);
    expect(s.deal.dealer).toBe(dealerFor(s, 1));
    expect([1, 2, 3].map((n) => dealerFor(s, n))).toEqual([0, 1, 2].map((k) => ((s.firstDealer + k) % 3) as Player));
  });

  it(`ends after ${DEALS_PER_SESSION} deals and reports the score`, () => {
    const states = playSession(11);
    const end = states[states.length - 1];
    expect(DEALS_PER_SESSION).toBe(10);
    expect(end.phase).toBe('finished');
    expect(end.history).toHaveLength(10);
    expect(new Set(states.map((x) => x.dealNo))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    const totals = end.history.reduce((t, d) => t.map((v, i) => v + d.units[i]), [0, 0, 0]);
    expect(end.scores).toEqual(totals);
    expect(end.scores[0] + end.scores[1] + end.scores[2]).toBe(0);
    expect(sessionScore(end)).toBe(Math.min(30000, Math.max(0, end.scores[0]) * 50 * 1.5));
    expect(end.history.map((d) => d.dealer)).toEqual(Array.from({ length: 10 }, (_, i) => dealerFor(end, i + 1)));
    // Nothing moves once finished.
    expect(() => nextDeal(end)).toThrow();
  });

  it('runBots stops at the human’s turn or at the end of a deal, and is deterministic', () => {
    const s = startSession({ difficulty: 'easy', seed: 5 });
    const a = runBots(s);
    const b = runBots(clone(s));
    expect(a).toEqual(b);
    expect(a.phase === 'dealOver' || a.deal.turn === 0).toBe(true);
    expect(() => act(a.phase === 'playing' ? { ...a, deal: { ...a.deal, turn: 1 } } : a, { type: 'pass' })).toThrow();
  });

  it('resume mid-deal restores the hands and the turn (through the kit session store)', () => {
    const states = playSession(21, 'hard');
    const mid = states.find((x) => x.phase === 'playing' && x.deal.phase === 'play' && x.deal.tricks.length === 4 && !isBotTurn(x));
    expect(mid).toBeDefined();
    const s = mid as UltiSession;
    saveSession('ulti', { schema: SESSION_SCHEMA, data: s, seconds: 42, score: sessionScore(s) });
    const env = loadSession<UltiSession>('ulti', SESSION_SCHEMA, isUltiSession);
    expect(env).not.toBeNull();
    const back = (env as NonNullable<typeof env>).data;
    expect(back.deal.hands).toEqual(s.deal.hands);
    expect(back.deal.turn).toBe(s.deal.turn);
    expect(back.deal.talon).toEqual(s.deal.talon);
    expect(back.deal.tricks).toEqual(s.deal.tricks);
    expect(back.scores).toEqual(s.scores);
    expect(back.dealNo).toBe(s.dealNo);
    expect(back.difficulty).toBe('hard');
    // The restored session continues exactly like the original.
    expect(runBots(humanMove(back))).toEqual(runBots(humanMove(s)));
  });

  it('the save guard accepts every real snapshot and rejects tampering', () => {
    const states = playSession(8, 'easy');
    for (const x of states) expect(isUltiSession(clone(x))).toBe(true);
    const mid = clone(states.find((x) => x.deal.phase === 'play') as UltiSession);
    expect(isUltiSession({ ...mid, difficulty: 'nightmare' })).toBe(false);
    expect(isUltiSession({ ...mid, dealNo: 11 })).toBe(false);
    expect(isUltiSession({ ...mid, scores: [mid.scores[0] + 1, mid.scores[1], mid.scores[2]] })).toBe(false);
    const dup = clone(mid);
    (dup.deal.hands[0] as unknown[])[0] = dup.deal.hands[1][0];
    expect(isUltiSession(dup)).toBe(false);
    const turn = clone(mid);
    (turn.deal as { turn: number }).turn = 5;
    expect(isUltiSession(turn)).toBe(false);
    expect(isUltiSession({ ...mid, seats: ['hard', 'hard', 'hard'] })).toBe(false);
    expect(isUltiSession(null)).toBe(false);
  });

  it('the save guard checks the shape of every history[].result', () => {
    const states = playSession(8, 'easy');
    const later = clone(states.find((x) => x.history.length >= 2 && x.deal.phase === 'play') as UltiSession);
    expect(isUltiSession(later)).toBe(true);
    const tamper = (f: (r: Record<string, unknown>) => void) => {
      const x = clone(later);
      f(x.history[1].result as unknown as Record<string, unknown>);
      return isUltiSession(x);
    };
    expect(tamper((r) => Object.keys(r).forEach((k) => delete r[k]))).toBe(false);
    expect(tamper((r) => (r.declarer = 7))).toBe(false);
    expect(tamper((r) => (r.bid = { kinds: ['nope'], trump: 'piros' }))).toBe(false);
    expect(tamper((r) => (r.kontra = 'yes'))).toBe(false);
    expect(tamper((r) => (r.contracts = []))).toBe(false);
    expect(tamper((r) => ((r.contracts as { won: boolean }[])[0].won = !(r.contracts as { won: boolean }[])[0].won))).toBe(false);
    expect(tamper((r) => (r.tricksWon = [11, 0, 0]))).toBe(false);
    expect(tamper((r) => (r.parti = { declarer: 'a', defenders: 0 }))).toBe(false);
  });

  it('bot RNG depends only on the saved state (so a resumed game replays the same bot moves)', () => {
    const s = startSession({ difficulty: 'medium', seed: 9 });
    expect(botRng(s)()).toBe(botRng(clone(s))());
  });

  it('all-bot sessions for the strength simulation finish with zero-sum scores', () => {
    const end = playBotSession(['medium', 'easy', 'medium'], 77);
    expect(end.phase).toBe('finished');
    expect(end.scores.reduce((a, b) => a + b, 0)).toBe(0);
  });
});
