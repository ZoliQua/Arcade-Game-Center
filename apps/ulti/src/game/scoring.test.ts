import { describe, expect, it } from 'vitest';
import { arcadeScore, DIFFICULTY_FACTOR, MAX_SCORE, POINTS_PER_UNIT, sessionOutcome } from './scoring';

describe('arcade score', () => {
  it('is max(0, net units) × 50 × difficulty factor', () => {
    expect(POINTS_PER_UNIT).toBe(50);
    expect(DIFFICULTY_FACTOR).toEqual({ easy: 1, medium: 1.5, hard: 2 });
    expect(arcadeScore(10, 'easy')).toBe(500);
    expect(arcadeScore(10, 'medium')).toBe(750);
    expect(arcadeScore(7, 'medium')).toBe(525);
    expect(arcadeScore(10, 'hard')).toBe(1000);
    expect(arcadeScore(0, 'hard')).toBe(0);
    expect(arcadeScore(-24, 'hard')).toBe(0);
  });

  it('never exceeds the arcade cap of 30000 for ulti', () => {
    expect(MAX_SCORE).toBe(30000);
    expect(arcadeScore(10_000, 'hard')).toBe(30000);
    expect(arcadeScore(299, 'hard')).toBe(29900);
  });

  it('a session is won when the player ends strictly on top', () => {
    expect(sessionOutcome([12, -4, -8])).toBe('win');
    expect(sessionOutcome([4, 4, -8])).toBe('draw');
    expect(sessionOutcome([-2, 6, -4])).toBe('loss');
  });
});
