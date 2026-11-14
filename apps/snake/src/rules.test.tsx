import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber } from './arcade';
import { DEFAULT_SPEED, GRID_SIZE, MAX_SPEED, MIN_SPEED } from './logic/constants';
import { SnakeGame } from './SnakeGame';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const openRules = () => fireEvent.click(screen.getByRole('button', { name: /Szabályok/ }));
const headings = () => within(screen.getByRole('dialog', { name: /szabályok/ })).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('Snake rules dialog', () => {
  it('shows a Rules button; opening mid-run pauses and closing leaves it paused', () => {
    render(<SnakeGame />);
    expect(screen.getByRole('button', { name: /Szabályok/ })).toBeTruthy();
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    openRules();
    expect(screen.getByRole('dialog', { name: 'Snake — szabályok' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Bezárás' }));
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy();
  });

  it('lists goal, play, rules, scoring, dental in order; mobile only on touch', () => {
    const { unmount } = render(<SnakeGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód']);
    unmount();
    setCoarsePointer(true);
    render(<SnakeGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód', 'Mobilon']);
    const dialog = screen.getByRole('dialog', { name: /szabályok/ });
    expect(dialog.textContent).toContain('Húzd az ujjad');
    expect(dialog.textContent).toContain('Teljes képernyő');
  });

  it('prints every scoring number', () => {
    render(<SnakeGame />);
    openRules();
    const text = screen.getByRole('dialog', { name: /szabályok/ }).textContent ?? '';
    for (const n of [MIN_SPEED, MAX_SPEED, DEFAULT_SPEED, GRID_SIZE]) expect(text).toContain(formatNumber(n, 'hu'));
  });

  it('has a described diagram', () => {
    render(<SnakeGame />);
    openRules();
    expect(within(screen.getByRole('dialog', { name: /szabályok/ })).getByRole("img", { name: /Ábra/ })).toBeTruthy();
  });

  it('keeps the run when the language changes inside the rules', () => {
    render(<SnakeGame />);
    act(() => key(' '));
    openRules();
    act(() => applyLang('de'));
    expect(screen.getByRole('heading', { level: 2, name: 'Snake — Regeln' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Ziel' })).toBeTruthy();
    expect(screen.getByRole('dialog', { name: 'Snake — Regeln' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Schließen' }));
    expect(screen.getByRole('dialog', { name: 'Pausiert' })).toBeTruthy();
    expect(screen.getByText('Länge').parentElement!.textContent).toContain('3');
  });
});
