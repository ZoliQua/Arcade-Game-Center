import type { PowerUpKind } from '../logic/types';

/** Row colours (top → bottom); vivid enough to read on both themes. */
export const ROW_COLORS: readonly string[] = [
  '#ef4c55',
  '#ff7a59',
  '#f4b860',
  '#e8d44d',
  '#42d392',
  '#4fd1c5',
  '#4aa8ff',
  '#6b8cff',
  '#b37dff',
];

/** Dental mode: tartar shades (deep → pale, top → bottom); the row marks add shape cues. */
export const TARTAR_COLORS: readonly string[] = [
  '#c98f3c',
  '#d69d48',
  '#e1ad57',
  '#eabd68',
  '#f0cb7a',
  '#f2d68f',
  '#efdea6',
  '#e9e1bc',
  '#e2dfcd',
];

/** Dental mode: the mark drawn on each brick cycles by column (and row) — three different shapes. */
export const BRICK_MARKS = ['brush', 'paste', 'probe'] as const;
export type BrickMark = (typeof BRICK_MARKS)[number];
export const brickMark = (col: number, row: number): BrickMark => BRICK_MARKS[(col + row) % BRICK_MARKS.length];

/** Capsule letter and colour; the names live in `i18n.ts` (`POWERUP_KEY`). */
export const POWERUP_INFO: Record<PowerUpKind, { letter: string; color: string }> = {
  wide: { letter: 'W', color: '#4aa8ff' },
  multi: { letter: 'M', color: '#b37dff' },
  slow: { letter: 'S', color: '#42d392' },
  catch: { letter: 'C', color: '#f4b860' },
  life: { letter: '+', color: '#ef4c55' },
};
