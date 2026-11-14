import type { ReactNode } from 'react';
import { formatNumber, PasteDrop, useDental, useIsTouch, useKitMessages, useLang, useMessages, type RulesSection } from './arcade';
import { LEVEL_CLEAR_BONUS, MAX_BOUNCE_ANGLE, MAX_LIVES, POWERUP_POINTS, ROW_POINTS, START_LIVES } from './logic/constants';
import { MESSAGES } from './i18n';

const PADDLE_Y = 112;
const PADDLE_X = 60;
const PADDLE_W = 180;
const HITS = [
  { x: 84, angle: -MAX_BOUNCE_ANGLE },
  { x: 150, angle: 0 },
  { x: 216, angle: MAX_BOUNCE_ANGLE },
] as const;
const REACH = 62;
const BALL_Y = PADDLE_Y - 8;

/** Arrow from (x, y) pointing at `angle` radians from vertical (negative = left), with a two-stroke head. */
function Arrow({ x, y, angle }: { x: number; y: number; angle: number }) {
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const tx = x + dx * REACH;
  const ty = y + dy * REACH;
  const head = (turn: number) => {
    const a = Math.atan2(dy, dx) + Math.PI + turn;
    return `M${tx.toFixed(1)} ${ty.toFixed(1)}l${(Math.cos(a) * 8).toFixed(1)} ${(Math.sin(a) * 8).toFixed(1)}`;
  };
  return (
    <path
      d={`M${x} ${y}L${tx.toFixed(1)} ${ty.toFixed(1)}${head(0.45)}${head(-0.45)}`}
      fill="none"
      stroke="var(--text)"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Rules diagram: the ball falls straight down; where it meets the paddle sets the angle (centre = straight up, edge = 60°). */
export function BounceDiagram() {
  const m = useMessages(MESSAGES);
  const [lang] = useLang();
  const [dental] = useDental();
  const deg = Math.round((MAX_BOUNCE_ANGLE * 180) / Math.PI);
  const labels = [m('rulesDiagramEdge'), m('rulesDiagramCentre'), m('rulesDiagramEdge')];
  return (
    <svg
      viewBox="0 0 300 162"
      role="img"
      aria-label={m('rulesDiagramLabel', { angle: formatNumber(deg, lang) })}
      style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block', margin: '8px auto' }}
    >
      {dental ? (
        <g>
          <rect x={PADDLE_X} y={PADDLE_Y + 3} width={PADDLE_W * 0.72} height={6} rx={3} fill="var(--arc-brush-handle, #6b8cff)" stroke="var(--text)" strokeWidth={1.5} />
          <rect x={PADDLE_X + PADDLE_W * 0.66} y={PADDLE_Y} width={PADDLE_W * 0.34} height={10} rx={2} fill="var(--arc-paste, #e9f6ff)" stroke="var(--text)" strokeWidth={1.5} />
        </g>
      ) : (
        <rect x={PADDLE_X} y={PADDLE_Y} width={PADDLE_W} height={10} rx={5} fill="var(--game-breakout, var(--accent))" stroke="var(--text)" strokeWidth={1.5} />
      )}
      {HITS.map((h, i) => (
        <g key={h.x}>
          <path d={`M${h.x} 14V${BALL_Y - 8}`} stroke="var(--text)" strokeWidth={1.5} strokeDasharray="4 3" fill="none" />
          {dental ? (
            <g transform={`translate(${h.x - 7} ${BALL_Y - 10})`}>
              <PasteDrop size={14} />
            </g>
          ) : (
            <circle cx={h.x} cy={BALL_Y} r={5} fill="var(--text)" />
          )}
          <Arrow x={h.x} y={BALL_Y - 6} angle={h.angle} />
          <text x={h.x} y={PADDLE_Y + 28} fontSize="12" fill="var(--text)" textAnchor="middle">
            {labels[i]}
          </text>
          <text x={h.x} y={PADDLE_Y + 42} fontSize="12" fontWeight="700" fill="var(--text)" textAnchor="middle">
            {formatNumber(Math.round((Math.abs(h.angle) * 180) / Math.PI), lang)}°
          </text>
        </g>
      ))}
    </svg>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- the diagram and its hook belong together
export function useRulesSections(): RulesSection[] {
  const m = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const touch = useIsTouch();
  const num = (n: number) => formatNumber(n, lang);
  const ios = typeof navigator !== 'undefined' && /iP(hone|od)/.test(navigator.userAgent);
  const mobile: ReactNode = (
    <ul>
      <li>{m('rulesMobileDrag')}</li>
      <li>{m('rulesMobileTap')}</li>
      <li>{m('rulesMobileFs')}</li>
      {ios && <li>{k('iosHomeScreenTip')}</li>}
    </ul>
  );
  return [
    {
      id: 'goal',
      body: (
        <>
          <p>{m('rulesGoal')}</p>
          <BounceDiagram />
        </>
      ),
    },
    { id: 'play', body: <p>{touch ? m('rulesPlayTouch') : m('rulesPlayKeys')}</p> },
    {
      id: 'rules',
      body: (
        <ul>
          <li>{m('rulesRulesLives', { lives: num(START_LIVES), maxLives: num(MAX_LIVES) })}</li>
          <li>{m('rulesRulesBricks')}</li>
          <li>{m('rulesRulesPowerUps')}</li>
          <li>{m('rulesRulesPause')}</li>
        </ul>
      ),
    },
    {
      id: 'scoring',
      body: (
        <p>
          {m('rulesScoringText', {
            rows: ROW_POINTS.map(num).join(', '),
            pu: num(POWERUP_POINTS),
            clear: num(LEVEL_CLEAR_BONUS),
          })}
        </p>
      ),
    },
    { id: 'dental', body: <p>{m('rulesDentalText')}</p> },
    { id: 'mobile', body: mobile },
  ];
}
