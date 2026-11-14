import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber, loadSession } from './arcade';
import { DEALS_PER_SESSION, finishEarly, MIN_FINISH_DEALS, rankedScore, SESSION_SCHEMA, sessionScore, type UltiSession } from './game/session';
import { findSession, humanTurn, save } from './test/fixtures';
import { UltiGame } from './UltiGame';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  applyLang('en', { silent: true });
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const click = (el: Element) => act(() => void fireEvent.click(el));
const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const finishBtn = () => screen.queryByRole('button', { name: 'Befejezés' });
const stat = (label: string) => screen.getByText(label, { selector: 'dt' }).parentElement?.querySelector('dd')?.textContent;
const note = () => screen.queryByTestId('ulti-finish-note')?.textContent ?? '';
const n = (v: number) => formatNumber(v, 'hu');

/** Between two deals (the result card is showing), with points on the board. */
const between = (pred: (s: UltiSession) => boolean) => findSession((x) => x.phase === 'dealOver' && x.scores[0] > 0 && pred(x));

function resume(s: UltiSession, props: Parameters<typeof UltiGame>[0] = {}) {
  save(s, 90);
  render(<UltiGame {...props} />);
  key('p');
}

describe('Ulti finish early', () => {
  it('needs at least half of the deals: the minimum is a named constant', () => {
    expect(MIN_FINISH_DEALS).toBe(Math.ceil(DEALS_PER_SESSION / 2));
  });

  it('is hidden before the session and during a deal, with a note why', () => {
    render(<UltiGame />);
    expect(finishBtn()).toBeNull();
    click(screen.getByRole('button', { name: /Osztás/ }));
    expect(finishBtn()).toBeNull();
    expect(note()).toBe('Befejezni két osztás között lehet.');
  });

  it('mid-deal it is not offered even when the player is losing the contract, and the engine refuses it', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.deal.tricks.length >= 3);
    resume(s);
    expect(finishBtn()).toBeNull();
    expect(finishEarly(s)).toBe(s);
  });

  it(`below ${MIN_FINISH_DEALS} played deals it ranks 0, and the note and confirm say so`, () => {
    const s = between((x) => x.history.length < MIN_FINISH_DEALS);
    expect(sessionScore(s)).toBeGreaterThan(0);
    expect(rankedScore(finishEarly(s))).toBe(0);
    const onGameOver = vi.fn();
    resume(s, { onGameOver });
    expect(note()).toBe(`${n(MIN_FINISH_DEALS)} lejátszott osztás előtt a Befejezés ${n(0)} pontot ér.`);
    click(finishBtn()!);
    expect(screen.getByRole('alertdialog').textContent).toContain(`Befejezed a játékot? ${n(0)} pont kerül a ranglistára.`);
    click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0, { finished: true });
    expect(screen.getByRole('dialog', { name: 'Idő előtt befejezve' })).toBeTruthy();
    expect(loadSession('ulti', SESSION_SCHEMA)).toBeNull();
  });

  it(`at ${MIN_FINISH_DEALS} played deals it ranks the session score shown in the Score panel, once`, () => {
    const s = between((x) => x.history.length === MIN_FINISH_DEALS);
    const score = sessionScore(s);
    expect(score).toBeGreaterThan(0);
    expect(rankedScore(finishEarly(s))).toBe(score);
    const onGameOver = vi.fn();
    resume(s, { onGameOver });
    expect(stat('Pont')).toBe(n(score));
    expect(note()).toBe('');
    click(finishBtn()!);
    expect(screen.getByRole('alertdialog').textContent).toContain(`Befejezed a játékot? ${n(score)} pont kerül a ranglistára.`);
    click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(score, { finished: true });
    const card = screen.getByRole('dialog', { name: 'Idő előtt befejezve' });
    expect(card.textContent).toContain(`${n(score)} pontot szereztél.`);
    expect(card.textContent).toContain(`${n(s.history.length)} osztás`);
    expect(loadSession('ulti', SESSION_SCHEMA)).toBeNull();
    act(() => void window.dispatchEvent(new Event('pagehide')));
    tick(5000);
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(loadSession('ulti', SESSION_SCHEMA)).toBeNull();
    expect(finishBtn()).toBeNull();
  });

  it('Cancel changes nothing', () => {
    const s = between((x) => x.history.length >= 1);
    const onGameOver = vi.fn();
    resume(s, { onGameOver });
    click(finishBtn()!);
    click(screen.getByRole('button', { name: 'Mégse' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onGameOver).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: `${s.dealNo}. osztás vége` })).toBeTruthy();
    expect(stat('Pont')).toBe(n(sessionScore(s)));
  });

  it('the clock stands still while the confirm is open', () => {
    const s = between((x) => x.history.length >= 1);
    resume(s);
    click(finishBtn()!);
    const time = stat('Idő');
    tick(10_000);
    expect(stat('Idő')).toBe(time);
  });
});
