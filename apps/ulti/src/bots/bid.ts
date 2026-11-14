import { H_SUITS, HUNGARIAN_DECK, type HCard, type HRank, type HSuit } from '../deck/cards';
import {
  ALL_BIDS, bidFeasible, bidValue, cardKey, cardPoints, hasParti, isHigherBid, kindValue, rankStrength, sameCard, type Bid, type BidKind,
  type DealState, type Player,
} from '../engine';
import { rollout, unitsFor } from './play';
import { PROFILES, type Level } from './profiles';
import { inferConstraints, sampleDeal, stateFromSample } from './sample';
import type { BotView } from './view';

/*
 * Hand evaluation. Every contract gets a success chance from simple hand features; a bid's expected value per
 * opponent is the sum over its parts of chance × value − (1 − chance) × value (a failed Ulti pays double).
 */

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const TRUMP_HONOUR: Partial<Record<HRank, number>> = { asz: 2.5, X: 2, kiraly: 1.5, felso: 1.2, also: 0.8 };

const has = (hand: readonly HCard[], suit: HSuit, rank: HRank) => hand.some((c) => c.suit === suit && c.rank === rank);
const ofSuit = (hand: readonly HCard[], suit: HSuit) => hand.filter((c) => c.suit === suit);

/** Raw parti strength of a 10-card hand with `trump` as trump (≈ 10 is an even Passz). */
export function partiStrength(hand: readonly HCard[], trump: HSuit): number {
  const trumps = ofSuit(hand, trump);
  let s = trumps.reduce((n, c) => n + (TRUMP_HONOUR[c.rank] ?? 0.6), 0) + 0.8 * Math.max(0, trumps.length - 3);
  for (const suit of H_SUITS) {
    if (suit === trump) continue;
    const cards = ofSuit(hand, suit);
    const ace = has(hand, suit, 'asz');
    if (ace) s += 2;
    if (has(hand, suit, 'X')) s += ace ? 1.5 : cards.length >= 3 ? 0.4 : -0.5;
    if (has(hand, suit, 'kiraly') && (ace || has(hand, suit, 'X'))) s += 0.4;
    if (trumps.length >= 3) {
      if (cards.length === 0) s += 1;
      else if (cards.length === 1 && !ace) s += 0.5;
    }
    if (has(hand, suit, 'kiraly') && has(hand, suit, 'felso')) s += 1;
  }
  if (has(hand, trump, 'kiraly') && has(hand, trump, 'felso')) s += 2;
  return s;
}

/** Chance that a Passz with `trump` makes more parti points than the defenders. */
export const partiChance = (hand: readonly HCard[], trump: HSuit): number => sigmoid((partiStrength(hand, trump) - 10) / 2);

function ultiChance(hand: readonly HCard[], trump: HSuit): number {
  if (!has(hand, trump, 'VII')) return 0;
  const trumps = ofSuit(hand, trump);
  let u = trumps.length;
  if (has(hand, trump, 'asz')) u += 1.5;
  if (has(hand, trump, 'X')) u += 1;
  if (has(hand, trump, 'kiraly')) u += 0.6;
  for (const suit of H_SUITS) {
    if (suit === trump) continue;
    if (has(hand, suit, 'asz')) u += 0.5;
    if (ofSuit(hand, suit).length === 0) u += 0.5;
  }
  return sigmoid((u - 8.5) / 1.2);
}

/** Length of the unbroken run from the ace down, in the given rank order. */
function topRun(hand: readonly HCard[], suit: HSuit, colourless: boolean): number {
  const order = [...HUNGARIAN_DECK.filter((c) => c.suit === suit)].sort(
    (a, b) => rankStrength(b.rank, colourless) - rankStrength(a.rank, colourless),
  );
  let n = 0;
  while (n < order.length && has(hand, suit, order[n].rank)) n += 1;
  return n;
}

function durchmarsChance(hand: readonly HCard[], trump: HSuit | null): number {
  const colourless = trump === null;
  let ok = true;
  for (const suit of H_SUITS) {
    const cards = ofSuit(hand, suit).length;
    if (cards === 0) continue;
    const run = topRun(hand, suit, colourless);
    if (suit === trump) ok &&= run >= Math.min(cards, 8 - cards);
    else ok &&= run >= cards;
  }
  if (trump !== null) ok &&= ofSuit(hand, trump).length >= 5;
  return ok ? 0.92 : 0.03;
}

function betliChance(hand: readonly HCard[]): number {
  let danger = 0;
  for (const suit of H_SUITS) {
    const ranks = ofSuit(hand, suit)
      .map((c) => rankStrength(c.rank, true))
      .sort((a, b) => a - b);
    ranks.forEach((r, i) => (danger += 0.25 * Math.max(0, r - i) * (r >= 6 ? 1.6 : 1)));
  }
  return Math.exp(-1.2 * danger);
}

