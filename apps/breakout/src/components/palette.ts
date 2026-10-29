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

export const POWERUP_INFO: Record<PowerUpKind, { letter: string; label: string; color: string }> = {
  wide: { letter: 'W', label: 'Wide paddle', color: '#4aa8ff' },
  multi: { letter: 'M', label: 'Multiball', color: '#b37dff' },
  slow: { letter: 'S', label: 'Slow ball', color: '#42d392' },
  catch: { letter: 'C', label: 'Catch', color: '#f4b860' },
  life: { letter: '+', label: 'Extra life', color: '#ef4c55' },
};
