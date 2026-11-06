import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, applyUrlPrefs } from '@arcade/kit';
import App from './App';

type DL = { dataLayer?: Record<string, unknown>[] };

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
  delete (window as DL).dataLayer;
  window.location.hash = '';
});

describe('portal App', () => {
  it('boots from ?lang=de&dental=1 into a German, dental-mode portal and tracks the page', () => {
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
    expect((window as DL).dataLayer).toEqual([
      { event: 'arcade_page_view', page_path: '/arcade/play/snake', page_title: "Snake · Zoltan's Arcade", language: 'de' },
    ]);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('tracks each route change once and retitles on a language switch', () => {
    render(<App />);
    expect((window as DL).dataLayer?.map((e) => e.page_path)).toEqual(['/arcade/']);
    act(() => {
      window.location.hash = '#/settings';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect((window as DL).dataLayer?.map((e) => e.page_path)).toEqual(['/arcade/', '/arcade/settings']);
    act(() => applyLang('hu'));
    expect(document.title).toBe("Beállítások · Zoltan's Arcade");
    expect((window as DL).dataLayer).toHaveLength(2);
  });
});
