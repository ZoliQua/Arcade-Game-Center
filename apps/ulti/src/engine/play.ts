import { H_SUITS, type HCard } from '../arcade/hungarian/cards';
import { hasPair } from './bids';
import { nextPlayer, setHand } from './deal';
import { beats, currentBest, sameCard, trickWinner } from './ranks';
import type { Announcement, Bid, DealState, IllegalReason, LogEntry, Player, Trick } from './types';

const isUltiSeven = (state: DealState, player: Player, card: HCard): boolean =>
  !!state.bid &&
  state.bid.kinds.includes('ulti') &&
  player === state.declarer &&
  card.suit === state.bid.trump &&
  card.rank === 'VII';

/** Follow / beat / trump / overtrump rules, before the ulti VII restriction. */
function trickOptions(hand: readonly HCard[], trick: Trick | null, trump: Bid['trump']): HCard[] {
  if (!trick || trick.cards.length === 0) return hand.slice();
  const led = trick.cards[0].card.suit;
  const best = currentBest(trick.cards, trump).card;
  const follow = hand.filter((c) => c.suit === led);
  if (follow.length > 0) {
    const beating = follow.filter((c) => beats(c, best, trump));
    return beating.length > 0 ? beating : follow;
  }
  const trumps = trump === null ? [] : hand.filter((c) => c.suit === trump);
  if (trumps.length > 0) {
    const over = trumps.filter((c) => beats(c, best, trump));
    return over.length > 0 ? over : trumps;
  }
  return hand.slice();
}

/** Cards the player may play now (empty when it is not their turn). */
export function legalPlays(state: DealState, player: Player): HCard[] {
  if (state.phase !== 'play' || state.turn !== player || !state.bid) return [];
  const hand = state.hands[player];
  const options = trickOptions(hand, state.trick, state.bid.trump);
  if (hand.length > 1) {
    const keep = options.filter((c) => !isUltiSeven(state, player, c));
    if (keep.length > 0) return keep;
  }
  return options;
}

/** Null when the card is legal; otherwise the rule it breaks. */
export function illegalReason(state: DealState, player: Player, card: HCard): IllegalReason | null {
  if (state.phase !== 'play' || !state.bid) return 'notPlayPhase';
  if (state.turn !== player) return 'notYourTurn';
  const hand = state.hands[player];
  if (!hand.some((c) => sameCard(c, card))) return 'notInHand';
  if (legalPlays(state, player).some((c) => sameCard(c, card))) return null;
  const trump = state.bid.trump;
  if (trickOptions(hand, state.trick, trump).some((c) => sameCard(c, card))) return 'keepUltiSeven';
  const trick = state.trick as Trick;
  const led = trick.cards[0].card.suit;
  if (hand.some((c) => c.suit === led)) return card.suit === led ? 'mustBeat' : 'mustFollow';
  return card.suit === trump ? 'mustOvertrump' : 'mustTrump';
}

/** 20/40 announced automatically at the player's first card (parti games only). */
function announcementsFor(state: DealState, player: Player): Announcement[] {
  const bid = state.bid as Bid;
  const hand = state.hands[player];
  const trump = bid.trump;
  if (trump === null) return [];
  const pairs = H_SUITS.filter((s) => hasPair(hand, s)).map(
    (suit): Announcement => ({ player, suit, points: suit === trump ? 40 : 20 }),
  );
  if (bid.kinds.includes('passz')) return pairs;
  if (player !== state.declarer) return [];
  if (bid.kinds.includes('negyvenszaz')) return pairs.filter((a) => a.points === 40);
  if (bid.kinds.includes('huszszaz')) return pairs.filter((a) => a.points === 20).slice(0, 1);
  return [];
}

/** Betli and (színtelen) durchmars alone end as soon as they are lost. */
function decidedEarly(state: DealState): boolean {
  const bid = state.bid as Bid;
  if (bid.kinds.length !== 1) return false;
  const [kind] = bid.kinds;
  const declarerWon = state.tricks.some((t) => t.winner === state.declarer);
  const declarerLost = state.tricks.some((t) => t.winner !== state.declarer);
  if (kind === 'betli') return declarerWon;
  if (kind === 'durchmars' || kind === 'szintelenDurchmars') return declarerLost;
  return false;
}

export function playCard(state: DealState, player: Player, card: HCard): DealState {
  const reason = illegalReason(state, player, card);
  if (reason) throw new Error(`Illegal card: ${reason}`);
  const firstPlay = state.tricks.length === 0;
  const announced = firstPlay ? announcementsFor(state, player) : [];
  const log: LogEntry[] = [
    ...state.log,
    ...announced.map((a): LogEntry => ({ type: 'announce', ...a })),
    { type: 'play', player, card },
  ];
  const hands = setHand(state.hands, player, state.hands[player].filter((c) => !sameCard(c, card)));
  const cards = [...(state.trick?.cards ?? []), { player, card }];
  const leader = state.trick?.leader ?? player;
  const base = { ...state, hands, announcements: [...state.announcements, ...announced] };
  if (cards.length < 3) return { ...base, turn: nextPlayer(player), trick: { leader, cards, winner: null }, log };
  const winner = trickWinner(cards, (state.bid as Bid).trump);
  const tricks = [...state.tricks, { leader, cards, winner }];
  log.push({ type: 'trick', index: tricks.length - 1, winner });
  const next: DealState = { ...base, turn: winner, trick: null, tricks, log };
  if (tricks.length === 10 || decidedEarly(next)) return { ...next, phase: 'over', log: [...log, { type: 'over' }] };
  return next;
}

export const isDealOver = (state: DealState): boolean => state.phase === 'over';
