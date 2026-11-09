import { memo, type PointerEvent as ReactPointerEvent } from 'react';
import { formatNumber, useDental, useLang, useMessages } from '../arcade';
import { bannerText, MESSAGES } from '../i18n';
import { BALL_R, BANNER_MS, DROP_H, DROP_W, FIELD_H, FIELD_W, PADDLE_H, PADDLE_Y, paddleWidth } from '../logic/constants';
import { awaitingLaunch, brickRect } from '../logic/game';
import type { Brick, GameState } from '../logic/types';
import { brickMark, POWERUP_INFO, ROW_COLORS, TARTAR_COLORS, type BrickMark } from './palette';
import styles from './Playfield.module.css';

const GAP = 1.5;

/** Dental mode: a small dark mark centred on a tartar brick — brush, paste blob or probe (three shapes). */
function BrickMarkShape({ mark, cx, cy }: { mark: BrickMark; cx: number; cy: number }) {
  if (mark === 'brush') {
    return (
      <g className={styles.markFill} data-testid="breakout-brick-mark" data-mark="brush">
        <rect x={cx - 10} y={cy + 0.5} width={15} height={2.4} rx={1.2} />
        <rect x={cx + 4} y={cy - 0.2} width={7} height={3.1} rx={0.8} />
        <path d={`M${cx + 5} ${cy - 3.6}v3.2M${cx + 7.5} ${cy - 3.6}v3.2M${cx + 10} ${cy - 3.6}v3.2`} className={styles.markLine} />
      </g>
    );
  }
  if (mark === 'paste') {
    return (
      <path
        d={`M${cx - 6} ${cy + 3}q0-5.5 6-5.5q6 0 6 5.5q-6 2.6-12 0zM${cx} ${cy - 2.5}q2.6-1.2 0.8-3.4`}
        className={styles.markFill}
        data-testid="breakout-brick-mark"
        data-mark="paste"
      />
    );
  }
  return (
    <path
      d={`M${cx - 10} ${cy + 3.2}L${cx + 4} ${cy - 1}q4-1.6 4 2.2`}
      className={styles.markLine}
      data-testid="breakout-brick-mark"
      data-mark="probe"
    />
  );
}

const BrickLayer = memo(function BrickLayer({ bricks, dental }: { bricks: readonly Brick[]; dental: boolean }) {
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
        const color = (dental ? TARTAR_COLORS : ROW_COLORS)[b.row % ROW_COLORS.length];
        const damaged = b.hp < b.max;
        return (
          <g key={`${b.col}-${b.row}`} opacity={damaged ? 0.55 + 0.45 * (b.hp / b.max) : 1}>
            <rect x={x} y={y} width={w} height={h} rx={2} fill={color} className={dental ? styles.tartar : undefined} />
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
            {dental && <BrickMarkShape mark={brickMark(b.col, b.row)} cx={x + w / 2} cy={y + h / 2 + 0.5} />}
          </g>
        );
      })}
    </g>
  );
});

/**
 * Dental-mode paddle: a toothbrush lying flat, drawn entirely inside the
 * paddle's hit box (x … x + w, PADDLE_Y … PADDLE_Y + PADDLE_H) — handle on the
 * left, head with a bristle block on the right.
 */
function Toothbrush({ x, w, className }: { x: number; w: number; className: string }) {
  const headX = x + w * 0.66;
  const headW = w * 0.34;
  const count = Math.max(4, Math.round(headW / 3.2));
  const bristles = Array.from({ length: count }, (_, i) => headX + 2 + (i * (headW - 4)) / (count - 1));
  return (
    <g className={className} data-testid="breakout-paddle-brush">
      <rect x={x} y={PADDLE_Y + 3} width={w * 0.72} height={5} rx={2.5} className={styles.brushHandle} />
      <rect x={headX} y={PADDLE_Y + 5.5} width={headW} height={4.5} rx={1.5} className={styles.brushHandle} />
      <rect x={headX + 1} y={PADDLE_Y} width={headW - 2} height={6} rx={1} className={styles.bristles} />
      <path d={bristles.map((bx) => `M${bx.toFixed(1)} ${PADDLE_Y + 0.8}v4.4`).join('')} className={styles.bristleLine} />
    </g>
  );
}

type Props = {
  state: GameState;
  /** `mini` renders the compact, non-interactive landing-page variant. */
  variant?: 'full' | 'mini';
  onPointerMove?: (e: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerDown?: (e: ReactPointerEvent<SVGSVGElement>) => void;
};

export function Playfield({ state, variant = 'full', onPointerMove, onPointerDown }: Props) {
  const t = useMessages(MESSAGES);
  const [lang] = useLang();
  const [dental] = useDental();
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
      aria-label={mini ? undefined : t('playfield', { level: formatNumber(state.level, lang), bricks: formatNumber(state.bricks.length, lang) })}
      aria-hidden={mini ? true : undefined}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      data-dental={dental ? 'true' : 'false'}
    >
      <rect x={0} y={0} width={FIELD_W} height={FIELD_H} className={styles.bg} />
      <BrickLayer bricks={state.bricks} dental={dental} />

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

      {dental ? (
        <Toothbrush
          x={state.paddleX - pw / 2}
          w={pw}
          className={`${styles.brush} ${state.effects.catchMs > 0 ? styles.paddleCatch : ''} ${
            effectsEnding(state.effects.wideMs) ? styles.blink : ''
          }`}
        />
      ) : (
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
      )}

      {state.balls.map((b, i) =>
        dental ? (
          <g key={i} data-testid="breakout-ball-paste">
            <circle cx={b.x} cy={b.y} r={BALL_R} className={`${styles.paste} ${state.effects.slowMs > 0 ? styles.ballSlow : ''}`} />
            <path d={`M${b.x - 3} ${b.y + 0.4}q1.5-1.6 3 0t3 0`} className={styles.pasteStripe} />
          </g>
        ) : (
          <circle
            key={i}
            cx={b.x}
            cy={b.y}
            r={BALL_R}
            className={`${styles.ball} ${state.effects.slowMs > 0 ? styles.ballSlow : ''}`}
          />
        ),
      )}

      {bannerOpacity > 0 && !mini && (
        <text x={FIELD_W / 2} y={FIELD_H * 0.64} className={styles.banner} opacity={bannerOpacity}>
          {bannerText(state.banner, t)}
        </text>
      )}
      {showHint && (
        <text x={FIELD_W / 2} y={FIELD_H * 0.64} className={styles.hint}>
          {t('launchHint')}
        </text>
      )}
    </svg>
  );
}