/** Success chance of one contract kind with this hand. */
export function kindChance(hand: readonly HCard[], kind: BidKind, trump: HSuit | null): number {
  switch (kind) {
    case 'passz':
      return partiChance(hand, trump as HSuit);
    case 'negyvenszaz':
      return sigmoid((partiStrength(hand, trump as HSuit) - 16) / 2);
    case 'huszszaz':
      return sigmoid((partiStrength(hand, trump as HSuit) - 19) / 2);
    case 'ulti':
      return ultiChance(hand, trump as HSuit);
    case 'betli':
      return betliChance(hand);
    case 'durchmars':
    case 'szintelenDurchmars':
      return durchmarsChance(hand, trump);
  }
}

/** Expected units per opponent of declaring `bid` with this 10-card hand. */
export function bidEV(hand: readonly HCard[], bid: Bid): number {
  return bid.kinds.reduce((sum, kind) => {
    const p = kindChance(hand, kind, bid.trump);
    const v = kindValue(bid, kind);
    return sum + p * v - (1 - p) * v * (kind === 'ulti' ? 2 : 1);
  }, 0);
}

export interface RatedBid {
  readonly bid: Bid;
  readonly ev: number;
}

/** Bids higher than `current` this hand can make, best expected value first. */
export function bestBids(hand: readonly HCard[], current: Bid | null, level: Level): RatedBid[] {
  const bids = ALL_BIDS.filter((b) => isHigherBid(b, current) && bidFeasible(b, hand));
  const pool = level === 'easy' ? bids.filter((b) => b.kinds.length === 1 && b.kinds[0] === 'passz') : bids;
  return (pool.length > 0 ? pool : bids)
    .map((bid) => ({ bid, ev: level === 'easy' ? easyEV(hand, bid) : bidEV(hand, bid) }))
    .sort((a, b) => b.ev - a.ev || bidValue(a.bid) - bidValue(b.bid));
}

/** Easy only looks at its trump count. */
const easyEV = (hand: readonly HCard[], bid: Bid) => (bid.trump ? ofSuit(hand, bid.trump).length : 0) - bidValue(bid);

/** The bid to declare with these 10 cards (always one of the legal bids). */
export function chooseBid(hand: readonly HCard[], current: Bid | null, level: Level): Bid {
  const [best] = bestBids(hand, current, level);
  if (!best) throw new Error('No legal bid');
  return best.bid;
}

/** Take the talon? Only when the own 10 cards already make a higher bid worth playing (the talon is never looked at). */
export function wantsPickUp(hand: readonly HCard[], current: Bid | null, level: Level): boolean {
  const options = bestBids(hand, current, level);
  if (options.length === 0) return false;
  if (level === 'easy') {
    return options.some((o) => o.bid.kinds[0] === 'passz' && o.bid.trump !== null && partiChance(hand, o.bid.trump) > 0.7);
  }
  return options[0].ev > PROFILES[level].pickUpMargin;
}

const pairs = (hand: readonly HCard[]): [HCard, HCard][] => {
  const out: [HCard, HCard][] = [];
  for (let i = 0; i < hand.length; i += 1) for (let j = i + 1; j < hand.length; j += 1) out.push([hand[i], hand[j]]);
  return out;
};

export interface DiscardPlan {
  readonly cards: [HCard, HCard];
  readonly rest: HCard[];
  readonly bid: Bid;
  readonly ev: number;
}

/** Every legal 2-card discard with the best bid it leaves, best first (talon points count for the defenders). */
export function discardPlans(hand12: readonly HCard[], current: Bid | null, level: Level): DiscardPlan[] {
  const plans: DiscardPlan[] = [];
  for (const cards of pairs(hand12)) {
    const rest = hand12.filter((c) => !cards.some((d) => sameCard(c, d)));
    const [best] = bestBids(rest, current, level);
    if (!best) continue;
    const lost = hasParti(best.bid) ? (cardPoints(cards[0]) + cardPoints(cards[1])) * 0.015 : 0;
    plans.push({ cards, rest, bid: best.bid, ev: best.ev - lost });
  }
  return plans.sort((a, b) => b.ev - a.ev);
}

/** Two cards to lay down from 12 (easy: any legal pair; medium: the best plan). */
export function chooseDiscard(hand12: readonly HCard[], current: Bid | null, level: Level, rng: () => number): [HCard, HCard] {
  const plans = discardPlans(hand12, current, level);
  if (plans.length === 0) throw new Error('No legal discard');
  if (level === 'easy') return plans[Math.floor(rng() * plans.length)].cards;
  return plans[0].cards;
}

/* ---------- kontra ---------- */

/** Medium: double when the own cards clearly stand against the contract. */
export function heuristicKontra(view: BotView): boolean {
  const bid = view.bid;
  if (!bid) return false;
  const hand = view.hand;
  const trump = bid.trump;
  if (trump === null) {
    // Betli / színtelen durchmars: only with a sure stopper against the durchmars.
    return bid.kinds.includes('szintelenDurchmars') && H_SUITS.some((s) => has(hand, s, 'asz'));
  }
  const trumps = ofSuit(hand, trump);
  const top = has(hand, trump, 'asz') || has(hand, trump, 'X');
  const sideAces = H_SUITS.filter((s) => s !== trump && has(hand, s, 'asz')).length;
  if (bid.kinds.includes('durchmars')) return has(hand, trump, 'asz');
  if (bid.kinds.includes('ulti')) return trumps.length >= 4 && top;
  return trumps.length >= 3 && top && sideAces >= 2;
}

