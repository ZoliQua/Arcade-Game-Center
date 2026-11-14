import type { HCard, HRank, HSuit } from '../deck/cards';
import type { PlayedCard, Player } from './types';

/** Trump games (Passz, 40-100, 20-100, Ulti, Durchmars), low → high: the X ranks right below the ace. */
export const TRUMP_ORDER: readonly HRank[] = ['VII', 'VIII', 'IX', 'also', 'felso', 'kiraly', 'X', 'asz'];
/** Colourless games (Betli, Színtelen durchmars), low → high: natural order. */
export const COLOURLESS_ORDER: readonly HRank[] = ['VII', 'VIII', 'IX', 'X', 'also', 'felso', 'kiraly', 'asz'];

export const rankStrength = (rank: HRank, colourless: boolean): number =>
  (colourless ? COLOURLESS_ORDER : TRUMP_ORDER).indexOf(rank);

/** Parti card points: ász and X are 10 each (80 in the deck; the last trick adds 10). */
export const cardPoints = (card: HCard): number => (card.rank === 'asz' || card.rank === 'X' ? 10 : 0);

export const sameCard = (a: HCard, b: HCard): boolean => a.suit === b.suit && a.rank === b.rank;
export const cardKey = (card: HCard): string => `${card.suit}:${card.rank}`;

/** Does `card` beat `best` (the trick's current winner)? `trump` null = colourless game. */
export function beats(card: HCard, best: HCard, trump: HSuit | null): boolean {
  if (card.suit === best.suit) return rankStrength(card.rank, trump === null) > rankStrength(best.rank, trump === null);
  return trump !== null && card.suit === trump;
}

/** The card currently winning a (possibly incomplete, non-empty) trick. */
export function currentBest(cards: readonly PlayedCard[], trump: HSuit | null): PlayedCard {
  return cards.reduce((best, pc) => (beats(pc.card, best.card, trump) ? pc : best));
}

export const trickWinner = (cards: readonly PlayedCard[], trump: HSuit | null): Player => currentBest(cards, trump).player;
