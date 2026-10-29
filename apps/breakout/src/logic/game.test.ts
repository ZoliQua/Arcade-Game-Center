import { describe, expect, it } from 'vitest';
import {
  BALL_R,
  BRICK_H,
  BRICK_TOP,
  CATCH_HOLD_MS,
  COLS,
  FIELD_W,
  LEVEL_CLEAR_BONUS,
  MAX_BOUNCE_ANGLE,
  MAX_LIVES,
  MAX_ROWS,
  PADDLE_W,
  PADDLE_WIDE_W,
  PADDLE_Y,
  ROW_POINTS,
  SLOW_FACTOR,
  STEP_MS,
  WIDE_MS,
  levelSpeed,
} from './constants';
import {
  awaitingLaunch,
  brickPoints,
  brickRect,
  bricksLeft,
  createInitialState,
  normalizeVelocity,
  servedBall,
  step,
  stepMany,
} from './game';
import { LEVELS, buildBricks, layoutForLevel } from './levels';
import { nextRandom } from './rng';
import type { Ball, Brick, Drop, GameEvent, GameState, StepInput } from './types';

const running = (over: Partial<GameState> = {}) => createInitialState({ status: 'running', bannerMs: 0, ...over });

const ball = (x: number, y: number, vx: number, vy: number): Ball => ({
  x,
  y,
  vx,
  vy,
  speed: Math.hypot(vx, vy),
  stuck: false,
  caught: false,
  offset: 0,
  heldMs: 0,
});

const brick = (col: number, row: number, max = 1, steel = false): Brick => ({ col, row, hp: max, max, steel });
/** A far-away breakable brick keeps the level from counting as cleared. */
const anchor = brick(11, 0);

const input = (over: Partial<StepInput> = {}): StepInput => ({ dir: 0, targetX: null, launch: false, ...over });

describe('createInitialState', () => {
  it('serves one ball on the paddle with three lives and the first wall', () => {
    const s = createInitialState();
    expect(s.status).toBe('idle');
    expect(s.lives).toBe(3);
    expect(s.level).toBe(1);
    expect(s.bricks).toHaveLength(72);
    expect(s.balls).toHaveLength(1);
    expect(s.balls[0].stuck).toBe(true);
    expect(awaitingLaunch(s)).toBe(true);
  });

  it('does nothing unless running', () => {
    const s = createInitialState();
    expect(step(s, 16, input({ dir: 1 }))).toBe(s);
    const p = { ...s, status: 'paused' as const };
    expect(step(p, 16, input({ launch: true }))).toBe(p);
  });
});

describe('paddle', () => {
  it('moves with the keyboard and stops at the walls', () => {
    const s = running();
    const right = stepMany(s, 30, STEP_MS, input({ dir: 1 }));
    expect(right.paddleX).toBeGreaterThan(s.paddleX);
    const wall = stepMany(s, 400, STEP_MS, input({ dir: -1 }));
    expect(wall.paddleX).toBe(PADDLE_W / 2);
  });

  it('follows a pointer target, carrying the served ball along', () => {
    const s = stepMany(running(), 60, STEP_MS, input({ targetX: 100 }));
    expect(s.paddleX).toBeCloseTo(100);
    expect(s.balls[0].stuck).toBe(true);
    expect(s.balls[0].x).toBeCloseTo(100 + s.balls[0].offset);
    expect(s.balls[0].y).toBe(PADDLE_Y - BALL_R);
  });
});

