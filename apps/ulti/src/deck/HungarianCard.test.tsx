import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HUNGARIAN_DECK, H_RANKS, H_SUITS, SEASON_OF_SUIT, hCardLabel, type HCard } from './cards';
import { HungarianCard } from './HungarianCard';
import { Gallery } from './Gallery';

const card = (suit: HCard['suit'], rank: HCard['rank']): HCard => ({ suit, rank });

describe('HUNGARIAN_DECK', () => {
  it('has 32 unique cards, 8 per suit and 4 per rank', () => {
    expect(HUNGARIAN_DECK).toHaveLength(32);
    expect(new Set(HUNGARIAN_DECK.map((c) => `${c.suit}-${c.rank}`)).size).toBe(32);
    for (const s of H_SUITS) expect(HUNGARIAN_DECK.filter((c) => c.suit === s)).toHaveLength(8);
    for (const r of H_RANKS) expect(HUNGARIAN_DECK.filter((c) => c.rank === r)).toHaveLength(4);
  });
});

describe('HungarianCard faces', () => {
  it.each(['also', 'felso', 'kiraly'] as const)('%s renders its figure with the suit sign in a top corner', (rank) => {
    for (const suit of H_SUITS) {
      const { container, unmount } = render(<HungarianCard card={card(suit, rank)} />);
      const figures = container.querySelectorAll('[data-figure]');
      expect(figures).toHaveLength(1);
      expect(figures[0].getAttribute('data-figure')).toBe(rank);
      expect(container.querySelector('[data-corner] [data-suit-shape]')).not.toBeNull();
      unmount();
    }
  });

  it('aces carry their season: piros Nyár, tök Ősz, zöld Tavasz, makk Tél', () => {
    expect(SEASON_OF_SUIT).toEqual({ piros: 'nyar', tok: 'osz', zold: 'tavasz', makk: 'tel' });
    const banner = { piros: 'NYÁR', tok: 'ŐSZ', zold: 'TAVASZ', makk: 'TÉL' } as const;
    for (const suit of H_SUITS) {
      const { container, unmount } = render(<HungarianCard card={card(suit, 'asz')} />);
      const season = container.querySelector('[data-season]');
      expect(season?.getAttribute('data-season')).toBe(SEASON_OF_SUIT[suit]);
      expect(container.querySelector('[data-banner]')?.textContent).toBe(banner[suit]);
      expect(container.querySelector('[data-figure]')).toBeNull();
      unmount();
    }
  });

  it.each([
    ['VII', 7],
    ['VIII', 8],
    ['IX', 9],
    ['X', 10],
  ] as const)('%s shows %i pips and its numeral in two corners', (rank, n) => {
    const { container } = render(<HungarianCard card={card('zold', rank)} />);
    expect(container.querySelectorAll('[data-pip]')).toHaveLength(n);
    const numerals = [...container.querySelectorAll('[data-numeral]')].map((e) => e.textContent);
    expect(numerals).toEqual([rank, rank]);
  });

  it('the four suit signs are different shapes', () => {
    const shapes = H_SUITS.map((suit) => {
      const { container, unmount } = render(<HungarianCard card={card(suit, 'VII')} />);
      const signs = [...container.querySelectorAll('[data-suit-shape]')];
      const kinds = new Set(signs.map((e) => e.getAttribute('data-suit-shape')));
      const outline = signs[0].innerHTML;
      unmount();
      expect(kinds.size).toBe(1);
      return { kind: [...kinds][0], outline };
    });
    expect(shapes.map((s) => s.kind)).toEqual(['heart', 'bell', 'leaf', 'acorn']);
    expect(new Set(shapes.map((s) => s.outline)).size).toBe(4);
  });

  it('marks suit and rank on the root and labels it in the given language', () => {
    render(<HungarianCard card={card('tok', 'felso')} lang="hu" />);
    const svg = screen.getByRole('img', { name: 'Tök felső' });
    expect(svg.getAttribute('data-card')).toBe('tok-felso');
  });

  it('selected cards get the kit selected class', () => {
    const { container } = render(<HungarianCard card={card('piros', 'asz')} selected size={80} />);
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('arc-card--selected')).toBe(true);
    expect(svg.style.width).toBe('80px');
  });
});

describe('HungarianCard backs', () => {
  it('face down shows the traditional back without any face art', () => {
    const { container } = render(<HungarianCard card={card('makk', 'kiraly')} faceDown />);
    expect(container.querySelector('[data-back]')).not.toBeNull();
    expect(screen.getByTestId('hcard-back-classic')).toBeTruthy();
    expect(screen.queryByTestId('hcard-back-tooth')).toBeNull();
    expect(container.querySelector('[data-figure]')).toBeNull();
    expect(container.querySelector('[data-card]')).toBeNull();
  });

  it('dental back carries the tooth on the same pattern', () => {
    const { container } = render(<HungarianCard card={card('makk', 'kiraly')} faceDown dental />);
    expect(screen.getByTestId('hcard-back-tooth')).toBeTruthy();
    expect(screen.queryByTestId('hcard-back-classic')).toBeNull();
    expect(container.querySelector('[data-back-pattern]')).not.toBeNull();
  });

  it('two backs on one page use distinct pattern ids', () => {
    const { container } = render(
      <>
        <HungarianCard card={card('piros', 'VII')} faceDown />
        <HungarianCard card={card('piros', 'VIII')} faceDown />
      </>,
    );
    const ids = [...container.querySelectorAll('pattern')].map((p) => p.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('hCardLabel', () => {
  it('hu', () => {
    expect(hCardLabel(card('piros', 'asz'), 'hu')).toBe('Piros ász');
    expect(hCardLabel(card('tok', 'felso'), 'hu')).toBe('Tök felső');
    expect(hCardLabel(card('zold', 'VII'), 'hu')).toBe('Zöld hetes');
    expect(hCardLabel(card('makk', 'also'), 'hu')).toBe('Makk alsó');
  });
  it('en keeps the Hungarian suit names', () => {
    expect(hCardLabel(card('piros', 'asz'), 'en')).toBe('Ace of Piros');
    expect(hCardLabel(card('tok', 'felso'), 'en')).toBe('Over of Tök');
    expect(hCardLabel(card('makk', 'X'), 'en')).toBe('Ten of Makk');
  });
  it('de', () => {
    expect(hCardLabel(card('piros', 'asz'), 'de')).toBe('Rot-Ass');
    expect(hCardLabel(card('tok', 'felso'), 'de')).toBe('Schellen-Ober');
    expect(hCardLabel(card('zold', 'kiraly'), 'de')).toBe('Grün-König');
    expect(hCardLabel(card('makk', 'also'), 'de')).toBe('Eichel-Unter');
  });
  it('every card has a distinct non-empty label in every language', () => {
    for (const lang of ['en', 'hu', 'de'] as const) {
      const labels = HUNGARIAN_DECK.map((c) => hCardLabel(c, lang));
      expect(labels.every((l) => l.trim().length > 0)).toBe(true);
      expect(new Set(labels).size).toBe(32);
    }
  });
});

describe('Gallery', () => {
  it('shows all 32 faces plus the classic and the dental back', () => {
    const { container } = render(<Gallery />);
    expect(container.querySelectorAll('svg[data-card]')).toHaveLength(32);
    expect(container.querySelectorAll('svg[data-back]')).toHaveLength(2);
    expect(screen.getByTestId('hcard-back-tooth')).toBeTruthy();
    expect(screen.getByTestId('hcard-back-classic')).toBeTruthy();
  });
});
