export type Position = { x: number; y: number };

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'idle' | 'running' | 'paused' | 'gameOver';

export type GameState = {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  status: GameStatus;
  score: number;
  gridSize: number;
  wrapWalls: boolean;
  speed: number;
};
