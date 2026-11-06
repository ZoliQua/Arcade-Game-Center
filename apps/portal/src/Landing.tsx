import { useState, type CSSProperties } from 'react';
import {
  formatClock,
  formatNumber,
  formatSavedAt,
  gameName,
  gameTagline,
  prefersReducedMotion,
  summarize,
  useInView,
  useKitMessages,
  useLang,
  useMessages,
  type ArcadeGameId,
  type GameStats,
  type SessionMeta,
} from '@arcade/kit';
import { GAMES, type PortalGame, type Route } from '@arcade/ui';
import { GAME_MODULES } from './games';
import { PORTAL_MESSAGES, tagLabel } from './i18n';

type LandingProps = {
  navigate: (route: Route) => void;
  stats: Record<ArcadeGameId, GameStats>;
  sessions: Partial<Record<ArcadeGameId, SessionMeta>>;
};

export function Landing({ navigate, stats, sessions }: LandingProps) {
  const [lang] = useLang();
  const t = useMessages(PORTAL_MESSAGES);
  const totals = summarize(stats);
  const saved = GAMES.filter((g) => sessions[g.id]);
  const play = (id: ArcadeGameId) => navigate({ view: 'play', gameId: id });

  return (
    <>
      <section className="landing__hero">
        <div>
          <h1>{t('heroTitle')}</h1>
          <p>{t('heroBody')}</p>
        </div>
        <dl className="landing__hero-stats">
          <div className="stat-card">
            <dt>{t('gamesPlayed')}</dt>
            <dd>{formatNumber(totals.plays, lang)}</dd>
          </div>
          <div className="stat-card">
            <dt>{t('totalScore')}</dt>
            <dd>{formatNumber(totals.totalScore, lang)}</dd>
          </div>
          <div className="stat-card">
            <dt>{t('timePlayed')}</dt>
            <dd>{formatClock(totals.totalSeconds)}</dd>
          </div>
        </dl>
      </section>

      {saved.length > 0 && (
        <section aria-labelledby="continue-head">
          <div className="section-head">
            <h2 id="continue-head">{t('continueHead')}</h2>
            <span>{t(saved.length === 1 ? 'savedRunsOne' : 'savedRunsMany', { n: saved.length })}</span>
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
                    <strong>{gameName(g.id, lang)}</strong>
                    <small>
                      {t('savedLine', {
                        score: formatNumber(s.score, lang),
                        time: formatClock(s.seconds),
                        ago: formatSavedAt(s.savedAt, Date.now(), lang),
                      })}
                    </small>
                  </span>
                  <span className="arc-btn arc-btn--primary">{t('continue')}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="games-head">
        <div className="section-head">
          <h2 id="games-head">{t('gamesHead')}</h2>
          <span>{t('gamesCount', { n: GAMES.length })}</span>
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
  const [lang] = useLang();
  const t = useMessages(PORTAL_MESSAGES);
  const kit = useKitMessages();
  const name = gameName(game.id, lang);
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
      aria-label={t(saved ? 'playAriaSaved' : 'playAria', { name })}
    >
      <div className="game-card__preview" ref={previewRef}>
        {saved && <span className="game-card__saved">{t('savedBadge')}</span>}
        <Demo active={active} />
      </div>
      <div className="game-card__body">
        <div className="game-card__title-row">
          <div>
            <span className="game-card__icon">
              <game.Icon size={16} />
            </span>
            <span className="game-card__title">{name}</span>
          </div>
          <span className="game-card__chip">{tagLabel(game.tag, lang)}</span>
        </div>
        <p className="game-card__desc">{gameTagline(game.id, lang)}</p>
        <div className="game-card__meta">
          <span>
            {kit('best')} <strong>{formatNumber(stats.best, lang)}</strong>
          </span>
          <span>
            {kit('plays')} <strong>{formatNumber(stats.plays, lang)}</strong>
          </span>
          <span style={{ flex: 1 }} />
          <span>{saved ? t('continueCta') : t('playCta')}</span>
        </div>
      </div>
    </article>
  );
}
