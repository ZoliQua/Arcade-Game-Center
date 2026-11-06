import { useCallback, useEffect, useState } from 'react';
import { ARCADE_GAMES, type ArcadeGameId } from '@arcade/kit';
import type { Route } from '@arcade/ui';

/**
 * Hash routing (`#/play/snake`, `#/leaderboard`, …) so reloads, bookmarks and
 * the browser's back button keep you where you were — and it works from any
 * sub-folder on static hosting without server rewrites.
 */
export function parseHash(hash: string): Route {
  // A query inside the hash (`#/play/snake?lang=de`) carries hand-off prefs, not route parts.
  const parts = hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
  if (parts[0] === 'play' && parts[1] && ARCADE_GAMES.some((g) => g.id === parts[1])) {
    return { view: 'play', gameId: parts[1] as ArcadeGameId };
  }
  if (parts[0] === 'leaderboard') return { view: 'leaderboard' };
  if (parts[0] === 'settings') return { view: 'settings' };
  return { view: 'home' };
}

export function formatHash(route: Route): string {
  switch (route.view) {
    case 'play':
      return `#/play/${route.gameId}`;
    case 'leaderboard':
      return '#/leaderboard';
    case 'settings':
      return '#/settings';
    default:
      return '#/';
  }
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((next: Route) => {
    const hash = formatHash(next);
    if (window.location.hash !== hash) window.location.hash = hash;
    else setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);

  return [route, navigate];
}

const PREF_PARAMS = ['lang', 'dental'];

function dropPrefs(query: string): string {
  const params = new URLSearchParams(query);
  for (const p of PREF_PARAMS) params.delete(p);
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}

/**
 * The URL without the `lang` / `dental` hand-off params (query and hash query),
 * or null when there is nothing to remove. Once applied at boot they are
 * saved, so leaving them in the address bar would override a later switch on reload.
 */
export function stripPrefParams(loc: { pathname: string; search: string; hash: string }): string | null {
  const hasPref = (q: string) => PREF_PARAMS.some((p) => new URLSearchParams(q).has(p));
  const q = loc.hash.indexOf('?');
  const hashPath = q >= 0 ? loc.hash.slice(0, q) : loc.hash;
  const hashQuery = q >= 0 ? loc.hash.slice(q + 1) : '';
  if (!hasPref(loc.search) && !hasPref(hashQuery)) return null;
  return `${loc.pathname}${dropPrefs(loc.search)}${hashPath}${q >= 0 ? dropPrefs(hashQuery) : ''}`;
}
