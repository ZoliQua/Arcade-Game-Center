import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, saveSession } from './arcade';
import { createInitialState } from './logic/game';
import type { GameState } from './logic/types';
import { SnakeGame } from './SnakeGame';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const grid = (c: HTMLElement) => c.querySelector('[role="grid"]') as HTMLElement;
const stat = (label: string) => screen.getByText(label).parentElement!.textContent;
const cellIndex = (c: HTMLElement, selector: string) =>
  Array.from(grid(c).children).findIndex((cell) => cell.matches(selector));

/** A paused run heading right, with a known score and food far away. */
function midRun(): GameState {
  return {
    ...createInitialState(),
    snake: [
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    status: 'running',
    score: 40,
  };
}

describe('Snake dental mode', () => {
  it('draws a smiling tooth head, tooth body and a toothpaste drop', () => {
    applyDental(true);
    const { container } = render(<SnakeGame />);
    expect(grid(container).getAttribute('data-dental')).toBe('true');
    expect(container.querySelectorAll('[data-testid="snake-head-tooth"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="snake-body-tooth"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-testid="snake-food-paste"]')).toHaveLength(1);
  });

  it('keeps the head tooth upright and mirrors it only when heading left', () => {
    applyDental(true);
    saveSession('snake', { schema: 1, data: midRun(), seconds: 5, score: 40 });
    const { container } = render(<SnakeGame />);
    const head = () => container.querySelector('[data-testid="snake-head-tooth"]') as HTMLElement;
    const transform = () => (head().querySelector('svg') as SVGElement).style.transform;
    expect(head().getAttribute('data-direction')).toBe('RIGHT');
    expect(transform()).toBe('scale(1.18)');
    act(() => key('p'));
    act(() => key('ArrowDown'));
    act(() => vi.advanceTimersByTime(400));
    expect(head().getAttribute('data-direction')).toBe('DOWN');
    expect(transform()).toBe('scale(1.18)');
    expect(transform()).not.toContain('rotate');
    act(() => key('ArrowLeft'));
    act(() => vi.advanceTimersByTime(400));
    expect(head().getAttribute('data-direction')).toBe('LEFT');
    expect(transform()).toBe('scaleX(-1) scale(1.18)');
  });

  it('keeps the classic cells with dental mode off', () => {
    const { container } = render(<SnakeGame />);
    expect(grid(container).getAttribute('data-dental')).toBe('false');
    expect(container.querySelectorAll('[role="grid"] .head')).toHaveLength(1);
    expect(container.querySelectorAll('[role="grid"] .food')).toHaveLength(1);
    expect(container.querySelector('[role="grid"] svg')).toBeNull();
  });

  it('toggling dental mode mid-run keeps the score, the snake and the run', () => {
    saveSession('snake', { schema: 1, data: midRun(), seconds: 5, score: 40 });
    const { container } = render(<SnakeGame />);
    act(() => key('p'));
    expect(screen.queryByRole('dialog')).toBeNull();
    const headBefore = cellIndex(container, '.head');
    const foodBefore = cellIndex(container, '.food');

    act(() => applyDental(true));
    expect(grid(container).getAttribute('data-dental')).toBe('true');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Score')).toContain('40');
    expect(stat('Length')).toContain('3');
    expect(cellIndex(container, '.head')).toBe(headBefore);
    expect(cellIndex(container, '.food')).toBe(foodBefore);

    act(() => applyDental(false));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(cellIndex(container, '.head')).toBe(headBefore);
    expect(stat('Score')).toContain('40');
  });

  it('offers the dental toggle in the game settings', () => {
    render(<SnakeGame />);
    const box = screen.getByRole('checkbox', { name: /Dental mode/ });
    expect((box as HTMLInputElement).checked).toBe(false);
    act(() => fireEvent.click(box));
    expect(localStorage.getItem('arcade.dental')).toBe('1');
  });
});
