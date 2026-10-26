import { ArcadeShell } from './arcade';
import { SnakeGame } from './SnakeGame';

export default function App() {
  return (
    <ArcadeShell gameId="snake">
      <SnakeGame />
    </ArcadeShell>
  );
}
