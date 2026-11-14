import { describe, expect, it } from 'vitest';
import {
  applyBid, cardKey, dealCards, discard, isLegalDiscard, makeBid, nextPlayer, pickUp, sameCard, type DealState, type Player,
} from '../engine';
import type { HCard } from '../arcade/hungarian/cards';
import { driveDeal } from './testkit';
import { toBotView } from './view';

/** Every card key that appears anywhere in a JSON value. */
function cardsIn(value: unknown): Set<string> {
  const out = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o.suit === 'string' && typeof o.rank === 'string') out.add(`${o.suit}:${o.rank}`);
      Object.values(o).forEach(walk);
    }
  };
  walk(JSON.parse(JSON.stringify(value)));
  return out;
}

/** Cards `me` must not see: other players' unplayed cards, and the talon unless `me` laid it down. */
function hiddenFrom(s: DealState, me: Player): HCard[] {
  const others = ([0, 1, 2] as Player[]).filter((p) => p !== me).flatMap((p) => s.hands[p]);
  const owner = s.phase === 'discard' ? null : s.phase === 'declare' ? s.turn : s.bidder;
  const talonKnown = owner === me;
  return talonKnown ? others : [...others, ...s.talon];
}

describe('toBotView', () => {
  it('never contains another player’s hand or the hidden talon (30 seeded deals, every decision, every seat)', () => {
    let checked = 0;
    for (let seed = 1; seed <= 30; seed += 1) {
      driveDeal({
        seed,
        dealer: (seed % 3) as Player,
        levels: ['medium', 'easy', 'hard'],
        onDecision: (s) => {
          for (const me of [0, 1, 2] as Player[]) {
            const view = toBotView(s, me);
            const seen = cardsIn(view);
            for (const card of hiddenFrom(s, me)) expect(seen.has(cardKey(card))).toBe(false);
            expect(view.hand).toHaveLength(s.hands[me].length);
            expect(view.hand.every((c) => s.hands[me].some((h) => sameCard(c, h)))).toBe(true);
            expect('seed' in view).toBe(false);
            checked += 1;
          }
        },
      });
    }
    expect(checked).toBeGreaterThan(1000);
  });

  it('shows the own discards to the player who laid them, and hand sizes of everybody', () => {
    driveDeal({
      seed: 4,
      levels: ['medium', 'medium', 'medium'],
      onDecision: (s, p) => {
        if (s.phase !== 'play') return;
        const view = toBotView(s, p);
        expect(view.handSizes).toEqual(s.hands.map((h) => h.length));
        if (p === s.declarer) expect(view.talon).toEqual(s.talon);
        else expect(view.talon).toBeNull();
      },
    });
  });

  it('talon owner: A discards and bids, B picks up — A’s view never holds the talon again', () => {
    let s = dealCards(21, 0);
    const a = s.turn;
    const b = nextPlayer(a);
    const hand = s.hands[a];
    // The first legal pair of discards of A's 12 cards.
    let down: [typeof hand[number], typeof hand[number]] | null = null;
    for (let i = 0; i < hand.length && !down; i += 1)
      for (let j = i + 1; j < hand.length && !down; j += 1) if (isLegalDiscard(s, [hand[i], hand[j]])) down = [hand[i], hand[j]];
    s = discard(s, down!);
    expect(toBotView(s, a).talon).toEqual(down);
    s = applyBid(s, makeBid(['passz'], 'makk'));
    expect(toBotView(s, a).talon).toEqual(down);
    expect(toBotView(s, b).talon).toBeNull();
    s = pickUp(s);
    expect(s.turn).toBe(b);
    const aView = toBotView(s, a);
    expect(aView.talon).toBeNull();
    const seen = cardsIn(aView);
    for (const c of down!) expect(seen.has(cardKey(c))).toBe(false);
    // B lays two down: now only B knows the talon.
    const bHand = s.hands[b];
    let bDown: [typeof hand[number], typeof hand[number]] | null = null;
    for (let i = 0; i < bHand.length && !bDown; i += 1)
      for (let j = i + 1; j < bHand.length && !bDown; j += 1) if (isLegalDiscard(s, [bHand[i], bHand[j]])) bDown = [bHand[i], bHand[j]];
    s = discard(s, bDown!);
    expect(toBotView(s, a).talon).toBeNull();
    expect(toBotView(s, b).talon).toEqual(bDown);
    for (const c of bDown!) expect(cardsIn(toBotView(s, a)).has(cardKey(c))).toBe(false);
  });
});
