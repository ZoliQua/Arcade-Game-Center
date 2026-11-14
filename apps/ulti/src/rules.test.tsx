import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatNumber, type Lang } from './arcade';
import {
  ALL_BIDS,
  BID_SHAPES,
  bidValue,
  cardPoints,
  COLOURLESS_ORDER,
  FAILED_ULTI_FACTOR,
  HAND_SIZE,
  KONTRA_FACTOR,
  kindValue,
  LAST_TRICK_POINTS,
  makeBid,
  PAIR_POINTS,
  scoreDeal,
  TALON_SIZE,
  TRUMP_ORDER,
} from './engine';
import { arcadeScore, DIFFICULTY_FACTOR, MAX_SCORE, POINTS_PER_UNIT } from './game/scoring';
import { DEALS_PER_SESSION, MIN_FINISH_DEALS } from './game/session';
import { findSession, humanTurn, save } from './test/fixtures';
import { isUltiSessionLoad } from './test/i18nHelpers';
import { setCoarsePointer } from './test/touchEnv';
import { KIND_NAME, RANK_NAME } from './ui/labels';
import { UltiGame } from './UltiGame';

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
  applyDental(false, { silent: true });
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const click = (el: Element) => act(() => void fireEvent.click(el));
const openRules = () => click(screen.getByRole('button', { name: /Szabályok/ }));
const dialog = () => screen.getByRole('dialog', { name: /szabályok|Regeln|rules/ });
const headings = () => within(dialog()).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
const n = (v: number, lang: Lang) => formatNumber(v, lang);

