import { H_SUITS, type HCard, type HSuit } from '../arcade/hungarian/cards';
import type { Bid, BidKind } from './types';

/** Base value per opponent (Hungarian Wikipedia value table). */
export const BASE_VALUE: Readonly<Record<BidKind, number>> = {
  passz: 1,
  negyvenszaz: 4,
  ulti: 4,
  betli: 5,
  durchmars: 6,
  huszszaz: 8,
  szintelenDurchmars: 12,
};

const COLOURLESS: readonly BidKind[] = ['betli', 'szintelenDurchmars'];

/** Every allowed contract shape (combinations: Ulti + Passz / Negyvenszáz / Húszszáz / Durchmars). */
export const BID_SHAPES: readonly (readonly BidKind[])[] = [
  ['passz'],
  ['negyvenszaz'],
  ['ulti'],
  ['durchmars'],
  ['huszszaz'],
  ['ulti', 'passz'],
  ['ulti', 'negyvenszaz'],
  ['ulti', 'huszszaz'],
  ['ulti', 'durchmars'],
  ['betli'],
  ['szintelenDurchmars'],
];

const shapeOf = (kinds: readonly BidKind[]): readonly BidKind[] | undefined =>
  BID_SHAPES.find((shape) => shape.length === kinds.length && shape.every((k) => kinds.includes(k)));

/** Builds a bid in canonical order; throws on a shape or trump that is not allowed. */
export function makeBid(kinds: readonly BidKind[], trump: HSuit | null): Bid {
  const shape = shapeOf(kinds);
  if (!shape || new Set(kinds).size !== kinds.length) throw new Error(`Bid shape not allowed: ${kinds.join('+')}`);
  const colourless = shape.some((k) => COLOURLESS.includes(k));
  if (colourless !== (trump === null)) throw new Error(`Trump ${trump} not allowed for ${kinds.join('+')}`);
  return { kinds: shape, trump };
}

/** All 38 bids: 9 trump shapes × 4 suits, then the 2 colourless ones. */
export const ALL_BIDS: readonly Bid[] = BID_SHAPES.flatMap((shape) =>
  shape.some((k) => COLOURLESS.includes(k)) ? [makeBid(shape, null)] : H_SUITS.map((suit) => makeBid(shape, suit)),
);

export const isColourless = (bid: Bid): boolean => bid.trump === null;
export const isPiros = (bid: Bid): boolean => bid.trump === 'piros';
/** Parti games: the card points decide (Passz, Negyvenszáz, Húszszáz). */
export const hasParti = (bid: Bid): boolean => bid.kinds.some((k) => k === 'passz' || k === 'negyvenszaz' || k === 'huszszaz');

/** Value of one contract of the bid (piros doubles trump bids). */
export const kindValue = (bid: Bid, kind: BidKind): number => BASE_VALUE[kind] * (isPiros(bid) ? 2 : 1);

/** Total bid value per opponent (combinations add). */
export const bidValue = (bid: Bid): number => bid.kinds.reduce((sum, k) => sum + kindValue(bid, k), 0);

export const bidsEqual = (a: Bid, b: Bid): boolean =>
  a.trump === b.trump && a.kinds.length === b.kinds.length && a.kinds.every((k) => b.kinds.includes(k));

/** Strictly higher: more value; at equal value a piros bid beats a non-piros one. */
export function isHigherBid(bid: Bid, current: Bid | null): boolean {
  if (current === null) return true;
  const a = bidValue(bid);
  const b = bidValue(current);
  return a > b || (a === b && isPiros(bid) && !isPiros(current));
}

const has = (hand: readonly HCard[], suit: HSuit, rank: HCard['rank']) =>
  hand.some((c) => c.suit === suit && c.rank === rank);
export const hasPair = (hand: readonly HCard[], suit: HSuit): boolean => has(hand, suit, 'kiraly') && has(hand, suit, 'felso');

/** Can this (10- or 12-card) hand make the bid? Ulti: trump VII; Negyvenszáz: trump K+F; Húszszáz: another K+F. */
export function bidFeasible(bid: Bid, hand: readonly HCard[]): boolean {
  const trump = bid.trump;
  return bid.kinds.every((k) => {
    if (trump === null) return true;
    if (k === 'ulti') return has(hand, trump, 'VII');
    if (k === 'negyvenszaz') return hasPair(hand, trump);
    if (k === 'huszszaz') return H_SUITS.some((s) => s !== trump && hasPair(hand, s));
    return true;
  });
}
