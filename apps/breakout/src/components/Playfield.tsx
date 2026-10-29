import { memo, type PointerEvent as ReactPointerEvent } from 'react';
import { BALL_R, BANNER_MS, DROP_H, DROP_W, FIELD_H, FIELD_W, PADDLE_H, PADDLE_Y, paddleWidth } from '../logic/constants';
import { awaitingLaunch, brickRect } from '../logic/game';
import type { Brick, GameState } from '../logic/types';
import { POWERUP_INFO, ROW_COLORS } from './palette';
import styles from './Playfield.module.css';

const GAP = 1.5;

const BrickLayer = memo(function BrickLayer({ bricks }: { bricks: readonly Brick[] }) {
  return (
    <g>
      {bricks.map((b) => {
        const r = brickRect(b);
        const x = r.x + GAP / 2;
        const y = r.y + GAP / 2;
        const w = r.w - GAP;
        const h = r.h - GAP;
        if (b.steel) {
          return (
            <g key={`${b.col}-${b.row}`}>
              <rect x={x} y={y} width={w} height={h} rx={2} className={styles.steel} />
              <rect x={x + 2} y={y + 2} width={w - 4} height={2} rx={1} className={styles.shine} />
            </g>
          );
        }
        const color = ROW_COLORS[b.row % ROW_COLORS.length];
        const damaged = b.hp < b.max;
        return (
          <g key={`${b.col}-${b.row}`} opacity={damaged ? 0.55 + 0.45 * (b.hp / b.max) : 1}>
            <rect x={x} y={y} width={w} height={h} rx={2} fill={color} />
            <rect x={x + 2} y={y + 2} width={w - 4} height={2} rx={1} className={styles.shine} />
            {b.max > 1 && (
              <rect
                x={x + 1.5}
                y={y + 1.5}
                width={w - 3}
                height={h - 3}
                rx={1.5}
                className={b.max === 3 ? styles.armor3 : styles.armor2}
              />
            )}
            {damaged && (
              <path
                d={`M${x + w * 0.35} ${y + 1} l3 ${h * 0.45} l-4 ${h * 0.2} l3 ${h * 0.35 - 2}`}
                className={styles.crack}
              />
            )}
          </g>
        );
      })}
    </g>
  );
});

type Props = {
  state: GameState;
  /** `mini` renders the compact, non-interactive landing-page variant. */
  variant?: 'full' | 'mini';
  onPointerMove?: (e: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerDown?: (e: ReactPointerEvent<SVGSVGElement>) => void;
};

export function Playfield({ state, variant = 'full', onPointerMove, onPointerDown }: Props) {
  const mini = variant === 'mini';
  const pw = paddleWidth(state.effects.wideMs);
  const bannerOpacity = state.bannerMs > 0 ? Math.min(1, state.bannerMs / (BANNER_MS * 0.35)) : 0;
  const showHint = !mini && state.status === 'running' && awaitingLaunch(state) && state.bannerMs <= 0;
  const effectsEnding = (ms: number) => ms > 0 && ms < 2500;

  return (
    <svg
      className={`${styles.field} ${mini ? styles.mini : ''} ${!mini && state.status === 'running' ? styles.playing : ''}`}
      viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
      preserveAspectRatio="xMidYMid meet"
      role={mini ? undefined : 'img'}
      aria-label={mini ? undefined : `Breakout playfield, level ${state.level}, ${state.bricks.length} bricks`}
      aria-hidden={mini ? true : undefined}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
    >
      <rect x={0} y={0} width={FIELD_W} height={FIELD_H} className={styles.bg} />
      <BrickLayer bricks={state.bricks} />

      {state.drops.map((d, i) => {
        const info = POWERUP_INFO[d.kind];
        return (
          <g key={i} transform={`translate(${d.x - DROP_W / 2} ${d.y - DROP_H / 2})`}>
            <rect width={DROP_W} height={DROP_H} rx={DROP_H / 2} fill={info.color} className={styles.drop} />
            <text x={DROP_W / 2} y={DROP_H / 2 + 0.5} className={styles.dropText}>
              {info.letter}
            </text>
          </g>
        );
      })}

      <rect
        x={state.paddleX - pw / 2}
        y={PADDLE_Y}
        width={pw}
        height={PADDLE_H}
        rx={PADDLE_H / 2}
        className={`${styles.paddle} ${state.effects.catchMs > 0 ? styles.paddleCatch : ''} ${
          effectsEnding(state.effects.wideMs) ? styles.blink : ''
        }`}
      />

      {state.balls.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={BALL_R}
          className={`${styles.ball} ${state.effects.slowMs > 0 ? styles.ballSlow : ''}`}
        />
      ))}

      {bannerOpacity > 0 && !mini && (
        <text x={FIELD_W / 2} y={FIELD_H * 0.64} className={styles.banner} opacity={bannerOpacity}>
          {state.banner}
        </text>
      )}
      {showHint && (
        <text x={FIELD_W / 2} y={FIELD_H * 0.64} className={styles.hint}>
          Space · click · tap to launch
        </text>
      )}
    </svg>
  );
}
