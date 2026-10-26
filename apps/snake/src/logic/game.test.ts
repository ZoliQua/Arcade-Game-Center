import { describe, expect, it } from 'vitest';
import { chooseDirection } from './autopilot';
import { advanceGame, createInitialState } from './game';
import { isSnakeState } from './persist';
import type { GameState } from './types';

const running = (over: Partial<GameState> = {}) => createInitialState({ status: 'running', ...over });
const fixedRng = () => 0;

describe('advanceGame', () => {
  it('does nothing unless running', () => {
    const s = createInitialState();
    expect(advanceGame(s)).toBe(s);
    const p = { ...s, status: 'paused' as const };
    expect(advanceGame(p)).toBe(p);
  });

  it('moves one cell and keeps length when not eating', () => {
    const next = advanceGame(running());
    expect(next.snake[0]).toEqual({ x: 11, y: 10 });
    expect(next.snake).toHaveLength(3);
    expect(next.score).toBe(0);
  });

  it('grows, scores the current speed and respawns food off the snake on eat', () => {
    const s = running({ food: { x: 11, y: 10 }, speed: 7 });
    const next = advanceGame(s, fixedRng);
    expect(next.snake).toHaveLength(4);
    expect(next.score).toBe(7);
    expect(next.snake.some((p) => p.x === next.food.x && p.y === next.food.y)).toBe(false);
  });

  it('ignores a queued 180° reversal', () => {
    const next = advanceGame(running({ nextDirection: 'LEFT' }));
    expect(next.direction).toBe('RIGHT');
    expect(next.snake[0]).toEqual({ x: 11, y: 10 });
  });

  it('dies on the wall without wrap and wraps with it', () => {
    const edge = { snake: [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }], food: { x: 0, y: 0 } };
    expect(advanceGame(running({ ...edge, wrapWalls: false })).status).toBe('gameOver');
    const wrapped = advanceGame(running({ ...edge, wrapWalls: true }));
    expect(wrapped.status).toBe('running');
    expect(wrapped.snake[0]).toEqual({ x: 0, y: 5 });
  });

  it('dies when biting its own body but may enter the cell the tail leaves', () => {
    // A 2×2 loop: head moving DOWN into the cell the tail vacates is legal.
    const loop = running({
      snake: [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }],
      direction: 'LEFT',
      nextDirection: 'DOWN',
      food: { x: 0, y: 0 },
    });
    expect(advanceGame(loop).status).toBe('running');
    const bite = running({
      snake: [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }],
      direction: 'LEFT',
      nextDirection: 'DOWN',
      food: { x: 0, y: 0 },
    });
    expect(advanceGame(bite).status).toBe('gameOver');
  });

  it('ends the run as a win when the snake fills the board', () => {
    const s = running({
      gridSize: 2,
      snake: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      food: { x: 1, y: 0 },
      wrapWalls: false,
    });
    const next = advanceGame(s);
    expect(next.status).toBe('gameOver');
    expect(next.snake).toHaveLength(4);
  });
});

describe('autopilot', () => {
  it('heads straight for food on an open board', () => {
    expect(chooseDirection(running({ food: { x: 15, y: 10 } }))).toBe('RIGHT');
    expect(chooseDirection(running({ food: { x: 10, y: 3 } }))).toBe('UP');
  });

  it('keeps a demo game alive and eating for a few hundred ticks', () => {
    let s = createInitialState({ status: 'running', gridSize: 16, wrapWalls: true });
    let eaten = 0;
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 400 && s.status === 'running'; i += 1) {
      const len = s.snake.length;
      s = advanceGame({ ...s, nextDirection: chooseDirection(s) }, rng);
      if (s.snake.length > len) eaten += 1;
    }
    expect(eaten).toBeGreaterThanOrEqual(10);
  });
});

describe('isSnakeState', () => {
  it('accepts a real state and rejects garbage', () => {
    expect(isSnakeState(createInitialState())).toBe(true);
    expect(isSnakeState({ ...createInitialState(), snake: [] })).toBe(false);
    expect(isSnakeState({ ...createInitialState(), food: { x: 99, y: 0 } })).toBe(false);
    expect(isSnakeState(null)).toBe(false);
  });
});
