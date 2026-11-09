import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, loadSession, saveSession } from './arcade';
import { BreakoutGame } from './BreakoutGame';
import { BreakoutDemo } from './demo/BreakoutDemo';
import { createInitialState } from './logic/game';
import type { GameState } from './logic/types';

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
  applyDental(false, { silent: true });
  localStorage.clear();
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'Date',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const stat = (label: string) => {
  const dt = screen.getAllByRole('term').find((el) => el.textContent === label);
  return dt?.nextElementSibling?.textContent;
};
const field = (container: HTMLElement) => container.querySelector('svg[data-dental]') as SVGSVGElement;

const seedRun = () => {
  const data = createInitialState({ status: 'running', level: 2, lives: 2, score: 1234 });
  saveSession('breakout', { schema: 1, data, seconds: 42, score: 1234 });
  return data;
};

describe('Breakout dental mode', () => {
  it('draws a toothbrush paddle, a toothpaste ball and tartar bricks with brush / paste / probe marks', () => {
    applyDental(true, { silent: true });
    const data = seedRun();
    const { container } = render(<BreakoutGame />);
    expect(field(container).dataset.dental).toBe('true');
    expect(screen.getByTestId('breakout-paddle-brush')).toBeTruthy();
    expect(screen.getAllByTestId('breakout-ball-paste')).toHaveLength(data.balls.length);
    const marks = screen.getAllByTestId('breakout-brick-mark').map((el) => el.dataset.mark);
    expect(new Set(marks)).toEqual(new Set(['brush', 'paste', 'probe']));
    expect(screen.getByRole('checkbox', { name: /Dental mode/ })).toHaveProperty('checked', true);
  });

  it('toggling dental mode mid-run keeps score, level, lives and bricks', () => {
    const data = seedRun();
    const bricks = data.bricks.length;
    const { container } = render(<BreakoutGame />);
    act(() => key('p')); // continue the restored run
    expect(screen.queryByRole('dialog')).toBeNull();

    act(() => applyDental(true));
    expect(field(container).dataset.dental).toBe('true');
    expect(screen.getByTestId('breakout-paddle-brush')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Score')).toBe('1,234');
    expect(stat('Level')).toBe('2');
    expect(stat('Lives')).toBe('2');
    expect(screen.getByRole('img', { name: `Breakout playfield, level 2, ${bricks} bricks` })).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: /Dental mode/ }));
    expect(field(container).dataset.dental).toBe('false');
    expect(localStorage.getItem('arcade.dental')).toBe('0');
    act(() => vi.advanceTimersByTime(1200));
    expect(loadSession<GameState>('breakout', 1)?.data).toMatchObject({ status: 'running', score: 1234, level: 2, lives: 2 });
  });

  it('with dental mode off the classic paddle and ball are drawn', () => {
    seedRun();
    const { container } = render(<BreakoutGame />);
    expect(field(container).dataset.dental).toBe('false');
    expect(screen.queryByTestId('breakout-paddle-brush')).toBeNull();
    expect(screen.queryAllByTestId('breakout-ball-paste')).toHaveLength(0);
    expect(screen.queryAllByTestId('breakout-brick-mark')).toHaveLength(0);
    expect(screen.getByRole('checkbox', { name: /Dental mode/ })).toHaveProperty('checked', false);
  });

  it('labels the settings row „Fogas mód” in Hungarian', () => {
    applyLang('hu', { silent: true });
    render(<BreakoutGame />);
    const box = screen.getByRole('checkbox', { name: /Fogas mód/ });
    expect(box.closest('label')?.textContent).toMatch(/fogkefe/i);
  });

  it('the demo follows dental mode without writing storage', () => {
    applyDental(true, { silent: true });
    localStorage.clear();
    applyDental(true, { silent: true });
    const before = localStorage.length;
    render(<BreakoutDemo />);
    expect(screen.getByTestId('breakout-paddle-brush')).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(localStorage.length).toBe(before);
  });
});
