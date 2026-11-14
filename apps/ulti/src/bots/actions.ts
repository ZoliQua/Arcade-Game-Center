import type { HCard } from '../arcade/hungarian/cards';
import { applyBid, applyKontra, discard, pass, pickUp, playCard, skipKontra, type Bid, type DealState } from '../engine';

/** One decision of the player whose turn it is (human or bot). */
export type Action =
  | { readonly type: 'discard'; readonly cards: readonly [HCard, HCard] }
  | { readonly type: 'bid'; readonly bid: Bid }
  | { readonly type: 'pickUp' }
  | { readonly type: 'pass' }
  | { readonly type: 'kontra' }
  | { readonly type: 'skipKontra' }
  | { readonly type: 'play'; readonly card: HCard };

/** Applies the action for `state.turn` through the engine (which throws on anything illegal). */
export function applyAction(state: DealState, action: Action): DealState {
  switch (action.type) {
    case 'discard':
      return discard(state, action.cards);
    case 'bid':
      return applyBid(state, action.bid);
    case 'pickUp':
      return pickUp(state);
    case 'pass':
      return pass(state);
    case 'kontra':
      return applyKontra(state);
    case 'skipKontra':
      return skipKontra(state);
    case 'play':
      return playCard(state, state.turn, action.card);
  }
}
