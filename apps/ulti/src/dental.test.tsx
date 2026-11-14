import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findSession, humanTurn, save } from './test/fixtures';
import { applyDental, isUltiSessionLoad } from './test/i18nHelpers';
import { UltiGame } from './UltiGame';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  applyDental(false, { silent: true });
  vi.useRealTimers();
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const table = () => screen.getByTestId('ulti-table');
const stat = (label: string) => screen.getByText(label).parentElement?.textContent?.replace(label, '');
const faces = () => [...document.querySelectorAll('[data-hand-card] [data-card]')].map((el) => el.getAttribute('data-card')).join(' ');

function resumeMidDeal() {
  const s = findSession((x) => humanTurn(x, 'play') && x.deal.tricks.length >= 1);
  save(s, 30);
  render(<UltiGame />);
  key('p');
  return s;
}

describe('dental mode', () => {
  it('dresses the three seat figures as dentist, hygienist and assistant and puts a tooth on the card backs', () => {
    applyDental(true);
    resumeMidDeal();
    expect(table().getAttribute('data-dental')).toBe('true');
    const figs = screen.getAllByTestId('ulti-figure-dental');
    expect(figs.map((f) => f.getAttribute('data-figure'))).toEqual(['teri', 'bandi', 'player']);
    expect(figs[1].querySelector('[data-tool="probe"]')).not.toBeNull();
    expect(figs[2].querySelector('[data-tool="head-mirror"]')).not.toBeNull();
    expect(figs[0].querySelector('[data-outfit="cap"]')).not.toBeNull();
    expect(screen.queryByTestId('ulti-figure-classic')).toBeNull();
    expect(screen.getAllByTestId('hcard-back-tooth').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('hcard-back-classic')).toBeNull();
  });

  it('with dental mode off the classic figures and backs are drawn', () => {
    resumeMidDeal();
    expect(table().getAttribute('data-dental')).toBe('false');
    expect(screen.getAllByTestId('ulti-figure-classic')).toHaveLength(3);
    expect(screen.queryByTestId('ulti-figure-dental')).toBeNull();
    expect(screen.queryByTestId('hcard-back-tooth')).toBeNull();
    expect(screen.getAllByTestId('hcard-back-classic').length).toBeGreaterThan(0);
  });

  it('toggling dental mode mid-deal keeps the deal, the faces and the clock', () => {
    const s = resumeMidDeal();
    const before = faces();
    expect(stat('Time')).toBe('00:30');
    act(() => void fireEvent.click(screen.getByRole('checkbox', { name: /Dental mode/ })));
    expect(table().getAttribute('data-dental')).toBe('true');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(faces()).toBe(before);
    expect(stat('Time')).toBe('00:30');
    expect(screen.getAllByTestId('ulti-figure-dental')).toHaveLength(3);
    expect(localStorage.getItem('arcade.dental')).toBe('1');
    expect(isUltiSessionLoad()?.deal.log.length).toBe(s.deal.log.length);
  });
});
