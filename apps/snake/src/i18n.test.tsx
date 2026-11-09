import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang, LANGS, saveSession } from './arcade';
import { MESSAGES } from './i18n';
import { createInitialState } from './logic/game';
import { SnakeGame } from './SnakeGame';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  act(() => applyLang('en'));
  vi.useRealTimers();
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });

describe('Snake translations', () => {
  it('has every key in every language with a non-empty value', () => {
    const keys = Object.keys(MESSAGES.en);
    expect(keys.length).toBeGreaterThan(0);
    for (const lang of LANGS) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual([...keys].sort());
      for (const k of keys) expect(MESSAGES[lang][k as keyof typeof MESSAGES.en].trim()).not.toBe('');
    }
  });

  it('shows the German start overlay', () => {
    applyLang('de');
    render(<SnakeGame />);
    const dialog = screen.getByRole('dialog', { name: 'Snake' });
    expect(dialog.textContent).toContain('Friss die roten Punkte');
    expect(within(dialog).getByRole('button', { name: /Start/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Einstellungen' })).toBeTruthy();
    expect(screen.getByText('Wände durchlässig')).toBeTruthy();
  });

  it('switching language mid-run keeps the score and the board', () => {
    const running = createInitialState({
      status: 'running',
      score: 12,
      snake: [{ x: 10, y: 3 }, { x: 9, y: 3 }, { x: 8, y: 3 }],
      food: { x: 0, y: 0 },
    });
    saveSession('snake', { schema: 1, data: running, seconds: 30, score: 12 });
    const { container } = render(<SnakeGame />);
    act(() => key('p'));
    expect(screen.queryByRole('dialog')).toBeNull();
    const grid = () => container.querySelector('[role="grid"]')!;
    const stat = (i: number) => container.querySelectorAll('.arc-stat dd')[i].textContent;
    const board = grid().innerHTML;
    expect(stat(0)).toBe('12');
    expect(stat(2)).toBe('3');

    act(() => applyLang('hu'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(container.querySelector('.arc-stat dt')!.textContent).toBe('Pont');
    expect(stat(0)).toBe('12');
    expect(stat(2)).toBe('3');
    expect(grid().innerHTML).toBe(board);
    expect(grid().getAttribute('aria-label')).toBe('Snake-játéktér');
  });
});
