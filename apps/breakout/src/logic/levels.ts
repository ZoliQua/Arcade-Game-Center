import { COLS, MAX_ROWS } from './constants';
import type { Brick } from './types';

export type LevelLayout = {
  name: string;
  /** One string per row, COLS characters: `.` empty, `1`–`3` hits, `#` steel. */
  rows: readonly string[];
};

/**
 * Hand-designed walls. After the last one the cycle starts again with a
 * faster ball (see `levelSpeed`).
 */
export const LEVELS: readonly LevelLayout[] = [
  {
    name: 'Classic',
    rows: [
      '222222222222',
      '111111111111',
      '111111111111',
      '111111111111',
      '111111111111',
      '111111111111',
    ],
  },
  {
    name: 'Pyramid',
    rows: [
      '.....22.....',
      '....2112....',
      '...211112...',
      '..21111112..',
      '.2111111112.',
      '211111111112',
    ],
  },
  {
    name: 'Checkers',
    rows: [
      '3.3.3.3.3.3.',
      '.2.2.2.2.2.2',
      '1.1.1.1.1.1.',
      '.1.1.1.1.1.1',
      '2.2.2.2.2.2.',
      '.1.1.1.1.1.1',
    ],
  },
  {
    name: 'Fortress',
    rows: [
      '#..........#',
      '#.33333333.#',
      '#.32222223.#',
      '#.32111123.#',
      '#.32111123.#',
      '#.33333333.#',
      '#..........#',
    ],
  },
  {
    name: 'Invader',
    rows: [
      '..1......1..',
      '...1....1...',
      '..22222222..',
      '.22.2222.22.',
      '222222222222',
      '2.22222222.2',
      '2.2......2.2',
      '...33..33...',
    ],
  },
  {
    name: 'Bulwark',
    rows: [
      '333333333333',
      '222222222222',
      '222222222222',
      '###......###',
      '111111111111',
      '111111111111',
      '1111.##.1111',
    ],
  },
];

export const layoutForLevel = (level: number): LevelLayout =>
  LEVELS[(Math.max(1, level) - 1) % LEVELS.length];

/** Build the brick list of a layout. */
export function buildBricks(layout: LevelLayout): Brick[] {
  const bricks: Brick[] = [];
  layout.rows.slice(0, MAX_ROWS).forEach((line, row) => {
    for (let col = 0; col < COLS; col += 1) {
      const ch = line[col] ?? '.';
      if (ch === '#') bricks.push({ col, row, hp: 1, max: 1, steel: true });
      else if (ch === '1' || ch === '2' || ch === '3') {
        const max = Number(ch);
        bricks.push({ col, row, hp: max, max, steel: false });
      }
    }
  });
  return bricks;
}

/** True when nothing breakable is left. */
export const isCleared = (bricks: readonly Brick[]): boolean => bricks.every((b) => b.steel);