describe('ball physics', () => {
  it('launches upwards, angled by where it sits on the paddle', () => {
    const events: GameEvent[] = [];
    const s = step(running(), STEP_MS, input({ launch: true }), events);
    const b = s.balls[0];
    expect(b.stuck).toBe(false);
    expect(b.vy).toBeLessThan(0);
    expect(b.vx).toBeGreaterThan(0); // default serve offset is right of centre
    expect(Math.hypot(b.vx, b.vy)).toBeCloseTo(levelSpeed(1));
    expect(events).toContain('launch');
  });

  it('bounces off the side and top walls', () => {
    const left = step(running({ bricks: [anchor], balls: [ball(5, 200, -200, -100)] }), STEP_MS);
    expect(left.balls[0].vx).toBeGreaterThan(0);
    const right = step(running({ bricks: [anchor], balls: [ball(FIELD_W - 5, 200, 200, -100)] }), STEP_MS);
    expect(right.balls[0].vx).toBeLessThan(0);
    const top = step(running({ bricks: [anchor], balls: [ball(200, 5, 100, -200)] }), STEP_MS);
    expect(top.balls[0].vy).toBeGreaterThan(0);
  });

  it('breaks a brick hit from below: reflects vy only and scores by row × level', () => {
    const target = brick(5, 3);
    const r = brickRect(target);
    const s = running({ level: 2, bricks: [target, anchor], balls: [ball(r.x + r.w / 2, r.y + r.h + BALL_R + 1, 30, -200)] });
    const next = stepMany(s, 3, STEP_MS);
    expect(next.bricks).toEqual([anchor]);
    expect(next.balls[0].vy).toBeGreaterThan(0);
    expect(next.balls[0].vx).toBeGreaterThan(0);
    expect(next.score).toBe(ROW_POINTS[3] * 2);
  });

  it('reflects vx only on a side hit', () => {
    const target = brick(5, 3);
    const r = brickRect(target);
    const s = running({ bricks: [target, anchor], balls: [ball(r.x - BALL_R - 1, r.y + r.h / 2, 200, 40)] });
    const next = stepMany(s, 3, STEP_MS);
    expect(next.bricks).toEqual([anchor]);
    expect(next.balls[0].vx).toBeLessThan(0);
    expect(next.balls[0].vy).toBeGreaterThan(0);
  });

  it('needs several hits for hard bricks and never breaks steel', () => {
    const hard = brick(5, 3, 2);
    const r = brickRect(hard);
    const below = (b: Brick) => ball(brickRect(b).x + 19, r.y + r.h + BALL_R + 1, 0, -200);
    const once = stepMany(running({ bricks: [hard, anchor], balls: [below(hard)] }), 3, STEP_MS);
    expect(once.bricks[0]).toMatchObject({ col: 5, row: 3, hp: 1 });
    expect(once.score).toBe(0);
    const twice = stepMany({ ...once, balls: [below(hard)] }, 3, STEP_MS);
    expect(twice.bricks).toEqual([anchor]);
    expect(twice.score).toBe(ROW_POINTS[3] * 2);

    const steel = brick(5, 3, 1, true);
    const hit = stepMany(running({ bricks: [steel, brick(0, 0)], balls: [below(steel)] }), 3, STEP_MS);
    expect(hit.bricks).toHaveLength(2);
    expect(hit.balls[0].vy).toBeGreaterThan(0);
    expect(brickPoints(steel, 5)).toBe(0);
  });

  it('never tunnels through a brick, even at extreme speed and a long frame', () => {
    const row = Array.from({ length: COLS }, (_, col) => brick(col, 0));
    const fast = ball(200, BRICK_TOP + BRICK_H + 40, 0, -2000);
    const next = step(running({ bricks: [...row, anchor], balls: [fast] }), 1000);
    expect(next.bricks).toHaveLength(COLS);
    expect(next.balls[0].vy).toBeGreaterThan(0);
    expect(next.balls[0].y).toBeGreaterThan(BRICK_TOP + BRICK_H);
  });

  it('keeps the brick array identity on steps without a hit', () => {
    const s = running({ balls: [ball(240, 250, 50, 200)] });
    expect(step(s, STEP_MS).bricks).toBe(s.bricks);
  });

  it('never tunnels through the paddle', () => {
    const s = running({ bricks: [anchor], balls: [ball(FIELD_W / 2, PADDLE_Y - 30, 0, 1900)] });
    const next = step(s, 50);
    expect(next.balls[0].vy).toBeLessThan(0);
    expect(next.lives).toBe(3);
  });

  it('sets the bounce angle from where the ball meets the paddle', () => {
    const at = (dx: number) =>
      stepMany(running({ bricks: [anchor], balls: [ball(FIELD_W / 2 + dx, PADDLE_Y - BALL_R - 1, 0, 200)] }), 4, STEP_MS)
        .balls[0];
    const centre = at(0);
    expect(centre.vy).toBeLessThan(0);
    expect(Math.abs(centre.vx)).toBeLessThan(1);
    const edge = at(PADDLE_W / 2);
    expect(Math.atan2(edge.vx, -edge.vy)).toBeCloseTo(MAX_BOUNCE_ANGLE, 1);
    expect(at(-PADDLE_W / 4).vx).toBeLessThan(0);
  });

  it('keeps flight angles away from horizontal', () => {
    const [vx, vy] = normalizeVelocity(300, -1, 300);
    expect(Math.abs(vy)).toBeGreaterThan(100);
    expect(vy).toBeLessThan(0);
    expect(Math.hypot(vx, vy)).toBeCloseTo(300);
  });
});

