import { lazy, Suspense } from 'react';
import { ArcadeShell } from './arcade';
import { UltiGame } from './UltiGame';

// Dev-only deck review page (`?gallery=1`); the import is dropped from production builds.
const Gallery =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('gallery') ? lazy(() => import('./deck/Gallery')) : null;

export default function App() {
  return (
    <ArcadeShell gameId="ulti">
      {Gallery ? (
        <Suspense fallback={null}>
          <Gallery />
        </Suspense>
      ) : (
        <UltiGame />
      )}
    </ArcadeShell>
  );
}
