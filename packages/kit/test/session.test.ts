import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSession,
  loadSession,
  peekSession,
  saveSession,
  SESSION_MAX_AGE_MS,
  sessionKey,
} from '../src/session';

beforeEach(() => localStorage.clear());

type Data = { n: number };
const isData = (d: unknown): d is Data => typeof d === 'object' && d !== null && typeof (d as Data).n === 'number';

describe('session', () => {
  it('round-trips data with metadata', () => {
    saveSession('snake', { schema: 2, data: { n: 7 }, seconds: 12.7, score: 30 }, 1000);
    const env = loadSession<Data>('snake', 2, isData, 2000);
    expect(env).toMatchObject({ v: 1, game: 'snake', schema: 2, savedAt: 1000, seconds: 12, score: 30, data: { n: 7 } });
  });

  it('drops saves from another schema version', () => {
    saveSession('snake', { schema: 1, data: { n: 1 }, seconds: 0, score: 0 });
    expect(loadSession('snake', 2)).toBeNull();
    expect(localStorage.getItem(sessionKey('snake'))).toBeNull();
  });

  it('drops saves that fail validation', () => {
    saveSession('snake', { schema: 1, data: { wrong: true }, seconds: 0, score: 0 });
    expect(loadSession('snake', 1, isData)).toBeNull();
  });

  it('drops stale saves', () => {
    saveSession('2048', { schema: 1, data: { n: 1 }, seconds: 0, score: 0 }, 0);
    expect(loadSession('2048', 1, isData, SESSION_MAX_AGE_MS + 1)).toBeNull();
  });

  it('drops corrupt envelopes', () => {
    localStorage.setItem(sessionKey('tetris'), '"just a string"');
    expect(loadSession('tetris', 1)).toBeNull();
  });

  it('peek returns metadata without data, clear removes it', () => {
    saveSession('pacman', { schema: 1, data: { n: 1 }, seconds: 5, score: 50 }, 10);
    expect(peekSession('pacman', 20)).toEqual({ v: 1, game: 'pacman', schema: 1, savedAt: 10, seconds: 5, score: 50 });
    clearSession('pacman');
    expect(peekSession('pacman')).toBeNull();
  });
});
