import { readString, writeString } from '../arcade';
import type { DealState } from '../engine';

export type Speed = 'slow' | 'normal' | 'fast';
export const SPEEDS: readonly Speed[] = ['slow', 'normal', 'fast'];
export const SPEED_KEY = 'ulti.speed';

/** Multiplier on every bot delay (Normal = 1), as in Texas Hold'em. */
export const SPEED_FACTOR: Readonly<Record<Speed, number>> = { slow: 1.6, normal: 1, fast: 0.45 };

/** Visible thinking time of a bot at Normal speed. */
export const BID_DELAY_MS = 1000;
export const PLAY_DELAY_MS = 750;
/** A finished trick stays on the table this long before the next lead. */
export const TRICK_PAUSE_MS = 1300;

export function readSpeed(): Speed {
  const v = readString(SPEED_KEY);
  return SPEEDS.includes(v as Speed) ? (v as Speed) : 'normal';
}

export const writeSpeed = (s: Speed): void => void writeString(SPEED_KEY, s);

/** How long the bot on turn waits before it moves (Normal speed). */
export function botDelay(deal: DealState): number {
  const last = deal.log[deal.log.length - 1];
  if (last?.type === 'trick' || last?.type === 'over') return TRICK_PAUSE_MS;
  return deal.phase === 'play' ? PLAY_DELAY_MS : BID_DELAY_MS;
}
