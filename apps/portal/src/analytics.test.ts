import { afterEach, describe, expect, it } from 'vitest';
import { trackRoute } from './analytics';
import { routeTitle } from './i18n';

type DL = { dataLayer?: Record<string, unknown>[] };

afterEach(() => {
  delete (window as DL).dataLayer;
});

describe('trackRoute', () => {
  it('pushes an arcade_page_view with the /arcade/ path and the language', () => {
    (window as DL).dataLayer = [];
    trackRoute({ view: 'play', gameId: 'snake' }, 'hu');
    expect((window as DL).dataLayer).toEqual([
      {
        event: 'arcade_page_view',
        page_path: '/arcade/play/snake',
        page_title: routeTitle({ view: 'play', gameId: 'snake' }, 'hu'),
        language: 'hu',
      },
    ]);
  });

  it('creates window.dataLayer when GTM has not loaded', () => {
    expect((window as DL).dataLayer).toBeUndefined();
    trackRoute({ view: 'home' }, 'en');
    expect((window as DL).dataLayer?.[0]).toMatchObject({ event: 'arcade_page_view', page_path: '/arcade/', language: 'en' });
  });

  it('maps every view to its path', () => {
    (window as DL).dataLayer = [];
    trackRoute({ view: 'leaderboard' }, 'de');
    trackRoute({ view: 'settings' }, 'de');
    expect((window as DL).dataLayer?.map((e) => e.page_path)).toEqual(['/arcade/leaderboard', '/arcade/settings']);
  });
});