describe('Ulti rules dialog', () => {
  it('shows a Rules button; opening it mid-session pauses, closing leaves the game paused', () => {
    const onStatusChange = vi.fn();
    render(<UltiGame onStatusChange={onStatusChange} />);
    expect(screen.getByRole('button', { name: /Szabályok/ })).toBeTruthy();
    click(screen.getByRole('button', { name: /Osztás/ }));
    expect(onStatusChange.mock.calls.at(-1)?.[0].status).toBe('running');
    openRules();
    expect(screen.getByRole('dialog', { name: 'Ulti — szabályok' })).toBeTruthy();
    expect(onStatusChange.mock.calls.at(-1)?.[0].status).toBe('paused');
    click(screen.getByRole('button', { name: 'Bezárás' }));
    expect(screen.queryByRole('dialog', { name: 'Ulti — szabályok' })).toBeNull();
    expect(onStatusChange.mock.calls.at(-1)?.[0].status).toBe('paused');
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy();
  });

  it('R opens the rules (Ulti does not use R otherwise)', () => {
    render(<UltiGame />);
    key('r');
    expect(screen.getByRole('dialog', { name: 'Ulti — szabályok' })).toBeTruthy();
  });

  it('lists goal, play, rules, scoring, dental in order; mobile only with a coarse pointer, with the touch rows', () => {
    const { unmount } = render(<UltiGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód']);
    expect(dialog().textContent).toContain('Kattints egy lapra');
    unmount();
    setCoarsePointer(true);
    render(<UltiGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód', 'Mobilon']);
    const text = dialog().textContent ?? '';
    expect(text).toContain('Koppints egy lapra: kiemelkedik; koppints rá újra: kijátszod.');
    expect(text).toContain('alsó sávban');
    expect(text).toContain('Teljes képernyő');
    expect(text).not.toContain('Kattints egy lapra');
  });

  it('prints the deal and card-point numbers from the engine constants', () => {
    render(<UltiGame />);
    openRules();
    const text = dialog().textContent ?? '';
    expect(text).toContain(
      `Mindenki ${n(HAND_SIZE, 'hu')} lapot kap, ${n(TALON_SIZE, 'hu')} lap a talonba kerül. Az előkéz felveszi a talont, így ${n(HAND_SIZE + TALON_SIZE, 'hu')} lap van nála; ebből ${n(TALON_SIZE, 'hu')} lapot lerak, és licitálnia kell.`,
    );
    const ten = cardPoints({ suit: 'makk', rank: 'asz' });
    expect(cardPoints({ suit: 'makk', rank: 'X' })).toBe(ten);
    expect(text).toContain(
      `Pontok: minden ász és tízes ${n(ten, 'hu')}, az utolsó ütés ${n(LAST_TRICK_POINTS, 'hu')}; a bemondott pár ${n(PAIR_POINTS.other, 'hu')} (másik szín király + felső) vagy ${n(PAIR_POINTS.trump, 'hu')} (adu király + felső).`,
    );
    expect(text).toContain(`${n(DEALS_PER_SESSION, 'hu')} osztást játszol Bandi és Teri ellen`);
  });

  it('prints the scoring formula, multipliers, example and cap as full sentences (hu and de)', () => {
    const piros = makeBid(['ulti'], 'piros');
    const value = kindValue(piros, 'ulti');
    const units = scoreDeal({ declarer: 0, bid: piros, kontra: false, contracts: [{ kind: 'ulti', won: true, value }], parti: null, tricksWon: [10, 0, 0] });
    expect(units).toEqual([2 * value, -value, -value]);
    const ex = arcadeScore(10, 'hard');
    expect(ex).toBe(1000);
    render(<UltiGame />);
    openRules();
    let text = dialog().textContent ?? '';
    expect(text).toContain(
      `Minden osztás nullaösszegű: a felvevő mindkét ellenjátékostól megkapja az értéket, vagy mindkettőnek kifizeti. Kontrával ×${n(KONTRA_FACTOR, 'hu')} az érték, a bukott ulti pedig ×${n(FAILED_ULTI_FACTOR, 'hu')} értéket fizet.`,
    );
    expect(text).toContain(
      `Példa: a teljesített Piros ulti ellenfelenként ${n(value, 'hu')} egységet ér, így a felvevő +${n(units[0], 'hu')}, mindkét ellenjátékos −${n(-units[1], 'hu')} egységet kap.`,
    );
    expect(text).toContain(
      `A pontszámod ${n(DEALS_PER_SESSION, 'hu')} osztás után: nettó egységeid × ${n(POINTS_PER_UNIT, 'hu')} × a nehézségi szorzó (Könnyű ×${n(DIFFICULTY_FACTOR.easy, 'hu')}, Közepes ×${n(DIFFICULTY_FACTOR.medium, 'hu')}, Nehéz ×${n(DIFFICULTY_FACTOR.hard, 'hu')}), legalább ${n(0, 'hu')}, legfeljebb ${n(MAX_SCORE, 'hu')} pont.`,
    );
    expect(text).toContain('Közepes ×1,5');
    expect(text).toContain(`Például Nehéz szinten +${n(10, 'hu')} egység ${n(ex, 'hu')} pontot ér.`);
    expect(text).toContain(
      `A Befejezés két osztás között lezárja a játszmát. Ha már legalább ${n(MIN_FINISH_DEALS, 'hu')} osztást lejátszottál a ${n(DEALS_PER_SESSION, 'hu')}-ből, az eddigi pontszámod kerül a ranglistára, előtte ${n(0, 'hu')} pont.`,
    );

    act(() => applyLang('de'));
    text = dialog().textContent ?? '';
    expect(text).toContain(
      `Deine Punktzahl nach ${n(DEALS_PER_SESSION, 'de')} Runden: deine Netto-Einheiten × ${n(POINTS_PER_UNIT, 'de')} × der Schwierigkeitsfaktor (Leicht ×${n(DIFFICULTY_FACTOR.easy, 'de')}, Mittel ×${n(DIFFICULTY_FACTOR.medium, 'de')}, Schwer ×${n(DIFFICULTY_FACTOR.hard, 'de')}), mindestens ${n(0, 'de')} und höchstens ${n(MAX_SCORE, 'de')} Punkte.`,
    );
    expect(text).toContain(
      `„Beenden” gibt es zwischen den Runden und schließt die Partie vorzeitig ab. Nach mindestens ${n(MIN_FINISH_DEALS, 'de')} der ${n(DEALS_PER_SESSION, 'de')} Runden kommt deine bisherige Punktzahl in die Bestenliste, davor ${n(0, 'de')} Punkte.`,
    );
    expect(text).toContain(`Zum Beispiel bringen +${n(10, 'de')} Einheiten auf der Stufe Schwer ${n(ex, 'de')} Punkte.`);
  });

  it('the bid value table lists every contract shape of the bid list with its value and piros value', () => {
    render(<UltiGame />);
    openRules();
    const table = within(dialog()).getByTestId('ulti-rules-bids');
    const rows = [...table.querySelectorAll('tbody tr')];
    expect(rows).toHaveLength(BID_SHAPES.length);
    BID_SHAPES.forEach((shape, i) => {
      const bids = ALL_BIDS.filter((b) => b.kinds.length === shape.length && b.kinds.every((k) => shape.includes(k)));
      const plain = bids.find((b) => b.trump !== 'piros')!;
      const red = bids.find((b) => b.trump === 'piros');
      const cells = [...rows[i].querySelectorAll('th, td')].map((c) => c.textContent);
      expect(cells).toEqual([shape.map((k) => KIND_NAME[k]).join(' + '), n(bidValue(plain), 'hu'), red ? n(bidValue(red), 'hu') : '—']);
    });
    // The top row: Színtelen durchmars, 12, no piros.
    expect(rows.at(-1)?.textContent).toBe(`Színtelen durchmars${n(12, 'hu')}—`);
  });

  it('has a described card-order diagram built from the engine orders; it follows dental mode', () => {
    render(<UltiGame />);
    openRules();
    const img = within(dialog()).getByRole('img', { name: /A lapok sorrendje/ });
    const names = (order: readonly (keyof (typeof RANK_NAME)['hu'])[]) => order.map((r) => RANK_NAME.hu[r]).join(', ');
    expect(img.getAttribute('aria-label')).toBe(
      `A lapok sorrendje a legkisebbtől a legnagyobbig. Adus játékok: ${names(TRUMP_ORDER)}. Betli és színtelen durchmars: ${names(COLOURLESS_ORDER)}.`,
    );
    expect(img.getAttribute('data-dental')).toBe('false');
    act(() => applyDental(true));
    expect(within(dialog()).getByRole('img', { name: /A lapok sorrendje/ }).getAttribute('data-dental')).toBe('true');
  });

  it('keeps the session when the language changes inside the rules', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.deal.tricks.length >= 1);
    save(s, 40);
    render(<UltiGame />);
    key('p');
    const cards = document.querySelectorAll('[data-hand-card]').length;
    openRules();
    act(() => applyLang('de'));
    expect(screen.getByRole('heading', { level: 2, name: 'Ulti — Regeln' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Ziel' })).toBeTruthy();
    click(screen.getByRole('button', { name: 'Schließen' }));
    expect(screen.getByRole('dialog', { name: 'Pausiert' })).toBeTruthy();
    expect(document.querySelectorAll('[data-hand-card]')).toHaveLength(cards);
    const after = isUltiSessionLoad();
    expect(after?.dealNo).toBe(s.dealNo);
    expect(after?.deal.log.length).toBe(s.deal.log.length);
    expect(after?.scores).toEqual(s.scores);
  });
});
