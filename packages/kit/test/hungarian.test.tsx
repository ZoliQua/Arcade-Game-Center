import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HUNGARIAN_DECK,
  H_RANKS,
  H_SUITS,
  HungarianCard,
  SEASON_OF_SUIT,
  hCardBackLabel,
  hCardLabel,
  hFigure,
  hFigureName,
  type HCard,
} from '../src/hungarian';
import * as kit from '../src';

const card = (suit: HCard['suit'], rank: HCard['rank']): HCard => ({ suit, rank });
const MIRROR = 'rotate(180 50 80)';

/** Asserts a top half and a bottom half that is the same drawing turned by 180° about the card centre. */
function expectMirrored(container: HTMLElement) {
  const top = container.querySelectorAll('[data-half="top"]');
  const bottom = container.querySelectorAll('[data-half="bottom"]');
  expect(top).toHaveLength(1);
  expect(bottom).toHaveLength(1);
  expect(bottom[0].getAttribute('transform')).toBe(MIRROR);
  expect(top[0].getAttribute('transform')).toBeNull();
  expect(bottom[0].innerHTML).toBe(top[0].innerHTML);
}

describe('kit exports', () => {
  it('the kit barrel re-exports the Hungarian deck', () => {
    expect(kit.HungarianCard).toBe(HungarianCard);
    expect(kit.HUNGARIAN_DECK).toBe(HUNGARIAN_DECK);
    expect(kit.hCardLabel).toBe(hCardLabel);
    expect(kit.hCardBackLabel).toBe(hCardBackLabel);
    expect(typeof kit.HSuitSign).toBe('function');
  });
});

describe('HUNGARIAN_DECK', () => {
  it('has 32 unique cards, 8 per suit and 4 per rank', () => {
    expect(HUNGARIAN_DECK).toHaveLength(32);
    expect(new Set(HUNGARIAN_DECK.map((c) => `${c.suit}-${c.rank}`)).size).toBe(32);
    for (const s of H_SUITS) expect(HUNGARIAN_DECK.filter((c) => c.suit === s)).toHaveLength(8);
    for (const r of H_RANKS) expect(HUNGARIAN_DECK.filter((c) => c.rank === r)).toHaveLength(4);
  });
});

