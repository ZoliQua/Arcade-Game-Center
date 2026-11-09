import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber, type ArcadeGameProps } from '@arcade/kit';

const submitScore = vi.fn(async () => ({ ok: true as const, rank: 1, id: 1 }));
vi.mock('./services/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./services/api')>()),
  submitScore: (...args: unknown[]) => submitScore(...(args as [])),
}));

// A stand-in game: one button ends a ranked run with 1234 points.
function FakeGame({ onGameOver }: ArcadeGameProps) {
  return (
    <button type="button" onClick={() => onGameOver?.(1234)}>
      end run
    </button>
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

    const dialog = screen.getByRole('dialog');
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

  it('sends nothing when the player skips, and asks again after the next run', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'end run' }));
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(submitScore).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'end run' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('submits straight away when a nickname is set', () => {
    localStorage.setItem('arcade.nickname', 'Zoli');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'end run' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(submitScore).toHaveBeenCalledWith('2048', 'Zoli', 1234);
  });
});