describe('lives and levels', () => {
  it('loses a life when the last ball falls out and serves a new one', () => {
    const events: GameEvent[] = [];
    const s = running({ bricks: [anchor, brick(0, 0)], balls: [ball(20, 358, 0, 200)], paddleX: 400 });
    const next = stepMany(s, 10, STEP_MS, input(), events);
    expect(next.lives).toBe(2);
    expect(next.status).toBe('running');
    expect(next.balls).toHaveLength(1);
    expect(next.balls[0].stuck).toBe(true);
    expect(events).toContain('lifeLost');
  });

  it('ends the run when the last life is lost', () => {
    const s = running({ lives: 1, bricks: [brick(0, 0)], balls: [ball(20, 358, 0, 200)], paddleX: 400 });
    const next = stepMany(s, 10, STEP_MS);
    expect(next.status).toBe('gameOver');
    expect(next.lives).toBe(0);
  });

  it('a second ball keeps the life alive', () => {
    const s = running({ bricks: [brick(0, 0)], balls: [ball(20, 358, 0, 200), ball(200, 200, 50, -200)], paddleX: 400 });
    const next = stepMany(s, 10, STEP_MS);
    expect(next.lives).toBe(3);
    expect(next.balls).toHaveLength(1);
  });

  it('clearing the wall awards the bonus and serves the next, faster level', () => {
    const last = brick(5, 3);
    const r = brickRect(last);
    const s = running({ bricks: [last, brick(0, 0, 1, true)], balls: [ball(r.x + 19, r.y + r.h + BALL_R + 1, 0, -200)] });
    const next = stepMany(s, 3, STEP_MS);
    expect(next.level).toBe(2);
    expect(next.score).toBe(ROW_POINTS[3] + LEVEL_CLEAR_BONUS);
    expect(next.bricks).toEqual(buildBricks(layoutForLevel(2)));
    expect(next.balls[0].stuck).toBe(true);
    expect(next.balls[0].speed).toBe(levelSpeed(2));
    expect(levelSpeed(2)).toBeGreaterThan(levelSpeed(1));
  });

  it('has at least five valid layouts that loop', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(5);
    for (const layout of LEVELS) {
      expect(layout.rows.length).toBeLessThanOrEqual(MAX_ROWS);
      for (const row of layout.rows) expect(row).toMatch(/^[.123#]{12}$/);
      expect(bricksLeft(createInitialState({ bricks: buildBricks(layout) }))).toBeGreaterThan(0);
    }
    expect(layoutForLevel(LEVELS.length + 1)).toBe(LEVELS[0]);
    expect(LEVELS.some((l) => l.rows.join('').includes('3'))).toBe(true);
    expect(LEVELS.some((l) => l.rows.join('').includes('#'))).toBe(true);
  });
});

describe('power-ups', () => {
  const catchDrop = (kind: Drop['kind'], over: Partial<GameState> = {}) =>
    running({
      bricks: [anchor, brick(0, 0)],
      drops: [{ x: FIELD_W / 2, y: PADDLE_Y - 4, kind }],
      balls: [ball(100, 200, 120, -180)],
      ...over,
    });

  it('drops are deterministic for a given seed', () => {
    const a = stepMany(running({ seed: 42 }), 1500, STEP_MS, input({ launch: true }));
    const b = stepMany(running({ seed: 42 }), 1500, STEP_MS, input({ launch: true }));
    expect(a).toEqual(b);
  });

  it('Wide widens the paddle until the timer runs out', () => {
    const s = stepMany(catchDrop('wide'), 6, STEP_MS);
    expect(s.drops).toHaveLength(0);
    expect(s.effects.wideMs).toBeGreaterThan(WIDE_MS - 100);
    expect(s.score).toBe(50);
    const later = step({ ...s, effects: { ...s.effects, wideMs: 5 } }, STEP_MS);
    expect(later.effects.wideMs).toBe(0);
    expect(PADDLE_WIDE_W).toBeGreaterThan(PADDLE_W);
  });

  it('Multiball splits every free ball into three', () => {
    const s = stepMany(catchDrop('multi'), 6, STEP_MS);
    expect(s.balls).toHaveLength(3);
    const dirs = new Set(s.balls.map((b) => Math.round(Math.atan2(b.vy, b.vx) * 100)));
    expect(dirs.size).toBe(3);
  });

  it('Slow makes the ball travel less per step', () => {
    const base = running({ bricks: [anchor], balls: [ball(200, 200, 0, -200)] });
    const normal = step(base, 20);
    const slow = step({ ...base, effects: { wideMs: 0, slowMs: 5000, catchMs: 0 } }, 20);
    expect(200 - slow.balls[0].y).toBeCloseTo((200 - normal.balls[0].y) * SLOW_FACTOR);
  });

  it('Extra life adds a life up to the cap', () => {
    expect(stepMany(catchDrop('life'), 6, STEP_MS).lives).toBe(4);
    expect(stepMany(catchDrop('life', { lives: MAX_LIVES }), 6, STEP_MS).lives).toBe(MAX_LIVES);
  });

  it('Catch holds the ball on the paddle, then releases it automatically', () => {
    const s = running({
      bricks: [anchor],
      effects: { wideMs: 0, slowMs: 0, catchMs: 5000 },
      balls: [ball(FIELD_W / 2 + 6, PADDLE_Y - BALL_R - 1, 0, 200)],
    });
    const held = stepMany(s, 4, STEP_MS);
    expect(held.balls[0]).toMatchObject({ stuck: true, caught: true });
    expect(awaitingLaunch(held)).toBe(false);
    const released = stepMany(held, Math.ceil(CATCH_HOLD_MS / STEP_MS) + 2, STEP_MS);
    expect(released.balls[0].stuck).toBe(false);
    expect(released.balls[0].vy).toBeLessThan(0);
  });

  it('a broken brick sometimes spawns a falling capsule', () => {
    // Find a seed whose first roll triggers a drop.
    let seed = 1;
    while (nextRandom(seed)[0] >= 0.14) seed += 1;
    const target = brick(5, 3);
    const r = brickRect(target);
    const s = running({ seed, bricks: [target, anchor], balls: [ball(r.x + 19, r.y + r.h + BALL_R + 1, 0, -200)] });
    const next = stepMany(s, 3, STEP_MS);
    expect(next.drops).toHaveLength(1);
    expect(next.drops[0].x).toBeCloseTo(r.x + r.w / 2);
    const fallen = stepMany({ ...next, balls: [ball(200, 200, 10, -200)] }, 30, STEP_MS);
    expect(fallen.drops[0].y).toBeGreaterThan(next.drops[0].y);
  });

  it('a fresh serve resets power-ups', () => {
    const s = running({
      bricks: [anchor, brick(0, 0)],
      effects: { wideMs: 9000, slowMs: 9000, catchMs: 9000 },
      balls: [ball(20, 358, 0, 200)],
      paddleX: 400,
    });
    const next = stepMany(s, 10, STEP_MS);
    expect(next.effects).toEqual({ wideMs: 0, slowMs: 0, catchMs: 0 });
    expect(next.balls[0]).toEqual(servedBall(FIELD_W / 2, 1));
  });
});
