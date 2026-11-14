import { H_SUITS, type HCard } from '../deck/cards';
import { rankStrength, type Bid, type DealState, type Trick } from '../engine';

/** Suits in deck order, then high to low in the order of the current game (trump order unless colourless). */
export function sortHand(cards: readonly HCard[], bid: Bid | null): HCard[] {
  const colourless = bid !== null && bid.trump === null;
  return cards
    .slice()
    .sort((a, b) => H_SUITS.indexOf(a.suit) - H_SUITS.indexOf(b.suit) || rankStrength(b.rank, colourless) - rankStrength(a.rank, colourless));
}

/** The trick in progress, or the last completed one until the next card is led. */
export function shownTrick(deal: DealState): { trick: Trick; index: number } | null {
  if (deal.trick) return { trick: deal.trick, index: deal.tricks.length };
  if (deal.tricks.length === 0) return null;
  return { trick: deal.tricks[deal.tricks.length - 1], index: deal.tricks.length - 1 };
}
