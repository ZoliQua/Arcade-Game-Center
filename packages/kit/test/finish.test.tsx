import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useArcadeRun } from '../src/hooks';
import { applyLang } from '../src/i18n';
import { formatNumber } from '../src/format';
import { readStats } from '../src/stats';
import { FinishButton } from '../src/components/Finish';
import type { ArcadeStatus, RunOutcome } from '../src/types';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

type HarnessProps = { status: ArcadeStatus; score: number; runKey: number; outcome: RunOutcome };

function harness(initial: HarnessProps, ranked = true) {
  const onGameOver = vi.fn();
  const onRunEnd = vi.fn();
  const props = { onGameOver, onRunEnd };
  const hook = renderHook(
    (p: HarnessProps) =>
      useArcadeRun({ gameId: 'nutsort', status: p.status, score: p.score, seconds: 4, runKey: p.runKey, outcome: p.outcome, ranked, props }),
    { initialProps: initial },
  );
  return { ...hook, onGameOver, onRunEnd };
}

describe('finish contract in useArcadeRun', () => {
  it('finished outcome reports 0 with info', () => {
    const { rerender, onGameOver, onRunEnd } = harness({ status: 'running', score: 0, runKey: 1, outcome: 'finished' });
    rerender({ status: 'gameOver', score: 0, runKey: 1, outcome: 'finished' });
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0, { finished: true });
    expect(onRunEnd).toHaveBeenCalledWith({ score: 0, seconds: 4, outcome: 'finished', ranked: true });
  });

  it('finished outcome reports a positive score with info', () => {
    const { rerender, onGameOver } = harness({ status: 'running', score: 70, runKey: 1, outcome: 'finished' });
    rerender({ status: 'gameOver', score: 70, runKey: 1, outcome: 'finished' });
    expect(onGameOver).toHaveBeenCalledWith(70, { finished: true });
  });

  it('over outcome with 0 reports nothing', () => {
    const { rerender, onGameOver, onRunEnd } = harness({ status: 'running', score: 0, runKey: 1, outcome: 'over' });
    rerender({ status: 'gameOver', score: 0, runKey: 1, outcome: 'over' });
    expect(onGameOver).not.toHaveBeenCalled();
    expect(onRunEnd).toHaveBeenCalledTimes(1);
  });

  it('over outcome keeps the one-argument call', () => {
    const { rerender, onGameOver } = harness({ status: 'running', score: 5, runKey: 1, outcome: 'over' });
    rerender({ status: 'gameOver', score: 5, runKey: 1, outcome: 'over' });
    expect(onGameOver.mock.calls).toEqual([[5]]);
  });

  it('unranked finished runs report nothing', () => {
    const { rerender, onGameOver } = harness({ status: 'running', score: 0, runKey: 1, outcome: 'finished' }, false);
    rerender({ status: 'gameOver', score: 0, runKey: 1, outcome: 'finished' });
    expect(onGameOver).not.toHaveBeenCalled();
  });

  it('finish is recorded once', () => {
    const { rerender, onGameOver } = harness({ status: 'paused', score: 12, runKey: 7, outcome: 'finished' });
    rerender({ status: 'gameOver', score: 12, runKey: 7, outcome: 'finished' });
    rerender({ status: 'gameOver', score: 12, runKey: 7, outcome: 'finished' });
    rerender({ status: 'paused', score: 12, runKey: 7, outcome: 'finished' });
    rerender({ status: 'gameOver', score: 12, runKey: 7, outcome: 'finished' });
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(readStats('nutsort').plays).toBe(1);
  });

  it('a finished run counts as a play, not a win', () => {
    const { rerender } = harness({ status: 'running', score: 30, runKey: 1, outcome: 'finished' });
    rerender({ status: 'gameOver', score: 30, runKey: 1, outcome: 'finished' });
    const stats = readStats('nutsort');
    expect(stats.plays).toBe(1);
    expect(stats.wins).toBe(0);
    expect(stats.best).toBe(30);
  });
});

describe('FinishButton', () => {
  beforeEach(() => act(() => applyLang('hu')));

  it('renders nothing when not visible', () => {
    const { container, queryByRole } = render(<FinishButton score={5} visible={false} onFinish={() => {}} />);
    expect(container.innerHTML).toBe('');
    expect(queryByRole('button')).toBeNull();
  });

  it('opens an in-page confirm with the formatted score; Mégse cancels', () => {
    const onFinish = vi.fn();
    const onOpenChange = vi.fn();
    const { getByRole, queryByRole } = render(
      <FinishButton score={1234} visible onFinish={onFinish} onOpenChange={onOpenChange} />,
    );
    const trigger = getByRole('button', { name: 'Befejezés' });
    fireEvent.click(trigger);
    const dialog = getByRole('alertdialog');
    expect(dialog.textContent).toContain(formatNumber(1234, 'hu'));
    expect(dialog.textContent).toContain('Befejezed a játékot?');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(getByRole('button', { name: 'Mégse' }));
    expect(queryByRole('alertdialog')).toBeNull();
    expect(onFinish).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('Befejezem calls onFinish exactly once', () => {
    const onFinish = vi.fn();
    const { getByRole, queryByRole } = render(<FinishButton score={0} visible onFinish={onFinish} />);
    fireEvent.click(getByRole('button', { name: 'Befejezés' }));
    const yes = getByRole('button', { name: 'Befejezem' });
    fireEvent.click(yes);
    fireEvent.click(yes);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(queryByRole('alertdialog')).toBeNull();
  });

  it('Escape cancels without reaching game hotkeys', () => {
    const onFinish = vi.fn();
    const gameKey = vi.fn();
    window.addEventListener('keydown', gameKey);
    const { getByRole, queryByRole } = render(<FinishButton score={3} visible onFinish={onFinish} />);
    fireEvent.click(getByRole('button', { name: 'Befejezés' }));
    expect(document.activeElement).toBe(getByRole('button', { name: 'Mégse' }));
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    window.removeEventListener('keydown', gameKey);
    expect(queryByRole('alertdialog')).toBeNull();
    expect(gameKey).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
  });
});
