import { useState, type CSSProperties } from 'react';
import {
  formatClock,
  formatSavedAt,
  prefersReducedMotion,
  summarize,
  useInView,
  type ArcadeGameId,
  type GameStats,
  type SessionMeta,
} from '@arcade/kit';
import { GAMES, type PortalGame, type Route } from '@arcade/ui';
import { GAME_MODULES } from './games';

type LandingProps = {
  navigate: (route: Route) => void;
  stats: Record<ArcadeGameId, GameStats>;
  sessions: Partial<Record<ArcadeGameId, SessionMeta>>;
};

export function Landing({ navigate, stats, sessions }: LandingProps) {
  const totals = summarize(stats);
  const saved = GAMES.filter((g) => sessions[g.id]);
  const play = (id: ArcadeGameId) => navigate({ view: 'play', gameId: id });

  return (
    <>
      <section className="landing__hero">
        <div>
          <h1>Ten classics, one home.</h1>
          <p>
            Pick a game — every card below is the real game playing itself. Runs autosave, so you can
            leave mid-game and continue later; best scores and play time follow you across sessions.
          </p>
        </div>
        <dl className="landing__hero-stats">
          <div className="stat-card">
            <dt>Games played</dt>
            <dd>{totals.plays.toLocaleString()}</dd>
          </div>
          <div className="stat-card">
            <dt>Total score</dt>
            <dd>{totals.totalScore.toLocaleString()}</dd>
          </div>
          <div className="stat-card">
            <dt>Time played</dt>
            <dd>{formatClock(totals.totalSeconds)}</dd>
          </div>
        </dl>
      </section>

      {saved.length > 0 && (
        <section aria-labelledby="continue-head">
          <div className="section-head">
            <h2 id="continue-head">Continue where you left off</h2>
            <span>{saved.length} saved {saved.length === 1 ? 'run' : 'runs'}</span>
          </div>
          <div className="continue">
            {saved.map((g) => {
              const s = sessions[g.id]!;
              return (
                <button
                  key={g.id}
                  type="button"
                  className="continue__item"
                  style={{ '--game-color': g.color } as CSSProperties}
                  onClick={() => play(g.id)}
                >
                  <span className="game-card__icon">
                    <g.Icon size={16} />
                  </span>
                  <span>
                    <strong>{g.name}</strong>
                    <small>
                      {s.score.toLocaleString()} pts · {formatClock(s.seconds)} · {formatSavedAt(s.savedAt)}
                    </small>
                  </span>
                  <span className="arc-btn arc-btn--primary">Continue</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="games-head">
        <div className="section-head">
          <h2 id="games-head">Games</h2>
          <span>{GAMES.length} available · keyboard-first</span>
        </div>
        <div className="cards">
          {GAMES.map((g) => (
            <GameCard key={g.id} game={g} stats={stats[g.id]} saved={sessions[g.id]} onPlay={() => play(g.id)} />
          ))}
        </div>
      </section>
    </>
  );
}

function GameCard({
  game,
  stats,
  saved,
  onPlay,
}: {
  game: PortalGame;
  stats: GameStats;
  saved?: SessionMeta;
  onPlay: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [previewRef, inView] = useInView<HTMLDivElement>();
  // Demos run whenever the card is on screen; with reduced motion only on hover/focus.
  const active = inView && (hover || !prefersReducedMotion());
  const { Demo } = GAME_MODULES[game.id];

  return (
    <article
      className="game-card"
      style={{ '--game-color': game.color } as CSSProperties}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={onPlay}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Play ${game.name}${saved ? ' — continue saved run' : ''}`}
    >
      <div className="game-card__preview" ref={previewRef}>
        {saved && <span className="game-card__saved">Saved run</span>}
        <Demo active={active} />
      </div>
      <div className="game-card__body">
        <div className="game-card__title-row">
          <div>
            <span className="game-card__icon">
              <game.Icon size={16} />
            </span>
            <span className="game-card__title">{game.name}</span>
          </div>
          <span className="game-card__chip">{game.tag}</span>
        </div>
        <p className="game-card__desc">{game.tagline}</p>
        <div className="game-card__meta">
          <span>
            Best <strong>{stats.best.toLocaleString()}</strong>
          </span>
          <span>
            Plays <strong>{stats.plays.toLocaleString()}</strong>
          </span>
          <span style={{ flex: 1 }} />
          <span>{saved ? 'Continue →' : 'Play →'}</span>
        </div>
      </div>
    </article>
  );
}
