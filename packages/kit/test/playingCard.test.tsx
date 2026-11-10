import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlayingCard } from '../src/components/PlayingCard';
import { cardBackLabel, cardLabel } from '../src/cardLabels';
import { gameInfo, gameName, gameTagline } from '../src/registry';

describe('PlayingCard', () => {
  it('renders rank and suit symbol', () => {
    const { container } = render(<PlayingCard card={{ suit: 'H', rank: 'Q' }} />);
    expect(container.textContent).toContain('Q');
    expect(container.querySelector('[data-suit="H"]')).not.toBeNull();
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Queen of hearts');
  });
  it('faceDown hides the rank and shows the back', () => {
    const { container } = render(<PlayingCard card={{ suit: 'S', rank: 'K' }} faceDown />);
    expect(container.textContent).not.toContain('K');
    expect(container.querySelector('[data-back]')).not.toBeNull();
  });
  it('dental back contains the tooth', () => {
    const { container } = render(<PlayingCard card={{ suit: 'S', rank: 'K' }} faceDown dental />);
    expect(container.querySelector('[data-testid="card-back-tooth"]')).not.toBeNull();
  });
  it('grey deck sets data-deck', () => {
    const { container } = render(<PlayingCard card={{ suit: 'D', rank: '10' }} deck="grey" />);
    expect(container.querySelector('[data-deck="grey"]')).not.toBeNull();
  });
  it('localizes default aria-labels', () => {
    const a = render(<PlayingCard card={{ suit: 'H', rank: 'J' }} lang="hu" />);
    expect(a.getByRole('img').getAttribute('aria-label')).toBe('Kőr bubi');
    const b = render(<PlayingCard card={{ suit: 'H', rank: 'J' }} faceDown lang="de" />);
    expect(b.getAllByRole('img')[1]!.getAttribute('aria-label')).toBe('Verdeckte Karte');
    expect(cardBackLabel('hu')).toBe('Lefordított kártya');
  });
  it('labels cards in all languages', () => {
    expect(cardLabel({ suit: 'S', rank: 'A' }, 'hu')).toBe('Pikk ász');
    expect(cardLabel({ suit: 'S', rank: 'A' }, 'de')).toBe('Pik-Ass');
    expect(cardLabel({ suit: 'S', rank: 'A' }, 'en')).toBe('Ace of spades');
  });
});

describe('new game registry entries', () => {
  it('names', () => {
    expect(gameName('minesweeper', 'hu')).toBe('Aknakereső');
    expect(gameName('minesweeper', 'de')).toBe('Minesweeper');
    expect(gameName('solitaire', 'hu')).toBe('Pasziánsz');
    expect(gameName('solitaire', 'de')).toBe('Solitär');
    expect(gameName('ulti', 'hu')).toBe('Ulti');
    for (const id of ['minesweeper', 'solitaire', 'ulti'] as const) {
      expect(gameInfo(id).repo).toMatch(/^https:\/\/github\.com\/ZoliQua\/\w+-Game$/);
      expect(gameTagline(id, 'de').length).toBeGreaterThan(10);
    }
  });
});
