import { HUNGARIAN_DECK, H_RANKS, H_SUITS, type HCard } from '../deck/cards';
import { applyAction, type Action } from '../bots/actions';
import { decide } from '../bots/decide';
import { isLevel, type Level } from '../bots/profiles';
import { toBotView } from '../bots/view';
import {
  bidsEqual, cardKey, dealCards, dealResult, makeBid, mulberry32, scoreDeal, trickWinner, type Bid, type DealResult, type DealState,
  type Player,
} from '../engine';
import { arcadeScore } from './scoring';

/*
 * A session: 10 deals, the human at seat 0 and two bots of the chosen difficulty at seats 1 and 2. The dealer
 * rotates every deal. Everything here is a pure function of the session value, so the whole session (bots' hands
 * included — they are saved but never shown) round-trips through the arcade session store.
 */

export const DEALS_PER_SESSION = 10;
/** Persisted shape version (bump on incompatible changes). */
export const SESSION_SCHEMA = 1;

export type Seat = 'human' | Level;

export interface DealRecord {
  readonly dealer: Player;
  readonly result: DealResult;
  readonly units: readonly [number, number, number];
}

export interface UltiSession {
  readonly difficulty: Level;
  readonly seats: readonly [Seat, Seat, Seat];
  readonly seed: number;
  readonly firstDealer: Player;
  /** 1 … 10. */
  readonly dealNo: number;
  readonly deal: DealState;
  /** Running units per seat (zero-sum). */
  readonly scores: readonly [number, number, number];
  readonly history: readonly DealRecord[];
  /** playing → dealOver (result shown) → next deal …; finished after the 10th deal. */
  readonly phase: 'playing' | 'dealOver' | 'finished';
}

export const dealerFor = (s: Pick<UltiSession, 'firstDealer'>, dealNo: number): Player =>
  ((s.firstDealer + dealNo - 1) % 3) as Player;

/** Seed of deal `dealNo` of a session (independent shuffles, reproducible from the session seed). */
export const dealSeed = (seed: number, dealNo: number): number =>
  Math.floor(mulberry32((seed ^ Math.imul(dealNo, 0x9e3779b9)) >>> 0)() * 0x1_0000_0000) >>> 0;

export interface StartOptions {
  difficulty: Level;
  seed: number;
  /** Only the strength simulation fills every seat with bots. */
  seats?: readonly [Seat, Seat, Seat];
  firstDealer?: Player;
}

export function startSession(o: StartOptions): UltiSession {
  const seed = o.seed >>> 0;
  const firstDealer = o.firstDealer ?? ((seed % 3) as Player);
  return {
    difficulty: o.difficulty,
    seats: o.seats ?? ['human', o.difficulty, o.difficulty],
    seed,
    firstDealer,
    dealNo: 1,
    deal: dealCards(dealSeed(seed, 1), firstDealer),
    scores: [0, 0, 0],
    history: [],
    phase: 'playing',
  };
}

export const isBotTurn = (s: UltiSession): boolean => s.phase === 'playing' && s.seats[s.deal.turn] !== 'human';

/** The bots' RNG comes from the saved state only, so a resumed session makes the same bot moves. */
export const botRng = (s: UltiSession): (() => number) =>
  mulberry32((s.seed ^ Math.imul(s.dealNo, 0x85ebca6b) ^ Math.imul(s.deal.log.length + 1, 0xc2b2ae35)) >>> 0);

function afterMove(s: UltiSession, deal: DealState): UltiSession {
  if (deal.phase !== 'over') return { ...s, deal };
  const result = dealResult(deal);
  const units = scoreDeal(result);
  const scores = s.scores.map((v, i) => v + units[i]) as unknown as UltiSession['scores'];
  return {
    ...s,
    deal,
    scores,
    history: [...s.history, { dealer: deal.dealer, result, units }],
    phase: s.dealNo >= DEALS_PER_SESSION ? 'finished' : 'dealOver',
  };
}

/** The human's decision (seat 0); the engine rejects anything illegal. */
export function act(s: UltiSession, action: Action): UltiSession {
  if (s.phase !== 'playing') throw new Error('No deal in progress');
  if (s.seats[s.deal.turn] !== 'human') throw new Error('Not the player’s turn');
  return afterMove(s, applyAction(s.deal, action));
}

/** The bot whose turn it is decides and moves. */
export function botStep(s: UltiSession): UltiSession {
  if (!isBotTurn(s)) throw new Error('Not a bot’s turn');
  const p = s.deal.turn;
  const action = decide(toBotView(s.deal, p), s.seats[p] as Level, botRng(s));
  return afterMove(s, applyAction(s.deal, action));
}

/** Lets the bots move until it is the human's turn or the deal is over. */
export function runBots(s: UltiSession): UltiSession {
  let x = s;
  while (isBotTurn(x)) x = botStep(x);
  return x;
}

