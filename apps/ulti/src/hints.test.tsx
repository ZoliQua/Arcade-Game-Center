import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber, type Lang } from './arcade';
import { HAND_SIZE, PAIR_POINTS, PARTI_TARGET, TALON_SIZE } from './engine';
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

const n = (v: number, lang: Lang = 'hu') => formatNumber(v, lang);
const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));

describe('Ulti hints use the engine constants', () => {
  it('the discard prompt, button and warning name the real hand and talon sizes', () => {
    save(findSession((x) => humanTurn(x, 'discard') && x.deal.bid === null));
    render(<UltiGame />);
    key('p');
    const panel = screen.getByTestId('ulti-actions');
    expect(screen.getByTestId('ulti-prompt').textContent).toBe(
      `▶ ${n(HAND_SIZE + TALON_SIZE)} lap van nálad: válassz ki ${n(TALON_SIZE)} lapot, azt lerakod talonnak, aztán licitálsz.`,
    );
    const btn = within(panel).getByRole('button', { name: `Lerakom a ${n(TALON_SIZE)} lapot` });
    act(() => void fireEvent.click(btn));
    expect(screen.getByTestId('ulti-notice').textContent).toBe(`⚠ Pontosan ${n(TALON_SIZE)} lapot válassz ki a lerakáshoz.`);
    act(() => applyLang('de'));
    expect(within(panel).getByRole('button', { name: `${n(TALON_SIZE, 'de')} Karten ablegen` })).toBeTruthy();
  });

  it('the Contracts panel prints 20/40 and the 100-point target from the constants', () => {
    expect(PARTI_TARGET).toBe(100);
    render(<UltiGame />);
    const text = document.body.textContent ?? '';
    expect(text).toContain(
      `Passz — az alapjáték: több pontot (ász, tízes, utolsó ütés, ${n(PAIR_POINTS.other)}/${n(PAIR_POINTS.trump)}) kell vinned, mint a két ellenjátékosnak együtt.`,
    );
    expect(text).toContain(`Negyvenszáz — bemondod az adu király + felsőt (${n(PAIR_POINTS.trump)}), és legalább ${n(PARTI_TARGET)} pontot viszel.`);
    expect(text).toContain(
      `Húszszáz — bemondasz egy másik színű király + felsőt (${n(PAIR_POINTS.other)}), és legalább ${n(PARTI_TARGET)} pontot viszel.`,
    );
    act(() => applyLang('en'));
    expect(document.body.textContent).toContain(
      `Negyvenszáz — announce the trump king + over (${n(PAIR_POINTS.trump, 'en')}) and reach ${n(PARTI_TARGET, 'en')} points.`,
    );
  });
});
