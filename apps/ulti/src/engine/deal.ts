import { HUNGARIAN_DECK, type HCard } from '../deck/cards';
import { ALL_BIDS, bidFeasible, bidsEqual, isHigherBid } from './bids';
import { cardKey, sameCard } from './ranks';
import type { Bid, DealState, Hands, LogEntry, Player } from './types';

/** Small seeded RNG (same as the other arcade games). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const nextPlayer = (p: Player): Player => ((p + 1) % 3) as Player;

export function setHand(hands: Hands, player: Player, hand: readonly HCard[]): Hands {
  return [0, 1, 2].map((p) => (p === player ? hand : hands[p])) as unknown as Hands;
}

const withLog = (state: DealState, ...entries: LogEntry[]): readonly LogEntry[] => [...state.log, ...entries];

/** Shuffles with the seed, deals 10 each and the 2-card talon; the forehand takes the talon at once. */
export function dealCards(seed: number, dealer: Player): DealState {
  const deck = shuffle(HUNGARIAN_DECK, mulberry32(seed));
  const forehand = nextPlayer(dealer);
  const hands = [0, 1, 2].map((p) => {
    const seat = (p - forehand + 3) % 3;
    const own = deck.slice(seat * 10, seat * 10 + 10);
    return p === forehand ? [...own, ...deck.slice(30, 32)] : own;
  }) as unknown as Hands;
  return {
    seed,
    dealer,
    forehand,
    phase: 'discard',
    turn: forehand,
    hands,
    talon: [],
    bid: null,
    bidder: null,
    passes: 0,
    declarer: null,
    kontra: false,
    kontraBy: null,
    tricks: [],
    trick: null,
    announcements: [],
    log: [{ type: 'pickup', player: forehand }],
  };
}

const higherFeasible = (current: Bid | null, hand: readonly HCard[]): Bid[] =>
  ALL_BIDS.filter((b) => isHigherBid(b, current) && bidFeasible(b, hand));

/** Picking up is allowed when some higher bid can be made with the 12 cards (else the player must pass). */
export function canPickUp(state: DealState): boolean {
  return state.phase === 'pickup' && higherFeasible(state.bid, [...state.hands[state.turn], ...state.talon]).length > 0;
}

export function pickUp(state: DealState): DealState {
  if (!canPickUp(state)) throw new Error('Cannot pick up the talon now');
  const p = state.turn;
  return {
    ...state,
    phase: 'discard',
    hands: setHand(state.hands, p, [...state.hands[p], ...state.talon]),
    talon: [],
    log: withLog(state, { type: 'pickup', player: p }),
  };
}

/** Pass (only when offered the talon). Two passes after the last bid end the bidding. */
export function pass(state: DealState): DealState {
  if (state.phase !== 'pickup') throw new Error('Cannot pass now');
  const p = state.turn;
  const passes = state.passes + 1;
  const log = withLog(state, { type: 'pass', player: p });
  if (passes < 2) return { ...state, turn: nextPlayer(p), passes, log };
  const declarer = state.bidder as Player;
  return {
    ...state,
    phase: 'kontra',
    turn: nextPlayer(declarer),
    passes,
    declarer,
    log: [...log, { type: 'declarer', player: declarer, bid: state.bid as Bid }],
  };
}

/** Two distinct cards from the 12-card hand, leaving a hand that can still make a higher bid. */
export function isLegalDiscard(state: DealState, cards: readonly HCard[]): boolean {
  if (state.phase !== 'discard' || cards.length !== 2 || sameCard(cards[0], cards[1])) return false;
  const hand = state.hands[state.turn];
  if (!cards.every((c) => hand.some((h) => sameCard(h, c)))) return false;
  const rest = hand.filter((h) => !cards.some((c) => sameCard(c, h)));
  return higherFeasible(state.bid, rest).length > 0;
}

export function discard(state: DealState, cards: readonly HCard[]): DealState {
  if (!isLegalDiscard(state, cards)) throw new Error(`Illegal discard: ${cards.map(cardKey).join(', ')}`);
  const p = state.turn;
  return {
    ...state,
    phase: 'declare',
    hands: setHand(state.hands, p, state.hands[p].filter((h) => !cards.some((c) => sameCard(c, h)))),
    talon: cards.slice(),
    log: withLog(state, { type: 'discard', player: p }),
  };
}

/** Bids the player (after discarding) may make: strictly higher and feasible with the 10 cards. */
export function legalBids(state: DealState): Bid[] {
  return state.phase === 'declare' ? higherFeasible(state.bid, state.hands[state.turn]) : [];
}

export function applyBid(state: DealState, bid: Bid): DealState {
  if (!legalBids(state).some((b) => bidsEqual(b, bid))) throw new Error('Illegal bid');
  const p = state.turn;
  const canonical = legalBids(state).find((b) => bidsEqual(b, bid)) as Bid;
  return {
    ...state,
    phase: 'pickup',
    turn: nextPlayer(p),
    bid: canonical,
    bidder: p,
    passes: 0,
    log: withLog(state, { type: 'bid', player: p, bid: canonical }),
  };
}

const startPlay = (state: DealState, log: readonly LogEntry[]): DealState => ({
  ...state,
  phase: 'play',
  turn: state.declarer as Player,
  trick: null,
  log,
});

/** The defender whose turn it is doubles the bid (once per deal); play starts. */
export function applyKontra(state: DealState): DealState {
  if (state.phase !== 'kontra') throw new Error('No kontra now');
  return startPlay({ ...state, kontra: true, kontraBy: state.turn }, withLog(state, { type: 'kontra', player: state.turn }));
}

/** The defender declines; the other defender is asked, then play starts. */
export function skipKontra(state: DealState): DealState {
  if (state.phase !== 'kontra') throw new Error('No kontra now');
  const log = withLog(state, { type: 'noKontra', player: state.turn });
  const next = nextPlayer(state.turn);
  if (next !== state.declarer) return { ...state, turn: next, log };
  return startPlay(state, log);
}
