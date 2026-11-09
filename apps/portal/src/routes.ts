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
