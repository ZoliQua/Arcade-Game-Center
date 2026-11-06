import { useEffect, useState } from 'react';
import { ARCADE_GAMES, formatNumber, gameName, useLang, useMessages, type Lang } from '@arcade/kit';
import { pt, PORTAL_MESSAGES } from './i18n';
import {
  apiConfigured,
  fetchAllLeaderboards,
  type GameId,
  type LeaderboardEntry,
} from './services/api';

const ORDER: GameId[] = ARCADE_GAMES.map((g) => g.id);

type LeaderboardData = Record<GameId, LeaderboardEntry[]>;
const EMPTY = Object.fromEntries(ORDER.map((id) => [id, []])) as unknown as LeaderboardData;

function fmtRelative(at: string, lang: Lang): string {
  // API v2 sends ISO-8601 UTC; v1 sent 'YYYY-MM-DD HH:MM:SS' (UTC).
  const t = new Date(at.includes('T') ? at : at.replace(' ', 'T') + 'Z').getTime();
  if (Number.isNaN(t)) return at;
  const diffSec = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (diffSec < 60) return pt(lang, 'agoSeconds', { n: diffSec });
  if (diffSec < 3600) return pt(lang, 'agoMinutes', { n: Math.floor(diffSec / 60) });
  if (diffSec < 86400) return pt(lang, 'agoHours', { n: Math.floor(diffSec / 3600) });
  return pt(lang, 'agoDays', { n: Math.floor(diffSec / 86400) });
}

export function Leaderboard() {
  const t = useMessages(PORTAL_MESSAGES);
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
      .catch(() => {
        if (!ctrl.signal.aborted) setStatus('error');
      });
    return () => ctrl.abort();
  }, []);

  return (
    <div>
      <div className="section-head">
        <h2>{t('lbTitle')}</h2>
        <span>
          {status === 'loading' && t('loading')}
          {status === 'ok' && t('lbOk')}
          {status === 'error' && !apiConfigured && t('lbNotConfigured')}
          {status === 'error' && apiConfigured && t('lbUnreachable')}
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
  const [lang] = useLang();
  const t = useMessages(PORTAL_MESSAGES);
  return (
    <div className="arc-panel" style={{ padding: 0, overflow: 'hidden' }}>
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
          {gameName(game, lang)}
        </span>
        <span>{entries.length === 0 ? '—' : t(entries.length === 1 ? 'entriesOne' : 'entriesMany', { n: entries.length })}</span>
      </div>

      {status === 'loading' && entries.length === 0 && (
        <div style={{ padding: '18px', color: 'var(--text-mute)', fontSize: 13 }}>
          {t('loading')}
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '18px', color: 'var(--text-mute)', fontSize: 13 }}>
          {t('unavailable')}
        </div>
      )}

      {status === 'ok' && entries.length === 0 && (
        <div style={{ padding: '18px', color: 'var(--text-mute)', fontSize: 13 }}>
          {t('noScores')}
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
            {formatNumber(row.score, lang)}
          </span>
          <span
            style={{
              color: 'var(--text-mute)',
              fontSize: 11,
              textAlign: 'right',
            }}
          >
            {fmtRelative(row.at, lang)}
          </span>
        </div>
      ))}
    </div>
  );
}