export function nextDeal(s: UltiSession): UltiSession {
  if (s.phase !== 'dealOver') throw new Error('The deal is not over (or the session is finished)');
  const dealNo = s.dealNo + 1;
  return { ...s, dealNo, deal: dealCards(dealSeed(s.seed, dealNo), dealerFor(s, dealNo)), phase: 'playing' };
}

/** Arcade score of the session so far (the human's units). */
export const sessionScore = (s: UltiSession): number => arcadeScore(s.scores[0], s.difficulty);

/** A whole session with bots in every seat (strength simulation). */
export function playBotSession(levels: readonly [Level, Level, Level], seed: number, firstDealer?: Player): UltiSession {
  let s = startSession({ difficulty: levels[1], seed, seats: levels, firstDealer });
  while (s.phase !== 'finished') s = s.phase === 'dealOver' ? nextDeal(s) : runBots(s);
  return s;
}

/* ---------- save guard ---------- */

type Rec = Record<string, unknown>;
const isObj = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isNat = (v: unknown): v is number => isInt(v) && v >= 0;
const isPlayer = (v: unknown): v is Player => v === 0 || v === 1 || v === 2;
const isCard = (v: unknown): v is HCard =>
  isObj(v) && H_SUITS.includes(v.suit as never) && H_RANKS.includes(v.rank as never) && Object.keys(v).length === 2;
const isCards = (v: unknown): v is HCard[] => Array.isArray(v) && v.every(isCard);
const PHASES = ['discard', 'declare', 'pickup', 'kontra', 'play', 'over'];

function isBid(v: unknown): v is Bid {
  if (!isObj(v) || !Array.isArray(v.kinds)) return false;
  try {
    return bidsEqual(makeBid(v.kinds as Bid['kinds'], v.trump as Bid['trump']), v as unknown as Bid);
  } catch {
    return false;
  }
}

function isTrick(v: unknown, trump: Bid['trump'], complete: boolean): boolean {
  if (!isObj(v) || !isPlayer(v.leader) || !Array.isArray(v.cards)) return false;
  const n = v.cards.length;
  if (complete ? n !== 3 : n < 1 || n > 2) return false;
  const ok = v.cards.every((pc, i) => isObj(pc) && isCard(pc.card) && pc.player === (((v.leader as number) + i) % 3));
  if (!ok) return false;
  if (!complete) return v.winner === null;
  return v.winner === trickWinner(v.cards as never, trump);
}

/** Structure and invariants of a deal: 32 distinct cards, hand sizes that fit the phase, a turn that can move. */
export function isDealState(v: unknown): v is DealState {
  if (!isObj(v) || !isNat(v.seed) || v.seed > 0xffffffff) return false;
  if (!isPlayer(v.dealer) || v.forehand !== (v.dealer + 1) % 3 || !isPlayer(v.turn)) return false;
  if (typeof v.phase !== 'string' || !PHASES.includes(v.phase)) return false;
  if (!Array.isArray(v.hands) || v.hands.length !== 3 || !v.hands.every(isCards) || !isCards(v.talon)) return false;
  if (!(v.bid === null || isBid(v.bid)) || !(v.bidder === null || isPlayer(v.bidder))) return false;
  if (!isNat(v.passes) || v.passes > 2 || typeof v.kontra !== 'boolean') return false;
  if (!(v.declarer === null || isPlayer(v.declarer)) || !(v.kontraBy === null || isPlayer(v.kontraBy))) return false;
  if (!Array.isArray(v.announcements) || !Array.isArray(v.log) || !v.log.every((e) => isObj(e) && typeof e.type === 'string')) return false;
  const phase = v.phase as DealState['phase'];
  const bid = v.bid as Bid | null;
  const trump = bid?.trump ?? null;
  if (!Array.isArray(v.tricks) || v.tricks.length > 10 || !v.tricks.every((t) => isTrick(t, trump, true))) return false;
  if (!(v.trick === null || isTrick(v.trick, trump, false))) return false;
  const hands = v.hands as HCard[][];
  const tricks = v.tricks as DealState['tricks'];
  const trick = v.trick as DealState['trick'];
  const all = [...hands.flat(), ...(v.talon as HCard[]), ...[...tricks, ...(trick ? [trick] : [])].flatMap((t) => t.cards.map((pc) => pc.card))];
  if (all.length !== 32 || new Set(all.map(cardKey)).size !== 32) return false;
  if (!all.every((c) => HUNGARIAN_DECK.some((d) => cardKey(d) === cardKey(c)))) return false;

  const turn = v.turn as Player;
  const sizes = hands.map((h) => h.length);
  if (phase === 'discard') {
    return v.talon.length === 0 && sizes.every((n, p) => n === (p === turn ? 12 : 10)) && tricks.length === 0 && (bid === null) === (v.bidder === null);
  }
  if (v.talon.length !== 2) return false;
  if (phase === 'declare') {
    return sizes.every((n) => n === 10) && tricks.length === 0 && trick === null && (bid === null) === (v.bidder === null);
  }
  if (bid === null || v.bidder === null) return false;
  if (phase === 'pickup') return sizes.every((n) => n === 10) && tricks.length === 0 && trick === null;
  if (v.declarer === null || v.declarer !== v.bidder) return false;
  if (phase === 'kontra') return sizes.every((n) => n === 10) && tricks.length === 0 && turn !== v.declarer;
  // play / over: every hand holds 10 − tricks − own card on the table.
  const onTable = (p: number) => (trick?.cards.some((pc) => pc.player === p) ? 1 : 0);
  if (!sizes.every((n, p) => n === 10 - tricks.length - onTable(p))) return false;
  if (phase === 'over') return trick === null;
  const expected = trick ? (trick.leader + trick.cards.length) % 3 : tricks.length > 0 ? tricks[tricks.length - 1].winner : v.declarer;
  return tricks.length < 10 && turn === expected;
}

