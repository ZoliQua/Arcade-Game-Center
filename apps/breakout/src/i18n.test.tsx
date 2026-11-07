import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang, formatNumber, LANGS, loadSession, saveSession } from './arcade';
import { BreakoutGame } from './BreakoutGame';
import { MESSAGES } from './i18n';
import { createInitialState } from './logic/game';
import type { GameState } from './logic/types';

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
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

describe('Breakout messages', () => {
  it('has every key in en / hu / de with a non-empty value', () => {
    const keys = Object.keys(MESSAGES.en).sort();
    expect(keys.length).toBeGreaterThan(0);
    for (const lang of LANGS) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual(keys);
      for (const k of keys) {
        const value = (MESSAGES[lang] as Record<string, string>)[k];
        expect(typeof value, `${lang}.${k}`).toBe('string');
        expect(value.trim(), `${lang}.${k}`).not.toBe('');
      }
    }
  });
});

describe('<BreakoutGame /> in other languages', () => {
  it('shows the German start overlay after applyLang("de")', () => {
    applyLang('de');
    render(<BreakoutGame />);
    const dialog = screen.getByRole('dialog', { name: 'Breakout' });
    expect(dialog.textContent).toContain('Halte den Ball im Spiel');
    expect(screen.getAllByRole('button', { name: /Start/ }).length).toBeGreaterThan(0);
    expect(screen.getByText('Breiter Schläger')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Einstellungen' })).toBeTruthy();
  });

  it('translates a saved English banner at render time', () => {
    const data = createInitialState({ status: 'running', level: 2, banner: 'Ball lost', bannerMs: 1500 });
    saveSession('breakout', { schema: 1, data, seconds: 10, score: 0 });
    applyLang('de');
    render(<BreakoutGame />);
    expect(screen.getByRole('dialog', { name: 'Willkommen zurück' }).textContent).toContain('noch 3 Leben');
    expect(screen.getByText('Ball verloren')).toBeTruthy();
    expect(screen.getByText('Pyramide')).toBeTruthy();
  });

  it('switching to Hungarian mid-run keeps score, level, lives and bricks', () => {
    const data = createInitialState({ status: 'running', level: 2, lives: 2, score: 1234 });
    saveSession('breakout', { schema: 1, data, seconds: 42, score: 1234 });
    render(<BreakoutGame />);
    act(() => key('p')); // continue the restored run
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Score')).toBe('1,234');
    const bricks = data.bricks.length;
    expect(screen.getByRole('img', { name: `Breakout playfield, level 2, ${bricks} bricks` })).toBeTruthy();

    act(() => applyLang('hu'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Pont')).toBe(formatNumber(1234, 'hu'));
    expect(stat('Szint')).toBe('2');
    expect(stat('Életek')).toBe('2');
    expect(screen.getByRole('img', { name: `Breakout pálya, 2. szint, ${bricks} tégla` })).toBeTruthy();
    act(() => vi.advanceTimersByTime(1200));
    expect(loadSession<GameState>('breakout', 1)?.data).toMatchObject({ status: 'running', score: 1234, level: 2, lives: 2 });
  });

  it('keeps the English singular for the last life', () => {
    const data = createInitialState({ status: 'running', lives: 1, score: 12345 });
    saveSession('breakout', { schema: 1, data, seconds: 5, score: 12345 });
    render(<BreakoutGame />);
    const text = screen.getByRole('dialog', { name: 'Welcome back' }).textContent;
    expect(text).toContain('score 12,345');
    expect(text).toContain('1 life left');
  });
});
