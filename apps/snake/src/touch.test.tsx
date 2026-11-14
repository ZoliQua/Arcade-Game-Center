import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang } from './arcade';
import { SnakeGame } from './SnakeGame';
import { setCoarsePointer } from './test/touchEnv';

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

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const board = () => document.querySelector('.arc-board-touch') as HTMLElement;
const headCell = () => {
  const cells = Array.from(document.querySelectorAll('[role="gridcell"]'));
  return cells.findIndex((c) => c.className.includes('head'));
};
const pos = () => {
  const i = headCell();
  return { x: i % 20, y: Math.floor(i / 20) };
};

function swipe(el: HTMLElement, dx: number, dy: number) {
  fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100, button: 0 });
  fireEvent.pointerUp(window, { pointerId: 1, pointerType: 'touch', clientX: 100 + dx, clientY: 100 + dy, button: 0 });
}
const tick = () => act(() => vi.advanceTimersByTime(160));

describe('Snake touch controls', () => {
  it('marks the board as a gesture board', () => {
    render(<SnakeGame />);
    expect(board()).toBeTruthy();
  });

  it('a tap on the board while idle starts the game', () => {
    render(<SnakeGame />);
    expect(screen.getByRole('dialog', { name: 'Snake' })).toBeTruthy();
    swipe(board(), 0, 0);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('swipes turn the snake, queued like keys', () => {
    render(<SnakeGame />);
    act(() => key(' '));
    const start = pos();
    swipe(board(), 0, -60);
    tick();
    expect(pos()).toEqual({ x: start.x, y: start.y - 1 });
    swipe(board(), -60, 0);
    tick();
    expect(pos().x).toBe(start.x - 1);
    swipe(board(), 60, 0); // reversal ignored
    tick();
    expect(pos().x).toBe(start.x - 2);
    swipe(board(), 0, 60);
    tick();
    expect(pos().y).toBe(start.y);
  });

  it('on-screen d-pad buttons turn the snake', () => {
    render(<SnakeGame />);
    act(() => key(' '));
    const start = pos();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Down' }), { pointerId: 2, pointerType: 'touch', button: 0 });
    tick();
    expect(pos()).toEqual({ x: start.x, y: start.y + 1 });
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Left' }), { pointerId: 2, pointerType: 'touch', button: 0 });
    tick();
    expect(pos().x).toBe(start.x - 1);
  });

  it('shows touch help instead of keys', () => {
    render(<SnakeGame />);
    expect(screen.getByText('Swipe')).toBeTruthy();
  });

  it('the full-screen button toggles the immersive mode', () => {
    render(<SnakeGame />);
    fireEvent.click(screen.getByRole('button', { name: /Full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /Exit full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBeUndefined();
  });
});
