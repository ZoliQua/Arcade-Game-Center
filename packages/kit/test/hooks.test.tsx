import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatClock } from '../src/format';
import { useArcadeRun, useRunTimer, useSessionAutosave } from '../src/hooks';
import { loadSession, peekSession } from '../src/session';
import { readStats } from '../src/stats';
import { ArcadeShell } from '../src/components/ArcadeShell';
import { GameOverlay, StatPanel } from '../src/components/ArcadeUI';
import type { ArcadeStatus } from '../src/types';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('formatClock', () => {
  it('formats mm:ss and h:mm:ss', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(75)).toBe('01:15');
    expect(formatClock(3725)).toBe('1:02:05');
  });
});

describe('useRunTimer', () => {
  it('counts only while running and resets on a new key', () => {
    const { result, rerender } = renderHook(({ running, key, init }) => useRunTimer(running, key, init), {
      initialProps: { running: true, key: 1, init: 0 },
    });
    act(() => vi.advanceTimersByTime(3100));
    expect(result.current).toBe(3);
    rerender({ running: false, key: 1, init: 0 });
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(3);
    rerender({ running: true, key: 1, init: 0 });
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe(5);
    rerender({ running: true, key: 2, init: 40 });
    expect(result.current).toBe(40);
    act(() => vi.advanceTimersByTime(1100));
    expect(result.current).toBe(41);
  });
});

describe('useArcadeRun', () => {
  it('records exactly one result per run and notifies the host', () => {
    const onGameOver = vi.fn();
    const onRunEnd = vi.fn();
    const onStatusChange = vi.fn();
    const props = { onGameOver, onRunEnd, onStatusChange };
    const { rerender, result } = renderHook(
      ({ status, score, runKey }: { status: ArcadeStatus; score: number; runKey: number }) =>
        useArcadeRun({ gameId: 'snake', status, score, seconds: 9, runKey, props }),
      { initialProps: { status: 'running', score: 10, runKey: 1 } },
    );
    rerender({ status: 'gameOver', score: 10, runKey: 1 });
    rerender({ status: 'gameOver', score: 10, runKey: 1 });
    expect(readStats('snake').plays).toBe(1);
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(10);
    expect(onRunEnd).toHaveBeenCalledWith({ score: 10, seconds: 9, outcome: 'over', ranked: true });
    expect(onStatusChange).toHaveBeenLastCalledWith({ status: 'gameOver', score: 10, seconds: 9 });

    expect(result.current.best).toBe(10);
    expect(result.current.bestBeforeRun).toBe(0);

    rerender({ status: 'running', score: 0, runKey: 2 });
    expect(result.current.bestBeforeRun).toBe(10);
    rerender({ status: 'gameOver', score: 3, runKey: 2 });
    expect(readStats('snake').plays).toBe(2);
    expect(readStats('snake').best).toBe(10);
  });

  it('unranked runs do not call onGameOver', () => {
    const onGameOver = vi.fn();
    renderHook(() =>
      useArcadeRun({ gameId: 'gomoku', status: 'gameOver', score: 500, seconds: 1, runKey: 'r', ranked: false, outcome: () => 'win', props: { onGameOver } }),
    );
    expect(onGameOver).not.toHaveBeenCalled();
    expect(readStats('gomoku').wins).toBe(1);
  });
});

describe('useSessionAutosave', () => {
  it('saves while enabled, flushes on unmount and clears on discard', () => {
    const { rerender, unmount } = renderHook((p: { n: number; enabled: boolean; discard: boolean }) =>
      useSessionAutosave({ gameId: 'snake', schema: 1, enabled: p.enabled, discard: p.discard, data: { n: p.n }, seconds: 3, score: p.n }),
      { initialProps: { n: 1, enabled: true, discard: false } },
    );
    act(() => vi.advanceTimersByTime(1100));
    expect(loadSession('snake', 1)?.data).toEqual({ n: 1 });
    rerender({ n: 2, enabled: true, discard: false });
    unmount();
    expect(loadSession('snake', 1)?.data).toEqual({ n: 2 });

    const second = renderHook((p: { discard: boolean }) =>
      useSessionAutosave({ gameId: 'snake', schema: 1, enabled: false, discard: p.discard, data: {}, seconds: 0, score: 0 }),
      { initialProps: { discard: false } },
    );
    second.rerender({ discard: true });
    expect(peekSession('snake')).toBeNull();
  });
});

describe('components', () => {
  it('render the shared UI', () => {
    const onClick = vi.fn();
    const { getByText, getByRole } = render(
      <ArcadeShell gameId="snake">
        <StatPanel items={[{ label: 'Score', value: 5 }]} status="paused" />
        <GameOverlay title="Paused" actions={[{ label: 'Resume', onClick, primary: true, kbd: 'P' }]} />
      </ArcadeShell>,
    );
    expect(getByText('Zoltan’s Arcade'.replace('’', "'"))).toBeTruthy();
    getByRole('button', { name: /Resume/ }).click();
    expect(onClick).toHaveBeenCalled();
    expect(document.title).toBe("Snake · Zoltan's Arcade");
  });
});
