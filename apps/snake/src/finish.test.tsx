import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, loadSession, saveSession } from './arcade';
import { createInitialState } from './logic/game';
import { SnakeGame } from './SnakeGame';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const finishBtn = () => screen.queryByRole('button', { name: 'Befejezés' });

function startWithScore() {
  const run = createInitialState({
    status: 'running',
    wrapWalls: true,
    score: 18,
    snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
    food: { x: 15, y: 15 },
  });
  saveSession('snake', { schema: 1, data: run, seconds: 10, score: 18 });
}

describe('Snake finish early', () => {
  it('is hidden before the run starts and visible after the first move', () => {
    render(<SnakeGame />);
    expect(finishBtn()).toBeNull();
    act(() => key(' '));
    expect(finishBtn()).toBeTruthy();
  });

  it('confirms with the Score value, ranks it once and shows the finished card', () => {
    startWithScore();
    const onGameOver = vi.fn();
    render(<SnakeGame onGameOver={onGameOver} />);
    act(() => vi.advanceTimersByTime(1200));
    fireEvent.click(finishBtn()!);
    expect(screen.getByRole('alertdialog').textContent).toContain('18 pont kerül a ranglistára');
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(18, { finished: true });
    expect(screen.getByRole('dialog', { name: 'Idő előtt befejezve' })).toBeTruthy();
    expect(loadSession('snake', 1)).toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it('Cancel changes nothing', () => {
    startWithScore();
    const onGameOver = vi.fn();
    render(<SnakeGame onGameOver={onGameOver} />);
    const before = screen.getByText('Hossz').parentElement!.textContent;
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Mégse' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onGameOver).not.toHaveBeenCalled();
    expect(screen.getByText('Hossz').parentElement!.textContent).toBe(before);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('stops the snake and the clock while the confirm is open', () => {
    startWithScore();
    render(<SnakeGame />);
    act(() => key('p'));
    act(() => key('p'));
    const head = () => document.querySelectorAll('[role="gridcell"]').length;
    act(() => vi.advanceTimersByTime(600));
    fireEvent.click(finishBtn()!);
    const grid1 = document.querySelector('[role="grid"]')!.innerHTML;
    act(() => vi.advanceTimersByTime(2000));
    expect(document.querySelector('[role="grid"]')!.innerHTML).toBe(grid1);
    expect(head()).toBe(400);
  });
});
