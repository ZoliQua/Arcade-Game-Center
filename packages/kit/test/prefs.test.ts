import { beforeEach, describe, expect, it } from 'vitest';
import { applyUrlPrefs, readUrlPrefs, withPrefs } from '../src/prefs';
import { readLang } from '../src/i18n';
import { readDental } from '../src/dental';

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
    expect(withPrefs('https://dulzoltan.hu/arcade/?x=1', { lang: 'hu', dental: false })).toBe(
      'https://dulzoltan.hu/arcade/?x=1&lang=hu',
    );
  });
});
