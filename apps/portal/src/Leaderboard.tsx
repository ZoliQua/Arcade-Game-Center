import { useEffect, useState } from 'react';
import {
  apiConfigured,
  fetchAllLeaderboards,
  type GameId,
  type LeaderboardEntry,
} from './services/api';

const GAME_LABEL: Record<GameId, string> = {
  tetris: 'Tetris',
  snake: 'Snake',
  '2048': '2048',
  pacman: 'Pac-Man',
};

const ORDER: GameId[] = ['tetris', 'snake', '2048', 'pacman'];

type LeaderboardData = Record<GameId, LeaderboardEntry[]>;
const EMPTY: LeaderboardData = { tetris: [], snake: [], '2048': [], pacman: [] };

function fmtRelative(at: string): string {
  const t = new Date(at.replace(' ', 'T') + 'Z').getTime();
  if (Number.isNaN(t)) return at;
  const diffSec = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardData>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  useEffect(() => {
    if (!apiConfigured) {
      setStatus('error');
      return;
    }
    const ctrl = new AbortController();
    setStatus('loading');
    fetchAllLeaderboards(ctrl.signal)
      .then((d) => {
        setData(d);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
    return () => ctrl.abort();
  }, []);

  return (
    <div>
      <div className="section-head">
        <h2>Best runs</h2>
        <span>
          {status === 'loading' && 'Loading…'}
          {status === 'ok' && 'Top 10 per game · global'}
          {status === 'error' && !apiConfigured && 'Leaderboard server not configured'}
          {status === 'error' && apiConfigured && 'Could not reach leaderboard server'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {ORDER.map((g) => (
          <GameLeaderboard key={g} game={g} entries={data[g]} status={status} />
        ))}
      </div>
    </div>
  );
}

type GameLeaderboardProps = {
  game: GameId;
  entries: LeaderboardEntry[];
  status: 'idle' | 'loading' | 'ok' | 'error';
};

function GameLeaderboard({ game, entries, status }: GameLeaderboardProps) {
  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--panel-border)',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-mute)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'var(--text-strong)', fontWeight: 600 }}>
          {GAME_LABEL[game]}
        </span>
        <span>{entries.length === 0 ? '—' : `${entries.length} entries`}</span>
      </div>

      {status === 'loading' && entries.length === 0 && (
        <div style={{ padding: '18px', color: 'var(--text-mute)', fontSize: 13 }}>
          Loading…
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '18px', color: 'var(--text-mute)', fontSize: 13 }}>
          Unavailable.
        </div>
      )}

      {status === 'ok' && entries.length === 0 && (
        <div style={{ padding: '18px', color: 'var(--text-mute)', fontSize: 13 }}>
          No scores yet — be the first.
        </div>
      )}

      {entries.map((row, i) => (
        <div
          key={`${row.name}-${row.score}-${row.at}`}
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 100px 80px',
            padding: '10px 18px',
            borderBottom: '1px solid var(--panel-border)',
            fontSize: 13,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: i === 0 ? 'var(--tetro-O)' : 'var(--text-mute)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            {i + 1}
          </span>
          <span style={{ color: 'var(--text-strong)' }}>{row.name}</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-strong)',
              textAlign: 'right',
            }}
          >
            {row.score.toLocaleString()}
          </span>
          <span
            style={{
              color: 'var(--text-mute)',
              fontSize: 11,
              textAlign: 'right',
            }}
          >
            {fmtRelative(row.at)}
          </span>
        </div>
      ))}
    </div>
  );
}
