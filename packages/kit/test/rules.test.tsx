import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang } from '../src/i18n';
import { RulesButton, type RulesSection } from '../src/components/Rules';

const SECTIONS: RulesSection[] = [
  { id: 'goal', body: <p>goal body</p> },
  { id: 'play', body: <p>play body</p> },
  { id: 'rules', body: <p>rules body</p> },
  { id: 'scoring', body: <p>scoring body</p> },
  { id: 'dental', body: <p>dental body</p> },
  { id: 'mobile', body: <p>mobile body</p> },
];

function mockPointer(coarse: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches: coarse && query.includes('coarse'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  act(() => applyLang('hu'));
  mockPointer(false);
});
afterEach(() => {
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe('RulesButton', () => {
  it('shows the visible word in Hungarian', () => {
    const { getByRole } = render(<RulesButton sections={SECTIONS} />);
    const btn = getByRole('button', { name: 'Szabályok' });
    expect(btn.textContent).toContain('Szabályok');
    expect(btn.querySelector('svg')).toBeTruthy();
  });

  it('R opens, Escape closes and focus returns to the button', () => {
    const onOpenChange = vi.fn();
    const { getByRole, queryByRole } = render(<RulesButton sections={SECTIONS} onOpenChange={onOpenChange} />);
    const btn = getByRole('button', { name: 'Szabályok' });
    fireEvent.keyDown(window, { key: 'r' });
    const dialog = getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(btn);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('Close button closes; Escape does not reach game hotkeys', () => {
    const gameKey = vi.fn();
    const { getByRole, queryByRole } = render(<RulesButton sections={SECTIONS} />);
    fireEvent.click(getByRole('button', { name: 'Szabályok' }));
    window.addEventListener('keydown', gameKey);
    fireEvent.keyDown(document.activeElement as Element, { key: 'p' });
    window.removeEventListener('keydown', gameKey);
    expect(gameKey).not.toHaveBeenCalled();
    fireEvent.click(getByRole('button', { name: 'Bezárás' }));
    expect(queryByRole('dialog')).toBeNull();
  });

  it('R typed in an input does nothing', () => {
    const { getByRole, queryByRole } = render(
      <>
        <input aria-label="nick" />
        <RulesButton sections={SECTIONS} />
      </>,
    );
    const input = getByRole('textbox', { name: 'nick' });
    input.focus();
    fireEvent.keyDown(input, { key: 'r' });
    fireEvent.keyDown(input, { key: 'R' });
    expect(queryByRole('dialog')).toBeNull();
  });

  it('hotkey={false} leaves R alone', () => {
    const { queryByRole } = render(<RulesButton sections={SECTIONS} hotkey={false} />);
    fireEvent.keyDown(window, { key: 'r' });
    expect(queryByRole('dialog')).toBeNull();
  });

  it('renders kit headings in the order given; mobile absent with a fine pointer', () => {
    const order: RulesSection[] = [SECTIONS[3], SECTIONS[0], SECTIONS[4], SECTIONS[5]];
    const { getByRole } = render(<RulesButton sections={order} />);
    fireEvent.click(getByRole('button', { name: 'Szabályok' }));
    const dialog = getByRole('dialog');
    const headings = Array.from(dialog.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headings).toEqual(['Pontozás', 'Cél', 'Fogas mód']);
    expect(dialog.textContent).toContain('scoring body');
    expect(dialog.textContent).not.toContain('mobile body');
  });

  it('mobile section present with a coarse pointer', () => {
    mockPointer(true);
    const { getByRole } = render(<RulesButton sections={SECTIONS} />);
    fireEvent.click(getByRole('button', { name: 'Szabályok' }));
    const dialog = getByRole('dialog');
    const headings = Array.from(dialog.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headings).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód', 'Mobilon']);
    expect(dialog.textContent).toContain('mobile body');
  });

  it('titles the dialog with the game name when gameId is given', () => {
    const { getByRole } = render(<RulesButton sections={SECTIONS} gameId="snake" />);
    fireEvent.click(getByRole('button', { name: 'Szabályok' }));
    expect(getByRole('dialog', { name: /szabályok/ })).toBeTruthy();
    expect(getByRole('heading', { level: 2 }).textContent).toMatch(/— szabályok$/);
  });

  it('switching language while open re-renders the dialog', () => {
    const { getByRole } = render(<RulesButton sections={SECTIONS} />);
    fireEvent.click(getByRole('button', { name: 'Szabályok' }));
    act(() => applyLang('de'));
    const headings = Array.from(getByRole('dialog').querySelectorAll('h3')).map((h) => h.textContent);
    expect(headings[2]).toBe('Regeln');
  });

  it('Tab is trapped inside the dialog', () => {
    const { getByRole } = render(
      <RulesButton sections={[{ id: 'goal', body: <a href="#x">link</a> }]} />,
    );
    fireEvent.click(getByRole('button', { name: 'Szabályok' }));
    const dialog = getByRole('dialog');
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href]'));
    const last = focusables[focusables.length - 1];
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(focusables[0]);
    fireEvent.keyDown(focusables[0], { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});
