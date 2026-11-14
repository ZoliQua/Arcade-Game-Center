import { describe, expect, it } from 'vitest';
import type { HCard } from '../deck/cards';
import { bidFeasible, bidValue, isHigherBid, makeBid } from '../engine';
import { c } from '../engine/__tests__/helpers';
import { bestBids, chooseBid, chooseDiscard, partiChance, wantsPickUp } from './bid';

const strong: HCard[] = [
  c('zold', 'asz'), c('zold', 'X'), c('zold', 'kiraly'), c('zold', 'felso'), c('zold', 'also'), c('zold', 'VII'),
  c('piros', 'asz'), c('tok', 'asz'), c('makk', 'asz'), c('makk', 'X'),
];
const weak: HCard[] = [
  c('zold', 'VIII'), c('zold', 'IX'), c('piros', 'VIII'), c('piros', 'also'), c('tok', 'IX'), c('tok', 'felso'),
  c('makk', 'VIII'), c('makk', 'also'), c('makk', 'IX'), c('tok', 'VIII'),
];
const lowCards: HCard[] = [
  c('zold', 'VII'), c('zold', 'VIII'), c('zold', 'IX'), c('piros', 'VII'), c('piros', 'VIII'), c('tok', 'VII'),
  c('tok', 'IX'), c('makk', 'VII'), c('makk', 'VIII'), c('makk', 'X'),
];

describe('medium bidding heuristics', () => {
  it('a strong zöld hand with the trump VII goes for more than a plain Passz', () => {
    const bid = chooseBid(strong, null, 'medium');
    expect(bid.trump).toBe('zold');
    expect(bidValue(bid)).toBeGreaterThan(1);
    expect(bid.kinds).toContain('ulti');
  });

  it('a weak hand that must bid takes the cheapest contract it can, never an Ulti or Betli', () => {
    const bid = chooseBid(weak, null, 'medium');
    expect(bid.kinds).toEqual(['passz']);
  });

  it('a hand of low cards plays Betli when it must outbid a Passz', () => {
    const bid = chooseBid(lowCards, makeBid(['passz'], 'piros'), 'medium');
    expect(bid.kinds).toEqual(['betli']);
  });

  it('only wants the talon when its own 10 cards already make a better bid it believes in', () => {
    const top = makeBid(['ulti', 'passz'], 'piros');
    expect(wantsPickUp(weak, makeBid(['passz'], 'zold'), 'medium')).toBe(false);
    expect(wantsPickUp(strong, makeBid(['passz'], 'tok'), 'medium')).toBe(true);
    for (const hand of [strong, weak, lowCards]) {
      if (wantsPickUp(hand, top, 'medium')) {
        expect(bestBids(hand, top, 'medium').some((b) => isHigherBid(b.bid, top) && bidFeasible(b.bid, hand))).toBe(true);
      }
    }
  });

  it('easy only takes the talon for a Passz with a strong hand', () => {
    expect(wantsPickUp(weak, makeBid(['passz'], 'zold'), 'easy')).toBe(false);
    const piros = strong.map((card) => (card.suit === 'zold' ? { ...card, suit: 'piros' as const } : card.suit === 'piros' ? { ...card, suit: 'zold' as const } : card));
    expect(wantsPickUp(piros, makeBid(['passz'], 'zold'), 'easy')).toBe(true);
    expect(wantsPickUp(piros, makeBid(['passz'], 'piros'), 'easy')).toBe(false);
  });

  it('discards keep a legal higher bid and lay away short side cards rather than trumps', () => {
    const twelve = [...strong, c('tok', 'VII'), c('piros', 'VIII')];
    const [a, b] = chooseDiscard(twelve, null, 'medium', () => 0.5);
    const rest = twelve.filter((x) => x !== a && x !== b);
    expect(rest).toHaveLength(10);
    expect([a, b].some((x) => x.suit === 'zold')).toBe(false);
  });

  it('values parti chances sensibly', () => {
    expect(partiChance(strong, 'zold')).toBeGreaterThan(0.8);
    expect(partiChance(weak, 'zold')).toBeLessThan(0.35);
  });
});
