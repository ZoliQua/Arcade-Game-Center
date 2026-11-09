import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme, applyUrlPrefs, cleanPrefParamsFromUrl, readTheme } from '@arcade/kit';
import App from './App';

import '@arcade/kit/arcade.css';
import '@arcade/ui/portal.css';
import '@arcade/ui/games.css';
import './main.css';

applyTheme(readTheme());

// `?lang=` / `?dental=` hand-off (e.g. from dulzoltan.hu), saved before the first
// render so every component mounts with it; silent, as no listener exists yet.
applyUrlPrefs(undefined, { silent: true });
cleanPrefParamsFromUrl();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