describe('HungarianCard faces', () => {
  it('uses the 100 × 160 viewBox', () => {
    const { container } = render(<HungarianCard card={card('piros', 'VII')} />);
    expect(container.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 100 160');
  });

  it.each(['also', 'felso', 'kiraly'] as const)('%s renders one figure, double-headed, with the suit sign in a corner', (rank) => {
    for (const suit of H_SUITS) {
      const { container, unmount } = render(<HungarianCard card={card(suit, rank)} />);
      const figures = container.querySelectorAll('[data-figure]');
      expect(figures).toHaveLength(1);
      expect(figures[0].getAttribute('data-figure')).toBe(hFigure(card(suit, rank)));
      expect(figures[0].getAttribute('data-rank')).toBe(rank);
      expect(container.querySelector('[data-corner] [data-suit-shape]')).not.toBeNull();
      expectMirrored(container);
      unmount();
    }
  });

  it.each(['also', 'felso'] as const)('the four %s cards show four different Tell figures', (rank) => {
    const figures = H_SUITS.map((suit) => {
      const { container, unmount } = render(<HungarianCard card={card(suit, rank)} />);
      const f = container.querySelector('[data-figure]')!.getAttribute('data-figure');
      unmount();
      return f;
    });
    expect(new Set(figures).size).toBe(4);
  });

  it('the Tell figures follow the Hungarian Wikipedia table', () => {
    const table = Object.fromEntries(H_SUITS.map((s) => [s, [hFigure(card(s, 'also')), hFigure(card(s, 'felso'))]]));
    expect(table).toEqual({
      piros: ['kuoni', 'gessler'],
      tok: ['reding', 'stussi'],
      zold: ['furst', 'rudenz'],
      makk: ['harras', 'tell'],
    });
    expect(hFigureName(card('makk', 'felso'), 'hu')).toBe('Tell Vilmos');
    expect(hFigureName(card('makk', 'felso'), 'en')).toBe('William Tell');
    expect(hFigureName(card('makk', 'felso'), 'de')).toBe('Wilhelm Tell');
    expect(hFigureName(card('piros', 'felso'), 'hu')).toBe('Geszler Hermann');
    expect(hFigureName(card('piros', 'asz'), 'hu')).toBe('Tavasz');
    expect(hFigureName(card('piros', 'VII'), 'hu')).toBeNull();
  });

  it('every Király rides a horse', () => {
    for (const suit of H_SUITS) {
      const { container, unmount } = render(<HungarianCard card={card(suit, 'kiraly')} />);
      expect(container.querySelector('[data-mount="horse"]')).not.toBeNull();
      unmount();
    }
  });

  it('aces carry their season, double-headed: piros Tavasz, tök Nyár, zöld Ősz, makk Tél', () => {
    expect(SEASON_OF_SUIT).toEqual({ piros: 'tavasz', tok: 'nyar', zold: 'osz', makk: 'tel' });
    const banner = { piros: 'TAVASZ', tok: 'NYÁR', zold: 'ŐSZ', makk: 'TÉL' } as const;
    for (const suit of H_SUITS) {
      const { container, unmount } = render(<HungarianCard card={card(suit, 'asz')} />);
      const season = container.querySelectorAll('[data-season]');
      expect(season).toHaveLength(1);
      expect(season[0].getAttribute('data-season')).toBe(SEASON_OF_SUIT[suit]);
      const banners = [...container.querySelectorAll('[data-banner]')].map((e) => e.textContent);
      expect(banners).toEqual([banner[suit], banner[suit]]);
      expect(container.querySelector('[data-figure]')).toBeNull();
      expect(container.querySelector('[data-corner] [data-suit-shape]')).not.toBeNull();
      expectMirrored(container);
      unmount();
    }
  });

  it.each([
    ['VII', 7],
    ['VIII', 8],
    ['IX', 9],
    ['X', 10],
  ] as const)('%s shows %i pips, a vignette and its numeral in all four corners', (rank, n) => {
    const { container } = render(<HungarianCard card={card('zold', rank)} />);
    expect(container.querySelectorAll('[data-pip]')).toHaveLength(n);
    expect(container.querySelectorAll('[data-vignette]')).toHaveLength(1);
    const numerals = [...container.querySelectorAll('[data-numeral]')];
    expect(numerals.map((e) => e.textContent)).toEqual([rank, rank, rank, rank]);
    // Two corners read from the top, two (turned) from the bottom.
    const turned = numerals.filter((e) => e.closest(`[transform="${MIRROR}"]`));
    expect(turned).toHaveLength(2);
  });

  it('pips sit in two side columns (plus the centre line only)', () => {
    for (const rank of ['VII', 'VIII', 'IX', 'X'] as const) {
      const { container, unmount } = render(<HungarianCard card={card('piros', rank)} />);
      const xs = new Set([...container.querySelectorAll('[data-pip]')].map((e) => e.getAttribute('data-x')));
      for (const x of xs) expect(['26', '50', '74']).toContain(x);
      unmount();
    }
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

  it('two faces on one page use distinct clip ids', () => {
    const { container } = render(
      <>
        <HungarianCard card={card('piros', 'felso')} />
        <HungarianCard card={card('makk', 'felso')} />
      </>,
    );
    const ids = [...container.querySelectorAll('clipPath')].map((p) => p.id);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    expect(new Set(ids).size).toBe(ids.length);
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
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Face-down card');
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
  it('back labels', () => {
    expect(hCardBackLabel('hu')).toBe('Lefordított kártya');
    expect(hCardBackLabel('de')).toBe('Verdeckte Karte');
  });
});
