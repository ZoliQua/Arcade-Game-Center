import type { Direction, GameState, Position } from './types';

export const GRID_SIZE = 20;

export const MIN_SPEED = 1;
export const MAX_SPEED = 10;
export const DEFAULT_SPEED = 6;

export const SPEED_TICK_MS: readonly number[] = [300, 260, 225, 195, 170, 150, 130, 110, 90, 70];

export const TICK_MS = SPEED_TICK_MS[DEFAULT_SPEED - 1];

export function tickMsForSpeed(speed: number): number {
  const clamped = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(speed)));
  return SPEED_TICK_MS[clamped - 1];
}

export const INITIAL_DIRECTION: Direction = 'RIGHT';

export const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_FOOD: Position = { x: 14, y: 10 };

export const DEFAULT_WRAP_WALLS = true;

export const INITIAL_STATE: GameState = {
  snake: INITIAL_SNAKE,
  food: INITIAL_FOOD,
  direction: INITIAL_DIRECTION,
  nextDirection: INITIAL_DIRECTION,
  status: 'idle',
  score: 0,
  gridSize: GRID_SIZE,
  wrapWalls: DEFAULT_WRAP_WALLS,
  speed: DEFAULT_SPEED,
};
