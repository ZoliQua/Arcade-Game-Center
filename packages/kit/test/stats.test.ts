import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyRun,
  emptyStats,
  readStats,
  recordRun,
  resetStats,
  STATS_EVENT,
  statsKey,
  summarize,
} from '../src/stats';

beforeEach(() => localStorage.clear());

describe('applyRun', () => {
  it('updates every counter for a ranked run', () => {
    const next = applyRun(emptyStats(), { score: 120, seconds: 45, outcome: 'over', ranked: true }, 1000);
    expect(next).toEqual({
      best: 120,
      plays: 1,
      wins: 0,
      totalScore: 120,
      totalSeconds: 45,
      lastScore: 120,
      lastPlayedAt: 1000,
    });
  });

  it('keeps the higher best and counts wins', () => {
    const a = applyRun(emptyStats(), { score: 300, seconds: 10, outcome: 'win', ranked: true }, 1);
    const b = applyRun(a, { score: 100, seconds: 5, outcome: 'win', ranked: true }, 2);
    expect(b.best).toBe(300);
    expect(b.wins).toBe(2);
    expect(b.totalScore).toBe(400);
  });

  it('unranked runs count plays and time but not best/total score', () => {
    const next = applyRun(emptyStats(), { score: 999, seconds: 30, outcome: 'win', ranked: false }, 1);
    expect(next.best).toBe(0);
    expect(next.totalScore).toBe(0);
    expect(next.plays).toBe(1);
    expect(next.totalSeconds).toBe(30);
  });

  it('sanitizes negative and fractional input', () => {
    const next = applyRun(emptyStats(), { score: -5, seconds: 2.9, outcome: 'over', ranked: true }, 1);
    expect(next.best).toBe(0);
    expect(next.totalSeconds).toBe(2);
  });
});

describe('persistence', () => {
  it('recordRun persists, mirrors the legacy key and emits an event', () => {
    const spy = vi.fn();
    window.addEventListener(STATS_EVENT, spy);
    recordRun('snake', { score: 42, seconds: 12, outcome: 'over', ranked: true });
    window.removeEventListener(STATS_EVENT, spy);
    expect(readStats('snake').best).toBe(42);
    expect(localStorage.getItem('snake.highScore')).toBe('42');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('migrates a legacy high score that is higher than the stored best', () => {
    localStorage.setItem('tetris.highScore', '5000');
    expect(readStats('tetris').best).toBe(5000);
  });

  it('survives corrupt JSON', () => {
    localStorage.setItem(statsKey('2048'), '{not json');
    expect(readStats('2048')).toEqual(emptyStats());
  });

  it('resetStats clears one or all games', () => {
    recordRun('snake', { score: 1, seconds: 1, outcome: 'over', ranked: true });
    recordRun('tetris', { score: 2, seconds: 1, outcome: 'over', ranked: true });
    resetStats('snake');
    expect(readStats('snake').plays).toBe(0);
    expect(readStats('tetris').plays).toBe(1);
    resetStats();
    expect(readStats('tetris').plays).toBe(0);
  });

  it('summarize adds up all games', () => {
    const s = { ...emptyStats(), plays: 2, totalScore: 10, totalSeconds: 60 };
    expect(summarize({ snake: s, tetris: s })).toEqual({ plays: 4, totalScore: 20, totalSeconds: 120 });
  });
});
