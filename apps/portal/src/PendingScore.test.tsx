import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber, type ArcadeGameProps } from '@arcade/kit';

const submitScore = vi.fn(async () => ({ ok: true as const, rank: 1, id: 1 }));
vi.mock('./services/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./services/api')>()),
  submitScore: (...args: unknown[]) => submitScore(...(args as [])),
}));

// A stand-in game: one button ends a ranked run with 1234 points, one finishes a run early on 0 points,
// one reaches a natural game over on 0 points (the kit never reports that, but the portal must not rank it either).
function FakeGame({ onGameOver }: ArcadeGameProps) {
  return (
    <>
      <button type="button" onClick={() => onGameOver?.(1234)}>
        end run
      </button>
      <button type="button" onClick={() => onGameOver?.(0, { finished: true })}>
        finish at zero
      </button>
      <button type="button" onClick={() => onGameOver?.(0)}>
        game over at zero
      </button>
    </>
  );
}
vi.mock('./games', () => ({
  GAME_MODULES: new Proxy({}, { get: () => ({ Game: FakeGame, Demo: () => null }) }),
}));

const { default: App } = await import('./App');

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  localStorage.clear();
  applyLang('en', { silent: true });
  applyDental(false, { silent: true });
  // The start-up prompt was dismissed earlier: the player chose to play without a name.
  localStorage.setItem('arcade.nickPromptDismissed', '1');
  window.location.hash = '#/play/2048';
  submitScore.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.location.hash = '';
});

describe('a ranked run that ends without a nickname', () => {
  it('offers a nickname and then submits the finished score', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'end run' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog.textContent).toContain(formatNumber(1234, 'en'));
    expect(submitScore).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Zoli' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(submitScore).toHaveBeenCalledWith('2048', 'Zoli', 1234);
    expect(localStorage.getItem('arcade.nickname')).toBe('Zoli');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('sends nothing when the player skips, and asks again after the next run', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'end run' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Not now' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(submitScore).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'end run' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
  });

  it('submits straight away when a nickname is set', async () => {
    localStorage.setItem('arcade.nickname', 'Zoli');
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'end run' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(submitScore).toHaveBeenCalledWith('2048', 'Zoli', 1234);
  });
});

describe('a run the player finished early', () => {
  it('a finished 0-point run is submitted', async () => {
    localStorage.setItem('arcade.nickname', 'Zoli');
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'finish at zero' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(submitScore).toHaveBeenCalledTimes(1);
    expect(submitScore).toHaveBeenCalledWith('2048', 'Zoli', 0);
  });

  it('a finished 0-point run asks for a nickname once', async () => {
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'finish at zero' }));
    });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog').textContent).toContain(formatNumber(0, 'en'));
    expect(submitScore).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Zoli' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(submitScore).toHaveBeenCalledTimes(1);
    expect(submitScore).toHaveBeenCalledWith('2048', 'Zoli', 0);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('a natural 0-point game over is not submitted', async () => {
    localStorage.setItem('arcade.nickname', 'Zoli');
    render(<App />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'game over at zero' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(submitScore).not.toHaveBeenCalled();

    localStorage.removeItem('arcade.nickname');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'game over at zero' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
