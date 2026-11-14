import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber, loadSession, saveSession } from './arcade';
import { BreakoutGame } from './BreakoutGame';
import { createInitialState } from './logic/game';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'] });
});
afterEach(() => {
  vi.useRealTimers();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const finishBtn = () => screen.queryByRole('button', { name: 'Befejezés' });

function savedRun(score: number) {
  const run = createInitialState({ status: 'running', score });
  saveSession('breakout', { schema: 1, data: run, seconds: 10, score });
}

describe('Breakout finish early', () => {
  it('is hidden before the run starts and visible after the first move', () => {
    render(<BreakoutGame />);
    expect(finishBtn()).toBeNull();
    act(() => key(' '));
    expect(finishBtn()).toBeTruthy();
  });

  it('confirms with the Score value, ranks it once and shows the finished card', () => {
    savedRun(1240);
    const onGameOver = vi.fn();
    render(<BreakoutGame onGameOver={onGameOver} />);
    fireEvent.click(finishBtn()!);
    expect(screen.getByRole('alertdialog').textContent).toContain(`${formatNumber(1240, 'hu')} pont kerül a ranglistára`);
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(1240, { finished: true });
    expect(screen.getByRole('dialog', { name: 'Idő előtt befejezve' })).toBeTruthy();
    expect(loadSession('breakout', 1)).toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it('finishing at score 0 still ranks once', () => {
    const onGameOver = vi.fn();
    render(<BreakoutGame onGameOver={onGameOver} />);
    act(() => key(' '));
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0, { finished: true });
  });

  it('Cancel changes nothing', () => {
    savedRun(300);
    const onGameOver = vi.fn();
    render(<BreakoutGame onGameOver={onGameOver} />);
    const before = screen.getByText('Pont').parentElement!.textContent;
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Mégse' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onGameOver).not.toHaveBeenCalled();
    expect(screen.getByText('Pont').parentElement!.textContent).toBe(before);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('stops the ball and the clock while the confirm is open', () => {
    render(<BreakoutGame />);
    act(() => key(' '));
    act(() => key(' '));
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(finishBtn()!);
    const ball = () => document.querySelector('circle')!.outerHTML;
    const time = () => screen.getByText('Idő').parentElement!.textContent;
    const b1 = ball();
    const t1 = time();
    act(() => vi.advanceTimersByTime(3000));
    expect(ball()).toBe(b1);
    expect(time()).toBe(t1);
  });
});
