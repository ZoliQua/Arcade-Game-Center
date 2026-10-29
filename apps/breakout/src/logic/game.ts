import {
  BALL_R,
  BANNER_MS,
  BRICK_H,
  BRICK_LEFT,
  BRICK_TOP,
  BRICK_W,
  CATCH_HOLD_MS,
  CATCH_MS,
  DROP_CHANCE,
  DROP_H,
  DROP_SPEED,
  DROP_W,
  FIELD_H,
  FIELD_W,
  LEVEL_CLEAR_BONUS,
  MAX_BALLS,
  MAX_BOUNCE_ANGLE,
  MAX_DROPS,
  MAX_FRAME_MS,
  MAX_LIVES,
  MAX_SPEEDUP,
  MAX_SUBSTEP_PX,
  PADDLE_H,
  PADDLE_KEY_SPEED,
  PADDLE_POINTER_SPEED,
  PADDLE_SPEEDUP,
  PADDLE_Y,
  POWERUP_POINTS,
  POWERUP_WEIGHTS,
  ROW_POINTS,
  SLOW_FACTOR,
  SLOW_MS,
  START_LIVES,
  WIDE_MS,
  levelSpeed,
  paddleWidth,
} from './constants';
import { buildBricks, isCleared, layoutForLevel } from './levels';
import { nextRandom } from './rng';
import type { Ball, Brick, Drop, Effects, GameEvent, GameState, PowerUpKind, StepInput } from './types';

export const NO_INPUT: StepInput = { dir: 0, targetX: null, launch: false };

/** Default serve offset: launches slightly to the right instead of straight up. */
const SERVE_OFFSET = 10;
/** Shallowest allowed flight angle from horizontal (prevents endless side-to-side loops). */
const MIN_ANGLE = (25 * Math.PI) / 180;
const EPS = 0.01;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type Rect = { x: number; y: number; w: number; h: number };

export const brickRect = (b: Pick<Brick, 'col' | 'row'>): Rect => ({
  x: BRICK_LEFT + b.col * BRICK_W,
  y: BRICK_TOP + b.row * BRICK_H,
  w: BRICK_W,
  h: BRICK_H,
});

export const paddleRect = (s: Pick<GameState, 'paddleX' | 'effects'>): Rect => {
  const w = paddleWidth(s.effects.wideMs);
  return { x: s.paddleX - w / 2, y: PADDLE_Y, w, h: PADDLE_H };
};

/** Ball (as its bounding square) overlaps the rectangle. */
const ballHits = (x: number, y: number, r: Rect) =>
  x + BALL_R > r.x && x - BALL_R < r.x + r.w && y + BALL_R > r.y && y - BALL_R < r.y + r.h;

const NO_EFFECTS: Effects = { wideMs: 0, slowMs: 0, catchMs: 0 };

export function servedBall(paddleX: number, level: number, offset = SERVE_OFFSET): Ball {
  return {
    x: paddleX + offset,
    y: PADDLE_Y - BALL_R,
    vx: 0,
    vy: 0,
    speed: levelSpeed(level),
    stuck: true,
    caught: false,
    offset,
    heldMs: 0,
  };
}

export function createInitialState(over: Partial<GameState> = {}): GameState {
  const level = over.level ?? 1;
  const base: GameState = {
    status: 'idle',
    level,
    lives: START_LIVES,
    score: 0,
    bricks: buildBricks(layoutForLevel(level)),
    paddleX: FIELD_W / 2,
    balls: [servedBall(FIELD_W / 2, level)],
    drops: [],
    effects: { ...NO_EFFECTS },
    seed: 1,
    banner: `Level ${level} · ${layoutForLevel(level).name}`,
    bannerMs: BANNER_MS,
  };
  return { ...base, ...over };
}

/** Points for breaking a brick (only breakable bricks score). */
export const brickPoints = (b: Brick, level: number): number =>
  b.steel ? 0 : (ROW_POINTS[b.row] ?? 10) * b.max * level;

/** Keep a direction at least MIN_ANGLE away from horizontal, at the given speed. */
export function normalizeVelocity(vx: number, vy: number, speed: number): [number, number] {
  let ang = Math.atan2(vy, vx);
  const fromHorizontal = Math.asin(Math.min(1, Math.abs(Math.sin(ang))));
  if (fromHorizontal < MIN_ANGLE) {
    const sx = Math.cos(ang) >= 0 ? 1 : -1;
    const sy = vy > 0 ? 1 : -1;
    ang = Math.atan2(sy * Math.sin(MIN_ANGLE), sx * Math.cos(MIN_ANGLE));
  }
  return [Math.cos(ang) * speed, Math.sin(ang) * speed];
}

