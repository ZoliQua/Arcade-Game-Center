/**
 * Ulti rules engine — pure, immutable functions (no React).
 *
 * Phases of a deal (`DealState.phase`):
 *   dealCards(seed, dealer) → 'discard' (the forehand already holds 12: 10 + the talon)
 *   'discard'  discard(state, [a, b])      2 cards face down → 'declare'
 *   'declare'  applyBid(state, bid)        a bid from legalBids(state) → 'pickup' for the next player
 *   'pickup'   pickUp(state) | pass(state)  pick up the 2 discards (→ 'discard') or pass;
 *                                          two passes after the last bid → 'kontra' (declarer fixed)
 *   'kontra'   applyKontra | skipKontra    each defender in turn may double once → 'play'
 *   'play'     playCard(state, p, card)    cards from legalPlays(state, p); declarer leads the first trick
 *   'over'     isDealOver(state) → dealResult(state) → scoreDeal(result) (units per seat)
 */
export type {
  Announcement, Bid, BidKind, ContractResult, DealResult, DealState, Hands, IllegalReason, LogEntry, Phase, PlayedCard, Player, Trick,
} from './types';
export { COLOURLESS_ORDER, TRUMP_ORDER, cardKey, cardPoints, rankStrength, sameCard, trickWinner } from './ranks';
export {
  ALL_BIDS, BASE_VALUE, BID_SHAPES, bidFeasible, bidValue, bidsEqual, hasParti, isColourless, isHigherBid, isPiros,
  kindValue, makeBid,
} from './bids';
export {
  applyBid, applyKontra, canPickUp, dealCards, discard, isLegalDiscard, legalBids, mulberry32, nextPlayer, pass, pickUp,
  shuffle, skipKontra,
} from './deal';
export { illegalReason, isDealOver, legalPlays, playCard } from './play';
export { dealResult, partiPoints, scoreDeal } from './scoreDeal';
