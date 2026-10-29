import { describe, expect, it } from 'vitest';
import { aimError, autopilotInput, demoAdvance, predictLandingX } from './autopilot';
import { BALL_R, FIELD_W, PADDLE_W, PADDLE_Y } from './constants';
import { bricksLeft, createInitialState } from './game';
import type { Ball } from './types';

const free = (x: number, y: number, vx: number, vy: number): Ball => ({
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

describe('predictLandingX', () => {
  it('follows a straight fall', () => {
    expect(predictLandingX({ x: 200, y: 100, vx: 0, vy: 200 })).toBeCloseTo(200);
    const dy = PADDLE_Y - BALL_R - 100;
    expect(predictLandingX({ x: 200, y: 100, vx: 50, vy: dy })).toBeCloseTo(250);
  });

  it('folds the path off the side walls', () => {
    const dy = PADDLE_Y - BALL_R - 100;
    // Overshooting the right wall by d comes back d inside it.
    const overshoot = FIELD_W - 50 + 150 - (FIELD_W - BALL_R);
    expect(predictLandingX({ x: FIELD_W - 50, y: 100, vx: 150, vy: dy })).toBeCloseTo(FIELD_W - BALL_R - overshoot);
    expect(predictLandingX({ x: 30, y: 100, vx: -60, vy: dy })).toBeCloseTo(BALL_R + (60 - (30 - BALL_R)));
  });
});

describe('autopilotInput', () => {
  it('launches a served ball after a short delay', () => {
    const s = createInitialState({ status: 'running' });
    expect(autopilotInput(s).launch).toBe(false);
    expect(autopilotInput({ ...s, bannerMs: 0 }).launch).toBe(true);
  });

  it('steers towards the falling ball', () => {
    const s = createInitialState({ status: 'running', paddleX: 400, balls: [free(60, 250, 0, 250)] });
    expect(autopilotInput(s).dir).toBe(-1);
    const r = createInitialState({ status: 'running', paddleX: 60, balls: [free(400, 250, 0, 250)] });
    expect(autopilotInput(r).dir).toBe(1);
  });

  it('aims imperfectly but within reach most of the time', () => {
    const errors = Array.from({ length: 200 }, (_, i) =>
      aimError(createInitialState({ seed: i * 7919 }), { vx: 120 }),
    );
    expect(new Set(errors.map((e) => Math.round(e))).size).toBeGreaterThan(20);
    const near = errors.filter((e) => Math.abs(e) <= PADDLE_W / 2).length;
    expect(near).toBeGreaterThan(160);
    expect(near).toBeLessThan(200);
  });

  it('never takes a vertical ball dead centre (no endless straight bounces)', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(Math.abs(aimError(createInitialState({ seed: i }), { vx: 0 }))).toBeGreaterThanOrEqual(PADDLE_W / 5);
    }
  });

  it('plays a real game: clears bricks and keeps rallies going', () => {
    let s = createInitialState({ status: 'running', seed: 7 });
    const start = bricksLeft(s);
    for (let t = 0; t < 40000 && s.status === 'running'; t += 100) s = demoAdvance(s, 100);
    expect(s.status).toBe('running');
    expect(start - bricksLeft(s) + (s.level - 1) * start).toBeGreaterThanOrEqual(25);
    expect(s.score).toBeGreaterThan(0);
  });

  it('eventually misses, so the demo loops through game over', () => {
    let s = createInitialState({ status: 'running', seed: 99 });
    for (let t = 0; t < 600000 && s.status === 'running'; t += 100) s = demoAdvance(s, 100);
    expect(s.status).toBe('gameOver');
  });
});
