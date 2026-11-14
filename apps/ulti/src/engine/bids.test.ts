import { describe, expect, it } from 'vitest';
import { ALL_BIDS, BASE_VALUE, bidFeasible, bidValue, isHigherBid, makeBid } from './bids';
import { c } from './__tests__/helpers';

describe('bid values', () => {
  it('base values per opponent', () => {
    expect(BASE_VALUE).toEqual({
      passz: 1, negyvenszaz: 4, ulti: 4, betli: 5, durchmars: 6, huszszaz: 8, szintelenDurchmars: 12,
    });
  });
  it('piros doubles the trump bids, not betli or színtelen durchmars', () => {
    expect(bidValue(makeBid(['passz'], 'zold'))).toBe(1);
    expect(bidValue(makeBid(['passz'], 'piros'))).toBe(2);
    expect(bidValue(makeBid(['negyvenszaz'], 'piros'))).toBe(8);
    expect(bidValue(makeBid(['huszszaz'], 'piros'))).toBe(16);
    expect(bidValue(makeBid(['ulti'], 'piros'))).toBe(8);
    expect(bidValue(makeBid(['durchmars'], 'piros'))).toBe(12);
    expect(bidValue(makeBid(['betli'], null))).toBe(5);
    expect(bidValue(makeBid(['szintelenDurchmars'], null))).toBe(12);
  });
  it('combinations add their values (and piros doubles the sum)', () => {
    expect(bidValue(makeBid(['ulti', 'passz'], 'tok'))).toBe(5);
    expect(bidValue(makeBid(['passz', 'ulti'], 'piros'))).toBe(10);
    expect(bidValue(makeBid(['ulti', 'negyvenszaz'], 'makk'))).toBe(8);
    expect(bidValue(makeBid(['ulti', 'huszszaz'], 'zold'))).toBe(12);
    expect(bidValue(makeBid(['ulti', 'durchmars'], 'piros'))).toBe(20);
  });
  it('rejects shapes outside the allowed list and wrong trump', () => {
    expect(() => makeBid(['passz', 'negyvenszaz'], 'tok')).toThrow();
    expect(() => makeBid(['ulti', 'betli'], 'tok')).toThrow();
    expect(() => makeBid(['betli'], 'piros')).toThrow();
    expect(() => makeBid(['ulti'], null)).toThrow();
  });
  it('lists every bid: 9 trump shapes × 4 suits + 2 colourless', () => {
    expect(ALL_BIDS).toHaveLength(38);
  });
});

describe('bid ordering', () => {
  it('higher value wins; anything beats no bid', () => {
    expect(isHigherBid(makeBid(['passz'], 'tok'), null)).toBe(true);
    expect(isHigherBid(makeBid(['betli'], null), makeBid(['ulti'], 'tok'))).toBe(true);
    expect(isHigherBid(makeBid(['ulti'], 'tok'), makeBid(['betli'], null))).toBe(false);
  });
  it('equal value: piros beats non-piros, otherwise not higher', () => {
    expect(isHigherBid(makeBid(['ulti'], 'piros'), makeBid(['huszszaz'], 'tok'))).toBe(true);
    expect(isHigherBid(makeBid(['huszszaz'], 'tok'), makeBid(['ulti'], 'piros'))).toBe(false);
    expect(isHigherBid(makeBid(['durchmars'], 'piros'), makeBid(['szintelenDurchmars'], null))).toBe(true);
    expect(isHigherBid(makeBid(['ulti'], 'zold'), makeBid(['negyvenszaz'], 'makk'))).toBe(false);
    expect(isHigherBid(makeBid(['ulti', 'passz'], 'zold'), makeBid(['betli'], null))).toBe(false);
    expect(isHigherBid(makeBid(['passz'], 'zold'), makeBid(['passz'], 'tok'))).toBe(false);
    expect(isHigherBid(makeBid(['passz'], 'piros'), makeBid(['passz'], 'tok'))).toBe(true);
  });
  it('combination beats its parts', () => {
    expect(isHigherBid(makeBid(['ulti', 'passz'], 'tok'), makeBid(['ulti'], 'tok'))).toBe(true);
    expect(isHigherBid(makeBid(['ulti', 'durchmars'], 'tok'), makeBid(['durchmars'], 'piros'))).toBe(false);
  });
});

describe('bid feasibility', () => {
  const hand = [c('tok', 'VII'), c('tok', 'kiraly'), c('tok', 'felso'), c('zold', 'kiraly'), c('makk', 'felso')];
  it('ulti needs the trump VII', () => {
    expect(bidFeasible(makeBid(['ulti'], 'tok'), hand)).toBe(true);
    expect(bidFeasible(makeBid(['ulti'], 'zold'), hand)).toBe(false);
  });
  it('negyvenszáz needs K+F of trump, húszszáz K+F of another suit', () => {
    expect(bidFeasible(makeBid(['negyvenszaz'], 'tok'), hand)).toBe(true);
    expect(bidFeasible(makeBid(['negyvenszaz'], 'zold'), hand)).toBe(false);
    expect(bidFeasible(makeBid(['huszszaz'], 'zold'), hand)).toBe(true);
    expect(bidFeasible(makeBid(['huszszaz'], 'tok'), hand)).toBe(false);
  });
  it('passz, betli and durchmars have no card requirement', () => {
    expect(bidFeasible(makeBid(['passz'], 'makk'), hand)).toBe(true);
    expect(bidFeasible(makeBid(['betli'], null), hand)).toBe(true);
    expect(bidFeasible(makeBid(['durchmars'], 'piros'), hand)).toBe(true);
  });
});
