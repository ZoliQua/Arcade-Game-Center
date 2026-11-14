import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, hCardLabel } from './arcade';
import { cardKey, illegalReason } from './engine';
import { MESSAGES } from './i18n';
import { findSession, humanTurn, save } from './test/fixtures';
import { isUltiSessionLoad } from './test/i18nHelpers';
import { setCoarsePointer } from './test/touchEnv';
import { RANK_SHORT } from './ui/labels';
import { UltiGame } from './UltiGame';
import type { UltiSession } from './game/session';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('en', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(true);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const en = MESSAGES.en;
const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const tap = (el: Element) =>
  act(() => {
    fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(el, { pointerId: 1, pointerType: 'touch', button: 0 });
    fireEvent.click(el);
  });
const handButtons = () => [...document.querySelectorAll<HTMLButtonElement>('[data-hand-card]')];
const bar = () => screen.getByTestId('ulti-actions');

function resume(s: UltiSession) {
  save(s);
  render(<UltiGame />);
  key('p');
}

describe('Ulti touch controls', () => {
  it('the board is a tap board and the actions sit in a bottom bar', () => {
    resume(findSession((x) => humanTurn(x, 'play')));
    expect(document.querySelector('.arc-board-tap')).toBeTruthy();
    expect(bar().getAttribute('data-bar')).toBe('bottom');
  });

  it('the hand is an overlapping fan; every card keeps a corner with its rank and suit', () => {
    const s = findSession((x) => humanTurn(x, 'discard'));
    resume(s);
    const hand = screen.getByTestId('ulti-hand');
    expect(hand.getAttribute('data-fan')).toBe('true');
    expect(hand.style.getPropertyValue('--n')).toBe('12');
    const buttons = handButtons();
    expect(buttons).toHaveLength(12);
    for (const b of buttons) {
      const [suit, rank] = b.getAttribute('data-hand-card')!.split(':') as [never, keyof (typeof RANK_SHORT)['en']];
      const corner = b.querySelector('[data-corner-index]');
      expect(corner?.textContent).toBe(RANK_SHORT.en[rank]);
      expect(corner?.getAttribute('data-suit')).toBe(suit);
      expect(corner?.querySelector('svg')).toBeTruthy();
    }
  });

  it('tap selects a card, tapping it again plays it', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.deal.hands[0].length > 3);
    resume(s);
    const before = handButtons().length;
    const card = document.querySelector<HTMLButtonElement>('[data-playable="true"]')!;
    const k = card.getAttribute('data-hand-card');
    tap(card);
    expect(handButtons()).toHaveLength(before);
    expect(card.getAttribute('aria-pressed')).toBe('true');
    expect(isUltiSessionLoad()?.deal.log.length).toBe(s.deal.log.length);
    tap(document.querySelector(`[data-hand-card="${k}"]`)!);
    expect(handButtons()).toHaveLength(before - 1);
    expect(document.querySelector(`[data-hand-card="${k}"]`)).toBeNull();
  });

  it('tapping another card moves the selection', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.deal.trick === null && x.deal.hands[0].length > 3);
    resume(s);
    const [a, b] = [...document.querySelectorAll<HTMLButtonElement>('[data-playable="true"]')];
    tap(a);
    tap(b);
    expect(a.getAttribute('aria-pressed')).toBe('false');
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(handButtons()).toHaveLength(s.deal.hands[0].length);
  });

  it('tapping a card that may not be played explains why and selects nothing', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.deal.trick !== null && x.deal.hands[0].some((c) => illegalReason(x.deal, 0, c)));
    resume(s);
    const illegal = document.querySelector<HTMLButtonElement>('[data-playable="false"]')!;
    tap(illegal);
    expect(screen.getByTestId('ulti-notice')).toBeTruthy();
    expect(illegal.getAttribute('aria-pressed')).toBe('false');
    expect(handButtons()).toHaveLength(s.deal.hands[0].length);
  });

  it('the bottom bar offers a Play button for the selected card', () => {
    const s = findSession((x) => humanTurn(x, 'play'));
    resume(s);
    expect(within(bar()).queryByRole('button', { name: /^Play / })).toBeNull();
    const card = document.querySelector<HTMLButtonElement>('[data-playable="true"]')!;
    const c = s.deal.hands[0].find((h) => cardKey(h) === card.getAttribute('data-hand-card'))!;
    tap(card);
    const play = within(bar()).getByRole('button', { name: en.playBtn.replace('{card}', hCardLabel(c, 'en')) });
    tap(play);
    expect(handButtons()).toHaveLength(s.deal.hands[0].length - 1);
  });

  it('discarding: tap two cards, then the lay-down button in the bottom bar', () => {
    const s = findSession((x) => humanTurn(x, 'discard') && x.deal.bid === null);
    resume(s);
    const n = handButtons().length;
    outer: for (let i = 0; i < n; i += 1)
      for (let j = i + 1; j < n; j += 1) {
        tap(handButtons()[i]);
        tap(handButtons()[j]);
        expect(handButtons().filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(2);
        tap(within(bar()).getByRole('button', { name: en.discardBtn.replace('{n}', '2') }));
        if (isUltiSessionLoad()?.deal.phase !== 'discard') break outer;
        handButtons().filter((b) => b.getAttribute('aria-pressed') === 'true').forEach((b) => tap(b));
      }
    expect(isUltiSessionLoad()?.deal.phase).toBe('declare');
    expect(within(bar()).getByTestId('ulti-bid-panel')).toBeTruthy();
  });

  it('while bidding, the bar drops the prompt sentence so the list covers less of the hand', () => {
    resume(findSession((x) => humanTurn(x, 'declare')));
    expect(within(bar()).getByTestId('ulti-bid-panel')).toBeTruthy();
    expect(within(bar()).queryByTestId('ulti-prompt')).toBeNull();
    expect(bar().getAttribute('data-phase')).toBe('declare');
  });

  it('a piros bid shows its ×2 as a separate badge next to the value', () => {
    resume(findSession((x) => humanTurn(x, 'declare') && x.deal.hands[0].some((c) => c.suit === 'piros')));
    const btn = bar().querySelector('[data-bid$=":piros"]');
    expect(btn).toBeTruthy();
    const badge = btn!.querySelector('[data-mult]');
    expect(badge?.textContent).toBe('×2');
    expect(btn!.querySelector('[data-value]')?.textContent).toMatch(/^\d+$/);
  });

  it('bidding, passing and kontra are buttons in the bottom bar', () => {
    const s = findSession((x) => humanTurn(x, 'kontra'));
    resume(s);
    tap(within(bar()).getByRole('button', { name: en.noKontra }));
    expect(isUltiSessionLoad()?.deal.log.length).toBeGreaterThan(s.deal.log.length);
  });

  it('shows touch help next to the (hidden) key help', () => {
    render(<UltiGame />);
    expect(screen.getByText(en.touchTap)).toBeTruthy();
    expect(screen.getByText(en.touchBar)).toBeTruthy();
  });

  it('the full-screen button toggles the immersive mode', () => {
    render(<UltiGame />);
    act(() => void fireEvent.click(screen.getByRole('button', { name: /Full screen/ })));
    expect(document.documentElement.dataset.arcadeImmersive).toBe('1');
    act(() => void fireEvent.click(screen.getByRole('button', { name: /Exit full screen/ })));
    expect(document.documentElement.dataset.arcadeImmersive).toBeUndefined();
  });

  it('with a mouse a click still plays at once', () => {
    setCoarsePointer(false);
    const s = findSession((x) => humanTurn(x, 'play'));
    resume(s);
    expect(screen.getByTestId('ulti-hand').getAttribute('data-fan')).toBe('false');
    act(() => void fireEvent.click(document.querySelector('[data-playable="true"]')!));
    expect(handButtons()).toHaveLength(s.deal.hands[0].length - 1);
  });
});
