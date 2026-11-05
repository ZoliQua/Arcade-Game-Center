import { emit, readString, writeString } from './storage';

/**
 * Dental mode: one shared, presentation-only preference (`arcade.dental`,
 * `'1'` / `'0'`, default off) that re-skins every game with teeth, brushes and
 * toothpaste. It never changes rules, scores, stats keys or save formats.
 */

export const DENTAL_KEY = 'arcade.dental';
export const DENTAL_EVENT = 'arcade:dental';

export function readDental(): boolean {
  return readString(DENTAL_KEY) === '1';
}

/** Mirror the preference on `<html data-dental>` so CSS can react to it. */
export function markDental(on: boolean): void {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-dental', on ? 'on' : 'off');
}

/** Persist dental mode and notify every listener on the page. */
export function applyDental(on: boolean): void {
  writeString(DENTAL_KEY, on ? '1' : '0');
  markDental(on);
  emit(DENTAL_EVENT, on);
}
