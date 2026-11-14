import { describe, expect, it } from 'vitest';
import type { HCard } from '../arcade/hungarian/cards';
import { isHigherBid, makeBid } from './bids';
import {
  applyBid, applyKontra, canPickUp, dealCards, discard, isLegalDiscard, legalBids, mulberry32, pass, pickUp, skipKontra,
} from './deal';
import { cardKey } from './ranks';
import { c } from './__tests__/helpers';
import type { DealState } from './types';

const keys = (cards: readonly HCard[]) => cards.map(cardKey).sort();
const allCards = (s: DealState) => [...s.hands[0], ...s.hands[1], ...s.hands[2], ...s.talon];

describe('mulberry32', () => {
  it('is deterministic per seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('dealCards', () => {
  it('deals 10 + 10 + 10 + talon 2, forehand (after the dealer) takes the talon', () => {
    const s = dealCards(7, 2);
    expect(s.forehand).toBe(0);
    expect(s.phase).toBe('discard');
    expect(s.turn).toBe(0);
    expect(s.hands.map((h) => h.length)).toEqual([12, 10, 10]);
    expect(s.talon).toHaveLength(0);
    expect(new Set(keys(allCards(s))).size).toBe(32);
    expect(s.log[0]).toEqual({ type: 'pickup', player: 0 });
  });
  it('same seed, same deal; dealer rotates the forehand', () => {
    expect(dealCards(5, 0).hands).toEqual(dealCards(5, 0).hands);
    expect(dealCards(5, 0).forehand).toBe(1);
    expect(dealCards(5, 1).forehand).toBe(2);
  });
  it('is immutable: actions never change the previous state', () => {
    const s = dealCards(9, 0);
    const before = JSON.stringify(s);
    discard(s, [s.hands[1][0], s.hands[1][1]]);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('bidding with the talon', () => {
  const start = () => {
    const s = dealCards(11, 2); // forehand 0
    const d = discard(s, [s.hands[0][0], s.hands[0][1]]);
    return d;
  };

  it('forehand must bid: cannot pass, discards 2, then bids at least Passz', () => {
    const s = dealCards(11, 2);
    expect(() => pass(s)).toThrow();
    expect(isLegalDiscard(s, [s.hands[0][0]])).toBe(false);
    expect(isLegalDiscard(s, [s.hands[0][0], s.hands[0][0]])).toBe(false);
    const d = start();
    expect(d.phase).toBe('declare');
    expect(d.hands[0]).toHaveLength(10);
    expect(d.talon).toHaveLength(2);
    const bids = legalBids(d);
    expect(bids).toContainEqual(makeBid(['passz'], 'zold'));
    expect(bids).toContainEqual(makeBid(['betli'], null));
  });

  it('next player passes or picks up the discards and must bid strictly higher', () => {
    const d = start();
    const b = applyBid(d, makeBid(['passz'], 'tok'));
    expect(b.phase).toBe('pickup');
    expect(b.turn).toBe(1);
    expect(canPickUp(b)).toBe(true);
    const talon = b.talon;
    const p = pickUp(b);
    expect(p.phase).toBe('discard');
    expect(keys(p.hands[1])).toEqual(keys([...b.hands[1], ...talon]));
    const q = discard(p, [p.hands[1][2], p.hands[1][3]]);
    const higher = legalBids(q);
    expect(higher.length).toBeGreaterThan(0);
    expect(higher.every((x) => isHigherBid(x, makeBid(['passz'], 'tok')))).toBe(true);
    expect(higher).not.toContainEqual(makeBid(['passz'], 'zold'));
    expect(higher).toContainEqual(makeBid(['passz'], 'piros'));
    expect(() => applyBid(q, makeBid(['passz'], 'zold'))).toThrow();
    const r = applyBid(q, makeBid(['passz'], 'piros'));
    expect(r.turn).toBe(2);
    expect(r.bidder).toBe(1);
  });

  it('ends when both others pass after the last bid; then defenders may kontra once', () => {
    const d = start();
    const b = applyBid(d, makeBid(['passz'], 'tok'));
    const e = pass(pass(b));
    expect(e.phase).toBe('kontra');
    expect(e.declarer).toBe(0);
    expect(e.turn).toBe(1);
    expect(e.hands.map((h) => h.length)).toEqual([10, 10, 10]);
    const k = applyKontra(e);
    expect(k.kontra).toBe(true);
    expect(k.kontraBy).toBe(1);
    expect(k.phase).toBe('play');
    expect(k.turn).toBe(0); // declarer leads
    const n = skipKontra(skipKontra(e));
    expect(n.kontra).toBe(false);
    expect(n.phase).toBe('play');
    const half = skipKontra(e);
    expect(half.turn).toBe(2);
    expect(applyKontra(half).kontraBy).toBe(2);
  });

  it('a player who passed may pick up later in the round', () => {
    const d = start();
    const b = applyBid(d, makeBid(['passz'], 'tok'));
    const p1 = pass(b); // player 1 passes
    const p2 = applyBid(discard(pickUp(p1), [pickUp(p1).hands[2][0], pickUp(p1).hands[2][1]]), makeBid(['betli'], null));
    expect(p2.turn).toBe(0);
    const p3 = pass(p2);
    expect(p3.turn).toBe(1);
    expect(canPickUp(p3)).toBe(true);
  });

  it('a discard must keep a feasible higher bid possible; pick-up needs a possible higher bid', () => {
    // Current bid: piros durchmars (12, piros). Higher bids all need cards, e.g. piros ulti + durchmars (piros VII).
    const s0 = dealCards(3, 2);
    const twelve: HCard[] = [
      c('piros', 'VII'), c('piros', 'VIII'), c('tok', 'VII'), c('tok', 'VIII'), c('zold', 'VII'), c('zold', 'VIII'),
      c('makk', 'VII'), c('makk', 'VIII'), c('makk', 'IX'), c('zold', 'IX'), c('tok', 'IX'), c('piros', 'IX'),
    ];
    const s: DealState = { ...s0, phase: 'discard', turn: 1, hands: [s0.hands[0], twelve, s0.hands[2]], bid: makeBid(['durchmars'], 'piros'), bidder: 0 };
    expect(isLegalDiscard(s, [c('piros', 'VII'), c('makk', 'IX')])).toBe(false);
    expect(isLegalDiscard(s, [c('makk', 'VIII'), c('makk', 'IX')])).toBe(true);
    const d = discard(s, [c('makk', 'VIII'), c('makk', 'IX')]);
    expect(legalBids(d)).toEqual([makeBid(['ulti', 'durchmars'], 'piros')]);
    const offered: DealState = { ...s, phase: 'pickup', hands: [s0.hands[0], twelve.slice(2), s0.hands[2]], talon: twelve.slice(0, 2) };
    expect(canPickUp(offered)).toBe(true);
    const noSeven: DealState = { ...offered, talon: [c('piros', 'X'), c('piros', 'asz')] };
    expect(canPickUp(noSeven)).toBe(false);
    expect(() => pickUp(noSeven)).toThrow();
  });
});
