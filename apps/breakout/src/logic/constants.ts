import type { PowerUpKind } from './types';

/** Logical playfield, scaled to fit the container. */
export const FIELD_W = 480;
export const FIELD_H = 360;

/** Fixed simulation step (120 Hz). */
export const STEP_MS = 1000 / 120;
/** Ball movement is further split so a sub-step never moves more than this. */
export const MAX_SUBSTEP_PX = 2;
/** Longest frame the loop will simulate (prevents jumps after a stall). */
export const MAX_FRAME_MS = 50;

// Bricks
export const COLS = 12;
export const MAX_ROWS = 9;
export const BRICK_W = 38;
export const BRICK_H = 14;
export const BRICK_LEFT = (FIELD_W - COLS * BRICK_W) / 2;
export const BRICK_TOP = 44;

// Paddle
export const PADDLE_Y = 334;
export const PADDLE_H = 10;
export const PADDLE_W = 68;
export const PADDLE_WIDE_W = 104;
/** Keyboard steering speed, px/s. */
export const PADDLE_KEY_SPEED = 470;
/** Pointer-follow speed cap, px/s (fast but not teleporting). */
export const PADDLE_POINTER_SPEED = 2400;

// Ball
export const BALL_R = 4;
export const BASE_SPEED = 230;
export const SPEED_PER_LEVEL = 18;
export const MAX_LEVEL_SPEED = 410;
/** Each paddle hit speeds the ball up by this factor… */
export const PADDLE_SPEEDUP = 1.015;
/** …up to this multiple of the level's base speed. */
export const MAX_SPEEDUP = 1.25;
/** Steepest paddle bounce, radians from vertical. */
export const MAX_BOUNCE_ANGLE = (60 * Math.PI) / 180;
export const SLOW_FACTOR = 0.7;
export const MAX_BALLS = 8;

// Power-ups
export const DROP_CHANCE = 0.14;
export const DROP_SPEED = 95;
export const DROP_W = 22;
export const DROP_H = 10;
export const MAX_DROPS = 3;
export const WIDE_MS = 15000;
export const SLOW_MS = 12000;
export const CATCH_MS = 15000;
/** A caught ball is released automatically after this long. */
export const CATCH_HOLD_MS = 2500;
/** Relative weights of the power-up kinds. */
export const POWERUP_WEIGHTS: readonly [PowerUpKind, number][] = [
  ['wide', 30],
  ['multi', 25],
  ['slow', 20],
  ['catch', 15],
  ['life', 10],
];

export const START_LIVES = 3;
export const MAX_LIVES = 6;
export const BANNER_MS = 1600;

/** Points for breaking a brick in `row` (0 = top), before hardness and level multipliers. */
export const ROW_POINTS: readonly number[] = [80, 70, 60, 50, 40, 30, 20, 10, 10];
export const POWERUP_POINTS = 50;
export const LEVEL_CLEAR_BONUS = 500;

export const levelSpeed = (level: number): number =>
  Math.min(MAX_LEVEL_SPEED, BASE_SPEED + (Math.max(1, level) - 1) * SPEED_PER_LEVEL);

export const paddleWidth = (wideMs: number): number => (wideMs > 0 ? PADDLE_WIDE_W : PADDLE_W);