const BID_KINDS = ['passz', 'negyvenszaz', 'ulti', 'betli', 'durchmars', 'huszszaz', 'szintelenDurchmars'];

/** A finished deal's result: declarer, a real bid, one contract per bid kind, parti totals, tricks per seat. */
function isResult(v: unknown): v is DealResult {
  if (!isObj(v) || !isPlayer(v.declarer) || !isBid(v.bid) || typeof v.kontra !== 'boolean') return false;
  const bid = v.bid as Bid;
  const contracts = v.contracts;
  if (!Array.isArray(contracts) || contracts.length !== bid.kinds.length) return false;
  const okContracts = contracts.every(
    (c, i) =>
      isObj(c) && BID_KINDS.includes(c.kind as string) && c.kind === bid.kinds[i] && typeof c.won === 'boolean' && isInt(c.value) && c.value > 0,
  );
  if (!okContracts) return false;
  const parti = v.parti;
  if (!(parti === null || (isObj(parti) && isNat(parti.declarer) && isNat(parti.defenders)))) return false;
  const tw = v.tricksWon;
  return Array.isArray(tw) && tw.length === 3 && tw.every(isNat) && (tw as number[]).reduce((a, b) => a + b, 0) <= 10;
}

function isRecord(v: unknown): v is DealRecord {
  if (!isObj(v) || !isResult(v.result)) return false;
  const expected = scoreDeal(v.result as DealResult);
  return (
    isPlayer(v.dealer) &&
    Array.isArray(v.units) &&
    v.units.length === 3 &&
    v.units.every(isInt) &&
    (v.units as number[]).reduce((a, b) => a + b, 0) === 0 &&
    (v.units as number[]).every((u, i) => u === expected[i])
  );
}

/** Guard for a saved session: shape, deal invariants, the deal count and scores that add up. */
export function isUltiSession(v: unknown): v is UltiSession {
  if (!isObj(v) || !isLevel(v.difficulty) || !isNat(v.seed) || v.seed > 0xffffffff || !isPlayer(v.firstDealer)) return false;
  const seats = v.seats;
  if (!Array.isArray(seats) || seats.length !== 3 || seats[0] !== 'human' || seats[1] !== v.difficulty || seats[2] !== v.difficulty) {
    return false;
  }
  if (!isInt(v.dealNo) || v.dealNo < 1 || v.dealNo > DEALS_PER_SESSION) return false;
  if (v.phase !== 'playing' && v.phase !== 'dealOver' && v.phase !== 'finished') return false;
  if (v.phase === 'finished' && v.dealNo !== DEALS_PER_SESSION) return false;
  if (!isDealState(v.deal)) return false;
  const deal = v.deal as DealState;
  if (deal.dealer !== dealerFor(v as Pick<UltiSession, 'firstDealer'>, v.dealNo)) return false;
  if (deal.seed !== dealSeed(v.seed, v.dealNo)) return false;
  if ((deal.phase === 'over') !== (v.phase !== 'playing')) return false;
  if (!Array.isArray(v.history) || !v.history.every(isRecord)) return false;
  const history = v.history as DealRecord[];
  if (history.length !== (v.phase === 'playing' ? v.dealNo - 1 : v.dealNo)) return false;
  if (!history.every((h, i) => h.dealer === dealerFor(v as Pick<UltiSession, 'firstDealer'>, i + 1))) return false;
  if (!Array.isArray(v.scores) || v.scores.length !== 3 || !v.scores.every(isInt)) return false;
  return [0, 1, 2].every((p) => (v.scores as number[])[p] === history.reduce((sum, h) => sum + h.units[p], 0));
}
