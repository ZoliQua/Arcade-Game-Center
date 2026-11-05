import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang, LANG_EVENT, LANG_KEY, LANGS, readLang, type Messages } from '../src/i18n';
import { useLang, useMessages } from '../src/hooks';
import { formatNumber } from '../src/format';
import { ARCADE_GAMES, ARCADE_PORTAL_URL, gameName, gameTagline } from '../src/registry';
import { ArcadeShell } from '../src/components/ArcadeShell';
import { SaveBadge, StatusPill } from '../src/components/ArcadeUI';
import { DecayedTooth, Germ, GoldCrown, Molar, PasteDrop, Probe, SmileTooth, Tooth, Toothbrush } from '../src/components/DentalIcons';

function browserLanguages(langs: string[]) {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs);
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(langs[0] ?? '');
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
});
afterEach(() => vi.restoreAllMocks());

describe('readLang', () => {
  it('returns the saved value', () => {
    browserLanguages(['de-AT']);
    localStorage.setItem(LANG_KEY, 'hu');
    expect(readLang()).toBe('hu');
  });
  it('falls back to the first supported browser language', () => {
    browserLanguages(['de-AT']);
    expect(readLang()).toBe('de');
    browserLanguages(['fr-FR', 'hu', 'en']);
    expect(readLang()).toBe('hu');
  });
  it('returns en when no browser language is supported', () => {
    browserLanguages(['fr']);
    expect(readLang()).toBe('en');
  });
  it('ignores a garbage saved value', () => {
    browserLanguages(['fr']);
    localStorage.setItem(LANG_KEY, 'xx');
    expect(readLang()).toBe('en');
  });
  it('uses the browser language without throwing when storage throws', () => {
    browserLanguages(['de-CH']);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => readLang()).not.toThrow();
    expect(readLang()).toBe('de');
  });
});

describe('applyLang', () => {
  it('persists, sets <html lang> and emits arcade:lang', () => {
    const seen: unknown[] = [];
    const on = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener(LANG_EVENT, on);
    applyLang('hu');
    window.removeEventListener(LANG_EVENT, on);
    expect(document.documentElement.lang).toBe('hu');
    expect(localStorage.getItem('arcade.lang')).toBe('hu');
    expect(seen).toEqual(['hu']);
    expect(LANGS).toEqual(['en', 'hu', 'de']);
  });
});

describe('useMessages / useLang', () => {
  const dict: Messages<'hello' | 'bye'> = {
    en: { hello: 'Hello, {name}! You have {n} points.', bye: 'Bye' },
    hu: { hello: 'Szia, {name}! {n} pontod van.', bye: 'Viszlát' },
    de: { hello: 'Hallo, {name}! Du hast {n} Punkte.', bye: 'Tschüss' },
  };

  it('picks the active language and fills placeholders', () => {
    localStorage.setItem(LANG_KEY, 'hu');
    const { result } = renderHook(() => useMessages(dict));
    expect(result.current('hello', { name: 'Zoli', n: 3 })).toBe('Szia, Zoli! 3 pontod van.');
    act(() => applyLang('de'));
    expect(result.current('bye')).toBe('Tschüss');
    expect(result.current('hello', { name: 'Anna' })).toBe('Hallo, Anna! Du hast {n} Punkte.');
  });

  it('useLang setter switches every listener', () => {
    localStorage.setItem(LANG_KEY, 'en');
    const a = renderHook(() => useLang());
    const b = renderHook(() => useLang());
    act(() => a.result.current[1]('de'));
    expect(a.result.current[0]).toBe('de');
    expect(b.result.current[0]).toBe('de');
    expect(document.documentElement.lang).toBe('de');
  });
});

describe('registry and format', () => {
  it('localizes only established game names', () => {
    expect(gameName('gomoku', 'hu')).toBe('Amőba');
    expect(gameName('gomoku', 'de')).toBe('Gomoku');
    expect(gameName('connect4', 'hu')).toBe('Négy a sorban');
    expect(gameName('connect4', 'de')).toBe('Vier gewinnt');
    expect(gameName('tetris', 'hu')).toBe('Tetris');
    expect(ARCADE_PORTAL_URL).toBe('https://dulzoltan.hu/arcade/');
  });

  it('has a tagline in every language for every game', () => {
    for (const g of ARCADE_GAMES) {
      for (const l of LANGS) expect(gameTagline(g.id, l).length).toBeGreaterThan(10);
      expect(g.tagline).toBe(gameTagline(g.id, 'en'));
      expect(gameTagline(g.id, 'hu')).not.toBe(gameTagline(g.id, 'en'));
    }
  });

  it('formats numbers with the locale grouping', () => {
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
    expect(formatNumber(1234567, 'de')).toBe('1.234.567');
    expect(formatNumber(1234567, 'hu').replace(/\s/g, ' ')).toBe('1 234 567');
  });
});

describe('translated kit chrome', () => {
  it('kit components follow the language', () => {
    localStorage.setItem(LANG_KEY, 'hu');
    const { getByText } = render(
      <>
        <StatusPill status="paused" />
        <SaveBadge savedAt={Date.now()} onDiscard={() => {}} />
      </>,
    );
    expect(getByText('Szünet')).toBeTruthy();
    expect(getByText('Elvetés')).toBeTruthy();
  });

  it('a label passed by the game still wins', () => {
    localStorage.setItem(LANG_KEY, 'de');
    const { getByText } = render(<StatusPill status="paused" label="Custom" />);
    expect(getByText('Custom')).toBeTruthy();
  });

  it('ArcadeShell applies URL prefs, switches language and toggles dental mode', () => {
    window.history.replaceState(null, '', '/?lang=de');
    const { getByRole, getByText } = render(
      <ArcadeShell gameId="connect4">
        <p>board</p>
      </ArcadeShell>,
    );
    window.history.replaceState(null, '', '/');
    expect(document.title).toBe("Vier gewinnt · Zoltan's Arcade");
    expect(document.documentElement.lang).toBe('de');
    const langBtn = getByRole('button', { name: /Sprache/ });
    expect(langBtn.textContent).toContain('DE');
    fireEvent.click(langBtn);
    fireEvent.click(getByRole('menuitemradio', { name: 'Magyar' }));
    expect(document.title).toBe("Négy a sorban · Zoltan's Arcade");
    expect(getByText('Négy a sorban a GitHubon')).toBeTruthy();

    const dental = getByRole('button', { name: /Fogas mód/ });
    expect(dental.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(dental);
    expect(dental.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('arcade.dental')).toBe('1');
  });
});

describe('dental icons', () => {
  it('render titled SVGs with distinct shapes', () => {
    const icons = [Tooth, Molar, SmileTooth, GoldCrown, Toothbrush, PasteDrop, Probe, Germ, DecayedTooth];
    const markup = new Set<string>();
    for (const [i, Icon] of icons.entries()) {
      const { container, getByRole, unmount } = render(<Icon size={32} className="x" title={`icon ${i}`} />);
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('width')).toBe('32');
      expect(svg.getAttribute('class')).toBe('x');
      expect(getByRole('img', { name: `icon ${i}` })).toBeTruthy();
      markup.add(svg.innerHTML);
      unmount();
    }
    expect(markup.size).toBe(icons.length);
    const { container } = render(<Tooth />);
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });
});