/* ---------- hard: evaluate by simulation ---------- */

/** Average units for `view.me` over sampled deals once play starts with the given bid / hand / talon. */
function simulate(
  view: BotView,
  rng: () => number,
  samples: number,
  plan: { hand: readonly HCard[]; talon: readonly HCard[]; bid: Bid; declarer: Player },
): number {
  const me = view.me;
  const seen = new Set([...plan.hand, ...plan.talon].map(cardKey));
  const unseen = HUNGARIAN_DECK.filter((c) => !seen.has(cardKey(c)));
  let total = 0;
  for (let i = 0; i < samples; i += 1) {
    // Opponents' hands: a random split of the unseen cards (the declarer's bid shapes the sample when it is not me).
    const shuffled = unseen.slice();
    for (let k = shuffled.length - 1; k > 0; k -= 1) {
      const j = Math.floor(rng() * (k + 1));
      [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]];
    }
    const others = ([0, 1, 2] as Player[]).filter((p) => p !== me);
    const hands = [[], [], []] as HCard[][];
    hands[me] = plan.hand.slice();
    hands[others[0]] = shuffled.slice(0, 10);
    hands[others[1]] = shuffled.slice(10, 20);
    const state: DealState = {
      seed: 0,
      dealer: view.dealer,
      forehand: view.forehand,
      phase: 'play',
      turn: plan.declarer,
      hands: hands as unknown as DealState['hands'],
      talon: plan.talon,
      bid: plan.bid,
      bidder: plan.declarer,
      passes: 2,
      declarer: plan.declarer,
      kontra: false,
      kontraBy: null,
      tricks: [],
      trick: null,
      announcements: [],
      log: [],
    };
    total += unitsFor(rollout(state), me);
  }
  return total / samples / 2;
}

/** Hard discard: the best few heuristic plans, played out on sampled deals. */
export function hardDiscard(view: BotView, rng: () => number): [HCard, HCard] {
  const plans = topDistinct(discardPlans(view.hand, view.bid, 'hard'), 4);
  if (plans.length === 1) return plans[0].cards;
  const n = PROFILES.hard.bidSamples;
  let best = plans[0];
  let bestEv = -Infinity;
  for (const plan of plans) {
    const ev = simulate(view, rng, n, { hand: plan.rest, talon: plan.cards, bid: plan.bid, declarer: view.me });
    if (ev > bestEv) {
      bestEv = ev;
      best = plan;
    }
  }
  return best.cards;
}

/** Plans with different bids first, so the simulation compares contracts and not near-identical discards. */
function topDistinct(plans: DiscardPlan[], k: number): DiscardPlan[] {
  const out: DiscardPlan[] = [];
  for (const p of plans) {
    if (out.length >= k) break;
    if (!out.some((o) => o.bid.trump === p.bid.trump && o.bid.kinds.join() === p.bid.kinds.join())) out.push(p);
  }
  return out;
}

/** Hard bid (after the discard, talon known): the top heuristic bids, played out on sampled deals. */
export function hardBid(view: BotView, rng: () => number): Bid {
  const legal = view.legalBids;
  const rated = bestBids(view.hand, view.bid, 'hard').filter((r) => legal.some((b) => b.trump === r.bid.trump && b.kinds.join() === r.bid.kinds.join()));
  const top = rated.slice(0, 4);
  if (top.length <= 1) return (top[0]?.bid ?? legal[0]) as Bid;
  let best = top[0].bid;
  let bestEv = -Infinity;
  for (const r of top) {
    const ev = simulate(view, rng, PROFILES.hard.bidSamples, { hand: view.hand, talon: view.talon ?? [], bid: r.bid, declarer: view.me });
    if (ev > bestEv) {
      bestEv = ev;
      best = r.bid;
    }
  }
  return legal.find((b) => b.trump === best.trump && b.kinds.join() === best.kinds.join()) as Bid;
}

/** Hard kontra: expected defender units on sampled deals consistent with the bid (kontra doubles them). */
export function hardKontra(view: BotView, rng: () => number): boolean {
  if (!view.bid || view.declarer === null) return false;
  const cons = inferConstraints(view);
  const n = PROFILES.hard.bidSamples;
  let total = 0;
  for (let i = 0; i < n; i += 1) {
    const deal = sampleDeal(view, cons, rng);
    const s = stateFromSample(view, deal, { phase: 'play', turn: view.declarer, trick: null });
    total += unitsFor(rollout(s), view.me);
  }
  return total / n > PROFILES.hard.kontraMargin;
}
