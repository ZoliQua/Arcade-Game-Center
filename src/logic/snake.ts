import type { Direction, Position } from './types';

const DELTA: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function nextHead(head: Position, direction: Direction): Position {
  const d = DELTA[direction];
  return { x: head.x + d.x, y: head.y + d.y };
}

export function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === 'UP' && b === 'DOWN') ||
    (a === 'DOWN' && b === 'UP') ||
    (a === 'LEFT' && b === 'RIGHT') ||
    (a === 'RIGHT' && b === 'LEFT')
  );
}

export function moveSnake(snake: Position[], head: Position, grow: boolean): Position[] {
  return grow ? [head, ...snake] : [head, ...snake.slice(0, -1)];
}
