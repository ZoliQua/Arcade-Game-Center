import type { Position } from './types';

export function hitsWall(head: Position, gridSize: number): boolean {
  return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
}

export function hitsSelf(head: Position, body: Position[]): boolean {
  return body.some((cell) => cell.x === head.x && cell.y === head.y);
}

export function wrapPosition(pos: Position, gridSize: number): Position {
  return {
    x: ((pos.x % gridSize) + gridSize) % gridSize,
    y: ((pos.y % gridSize) + gridSize) % gridSize,
  };
}
