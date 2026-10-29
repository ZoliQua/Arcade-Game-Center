export type GameStatus = 'idle' | 'running' | 'paused' | 'gameOver';

/** One brick of the wall. Destroyed bricks are removed from the array. */
export type Brick = {
  col: number;
  row: number;
  /** Hits left before it breaks (ignored for steel). */
  hp: number;
  /** Hits it took when fresh: 1, 2 or 3. */
  max: number;
  /** Indestructible; does not count towards clearing the level. */
  steel: boolean;
};

export type Ball = {
  /** Centre, logical pixels. */
  x: number;
  y: number;
  /** Velocity, logical pixels per second. */
  vx: number;
  vy: number;
  /** Speed the ball travels at (|v|), before the Slow effect. */
  speed: number;
  /** Riding on the paddle, waiting for a launch. */
  stuck: boolean;
  /** Held by the Catch power-up (auto-released) rather than waiting to be served. */
  caught: boolean;
  /** Horizontal offset from the paddle centre while stuck. */
  offset: number;
  /** Milliseconds the ball has been held by the Catch power-up. */
  heldMs: number;
};

export type PowerUpKind = 'wide' | 'multi' | 'slow' | 'life' | 'catch';

/** A power-up capsule falling towards the paddle. */
export type Drop = {
  x: number;
  y: number;
  kind: PowerUpKind;
};

export type Effects = {
  /** Remaining milliseconds of each timed power-up (0 = inactive). */
  wideMs: number;
  slowMs: number;
  catchMs: number;
};

export type GameState = {
  status: GameStatus;
  /** 1-based; levels loop through the layouts with a faster ball. */
  level: number;
  lives: number;
  score: number;
  bricks: Brick[];
  /** Paddle centre x (the paddle's y is fixed). */
  paddleX: number;
  balls: Ball[];
  drops: Drop[];
  effects: Effects;
  /** Seeded RNG state (uint32) — power-up drops are deterministic. */
  seed: number;
  /** Text shown over the field for `bannerMs` ("Level 2", "Life lost"). */
  banner: string;
  bannerMs: number;
};

/** Per-step player input. */
export type StepInput = {
  /** Keyboard steering: -1 left, 1 right, 0 none. */
  dir: -1 | 0 | 1;
  /** Pointer / touch target for the paddle centre (logical x), or null. */
  targetX: number | null;
  /** Launch a ball resting on the paddle. */
  launch: boolean;
};

export type GameEvent =
  | 'paddle'
  | 'wall'
  | 'brick'
  | 'hard'
  | 'steel'
  | 'powerup'
  | 'lifeLost'
  | 'levelClear'
  | 'gameOver'
  | 'launch';
