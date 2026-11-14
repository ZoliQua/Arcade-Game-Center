import { AceLayout } from './AceLayout';
import { Limb, P, SW } from './parts';

const BRANCHES = [
  'M50 82 Q40 72 30 64',
  'M50 76 Q62 66 70 54',
  'M50 72 Q48 58 52 44',
  'M34 67 Q28 58 30 50',
  'M64 61 Q74 60 81 56',
  'M51 54 Q58 48 60 41',
  'M42 75 Q32 76 24 72',
];
const SNOW_CAPS: [number, number, number][] = [
  [33, 64, -35], [64, 60, -50], [50, 49, 80], [29, 53, 70], [76, 57, -20], [58, 43, -60], [27, 72, 10],
];
const FLAKES: [number, number][] = [
  [22, 46], [34, 40], [70, 40], [80, 66], [20, 90], [40, 52], [62, 76], [76, 88], [28, 98], [56, 36], [84, 78], [44, 90],
];

/** Makk ász — winter: a bare tree in the snow. */
export function Tel() {
  return (
    <AceLayout season="tel" suit="makk" sky="#dcd9cc">
      <path d="M10 100 Q40 92 60 98 Q76 102 92 96 L92 120 L10 120 Z" fill={P.snow} stroke={P.ink} strokeWidth={SW} />
      <path d="M47 104 L49 70 L51.5 70 L54.5 104 Z" fill={P.brown} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" />
      {BRANCHES.map((d) => (
        <Limb key={d} d={d} color={P.brown} w={1.8} />
      ))}
      {SNOW_CAPS.map(([x, y, a]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3.6" ry="1.3" transform={`rotate(${a} ${x} ${y})`} fill={P.snow} stroke={P.ink} strokeWidth="0.45" />
      ))}
      {FLAKES.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill={P.snow} stroke={P.ink} strokeWidth="0.35" />
      ))}
    </AceLayout>
  );
}
