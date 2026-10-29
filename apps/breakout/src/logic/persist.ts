import { BALL_R, COLS, FIELD_H, FIELD_W, MAX_BALLS, MAX_DROPS, MAX_LIVES, MAX_ROWS, PADDLE_WIDE_W } from './constants';
import type { Ball, Brick, Drop, Effects, GameState, GameStatus, PowerUpKind } from './types';

const STATUSES: readonly GameStatus[] = ['idle', 'running', 'paused', 'gameOver'];
const KINDS: readonly PowerUpKind[] = ['wide', 'multi', 'slow', 'life', 'catch'];
/** Saved effect timers are capped (a minute is far above any real duration). */
const MAX_EFFECT_MS = 60000;
const MAX_HELD_MS = 60000;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const inRange = (v: unknown, lo: number, hi: number): v is number => isNum(v) && v >= lo && v <= hi;
const intIn = (v: unknown, lo: number, hi: number): v is number => isInt(v) && v >= lo && v <= hi;

function isBrick(v: unknown): v is Brick {
  if (!isObj(v)) return false;
  return (
    intIn(v.col, 0, COLS - 1) &&
    intIn(v.row, 0, MAX_ROWS - 1) &&
    intIn(v.max, 1, 3) &&
    intIn(v.hp, 1, v.max as number) &&
    typeof v.steel === 'boolean'
  );
}

/** Generous bounds: a live ball can be slightly outside the field mid-fall. */
function isBall(v: unknown): v is Ball {
  if (!isObj(v)) return false;
  return (
    inRange(v.x, -BALL_R, FIELD_W + BALL_R) &&
    inRange(v.y, -BALL_R, FIELD_H + 4 * BALL_R) &&
    inRange(v.vx, -2000, 2000) &&
    inRange(v.vy, -2000, 2000) &&
    inRange(v.speed, 1, 2000) &&
    typeof v.stuck === 'boolean' &&
    typeof v.caught === 'boolean' &&
    inRange(v.offset, -PADDLE_WIDE_W, PADDLE_WIDE_W) &&
    inRange(v.heldMs, 0, MAX_HELD_MS) &&
    // A free ball must actually move.
    (v.stuck === true || Math.hypot(v.vx as number, v.vy as number) > 1)
  );
}

function isDrop(v: unknown): v is Drop {
  if (!isObj(v)) return false;
  return inRange(v.x, 0, FIELD_W) && inRange(v.y, -20, FIELD_H + 20) && KINDS.includes(v.kind as PowerUpKind);
}

function isEffects(v: unknown): v is Effects {
  if (!isObj(v)) return false;
  return inRange(v.wideMs, 0, MAX_EFFECT_MS) && inRange(v.slowMs, 0, MAX_EFFECT_MS) && inRange(v.catchMs, 0, MAX_EFFECT_MS);
}

/** Guards a saved session before it is trusted as GameState. */
export function isBreakoutState(v: unknown): v is GameState {
  if (!isObj(v)) return false;
  if (!STATUSES.includes(v.status as GameStatus)) return false;
  if (!intIn(v.level, 1, 9999) || !intIn(v.lives, 0, MAX_LIVES) || !intIn(v.score, 0, Number.MAX_SAFE_INTEGER)) {
    return false;
  }
  if (!Array.isArray(v.bricks) || v.bricks.length > COLS * MAX_ROWS || !v.bricks.every(isBrick)) return false;
  const cells = new Set((v.bricks as Brick[]).map((b) => b.row * COLS + b.col));
  if (cells.size !== v.bricks.length) return false;
  if (!Array.isArray(v.balls) || v.balls.length < 1 || v.balls.length > MAX_BALLS || !v.balls.every(isBall)) {
    return false;
  }
  if (!Array.isArray(v.drops) || v.drops.length > MAX_DROPS || !v.drops.every(isDrop)) return false;
  return (
    inRange(v.paddleX, 0, FIELD_W) &&
    isEffects(v.effects) &&
    intIn(v.seed, 0, 0xffffffff) &&
    typeof v.banner === 'string' &&
    v.banner.length <= 80 &&
    inRange(v.bannerMs, 0, MAX_EFFECT_MS)
  );
}
