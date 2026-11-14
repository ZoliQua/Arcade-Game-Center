import { describe, expect, it } from 'vitest';
import { STRENGTH_THRESHOLD, strengthTally } from './strength';

/*
 * A small, fixed-seed slice of `npm run sim:strength` (the full run is 300 sessions per pair, see the script).
 * The seeds are the script's first sessions, so this is the same measurement on fewer sessions.
 */
describe('strength (slice of the sim:strength acceptance)', () => {
  it('medium beats easy in at least 60 % of 30 sessions (medium third seat)', () => {
    const t = strengthTally('medium', 'easy', 30);
    expect(t.sessions).toBe(30);
    expect(t.wins / t.sessions).toBeGreaterThanOrEqual(STRENGTH_THRESHOLD);
  });

  it('hard beats easy in at least 60 % of 8 sessions (medium third seat)', () => {
    const t = strengthTally('hard', 'easy', 8);
    expect(t.wins / t.sessions).toBeGreaterThanOrEqual(STRENGTH_THRESHOLD);
  }, 120_000);
});
