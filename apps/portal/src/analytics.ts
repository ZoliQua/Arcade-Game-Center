import type { Lang } from '@arcade/kit';
import type { Route } from '@arcade/ui';
import { routeTitle } from './i18n';

/**
 * Single-page-app page views for Google Tag Manager (GTM-MTSQ5JGF, loaded in
 * index.html). The portal is served from dulzoltan.hu/arcade/ with hash
 * routing, so each route is reported as a clean virtual path under /arcade/.
 */

export type ArcadePageView = {
  event: 'arcade_page_view';
  page_path: string;
  page_title: string;
  language: Lang;
};

type DataLayerWindow = Window & { dataLayer?: unknown[] };

export function routePath(route: Route): string {
  switch (route.view) {
    case 'play':
      return `/arcade/play/${route.gameId}`;
    case 'leaderboard':
      return '/arcade/leaderboard';
    case 'settings':
      return '/arcade/settings';
    default:
      return '/arcade/';
  }
}

/** Push one `arcade_page_view` to `window.dataLayer` (created if GTM has not loaded yet). */
export function trackRoute(route: Route, lang: Lang): void {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  const event: ArcadePageView = {
    event: 'arcade_page_view',
    page_path: routePath(route),
    page_title: routeTitle(route, lang),
    language: lang,
  };
  try {
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push(event);
  } catch {
    /* analytics must never break the app */
  }
}
