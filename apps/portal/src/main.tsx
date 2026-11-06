import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme, applyUrlPrefs, readTheme } from '@arcade/kit';
import App from './App';
import { stripPrefParams } from './routes';

import '@arcade/kit/arcade.css';
import '@arcade/ui/portal.css';
import '@arcade/ui/games.css';
import './main.css';

applyTheme(readTheme());

// `?lang=` / `?dental=` hand-off (e.g. from dulzoltan.hu), saved before the first
// render so every component mounts with it; silent, as no listener exists yet.
applyUrlPrefs(undefined, { silent: true });
try {
  const clean = stripPrefParams(window.location);
  if (clean !== null) window.history.replaceState(window.history.state, '', clean);
} catch {
  /* keep the URL as it is */
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
