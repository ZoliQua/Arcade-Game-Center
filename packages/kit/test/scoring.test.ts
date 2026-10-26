import { describe, expect, it } from 'vitest';
import { duelRoundScore } from '../src/scoring';

describe('duelRoundScore', () => {
  it('pays more for faster wins', () => {
    const fast = duelRoundScore({ outcome: 'win', difficulty: 'hard', moves: 9, boardCells: 225 });
    const slow = duelRoundScore({ outcome: 'win', difficulty: 'hard', moves: 150, boardCells: 225 });
    expect(fast).toBeGreaterThan(slow);
    expect(fast).toBeLessThanOrEqual(1000);
  });
  it('draw is a quarter of base, loss is zero, PvP is zero', () => {
    expect(duelRoundScore({ outcome: 'draw', difficulty: 'hard', moves: 9, boardCells: 9 })).toBe(125);
    expect(duelRoundScore({ outcome: 'loss', difficulty: 'easy', moves: 5, boardCells: 9 })).toBe(0);
    expect(duelRoundScore({ outcome: 'win', difficulty: null, moves: 5, boardCells: 9 })).toBe(0);
  });
  it('a full-board win is exactly base', () => {
    expect(duelRoundScore({ outcome: 'win', difficulty: 'medium', moves: 9, boardCells: 9 })).toBe(250);
  });
});
