import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang, isUltiSessionLoad, LANGS } from './test/i18nHelpers';
import { MESSAGES, type MessageKey } from './i18n';
import { findSession, humanTurn, save } from './test/fixtures';
import { UltiGame } from './UltiGame';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  act(() => applyLang('en'));
  vi.useRealTimers();
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const click = (el: Element) => act(() => void fireEvent.click(el));
const stat = (label: string) => screen.getByText(label).parentElement?.textContent?.replace(label, '');

/** Keys whose text may equal English: Hungarian game terms, names and pure templates. */
const SAME_OK: Record<'hu' | 'de', MessageKey[]> = {
  hu: ['kontraBtn', 'talon', 'statDealValue', 'colDeal', 'logKontra', 'logTrickOpen', 'unitsLine', 'suitPiros', 'suitTok', 'suitZold', 'suitMakk', 'rulesTablePiros'],
  de: ['kontraBtn', 'talon', 'statDealValue', 'colDeal', 'logKontra', 'logTrickOpen', 'unitsLine', 'speedNormal', 'rulesTablePiros', 'rulesDiagramColourless'],
};

describe('Ulti i18n', () => {
  it('has every key in en, hu and de with a non-empty value', () => {
    const keys = Object.keys(MESSAGES.en).sort();
    expect(keys.length).toBeGreaterThan(100);
    for (const lang of LANGS) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual(keys);
      for (const k of keys) expect((MESSAGES[lang] as Record<string, string>)[k].trim()).not.toBe('');
    }
  });

  it('is really translated (only game terms and templates may match English)', () => {
    for (const lang of ['hu', 'de'] as const) {
      const same = (Object.keys(MESSAGES.en) as MessageKey[]).filter((k) => MESSAGES[lang][k] === MESSAGES.en[k]);
      expect(same.filter((k) => !SAME_OK[lang].includes(k))).toEqual([]);
    }
  });

  it('keeps the Hungarian contract terms in every language, with an explanation', () => {
    expect(MESSAGES.en.infoUlti).toBe('Ulti — win the last trick with the trump VII.');
    for (const lang of LANGS) {
      for (const [k, term] of [
        ['infoPassz', 'Passz'], ['infoNegyvenszaz', 'Negyvenszáz'], ['infoUlti', 'Ulti'], ['infoBetli', 'Betli'], ['infoDurchmars', 'Durchmars'],
        ['infoHuszszaz', 'Húszszáz'], ['infoSzintelenDurchmars', 'Színtelen durchmars'], ['infoPiros', 'Piros'], ['infoKontra', 'Kontra'],
      ] as [MessageKey, string][]) {
        expect(MESSAGES[lang][k].startsWith(`${term} — `)).toBe(true);
      }
      expect(MESSAGES[lang].kontraBtn).toBe('Kontra');
    }
    expect(MESSAGES.hu.pickUp).toBe('Felveszem a talont');
  });

  it('uses natural Hungarian and German wording for the log, the pass button and deal titles', () => {
    expect(MESSAGES.hu.logAnnounce).toBe('{name} bemondja: {points} ({suit})');
    expect(MESSAGES.de.takes).toBe('{name} macht den Stich');
    expect(MESSAGES.de.logTrick).toBe('{n}. {cards} — {name} macht den Stich');
    expect(MESSAGES.de.passBtn).toBe('Passen');
    for (const v of Object.values(MESSAGES.hu)) expect(v).not.toMatch(/a\(z\)/i);
    expect(MESSAGES.hu.dealOverTitle).toMatch(/^\{n\}\. osztás/);
    expect(MESSAGES.hu.welcomeBody).toMatch(/^\{deal\}\. osztás/);
  });

  it('renders the German UI after applyLang("de")', () => {
    applyLang('de');
    render(<UltiGame />);
    expect(screen.getByRole('dialog', { name: 'Ulti' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Karten geben/ })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Gegner' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Einstellungen' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Ansagen' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /Zahnmodus/ })).toBeTruthy();
  });

  it('offers Hungarian bid names in hu, with the explanation as a tooltip', () => {
    applyLang('hu');
    const s = findSession((x) => humanTurn(x, 'declare'));
    save(s);
    render(<UltiGame />);
    key('p');
    const buttons = [...screen.getByTestId('ulti-bid-panel').querySelectorAll('[data-bid]')];
    expect(buttons.length).toBeGreaterThan(0);
    const passz = buttons.find((b) => b.getAttribute('data-bid')?.startsWith('passz:'));
    if (passz) {
      expect(passz.getAttribute('aria-label')).toMatch(/^(Piros|Tök|Zöld|Makk) passz/);
      expect(passz.getAttribute('title')).toContain('Passz — az alapjáték');
    }
    expect(screen.getByTestId('ulti-bid-panel').textContent).toMatch(/Passz|Negyvenszáz|Ulti|Betli|Durchmars|Húszszáz|Színtelen durchmars/);
  });

  it('switching to Hungarian mid-deal keeps the table, the deal and the clock', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.deal.tricks.length >= 2 && x.history.length >= 1);
    save(s, 42);
    render(<UltiGame />);
    key('p');
    const hand = () => [...document.querySelectorAll('[data-hand-card]')].map((b) => b.getAttribute('data-hand-card')).join(' ');
    click(document.querySelector('[data-playable="true"]')!);
    const handBefore = hand();
    const logBefore = screen.getByTestId('ulti-log').children.length;
    expect(stat('Deal')).toBe(`${s.dealNo} / 10`);

    act(() => applyLang('hu'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(hand()).toBe(handBefore);
    expect(stat('Osztás')).toBe(`${s.dealNo} / 10`);
    expect(stat('Idő')).toBe('00:42');
    expect(screen.getByTestId('ulti-log').children.length).toBe(logBefore);
    expect(screen.getByTestId('ulti-log').textContent).toMatch(/viszi|viszed/);
    expect(screen.getByRole('heading', { level: 2, name: /^Napló/ })).toBeTruthy();
    expect(isUltiSessionLoad()?.deal.log.length).toBe(s.deal.log.length + 1);
  });

  it('formats the balance with the language grouping and a real minus sign', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.scores[0] !== 0);
    save(s);
    applyLang('de');
    render(<UltiGame />);
    key('p');
    const u = s.scores[0];
    expect(stat('Stand')).toBe(u > 0 ? `+${u}` : `−${-u}`);
  });
});