/** Velocity for leaving the paddle at relative position `rel` (-1 left edge … 1 right edge). */
export function bounceVelocity(rel: number, speed: number): [number, number] {
  const angle = clamp(rel, -1, 1) * MAX_BOUNCE_ANGLE;
  return [speed * Math.sin(angle), -speed * Math.cos(angle)];
}

function pickPowerUp(r: number): PowerUpKind {
  const total = POWERUP_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let acc = 0;
  for (const [kind, w] of POWERUP_WEIGHTS) {
    acc += w / total;
    if (r < acc) return kind;
  }
  return POWERUP_WEIGHTS[POWERUP_WEIGHTS.length - 1][0];
}

/** Mutable working copy of the state for one step. */
type Work = {
  s: GameState;
  bricks: Brick[];
  balls: Ball[];
  drops: Drop[];
  effects: Effects;
  seed: number;
  score: number;
  lives: number;
  events: GameEvent[] | undefined;
};

const emit = (w: Work, e: GameEvent) => w.events?.push(e);

function hitBrick(w: Work, index: number): void {
  const b = w.bricks[index];
  if (b.steel) {
    emit(w, 'steel');
    return;
  }
  // Copy on first write: an untouched wall keeps its identity (cheap re-renders).
  if (w.bricks === w.s.bricks) w.bricks = w.bricks.slice();
  if (b.hp > 1) {
    w.bricks[index] = { ...b, hp: b.hp - 1 };
    emit(w, 'hard');
    return;
  }
  w.bricks.splice(index, 1);
  w.score += brickPoints(b, w.s.level);
  emit(w, 'brick');
  const [roll, seed1] = nextRandom(w.seed);
  w.seed = seed1;
  if (roll < DROP_CHANCE && w.drops.length < MAX_DROPS) {
    const [k, seed2] = nextRandom(w.seed);
    w.seed = seed2;
    const r = brickRect(b);
    w.drops.push({ x: r.x + r.w / 2, y: r.y + r.h / 2, kind: pickPowerUp(k) });
  }
}

