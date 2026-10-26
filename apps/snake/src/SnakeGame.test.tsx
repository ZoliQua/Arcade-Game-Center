import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSession, readStats, saveSession } from './arcade';
import { createInitialState } from './logic/game';
import { SnakeDemo } from './demo/SnakeDemo';
import { SnakeGame } from './SnakeGame';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

const key = (k: string) => fireEvent.keyDown(window, { key: k });

describe('<SnakeGame />', () => {
  it('starts with Space, pauses with P and reports status to the host', () => {
    const onStatusChange = vi.fn();
    render(<SnakeGame onStatusChange={onStatusChange} />);
    expect(screen.getByRole('dialog', { name: 'Snake' })).toBeTruthy();
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'running' }));
    act(() => key('p'));
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeTruthy();
  });

  it('autosaves a run in progress and restores it paused', () => {
    const { unmount } = render(<SnakeGame />);
    act(() => key(' '));
    act(() => vi.advanceTimersByTime(1200));
    unmount();
    const saved = loadSession('snake', 1);
    expect(saved?.data).toMatchObject({ status: 'running' });

    render(<SnakeGame embedded />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('records the finished run once and clears the save', () => {
    const onGameOver = vi.fn();
    // Head one step from the wall with wrapping off: the next tick ends the run.
    const doomed = createInitialState({
      status: 'running',
      wrapWalls: false,
      score: 12,
      snake: [{ x: 19, y: 3 }, { x: 18, y: 3 }, { x: 17, y: 3 }],
      food: { x: 0, y: 0 },
    });
    saveSession('snake', { schema: 1, data: doomed, seconds: 30, score: 12 });
    render(<SnakeGame onGameOver={onGameOver} />);
    act(() => key('p'));
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByRole('dialog', { name: 'Game over' })).toBeTruthy();
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(12);
    expect(readStats('snake')).toMatchObject({ best: 12, plays: 1 });
    expect(loadSession('snake', 1)).toBeNull();
  });

  it('ignores hotkeys while typing in a field', () => {
    render(
      <>
        <input aria-label="nick" />
        <SnakeGame />
      </>,
    );
    const input = screen.getByLabelText('nick');
    act(() => {
      fireEvent.keyDown(input, { key: ' ' });
    });
    expect(screen.getByRole('dialog', { name: 'Snake' })).toBeTruthy();
  });
});

describe('<SnakeDemo />', () => {
  it('plays by itself without touching stats or saves', () => {
    const { container } = render(<SnakeDemo />);
    act(() => vi.advanceTimersByTime(3000));
    expect(container.querySelector('.arc-demo')).toBeTruthy();
    expect(readStats('snake').plays).toBe(0);
    expect(localStorage.length).toBe(0);
  });
});
