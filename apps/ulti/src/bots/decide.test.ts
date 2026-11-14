import { describe, expect, it } from 'vitest';
import {
  ALL_BIDS, bidFeasible, bidsEqual, dealCards, discard, isHigherBid, isLegalDiscard, legalBids, legalPlays, mulberry32, sameCard,
  type DealState, type Player,
} from '../engine';
import type { Action } from './actions';
import { decide } from './decide';
import { LEVELS, type Level } from './profiles';
import { driveDeal } from './testkit';
import { toBotView } from './view';

/** Is `action` one the rules allow in state `s` (without peeking at the talon for pick-ups)? */
function isLegal(s: DealState, a: Action): boolean {
  switch (a.type) {
    case 'discard':
      return isLegalDiscard(s, a.cards);
    case 'bid':
      return legalBids(s).some((b) => bidsEqual(b, a.bid));
    case 'pickUp':
      // A bot may only pick up when its own 10 cards already make a higher bid (so the talon never matters).
      return s.phase === 'pickup' && ALL_BIDS.some((b) => isHigherBid(b, s.bid) && bidFeasible(b, s.hands[s.turn]));
    case 'pass':
      return s.phase === 'pickup';
    case 'kontra':
    case 'skipKontra':
      return s.phase === 'kontra';
    case 'play':
      return legalPlays(s, s.turn).some((c) => sameCard(c, a.card));
  }
}

describe('decide', () => {
  for (const level of LEVELS) {
    it(`${level}: every decision of 12 seeded deals is legal`, () => {
      for (let seed = 100; seed < 112; seed += 1) {
        const end = driveDeal({
          seed,
          dealer: (seed % 3) as Player,
          levels: [level, level, level],
          onDecision: (s, _p, a) => expect(isLegal(s, a), `${a.type} in ${s.phase}`).toBe(true),
        });
        expect(end.phase).toBe('over');
      }
    });
  }

  it('mixed tables finish too (40 deals)', () => {
    const mixes: [Level, Level, Level][] = [
      ['easy', 'medium', 'hard'],
      ['hard', 'easy', 'medium'],
      ['medium', 'hard', 'easy'],
    ];
    for (let seed = 200; seed < 240; seed += 1) {
      const end = driveDeal({
        seed,
        dealer: (seed % 3) as Player,
        levels: mixes[seed % 3],
        onDecision: (s, _p, a) => expect(isLegal(s, a)).toBe(true),
      });
      expect(end.phase).toBe('over');
    }
  });

  it('easy only ever bids Passz', () => {
    for (let seed = 300; seed < 330; seed += 1) {
      driveDeal({
        seed,
        levels: ['easy', 'easy', 'easy'],
        onDecision: (_s, _p, a) => {
          if (a.type === 'bid') expect(a.bid.kinds).toEqual(['passz']);
        },
      });
    }
  });

  it('hard is deterministic for the same RNG seed', () => {
    let s = dealCards(7, 0);
    for (let step = 0; step < 6; step += 1) {
      const p = s.turn;
      const a = decide(toBotView(s, p), 'hard', mulberry32(99));
      const b = decide(toBotView(s, p), 'hard', mulberry32(99));
      expect(b).toEqual(a);
      if (a.type === 'discard') s = discard(s, a.cards);
      else break;
    }
    const end = driveDeal({ seed: 7, levels: ['hard', 'hard', 'hard'] });
    const again = driveDeal({ seed: 7, levels: ['hard', 'hard', 'hard'] });
    expect(again.log).toEqual(end.log);
  });

  it('a hard decision stays well under the time budget (150 ms on a laptop)', () => {
    let worst = 0;
    let total = 0;
    let count = 0;
    for (let seed = 400; seed < 406; seed += 1) {
      driveDeal({
        seed,
        levels: ['hard', 'hard', 'hard'],
        onDecision: (s, p) => {
          const t0 = performance.now();
          decide(toBotView(s, p), 'hard', mulberry32(seed));
          const ms = performance.now() - t0;
          worst = Math.max(worst, ms);
          total += ms;
          count += 1;
        },
      });
    }
    console.info(`hard decision: worst ${worst.toFixed(1)} ms, mean ${(total / count).toFixed(1)} ms over ${count}`);
    // Ceiling with headroom for slow CI machines (laptop: worst ≈ 70 ms).
    expect(worst).toBeLessThan(300);
  });
});
