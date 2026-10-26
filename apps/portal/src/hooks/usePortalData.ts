import { useEffect, useState } from 'react';
import {
  ARCADE_GAMES,
  peekSession,
  readAllStats,
  subscribeSessions,
  subscribeStats,
  type ArcadeGameId,
  type GameStats,
  type SessionMeta,
} from '@arcade/kit';

/** Stats of every game, live-updated when any game records a run. */
export function useAllStats(): Record<ArcadeGameId, GameStats> {
  const [stats, setStats] = useState(() => readAllStats());
  useEffect(() => subscribeStats(() => setStats(readAllStats())), []);
  return stats;
}

function readSessions(): Partial<Record<ArcadeGameId, SessionMeta>> {
  const out: Partial<Record<ArcadeGameId, SessionMeta>> = {};
  for (const g of ARCADE_GAMES) {
    const meta = peekSession(g.id);
    if (meta) out[g.id] = meta;
  }
  return out;
}

/** Saved in-progress runs ("Continue where you left off"). */
export function useSavedSessions(): Partial<Record<ArcadeGameId, SessionMeta>> {
  const [sessions, setSessions] = useState(readSessions);
  useEffect(() => subscribeSessions(() => setSessions(readSessions())), []);
  return sessions;
}
