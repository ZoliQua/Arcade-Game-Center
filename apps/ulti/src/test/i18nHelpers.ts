/** Small helpers shared by the language and dental tests (not part of the bundle). */
import { act } from '@testing-library/react';
import { loadSession } from '../arcade';
import { isUltiSession, SESSION_SCHEMA, type UltiSession } from '../game/session';

export { applyLang, applyDental, LANGS } from '../arcade';

/** The live session through the autosave (page hide flushes it at once). */
export function isUltiSessionLoad(): UltiSession | null {
  act(() => void window.dispatchEvent(new Event('pagehide')));
  return loadSession<UltiSession>('ulti', SESSION_SCHEMA, isUltiSession)?.data ?? null;
}
