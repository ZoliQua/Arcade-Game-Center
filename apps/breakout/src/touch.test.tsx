import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang } from './arcade';
import { BreakoutGame } from './BreakoutGame';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('en', { silent: true });
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  setCoarsePointer(true);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const field = () => {
  const svg = document.querySelector('svg[data-dental]') as SVGSVGElement;
  // 480 px wide on screen = 1 logical px per CSS px.
  svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 480, height: 360, right: 480, bottom: 360, x: 0, y: 0, toJSON: () => ({}) });
  return svg;
};
const paddleCentre = () => {
  const r = document.querySelector('rect.paddle') as SVGRectElement;
  return Number(r.getAttribute('x')) + Number(r.getAttribute('width')) / 2;
};
const touch = (type: 'pointerDown' | 'pointerMove' | 'pointerUp', el: Element, x: number, y = 300) =>
  fireEvent[type](el, { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y, button: 0 });

describe('Breakout touch controls', () => {
  it('marks the board as a gesture board', () => {
    render(<BreakoutGame />);
    expect(document.querySelector('.arc-board-touch')).toBeTruthy();
  });

  it('dragging anywhere on the board moves the paddle to the finger', () => {
    render(<BreakoutGame />);
    act(() => key(' '));
    const svg = field();
    touch('pointerDown', svg, 100, 120);
    act(() => vi.advanceTimersByTime(300));
    expect(paddleCentre()).toBeCloseTo(100, 0);
    touch('pointerMove', svg, 400, 200);
    act(() => vi.advanceTimersByTime(300));
    expect(paddleCentre()).toBeCloseTo(400, 0);
  });

  it('a tap launches the ball; a drag does not', () => {
    render(<BreakoutGame />);
    act(() => key(' '));
    const svg = field();
    touch('pointerDown', svg, 100);
    touch('pointerMove', svg, 220);
    touch('pointerUp', svg, 220);
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByText('Launch!')).toBeTruthy();
    touch('pointerDown', svg, 220);
    touch('pointerUp', svg, 222);
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText('Launch!')).toBeNull();
  });

  it('shows touch help instead of keys', () => {
    render(<BreakoutGame />);
    expect(screen.getByText('Drag on the board')).toBeTruthy();
    expect(screen.getByText('Tap the board')).toBeTruthy();
  });

  it('the full-screen button toggles the immersive mode', () => {
    render(<BreakoutGame />);
    fireEvent.click(screen.getByRole('button', { name: /Full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /Exit full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBeUndefined();
  });
});
