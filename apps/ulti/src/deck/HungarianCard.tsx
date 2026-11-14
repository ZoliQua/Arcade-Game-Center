import type { CSSProperties, ReactNode } from 'react';
import type { Lang } from '../arcade';
import { hCardBackLabel, hCardLabel, pipCount, type HCard, type HRank, type HSuit } from './cards';
import { Also } from './art/Also';
import { Back } from './art/Back';
import { COSTUME } from './art/costumes';
import { Felso } from './art/Felso';
import { Kiraly } from './art/Kiraly';
import { Nyar } from './art/Nyar';
import { Osz } from './art/Osz';
import { Frame, H, P, W } from './art/parts';
import { SuitSign } from './art/SuitSign';
import { Tavasz } from './art/Tavasz';
import { Tel } from './art/Tel';

export type HungarianCardProps = {
  card: HCard;
  faceDown?: boolean;
  /** Tooth logo on the back. */
  dental?: boolean;
  /** Width in px (height follows the 100 × 160 card). */
  size?: number;
  selected?: boolean;
  className?: string;
  /** Language of the default accessible name (default en). */
  lang?: Lang;
  /** Accessible name override. */
  title?: string;
};

const L = 28;
const R = 72;
const COLS = (ys: number[]) => ys.flatMap((y) => [[L, y] as const, [R, y] as const]);
const FOUR = COLS([36, 66, 96, 126]);

/** Traditional pip layouts: two columns, extra pips on the centre line. */
const PIPS: Partial<Record<HRank, (readonly [number, number])[]>> = {
  VII: [...COLS([42, 80, 118]), [50, 61]],
  VIII: FOUR,
  IX: [...FOUR, [50, 81]],
  X: [...FOUR, [50, 51], [50, 111]],
};

const ACES: Record<HSuit, () => ReactNode> = { piros: Nyar, tok: Osz, zold: Tavasz, makk: Tel };

function Numerals({ rank }: { rank: HRank }) {
  const text = (x: number, y: number, anchor: 'start' | 'end') => (
    <text
      data-numeral=""
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily="Georgia, 'Times New Roman', serif"
      fontWeight="700"
      fontSize="8.5"
      fill={P.ink}
    >
      {rank}
    </text>
  );
  // Single-headed like the 1835 deck: both numerals read upright.
  return (
    <>
      {text(10, 17, 'start')}
      {text(W - 10, H - 10, 'end')}
    </>
  );
}

function Face({ card }: { card: HCard }) {
  const { suit, rank } = card;
  if (rank === 'asz') {
    const Ace = ACES[suit];
    return <Ace />;
  }
  if (rank === 'also' || rank === 'felso' || rank === 'kiraly') {
    const Figure = rank === 'also' ? Also : rank === 'felso' ? Felso : Kiraly;
    return (
      <>
        <Figure costume={COSTUME[suit]} />
        <g data-corner="">
          <SuitSign suit={suit} x={14.5} y={14.5} size={11} />
          <SuitSign suit={suit} x={85.5} y={14.5} size={11} />
        </g>
      </>
    );
  }
  const pips = PIPS[rank] ?? [];
  if (pips.length !== pipCount(rank)) throw new Error(`pip layout mismatch for ${rank}`);
  return (
    <>
      <Numerals rank={rank} />
      {pips.map(([x, y]) => (
        <SuitSign key={`${x}-${y}`} suit={suit} x={x} y={y} size={21} pip />
      ))}
    </>
  );
}

/** One card of the Hungarian (Tell) deck: our own redraw after the 1835 Schneider József design. */
export function HungarianCard({ card, faceDown = false, dental = false, size = 64, selected = false, className, lang = 'en', title }: HungarianCardProps) {
  const cls = ['arc-card', faceDown ? 'arc-card--down' : '', selected ? 'arc-card--selected' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  const style: CSSProperties | undefined = size > 0 ? { width: size } : undefined;
  const viewBox = `0 0 ${W} ${H}`;
  if (faceDown) {
    return (
      <svg className={cls} style={style} viewBox={viewBox} role="img" aria-label={title ?? hCardBackLabel(lang)} data-back="" data-dental={dental ? 'true' : 'false'}>
        <Back dental={dental} />
      </svg>
    );
  }
  const label = title ?? hCardLabel(card, lang);
  return (
    <svg className={cls} style={style} viewBox={viewBox} role="img" aria-label={label} data-card={`${card.suit}-${card.rank}`} data-suit={card.suit}>
      <title>{label}</title>
      <Frame />
      <Face card={card} />
    </svg>
  );
}
