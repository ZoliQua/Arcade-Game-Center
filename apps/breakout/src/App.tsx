import { ArcadeShell } from './arcade';
import { BreakoutGame } from './BreakoutGame';

export default function App() {
  return (
    <ArcadeShell gameId="breakout">
      <BreakoutGame />
    </ArcadeShell>
  );
}
