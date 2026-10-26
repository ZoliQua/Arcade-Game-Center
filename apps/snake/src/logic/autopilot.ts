import { hitsWall, wrapPosition } from './collision';
import { isOppositeDirection, nextHead } from './snake';
import type { Direction, GameState, Position } from './types';

const DIRECTIONS: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

const key = (p: Position) => `${p.x},${p.y}`;

function step(p: Position, d: Direction, state: GameState): Position | null {
  const raw = nextHead(p, d);
  if (state.wrapWalls) return wrapPosition(raw, state.gridSize);
  return hitsWall(raw, state.gridSize) ? null : raw;
}

/**
 * Pick the next direction for the landing-page demo: shortest path to the food
 * (BFS around the body), otherwise any move that does not die immediately,
 * otherwise keep going. Uses the real game rules (wrap, no 180° turns).
 */
export function chooseDirection(state: GameState): Direction {
  const head = state.snake[0];
  // The tail moves away on the next tick, so it is not an obstacle.
  const blocked = new Set(state.snake.slice(0, -1).map(key));
  const legal = DIRECTIONS.filter((d) => !isOppositeDirection(d, state.direction));

  const queue: { pos: Position; first: Direction }[] = [];
  const seen = new Set<string>([key(head)]);
  for (const d of legal) {
    const n = step(head, d, state);
    if (!n || blocked.has(key(n))) continue;
    if (n.x === state.food.x && n.y === state.food.y) return d;
    seen.add(key(n));
    queue.push({ pos: n, first: d });
  }
  const safe = queue.map((q) => q.first);

  for (let i = 0; i < queue.length; i += 1) {
    const { pos, first } = queue[i];
    for (const d of DIRECTIONS) {
      const n = step(pos, d, state);
      if (!n) continue;
      const k = key(n);
      if (seen.has(k) || blocked.has(k)) continue;
      if (n.x === state.food.x && n.y === state.food.y) return first;
      seen.add(k);
      queue.push({ pos: n, first });
    }
  }

  return safe[0] ?? state.direction;
}
