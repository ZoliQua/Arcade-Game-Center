import type { HCard } from '../deck/cards';
import {
  legalBids, legalPlays, type Announcement, type Bid, type DealState, type LogEntry, type Phase, type Player, type Trick,
} from '../engine';

/**
 * Everything a bot may know when it decides: the public table (bids, tricks, announcements, log, hand sizes) plus its
 * own cards. There is no field for another player's hand, for the talon (unless this bot laid it down) or for the deal
 * seed (which would recreate the whole deal), so bot code cannot cheat even by accident.
 */
export interface BotView {
  readonly me: Player;
  readonly phase: Phase;
  readonly turn: Player;
  readonly dealer: Player;
  readonly forehand: Player;
  /** Own cards (12 while discarding). */
  readonly hand: readonly HCard[];
  readonly handSizes: readonly [number, number, number];
  /** The 2 face-down cards, only when this bot laid them down; otherwise null. */
  readonly talon: readonly HCard[] | null;
  readonly bid: Bid | null;
  readonly bidder: Player | null;
  readonly passes: number;
  readonly declarer: Player | null;
  readonly kontra: boolean;
  readonly tricks: readonly Trick[];
  readonly trick: Trick | null;
  readonly announcements: readonly Announcement[];
  /** Public events (the log never holds discarded cards). */
  readonly log: readonly LogEntry[];
  /** Bids this bot may make now (only own cards and the current bid decide). */
  readonly legalBids: readonly Bid[];
  /** Cards this bot may play now. */
  readonly legalPlays: readonly HCard[];
}

/** Who laid the current talon down: the player who just discarded (declare), else the last bidder. */
export function talonOwner(s: DealState): Player | null {
  if (s.phase === 'discard') return null;
  return s.phase === 'declare' ? s.turn : s.bidder;
}

/** The only bridge from a deal to bot code. */
export function toBotView(s: DealState, me: Player): BotView {
  const myTurn = s.turn === me;
  const talonKnown = talonOwner(s) === me && s.talon.length === 2;
  return {
    me,
    phase: s.phase,
    turn: s.turn,
    dealer: s.dealer,
    forehand: s.forehand,
    hand: s.hands[me].slice(),
    handSizes: [s.hands[0].length, s.hands[1].length, s.hands[2].length],
    talon: talonKnown ? s.talon.slice() : null,
    bid: s.bid,
    bidder: s.bidder,
    passes: s.passes,
    declarer: s.declarer,
    kontra: s.kontra,
    tricks: s.tricks,
    trick: s.trick,
    announcements: s.announcements,
    log: s.log,
    legalBids: myTurn ? legalBids(s) : [],
    legalPlays: myTurn ? legalPlays(s, me) : [],
  };
}
