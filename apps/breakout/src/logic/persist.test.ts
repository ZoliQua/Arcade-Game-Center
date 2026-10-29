import { describe, expect, it } from 'vitest';
import { demoAdvance } from './autopilot';
import { createInitialState } from './game';
import { isBreakoutState } from './persist';
import type { GameState } from './types';

const roundTrip = (s: GameState): unknown => JSON.parse(JSON.stringify(s));

describe('isBreakoutState', () => {
  it('accepts fresh and mid-game states after a JSON round trip', () => {
    expect(isBreakoutState(roundTrip(createInitialState()))).toBe(true);
    let s = createInitialState({ status: 'running', seed: 3 });
    for (let i = 0; i < 300; i += 1) {
      s = demoAdvance(s, 100);
      expect(isBreakoutState(roundTrip(s))).toBe(true);
    }
  });

  it('rejects garbage and tampered saves', () => {
    const ok = createInitialState();
    const bad: unknown[] = [
      null,
      42,
      [],
      { ...ok, status: 'won' },
      { ...ok, level: 0 },
      { ...ok, lives: 99 },
      { ...ok, score: -5 },
      { ...ok, score: 1.5 },
      { ...ok, bricks: [{ col: 12, row: 0, hp: 1, max: 1, steel: false }] },
      { ...ok, bricks: [{ col: 0, row: 0, hp: 3, max: 2, steel: false }] },
      { ...ok, bricks: [ok.bricks[0], ok.bricks[0]] },
      { ...ok, balls: [] },
      { ...ok, balls: [{ ...ok.balls[0], x: Number.NaN }] },
      { ...ok, balls: [{ ...ok.balls[0], stuck: false, vx: 0, vy: 0 }] },
      { ...ok, balls: Array.from({ length: 9 }, () => ok.balls[0]) },
      { ...ok, drops: [{ x: 10, y: 10, kind: 'laser' }] },
      { ...ok, effects: { wideMs: -1, slowMs: 0, catchMs: 0 } },
      { ...ok, effects: undefined },
      { ...ok, seed: -1 },
      { ...ok, paddleX: 9999 },
      { ...ok, banner: 7 },
    ];
    for (const v of bad) expect(isBreakoutState(v)).toBe(false);
  });
});
