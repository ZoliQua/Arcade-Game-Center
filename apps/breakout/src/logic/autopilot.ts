import { BALL_R, BANNER_MS, FIELD_W, PADDLE_Y, STEP_MS, paddleWidth } from './constants';
import { step } from './game';
import { nextRandom } from './rng';
import type { Ball, GameState, StepInput } from './types';

/** How long the demo waits on a served ball before launching it. */
const SERVE_DELAY_MS = 600;
const DEADZONE = 5;

/**
 * Where a descending ball will cross the paddle's top line, folding the
 * straight-line path off the side walls (bricks are ignored — by the time a
 * ball is falling towards the paddle it is almost always below the wall).
 */
export function predictLandingX(ball: Pick<Ball, 'x' | 'y' | 'vx' | 'vy'>): number {
  if (ball.vy <= 0) return ball.x;
  const t = (PADDLE_Y - BALL_R - ball.y) / ball.vy;
  const raw = ball.x + ball.vx * Math.max(0, t);
  const span = FIELD_W - 2 * BALL_R;
  const period = 2 * span;
  let u = (((raw - BALL_R) % period) + period) % period;
  if (u > span) u = period - u;
  return BALL_R + u;
}

/** The free ball that will reach the paddle first, if any is falling. */
function threat(s: GameState): Ball | null {
  let best: Ball | null = null;
  let bestT = Infinity;
  for (const b of s.balls) {
    if (b.stuck || b.vy <= 0) continue;
    const t = (PADDLE_Y - b.y) / b.vy;
    if (t < bestT) {
      bestT = t;
      best = b;
    }
  }
  return best;
}

/**
 * Aim error for one descent of `ball`, hashed from the game's RNG seed (it
 * changes whenever a brick breaks), the ball's horizontal speed (it changes on
 * every paddle bounce) and the lives left (so a replayed serve is not missed
 * the same way twice). Deterministic yet imperfect: usually a near-centre
 * hit, now and then a clean miss.
 */
export function aimError(s: GameState, ball: Pick<Ball, 'vx'>): number {
  const w = paddleWidth(s.effects.wideMs);
  const salt = (Math.abs(Math.round(ball.vx)) * 2654435761 + s.lives * 40503) >>> 0;
  const [a, seed] = nextRandom((s.seed ^ salt) >>> 0);
  const [b] = nextRandom(seed);
  const amplitude = b < 0.1 ? w * 0.9 : w * 0.3;
  const error = (a * 2 - 1) * amplitude;
  // A (nearly) vertical ball is always taken off-centre, so it can never get
  // locked bouncing straight up and down between the paddle and a steel brick.
  if (Math.abs(ball.vx) < 5 && Math.abs(error) < w / 5) return error < 0 ? -w / 4 : w / 4;
  return error;
}

/** Input the demo autopilot would give this step. */
export function autopilotInput(s: GameState): StepInput {
  const w = paddleWidth(s.effects.wideMs);
  let target = s.paddleX;
  let launch = false;

  const ball = threat(s);
  if (ball) {
    target = predictLandingX(ball) + aimError(s, ball);
  } else {
    const free = s.balls.filter((b) => !b.stuck);
    const drop = s.drops.reduce<GameState['drops'][number] | null>((low, d) => (!low || d.y > low.y ? d : low), null);
    if (free.length === 0 && s.balls.some((b) => b.stuck)) {
      launch = s.bannerMs <= BANNER_MS - SERVE_DELAY_MS || s.balls.some((b) => b.caught);
    } else if (drop && drop.y > PADDLE_Y - 160) {
      target = drop.x;
    } else if (free.length > 0) {
      target = free.reduce((low, b) => (b.y > low.y ? b : low)).x;
    }
  }

  target = Math.min(FIELD_W - w / 2, Math.max(w / 2, target));
  const diff = target - s.paddleX;
  const dir: StepInput['dir'] = Math.abs(diff) <= DEADZONE ? 0 : diff < 0 ? -1 : 1;
  return { dir, targetX: null, launch };
}

/** Advance a demo game by `ms`, re-deciding the autopilot input every fixed step. */
export function demoAdvance(state: GameState, ms: number): GameState {
  let s = state;
  const steps = Math.max(1, Math.round(ms / STEP_MS));
  for (let i = 0; i < steps && s.status === 'running'; i += 1) {
    s = step(s, STEP_MS, autopilotInput(s));
  }
  return s;
}
