import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme, readTheme } from '@arcade/kit';
import App from './App';

import '@arcade/kit/arcade.css';
import '@arcade/ui/portal.css';
import '@arcade/ui/games.css';
import './main.css';

applyTheme(readTheme());

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
