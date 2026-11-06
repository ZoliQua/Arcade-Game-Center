import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, applyUrlPrefs } from '@arcade/kit';
import App from './App';

beforeEach(() => {
  // jsdom has no canvas; the landing demos skip drawing without a context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  localStorage.clear();
  applyLang('en', { silent: true });
  applyDental(false, { silent: true });
  localStorage.setItem('arcade.nickPromptDismissed', '1');
  window.location.hash = '';
});

afterEach(() => {
  vi.restoreAllMocks();
  window.location.hash = '';
});

describe('portal App', () => {
  it('boots from ?lang=de&dental=1 into a German, dental-mode portal', () => {
    const errors = vi.spyOn(console, 'error');
    window.location.hash = '#/play/snake';
    applyUrlPrefs({ search: '?lang=de&dental=1', hash: '#/play/snake' }, { silent: true });
    render(<App />);

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('button', { name: /sprache/i }).textContent).toContain('DE');
    expect(within(header).getByRole('button', { name: 'Einstellungen' })).toBeTruthy();
    expect(document.documentElement.lang).toBe('de');
    expect(document.documentElement.getAttribute('data-dental')).toBe('on');
    expect(localStorage.getItem('arcade.dental')).toBe('1');
    expect(document.title).toBe("Snake · Zoltan's Arcade");
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('retitles the page on a language switch', () => {
    window.location.hash = '#/settings';
    render(<App />);
    expect(document.title).toBe("Settings · Zoltan's Arcade");
    act(() => applyLang('hu'));
    expect(document.title).toBe("Beállítások · Zoltan's Arcade");
  });
});
