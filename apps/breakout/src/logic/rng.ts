/**
 * Mulberry32 as a pure function: the whole generator state is one uint32,
 * stored in GameState so a saved game replays the same power-up drops.
 */
export function nextRandom(seed: number): [value: number, nextSeed: number] {
  const next = (seed + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

/** A fresh seed for a new run (not used by the deterministic engine itself). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}
