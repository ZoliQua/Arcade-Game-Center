import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyUrlPrefs, readUrlPrefs, withPrefs } from '../src/prefs';
import { applyLang, readLang } from '../src/i18n';
import { applyDental, readDental } from '../src/dental';

beforeEach(() => localStorage.clear());

describe('readUrlPrefs', () => {
  it('reads lang and dental from the query', () => {
    expect(readUrlPrefs({ search: '?lang=de&dental=1', hash: '' })).toEqual({ lang: 'de', dental: true });
  });
  it('reads them from inside the hash route', () => {
    expect(readUrlPrefs({ search: '', hash: '#/play/snake?lang=hu&dental=0' })).toEqual({ lang: 'hu', dental: false });
  });
  it('ignores unknown values', () => {
    expect(readUrlPrefs({ search: '?lang=fr&dental=yes', hash: '' })).toEqual({});
  });
  it('lets the hash override the query and tolerates no location', () => {
    expect(readUrlPrefs({ search: '?lang=en', hash: '#/x?lang=de' })).toEqual({ lang: 'de' });
    expect(readUrlPrefs({ search: '', hash: '' })).toEqual({});
  });
});

describe('applyUrlPrefs', () => {
  it('persists what the URL asks for', () => {
    applyUrlPrefs({ search: '?lang=hu&dental=1', hash: '' });
    expect(readLang()).toBe('hu');
    expect(readDental()).toBe(true);
    applyUrlPrefs({ search: '', hash: '#/?dental=0' });
    expect(readDental()).toBe(false);
    expect(readLang()).toBe('hu');
  });
});

describe('withPrefs', () => {
  it('adds lang and dental to a link', () => {
    expect(withPrefs('https://dulzoltan.hu/arcade/', { lang: 'de', dental: true })).toBe(
      'https://dulzoltan.hu/arcade/?lang=de&dental=1',
    );
    // Off is carried too, so a saved '1' on the other origin is switched off.
    expect(withPrefs('https://dulzoltan.hu/arcade/?x=1', { lang: 'hu', dental: false })).toBe(
      'https://dulzoltan.hu/arcade/?x=1&lang=hu&dental=0',
    );
    expect(withPrefs('https://x.hu/a#/play', { lang: 'en', dental: true })).toBe('https://x.hu/a?lang=en&dental=1#/play');
  });
});

describe('applyUrlPrefs with blocked storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // Successful writes clear the in-memory fallback again.
    applyLang('en');
    applyDental(false);
  });
  it('keeps the URL choice in memory and can stay silent', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const heard = vi.fn();
    window.addEventListener('arcade:lang', heard);
    window.addEventListener('arcade:dental', heard);
    applyUrlPrefs({ search: '?lang=de&dental=1', hash: '' }, { silent: true });
    window.removeEventListener('arcade:lang', heard);
    window.removeEventListener('arcade:dental', heard);
    expect(heard).not.toHaveBeenCalled();
    expect(readLang()).toBe('de');
    expect(readDental()).toBe(true);
    expect(document.documentElement.lang).toBe('de');
  });
});
