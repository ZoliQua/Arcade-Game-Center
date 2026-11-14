import { AceLayout } from './AceLayout';
import { Limb, P, SW } from './parts';

const GRAPES: [number, number][] = [
  [41, 60], [50, 60], [59, 60],
  [36.5, 68], [45.5, 68], [54.5, 68], [63.5, 68],
  [41, 76], [50, 76], [59, 76],
  [45.5, 84], [54.5, 84],
  [50, 92],
];

/** Lobed vine leaf in local coordinates, stem at the origin. */
const VINE_LEAF =
  'M0 0 C-4 -2 -10 -2 -12 -7 C-9 -8 -8 -11 -10 -14 C-6 -14 -4 -16 -3 -20 C-1 -17 1 -17 3 -20 C4 -16 6 -14 10 -14 C8 -11 9 -8 12 -7 C10 -2 4 -2 0 0 Z';

/** Tök ász — autumn: a bunch of grapes hanging from the vine. */
export function Osz() {
  return (
    <AceLayout season="osz" suit="tok" sky="#ead9b4">
      <path d="M10 104 Q50 96 92 104 L92 120 L10 120 Z" fill={P.brownLight} stroke={P.ink} strokeWidth={SW} />
      <Limb d="M12 48 Q36 40 52 47 Q70 54 90 44" color={P.brown} w={2.6} />
      <path d="M66 50 q5 -8 -1 -11 q-4 -1 -3 3" fill="none" stroke={P.brown} strokeWidth="0.9" strokeLinecap="round" />
      <path d={VINE_LEAF} transform="translate(30 45) rotate(-10) scale(1.1)" fill={P.olive} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d={VINE_LEAF} transform="translate(76 50) rotate(170) scale(0.95)" fill={P.ochre} stroke={P.ink} strokeWidth={SW} strokeLinejoin="round" />
      <Limb d="M51 47 Q50 52 50 56" color={P.brown} w={1.4} />
      {GRAPES.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="4.6" fill={P.plum} stroke={P.ink} strokeWidth={SW} />
          <circle cx={x - 1.5} cy={y - 1.6} r="0.9" fill={P.linen} />
        </g>
      ))}
    </AceLayout>
  );
}
