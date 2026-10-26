import type { Direction, GameState, GameStatus, Position } from './types';

const DIRECTIONS: readonly Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
const STATUSES: readonly GameStatus[] = ['idle', 'running', 'paused', 'gameOver'];

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

function isPosition(v: unknown, gridSize: number): v is Position {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Position;
  return isInt(p.x) && isInt(p.y) && p.x >= 0 && p.y >= 0 && p.x < gridSize && p.y < gridSize;
}

/** Guards a saved session before it is trusted as GameState. */
export function isSnakeState(v: unknown): v is GameState {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  if (!isInt(s.gridSize) || (s.gridSize as number) < 4 || (s.gridSize as number) > 64) return false;
  const g = s.gridSize as number;
  return (
    Array.isArray(s.snake) &&
    s.snake.length > 0 &&
    s.snake.every((p) => isPosition(p, g)) &&
    isPosition(s.food, g) &&
    DIRECTIONS.includes(s.direction as Direction) &&
    DIRECTIONS.includes(s.nextDirection as Direction) &&
    STATUSES.includes(s.status as GameStatus) &&
    isInt(s.score) &&
    (s.score as number) >= 0 &&
    isInt(s.speed) &&
    typeof s.wrapWalls === 'boolean'
  );
}
