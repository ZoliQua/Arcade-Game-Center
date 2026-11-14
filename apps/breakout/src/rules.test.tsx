import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber } from './arcade';
import { BreakoutGame } from './BreakoutGame';
import { LEVEL_CLEAR_BONUS, POWERUP_POINTS, ROW_POINTS, START_LIVES, MAX_LIVES } from './logic/constants';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  setCoarsePointer(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const openRules = () => fireEvent.click(screen.getByRole('button', { name: /Szabályok/ }));
const headings = () =>
  within(screen.getByRole('dialog', { name: /szabályok/ }))
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent);

describe('Breakout rules dialog', () => {
  it('shows a Rules button; opening mid-run pauses and closing leaves it paused', () => {
    render(<BreakoutGame />);
    expect(screen.getByRole('button', { name: /Szabályok/ })).toBeTruthy();
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    openRules();
    expect(screen.getByRole('dialog', { name: 'Breakout — szabályok' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Bezárás' }));
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy();
  });

  it('lists goal, play, rules, scoring, dental in order; mobile only on touch', () => {
    const { unmount } = render(<BreakoutGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód']);
    unmount();
    setCoarsePointer(true);
    render(<BreakoutGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód', 'Mobilon']);
    const dialog = screen.getByRole('dialog', { name: /szabályok/ });
    expect(dialog.textContent).toContain('Húzd az ujjad');
    expect(dialog.textContent).toContain('Koppints a pályára');
    expect(dialog.textContent).toContain('Teljes képernyő');
  });

  it('prints the scoring sentence with every number', () => {
    render(<BreakoutGame />);
    openRules();
    const text = screen.getByRole('dialog', { name: /szabályok/ }).textContent ?? '';
    const rows = ROW_POINTS.map((n) => formatNumber(n, 'hu')).join(', ');
    expect(text).toContain(
      `Egy tégla értéke a sora szerinti érték (${rows}, fentről lefelé) × a tégla ütésszáma × a szint. ` +
        `Egy kapszula elkapása ${formatNumber(POWERUP_POINTS, 'hu')} × szint, a fal letisztítása ${formatNumber(LEVEL_CLEAR_BONUS, 'hu')} × szint.`,
    );
    expect(text).toContain(`${formatNumber(START_LIVES, 'hu')} élettel indulsz (legfeljebb ${formatNumber(MAX_LIVES, 'hu')} lehet)`);
  });

  it('has a described bounce diagram', () => {
    render(<BreakoutGame />);
    openRules();
    const img = within(screen.getByRole('dialog', { name: /szabályok/ })).getByRole('img', { name: /Ábra/ });
    expect(img.getAttribute('aria-label')).toContain('60°');
  });

  it('keeps the run when the language changes inside the rules', () => {
    render(<BreakoutGame />);
    act(() => key(' '));
    openRules();
    act(() => applyLang('de'));
    expect(screen.getByRole('heading', { level: 2, name: 'Breakout — Regeln' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Ziel' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Schließen' }));
    expect(screen.getByRole('dialog', { name: 'Pausiert' })).toBeTruthy();
    expect(screen.getByText('Leben').parentElement!.textContent).toContain('3');
  });
});
