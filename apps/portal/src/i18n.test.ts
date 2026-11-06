import { describe, expect, it } from 'vitest';
import { LANGS } from '@arcade/kit';
import { PORTAL_MESSAGES, routeTitle, tagLabel } from './i18n';

describe('routeTitle', () => {
  it('is localized and keeps the brand', () => {
    expect(routeTitle({ view: 'home' }, 'en')).toBe("Zoltan's Arcade");
    expect(routeTitle({ view: 'play', gameId: 'snake' }, 'de')).toBe("Snake · Zoltan's Arcade");
    expect(routeTitle({ view: 'settings' }, 'de')).toBe("Einstellungen · Zoltan's Arcade");
    expect(routeTitle({ view: 'leaderboard' }, 'hu')).toBe("Ranglista · Zoltan's Arcade");
  });
});

describe('portal messages', () => {
  it('translate every key into every language', () => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(PORTAL_MESSAGES[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe('');
      }
    }
  });

  it('localize genre tags and pass unknown ones through', () => {
    expect(tagLabel('Duel', 'de')).toBe('Duell');
    expect(tagLabel('Puzzle', 'hu')).toBe('Logikai');
    expect(tagLabel('Racing', 'hu')).toBe('Racing');
  });
});
