import type { HCard, HSuit } from '../arcade/hungarian/cards';

/** Seats: 0 is the human, 1 and 2 the bots. */
export type Player = 0 | 1 | 2;
export type Hands = readonly [readonly HCard[], readonly HCard[], readonly HCard[]];

export type BidKind = 'passz' | 'negyvenszaz' | 'ulti' | 'betli' | 'durchmars' | 'huszszaz' | 'szintelenDurchmars';

/**
 * A bid: one contract or an allowed combination (Ulti + Passz / Negyvenszáz / Húszszáz / Durchmars).
 * `trump` is the suit the declarer names for trump bids ('piros' = the doubled piros bid);
 * `null` for the colourless bids (Betli, Színtelen durchmars).
 */
export interface Bid {
  readonly kinds: readonly BidKind[];
  readonly trump: HSuit | null;
}

/**
 * discard → declare  the player holding 12 cards lays 2 face down, then bids;
 * pickup             the next player passes or picks up the 2 discards (then discard → declare);
 * kontra             bidding is over, each defender in turn may double once;
 * play               ten tricks, the declarer leads the first;
 * over               all tricks played, or the contract was decided early (betli / durchmars lost).
 */
export type Phase = 'discard' | 'declare' | 'pickup' | 'kontra' | 'play' | 'over';

export interface PlayedCard {
  readonly player: Player;
  readonly card: HCard;
}

export interface Trick {
  readonly leader: Player;
  readonly cards: readonly PlayedCard[];
  /** Set once the trick is complete. */
  readonly winner: Player | null;
}

export interface Announcement {
  readonly player: Player;
  readonly suit: HSuit;
  /** 40 = K+F of trump, 20 = K+F of another suit. */
  readonly points: 20 | 40;
}

export type LogEntry =
  | { readonly type: 'pickup'; readonly player: Player }
  | { readonly type: 'discard'; readonly player: Player }
  | { readonly type: 'bid'; readonly player: Player; readonly bid: Bid }
  | { readonly type: 'pass'; readonly player: Player }
  | { readonly type: 'declarer'; readonly player: Player; readonly bid: Bid }
  | { readonly type: 'kontra'; readonly player: Player }
  | { readonly type: 'noKontra'; readonly player: Player }
  | { readonly type: 'announce'; readonly player: Player; readonly suit: HSuit; readonly points: 20 | 40 }
  | { readonly type: 'play'; readonly player: Player; readonly card: HCard }
  | { readonly type: 'trick'; readonly index: number; readonly winner: Player }
  | { readonly type: 'over' };

export interface DealState {
  readonly seed: number;
  readonly dealer: Player;
  /** The player after the dealer: takes the talon first and must bid. */
  readonly forehand: Player;
  readonly phase: Phase;
  /** Whose decision it is (bidding, kontra or play). */
  readonly turn: Player;
  readonly hands: Hands;
  /** The 2 face-down cards: the last bidder's discards (empty while someone holds 12). */
  readonly talon: readonly HCard[];
  /** Highest bid so far and who made it. */
  readonly bid: Bid | null;
  readonly bidder: Player | null;
  /** Consecutive passes since the last bid (2 ends the bidding). */
  readonly passes: number;
  readonly declarer: Player | null;
  readonly kontra: boolean;
  readonly kontraBy: Player | null;
  /** Completed tricks. */
  readonly tricks: readonly Trick[];
  /** The trick in progress, if any card of it is down. */
  readonly trick: Trick | null;
  readonly announcements: readonly Announcement[];
  readonly log: readonly LogEntry[];
}

/** Why a card cannot be played (for UI reason texts). */
export type IllegalReason =
  | 'notPlayPhase'
  | 'notYourTurn'
  | 'notInHand'
  | 'mustFollow'
  | 'mustBeat'
  | 'mustTrump'
  | 'mustOvertrump'
  | 'keepUltiSeven';

export interface ContractResult {
  readonly kind: BidKind;
  readonly won: boolean;
  /** Final value per opponent, piros and kontra included. */
  readonly value: number;
}

export interface DealResult {
  readonly declarer: Player;
  readonly bid: Bid;
  readonly kontra: boolean;
  /** One entry per contract of the bid, in the bid's order. */
  readonly contracts: readonly ContractResult[];
  /** Parti totals (card points + last trick + announcements; talon to the defenders), null when no parti contract. */
  readonly parti: { readonly declarer: number; readonly defenders: number } | null;
  readonly tricksWon: readonly [number, number, number];
}
