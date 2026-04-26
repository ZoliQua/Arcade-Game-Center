type Row = {
  rank: number;
  game: string;
  score: number;
  lines: number | string;
  when: string;
};

const ROWS: Row[] = [
  { rank: 1, game: 'Tetris', score: 12480, lines: 124, when: '2 days ago' },
  { rank: 2, game: '2048', score: 4096, lines: '—', when: '4 days ago' },
  { rank: 3, game: 'Snake', score: 87, lines: '—', when: 'Yesterday' },
  { rank: 4, game: 'Tetris', score: 9760, lines: 92, when: 'Last week' },
  { rank: 5, game: 'Tetris', score: 7320, lines: 71, when: 'Last week' },
];

export function Leaderboard() {
  return (
    <div>
      <div className="section-head">
        <h2>Best runs</h2>
        <span>Personal bests across all games</span>
      </div>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 100px 1fr',
            padding: '12px 18px',
            borderBottom: '1px solid var(--panel-border)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
          }}
        >
          <span>#</span>
          <span>Game</span>
          <span>Score</span>
          <span>Lines</span>
          <span>When</span>
        </div>
        {ROWS.map((r) => (
          <div
            key={r.rank}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px 100px 1fr',
              padding: '12px 18px',
              borderBottom: '1px solid var(--panel-border)',
              fontSize: 13.5,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: r.rank === 1 ? 'var(--tetro-O)' : 'var(--text-mute)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              {r.rank}
            </span>
            <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{r.game}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
              {r.score.toLocaleString()}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              {r.lines}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>{r.when}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