/** Index of the overlapped brick closest to the ball centre, or -1. */
function findBrick(bricks: readonly Brick[], x: number, y: number): number {
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < bricks.length; i += 1) {
    const r = brickRect(bricks[i]);
    if (!ballHits(x, y, r)) continue;
    const d = Math.abs(r.x + r.w / 2 - x) + Math.abs(r.y + r.h / 2 - y);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function launchBall(b: Ball, paddleW: number): Ball {
  const [vx, vy] = bounceVelocity(b.offset / (paddleW / 2), b.speed);
  return { ...b, vx, vy, stuck: false, caught: false, heldMs: 0 };
}

/**
 * Move one free ball through `dt` seconds in sub-steps of at most
 * MAX_SUBSTEP_PX, resolving x and y separately: a hit while moving along x
 * reflects vx (side hit), along y reflects vy (top/bottom hit). Sub-steps are
 * far smaller than a brick or the paddle, so the ball can never tunnel.
 * Returns null when the ball fell out of the bottom.
 */
function moveBall(w: Work, ball: Ball, dt: number, paddle: Rect): Ball | null {
  let { x, y, vx, vy, speed } = ball;
  const factor = w.effects.slowMs > 0 ? SLOW_FACTOR : 1;
  const dist = speed * factor * dt;
  const n = Math.max(1, Math.ceil(dist / MAX_SUBSTEP_PX));
  const sub = (dt * factor) / n;

  for (let i = 0; i < n; i += 1) {
    // ── x axis ──
    let nx = x + vx * sub;
    if (nx - BALL_R < 0) {
      nx = BALL_R;
      vx = Math.abs(vx);
      emit(w, 'wall');
    } else if (nx + BALL_R > FIELD_W) {
      nx = FIELD_W - BALL_R;
      vx = -Math.abs(vx);
      emit(w, 'wall');
    }
    const bx = findBrick(w.bricks, nx, y);
    if (bx >= 0) {
      const r = brickRect(w.bricks[bx]);
      nx = vx > 0 ? r.x - BALL_R - EPS : r.x + r.w + BALL_R + EPS;
      vx = -vx;
      hitBrick(w, bx);
    }
    if (ballHits(nx, y, paddle)) {
      // The paddle's flank: push the ball out sideways, it keeps falling.
      nx = nx < paddle.x + paddle.w / 2 ? paddle.x - BALL_R - EPS : paddle.x + paddle.w + BALL_R + EPS;
      vx = nx < paddle.x ? -Math.abs(vx) : Math.abs(vx);
    }
    x = nx;

    // ── y axis ──
    let ny = y + vy * sub;
    if (ny - BALL_R < 0) {
      ny = BALL_R;
      vy = Math.abs(vy);
      emit(w, 'wall');
    }
    const by = findBrick(w.bricks, x, ny);
    if (by >= 0) {
      const r = brickRect(w.bricks[by]);
      ny = vy > 0 ? r.y - BALL_R - EPS : r.y + r.h + BALL_R + EPS;
      vy = -vy;
      hitBrick(w, by);
    }
    if (vy > 0 && ballHits(x, ny, paddle)) {
      if (y + BALL_R <= paddle.y + EPS) {
        // Top face: the bounce angle depends on where the ball landed.
        const rel = (x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        speed = Math.min(speed * PADDLE_SPEEDUP, levelSpeed(w.s.level) * MAX_SPEEDUP);
        emit(w, 'paddle');
        if (w.effects.catchMs > 0) {
          const offset = clamp(x - (paddle.x + paddle.w / 2), -paddle.w / 2, paddle.w / 2);
          return { x, y: paddle.y - BALL_R, vx: 0, vy: 0, speed, stuck: true, caught: true, offset, heldMs: 0 };
        }
        [vx, vy] = bounceVelocity(rel, speed);
        ny = paddle.y - BALL_R;
      } else {
        // Came in below the top face (it was already past the paddle): slide off.
        x = x < paddle.x + paddle.w / 2 ? paddle.x - BALL_R - EPS : paddle.x + paddle.w + BALL_R + EPS;
      }
    }
    y = ny;
    if (y - BALL_R > FIELD_H) return null;
  }
  return { ...ball, x, y, vx, vy, speed };
}

function applyPowerUp(w: Work, kind: PowerUpKind, paddleW: number): void {
  switch (kind) {
    case 'wide':
      w.effects.wideMs = WIDE_MS;
      break;
    case 'slow':
      w.effects.slowMs = SLOW_MS;
      break;
    case 'catch':
      w.effects.catchMs = CATCH_MS;
      break;
    case 'life':
      w.lives = Math.min(MAX_LIVES, w.lives + 1);
      break;
    case 'multi': {
      const free = w.balls.filter((b) => !b.stuck);
      const sources = free.length > 0 ? free : w.balls.slice(0, 1).map((b) => launchBall(b, paddleW));
      if (free.length === 0) w.balls = [...sources, ...w.balls.slice(1)];
      const extra: Ball[] = [];
      for (const src of sources) {
        for (const turn of [-0.45, 0.45]) {
          if (w.balls.length + extra.length >= MAX_BALLS) break;
          const c = Math.cos(turn);
          const s = Math.sin(turn);
          const [vx, vy] = normalizeVelocity(src.vx * c - src.vy * s, src.vx * s + src.vy * c, src.speed);
          extra.push({ ...src, vx, vy, stuck: false, caught: false, heldMs: 0 });
        }
      }
      w.balls = [...w.balls, ...extra];
      break;
    }
  }
}

function resetForServe(s: GameState, patch: Partial<GameState>): GameState {
  const level = patch.level ?? s.level;
  const paddleX = FIELD_W / 2;
  return {
    ...s,
    ...patch,
    paddleX,
    balls: [servedBall(paddleX, level)],
    drops: [],
    effects: { ...NO_EFFECTS },
  };
}

/**
 * Advance the simulation by `dtMs` (clamped to MAX_FRAME_MS). Pure apart
 * from pushing what happened into the optional `events` array (sound hooks).
 */
export function step(state: GameState, dtMs: number, input: StepInput = NO_INPUT, events?: GameEvent[]): GameState {
  if (state.status !== 'running') return state;
  const ms = clamp(dtMs, 0, MAX_FRAME_MS);
  const dt = ms / 1000;

  const w: Work = {
    s: state,
    bricks: state.bricks,
    balls: state.balls,
    drops: state.drops.map((d) => ({ ...d })),
    effects: {
      wideMs: Math.max(0, state.effects.wideMs - ms),
      slowMs: Math.max(0, state.effects.slowMs - ms),
      catchMs: Math.max(0, state.effects.catchMs - ms),
    },
    seed: state.seed,
    score: state.score,
    lives: state.lives,
    events,
  };

  // ── paddle ──
  let paddleW = paddleWidth(w.effects.wideMs);
  let paddleX = state.paddleX;
  if (input.targetX !== null && Number.isFinite(input.targetX)) {
    const max = PADDLE_POINTER_SPEED * dt;
    paddleX += clamp(input.targetX - paddleX, -max, max);
  } else {
    paddleX += input.dir * PADDLE_KEY_SPEED * dt;
  }
  paddleX = clamp(paddleX, paddleW / 2, FIELD_W - paddleW / 2);
  const paddle: Rect = { x: paddleX - paddleW / 2, y: PADDLE_Y, w: paddleW, h: PADDLE_H };

  // ── balls ──
  const moved: Ball[] = [];
  let launched = false;
  for (const ball of state.balls) {
    if (ball.stuck) {
      const offset = clamp(ball.offset, -paddleW / 2, paddleW / 2);
      const heldMs = ball.caught ? ball.heldMs + ms : 0;
      let b: Ball = { ...ball, offset, heldMs, x: clamp(paddleX + offset, BALL_R, FIELD_W - BALL_R), y: PADDLE_Y - BALL_R };
      if (input.launch || (ball.caught && heldMs >= CATCH_HOLD_MS)) {
        b = launchBall(b, paddleW);
        launched = true;
      }
      moved.push(b);
      continue;
    }
    const next = moveBall(w, ball, dt, paddle);
    if (next) moved.push(next);
  }
  if (launched) emit(w, 'launch');
  w.balls = moved;

  // ── falling power-ups ──
  const kept: Drop[] = [];
  for (const d of w.drops) {
    d.y += DROP_SPEED * dt;
    const caught =
      d.x + DROP_W / 2 > paddle.x &&
      d.x - DROP_W / 2 < paddle.x + paddle.w &&
      d.y + DROP_H / 2 > paddle.y &&
      d.y - DROP_H / 2 < paddle.y + paddle.h;
    if (caught) {
      applyPowerUp(w, d.kind, paddleW);
      w.score += POWERUP_POINTS * state.level;
      emit(w, 'powerup');
    } else if (d.y - DROP_H / 2 <= FIELD_H) {
      kept.push(d);
    }
  }
  w.drops = kept;
  // Catching Wide mid-step widens the paddle from the next step on.
  paddleW = paddleWidth(w.effects.wideMs);
  paddleX = clamp(paddleX, paddleW / 2, FIELD_W - paddleW / 2);

  let next: GameState = {
    ...state,
    bricks: w.bricks,
    balls: w.balls,
    drops: w.drops,
    effects: w.effects,
    paddleX,
    seed: w.seed,
    score: w.score,
    lives: w.lives,
    bannerMs: Math.max(0, state.bannerMs - ms),
  };

  // ── level clear / life lost ──
  if (isCleared(next.bricks)) {
    const level = state.level + 1;
    emit(w, 'levelClear');
    return resetForServe(next, {
      level,
      score: next.score + LEVEL_CLEAR_BONUS * state.level,
      bricks: buildBricks(layoutForLevel(level)),
      banner: `Level ${level} · ${layoutForLevel(level).name}`,
      bannerMs: BANNER_MS,
    });
  }
  if (next.balls.length === 0) {
    const lives = next.lives - 1;
    if (lives <= 0) {
      emit(w, 'gameOver');
      return { ...next, lives: 0, status: 'gameOver', drops: [], banner: 'Game over', bannerMs: 0 };
    }
    emit(w, 'lifeLost');
    next = resetForServe(next, { lives, banner: lives === 1 ? 'Last ball!' : 'Ball lost', bannerMs: BANNER_MS });
  }
  return next;
}

/** Run `count` fixed steps with the same input (launch applies to the first only). */
export function stepMany(
  state: GameState,
  count: number,
  stepMs: number,
  input: StepInput = NO_INPUT,
  events?: GameEvent[],
): GameState {
  let s = state;
  for (let i = 0; i < count && s.status === 'running'; i += 1) {
    s = step(s, stepMs, i === 0 ? input : { ...input, launch: false }, events);
  }
  return s;
}

/** True when a ball is resting on the paddle waiting for a launch. */
export const awaitingLaunch = (s: GameState): boolean => s.balls.some((b) => b.stuck && !b.caught);

/** Breakable bricks left. */
export const bricksLeft = (s: GameState): number => s.bricks.filter((b) => !b.steel).length;
