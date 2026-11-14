import type { ReactNode } from 'react';

/**
 * Shared drawing kit for the Hungarian deck (after the public-domain 1835 Schneider József design).
 * Card space is 100 × 160. Flat shapes with dark-brown outlines (woodcut feel), muted period palette.
 */
export const W = 100;
export const H = 160;

export const P = {
  stock: '#f3e7c9',
  stockShade: '#e6d5ac',
  ink: '#2e1d12',
  brick: '#b0452f',
  brickDark: '#7d2e1f',
  ochre: '#c99a34',
  ochreLight: '#e2bf6a',
  olive: '#6b7a36',
  oliveLight: '#a2a663',
  oliveDark: '#4b5726',
  brown: '#6e4527',
  brownLight: '#9b6a3e',
  skin: '#ecca9f',
  linen: '#faf3df',
  steel: '#9a9a8c',
  plum: '#5e3446',
  sky: '#e9dfc3',
  snow: '#fbf8ef',
} as const;

/** Outline width for every flat shape. */
export const SW = 1.1;

/** A costume per suit: each suit's figures wear their own colours. */
export type Costume = { main: string; trim: string; hose: string; hat: string; feather: string };

/** Inner frame: the drawable area is 7..93 × 7..153. */
export function Frame({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect x="1" y="1" width="98" height="158" rx="7" fill={P.stock} stroke={P.ink} strokeWidth="1.4" />
      <rect x="5" y="5" width="90" height="150" rx="3.5" fill="none" stroke={P.ink} strokeWidth="0.9" />
      <rect x="6.6" y="6.6" width="86.8" height="146.8" rx="2.6" fill="none" stroke={P.brown} strokeWidth="0.35" />
      {children}
    </>
  );
}

/** Ribbon banner with folded tails, for the season name on the aces. */
export function Banner({ y, text }: { y: number; text: string }) {
  const t = `translate(0 ${y})`;
  return (
    <g transform={t}>
      <path d="M10 3 L20 3 L20 15 L10 15 L14 9 Z" fill={P.brickDark} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M90 3 L80 3 L80 15 L90 15 L86 9 Z" fill={P.brickDark} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M17 0 Q50 -3 83 0 L83 13 Q50 10 17 13 Z" fill={P.linen} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M17 13 L20 15 L20 12.6 Z M83 13 L80 15 L80 12.6 Z" fill={P.ink} />
      <text
        data-banner=""
        x="50"
        y="9.4"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="8"
        letterSpacing="1.2"
        fill={P.ink}
      >
        {text}
      </text>
    </g>
  );
}

/** A limb or staff drawn as a coloured stroke inside a dark outline. */
export function Limb({ d, color, w }: { d: string; color: string; w: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={P.ink} strokeWidth={w + SW * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export function Hand({ x, y, r = 2.6 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={P.skin} stroke={P.ink} strokeWidth={SW} />;
}

/** Head with eyes and a mustache; `beard` adds a full beard in that colour. */
export function Head({ x, y, r = 8, beard, long = false }: { x: number; y: number; r?: number; beard?: string; long?: boolean }) {
  const k = r / 8;
  const b = long
    ? `M${x - 7 * k} ${y + 1} Q${x - 7 * k} ${y + 15 * k} ${x} ${y + 19 * k} Q${x + 7 * k} ${y + 15 * k} ${x + 7 * k} ${y + 1} Q${x} ${y + 6 * k} ${x - 7 * k} ${y + 1} Z`
    : `M${x - 7 * k} ${y + 1} Q${x - 6 * k} ${y + 10 * k} ${x} ${y + 12 * k} Q${x + 6 * k} ${y + 10 * k} ${x + 7 * k} ${y + 1} Q${x} ${y + 5 * k} ${x - 7 * k} ${y + 1} Z`;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={P.skin} stroke={P.ink} strokeWidth={SW} />
      {beard ? <path d={b} fill={beard} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" /> : null}
      <circle cx={x - 2.8 * k} cy={y - 1.6 * k} r={0.85 * k} fill={P.ink} />
      <circle cx={x + 2.8 * k} cy={y - 1.6 * k} r={0.85 * k} fill={P.ink} />
      <path d={`M${x} ${y - 0.8 * k} l-0.9 ${2.6 * k} h1.4`} fill="none" stroke={P.ink} strokeWidth={0.6} />
      <path
        d={`M${x - 3.6 * k} ${y + 3.6 * k} Q${x - 1.5 * k} ${y + 2.4 * k} ${x} ${y + 3.2 * k} Q${x + 1.5 * k} ${y + 2.4 * k} ${x + 3.6 * k} ${y + 3.6 * k}`}
        fill="none"
        stroke={beard ? P.ink : P.brown}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Grassy ground strip with woodcut hatching, under the standing figures. */
export function Ground() {
  return (
    <g>
      <path d="M9 143 Q50 136 91 143 L91 151 L9 151 Z" fill={P.olive} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path
        d="M16 146 l3 -3 M26 145 l3 -3 M38 144 l3 -3 M62 144 l3 -3 M74 145 l3 -3 M84 146 l3 -3 M20 149 l3 -3 M80 149 l3 -3"
        stroke={P.oliveDark}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Low shoe, toe pointing outwards (`dir` −1 left, 1 right); (x, y) is the middle of the sole. */
export function Shoe({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
  return (
    <path
      d={`M${x - dir * 3.4} ${y} L${x - dir * 3.4} ${y - 2.8} Q${x + dir * 2} ${y - 3.4} ${x + dir * 6} ${y} Z`}
      fill={P.ink}
      stroke={P.ink}
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
  );
}
