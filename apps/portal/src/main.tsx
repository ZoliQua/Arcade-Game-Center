import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import '@arcade/ui/tokens.css';
import '@arcade/ui/portal.css';
import '@arcade/ui/games.css';
import './main.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
