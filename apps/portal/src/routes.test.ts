import { describe, expect, it } from 'vitest';
import { formatHash, parseHash, stripPrefParams } from './routes';

describe('hash routes', () => {
  it('parses every view', () => {
    expect(parseHash('')).toEqual({ view: 'home' });
    expect(parseHash('#/')).toEqual({ view: 'home' });
    expect(parseHash('#/play/gomoku')).toEqual({ view: 'play', gameId: 'gomoku' });
    expect(parseHash('#/play/2048')).toEqual({ view: 'play', gameId: '2048' });
    expect(parseHash('#/leaderboard')).toEqual({ view: 'leaderboard' });
    expect(parseHash('#settings')).toEqual({ view: 'settings' });
  });

  it('falls back to home for unknown games and paths', () => {
    expect(parseHash('#/play/doom')).toEqual({ view: 'home' });
    expect(parseHash('#/whatever')).toEqual({ view: 'home' });
  });

  it('round-trips', () => {
    for (const hash of ['#/', '#/play/tictactoe', '#/leaderboard', '#/settings']) {
      expect(formatHash(parseHash(hash))).toBe(hash);
    }
  });
});

describe('hash routes with hand-off params', () => {
  it('ignores a query inside the hash', () => {
    expect(parseHash('#/play/snake?lang=de&dental=1')).toEqual({ view: 'play', gameId: 'snake' });
    expect(parseHash('#/settings?lang=hu')).toEqual({ view: 'settings' });
    expect(parseHash('#?dental=0')).toEqual({ view: 'home' });
  });
});

describe('stripPrefParams', () => {
  it('removes lang and dental from the query and the hash query, keeping the rest', () => {
    expect(stripPrefParams({ pathname: '/arcade/', search: '?lang=de&dental=1', hash: '#/play/snake' })).toBe(
      '/arcade/#/play/snake',
    );
    expect(stripPrefParams({ pathname: '/', search: '?utm_source=x&lang=hu', hash: '#/settings?dental=0' })).toBe(
      '/?utm_source=x#/settings',
    );
  });

  it('returns null when there is nothing to remove', () => {
    expect(stripPrefParams({ pathname: '/', search: '?utm_source=x', hash: '#/leaderboard' })).toBeNull();
  });
});
