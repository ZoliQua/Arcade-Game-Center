import { describe, expect, it } from 'vitest';
import { HUNGARIAN_DECK, type HRank } from '../arcade/hungarian/cards';
import { COLOURLESS_ORDER, TRUMP_ORDER, cardPoints, rankStrength, trickWinner } from './ranks';
import { c } from './__tests__/helpers';

const byStrength = (colourless: boolean): HRank[] =>
  (['VII', 'VIII', 'IX', 'X', 'also', 'felso', 'kiraly', 'asz'] as HRank[])
    .slice()
    .sort((a, b) => rankStrength(b, colourless) - rankStrength(a, colourless));

describe('rank orders', () => {
  it('trump games: asz > X > kiraly > felso > also > IX > VIII > VII', () => {
    expect(byStrength(false)).toEqual(['asz', 'X', 'kiraly', 'felso', 'also', 'IX', 'VIII', 'VII']);
    expect([...TRUMP_ORDER].reverse()).toEqual(['asz', 'X', 'kiraly', 'felso', 'also', 'IX', 'VIII', 'VII']);
  });
  it('colourless games: asz > kiraly > felso > also > X > IX > VIII > VII', () => {
    expect(byStrength(true)).toEqual(['asz', 'kiraly', 'felso', 'also', 'X', 'IX', 'VIII', 'VII']);
    expect([...COLOURLESS_ORDER].reverse()).toEqual(['asz', 'kiraly', 'felso', 'also', 'X', 'IX', 'VIII', 'VII']);
  });
  it('only asz and X carry card points: 80 in the deck', () => {
    expect(HUNGARIAN_DECK.reduce((s, card) => s + cardPoints(card), 0)).toBe(80);
  });
});

describe('trickWinner', () => {
  it('highest card of the led suit wins without trumps', () => {
    const t = [
      { player: 0 as const, card: c('tok', 'kiraly') },
      { player: 1 as const, card: c('tok', 'X') },
      { player: 2 as const, card: c('makk', 'asz') },
    ];
    expect(trickWinner(t, 'zold')).toBe(1);
    expect(trickWinner(t, null)).toBe(0); // colourless: kiraly > X
  });
  it('any trump beats the led suit; the higher trump wins', () => {
    const t = [
      { player: 2 as const, card: c('tok', 'asz') },
      { player: 0 as const, card: c('zold', 'VII') },
      { player: 1 as const, card: c('zold', 'VIII') },
    ];
    expect(trickWinner(t, 'zold')).toBe(1);
  });
});
