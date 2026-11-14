import { AceLayout } from './AceLayout';
import { Limb, P, SW } from './parts';

const BLOSSOMS: [number, number][] = [
  [52, 51], [71, 54], [36, 67], [76, 80], [58, 64], [85, 46], [24, 79], [45, 59],
];
const LEAVES: [number, number, number][] = [
  [30, 72, -30], [48, 66, 40], [64, 60, -20], [80, 49, 30], [70, 72, 60], [40, 63, -60],
];

function Blossom({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-2.6" rx="1.9" ry="2.6" transform={`rotate(${a})`} fill={P.linen} stroke={P.ink} strokeWidth="0.55" />
      ))}
      <circle r="1.3" fill={P.brick} stroke={P.ink} strokeWidth="0.4" />
    </g>
  );
}

/** Zöld ász — spring: a flowering branch over green hills. */
export function Tavasz() {
  return (
    <AceLayout season="tavasz" suit="zold" sky="#e6e4c4">
      <path d="M10 98 Q32 86 52 94 Q72 102 92 90 L92 120 L10 120 Z" fill={P.oliveLight} stroke={P.ink} strokeWidth={SW} />
      <path d="M10 108 Q40 100 60 108 Q78 114 92 106 L92 120 L10 120 Z" fill={P.olive} stroke={P.ink} strokeWidth={SW} />
      <Limb d="M12 86 Q36 72 54 66 Q70 61 88 44" color={P.brown} w={3} />
      <Limb d="M42 70 Q45 62 52 52" color={P.brown} w={1.6} />
      <Limb d="M62 62 Q70 72 76 80" color={P.brown} w={1.4} />
      <Limb d="M26 79 Q24 74 24 79" color={P.brown} w={1.2} />
      {LEAVES.map(([x, y, a]) => (
        <path key={`${x}-${y}`} d="M0 0 Q4.5 -3.6 10 0 Q4.5 3.6 0 0 Z" transform={`translate(${x} ${y}) rotate(${a})`} fill={P.olive} stroke={P.ink} strokeWidth="0.6" />
      ))}
      {BLOSSOMS.map(([x, y]) => (
        <Blossom key={`${x}-${y}`} x={x} y={y} />
      ))}
    </AceLayout>
  );
}
