import type { Position } from './types';

export function spawnFood(snake: Position[], gridSize: number, rng: () => number = Math.random): Position {
  const occupied = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const free: Position[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }

  if (free.length === 0) {
    return snake[0];
  }

  const index = Math.floor(rng() * free.length);
  return free[index];
}

export function isSamePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}
