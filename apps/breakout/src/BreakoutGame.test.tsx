import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSession, readStats, saveSession } from './arcade';
import { BreakoutGame } from './BreakoutGame';
import { createInitialState } from './logic/game';
import type { GameState } from './logic/types';

beforeEach(() => {
  localStorage.clear();
  // Vitest 2 leaves requestAnimationFrame real by default; the game loop runs on it.
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
afterEach(() => vi.useRealTimers());

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const keyUp = (k: string) => fireEvent.keyUp(window, { key: k });
const saved = () => loadSession<GameState>('breakout', 1)?.data;

describe('<BreakoutGame />', () => {
  it('starts with Space, launches with Space, pauses with P and reports status', () => {
    const onStatusChange = vi.fn();
    render(<BreakoutGame onStatusChange={onStatusChange} />);
    expect(screen.getByRole('dialog', { name: 'Breakout' })).toBeTruthy();
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'running' }));
    expect(screen.getByText('Launch!')).toBeTruthy();
    act(() => key(' '));
    act(() => vi.advanceTimersByTime(200));
    // Space while playing launches the ball instead of pausing.
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Launch!')).toBeNull();
    act(() => key('p'));
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeTruthy();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'paused' }));
  });

  it('steers the paddle with the arrow keys', () => {
    const { unmount } = render(<BreakoutGame />);
    act(() => key(' '));
    act(() => key('ArrowLeft'));
    act(() => vi.advanceTimersByTime(300));
    act(() => keyUp('ArrowLeft'));
    unmount();
    expect(saved()?.paddleX).toBeLessThan(240 - 50);
  });

  it('autosaves a run in progress and restores it paused', () => {
    const { unmount } = render(<BreakoutGame />);
    act(() => key(' '));
    act(() => key(' '));
    act(() => vi.advanceTimersByTime(1200));
    unmount();
    const data = saved();
    expect(data).toMatchObject({ status: 'running' });
    expect(data?.balls[0].stuck).toBe(false);

    render(<BreakoutGame embedded />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    // Continue resumes the restored run.
    act(() => key('p'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('pauses when the tab is hidden', () => {
    render(<BreakoutGame />);
    act(() => key(' '));
    const vis = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    vis.mockRestore();
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeTruthy();
  });

  it('records the finished run once and clears the save', () => {
    const onGameOver = vi.fn();
    // Last life, the only ball just above the bottom edge and far from the paddle.
    const doomed = createInitialState({
      status: 'running',
      lives: 1,
      score: 1234,
      paddleX: 400,
      bannerMs: 0,
      balls: [{ x: 30, y: 350, vx: 0, vy: 300, speed: 300, stuck: false, caught: false, offset: 0, heldMs: 0 }],
    });
    saveSession('breakout', { schema: 1, data: doomed, seconds: 42, score: 1234 });
    render(<BreakoutGame onGameOver={onGameOver} />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
    act(() => key('p'));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole('dialog', { name: 'Game over' })).toBeTruthy();
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(1234);
    expect(readStats('breakout')).toMatchObject({ best: 1234, plays: 1 });
    expect(loadSession('breakout', 1)).toBeNull();
    act(() => vi.advanceTimersByTime(500));
    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it('rejects a tampered save and starts fresh', () => {
    saveSession('breakout', { schema: 1, data: { ...createInitialState(), balls: [] }, seconds: 5, score: 0 });
    render(<BreakoutGame />);
    expect(screen.getByRole('dialog', { name: 'Breakout' })).toBeTruthy();
  });

  it('ignores hotkeys while typing in a field', () => {
    render(
      <>
        <input aria-label="nick" />
        <BreakoutGame />
      </>,
    );
    const input = screen.getByLabelText('nick');
    act(() => {
      fireEvent.keyDown(input, { key: ' ' });
      fireEvent.keyDown(input, { key: 'r' });
    });
    expect(screen.getByRole('dialog', { name: 'Breakout' })).toBeTruthy();
  });

  it('remembers the sound setting', () => {
    render(<BreakoutGame />);
    const box = screen.getByRole('checkbox', { name: /sound effects/i }) as HTMLInputElement;
    expect(box.checked).toBe(true);
    act(() => {
      fireEvent.click(box);
    });
    expect(box.checked).toBe(false);
    expect(localStorage.getItem('breakout.sound')).toBe('off');
  });
});
