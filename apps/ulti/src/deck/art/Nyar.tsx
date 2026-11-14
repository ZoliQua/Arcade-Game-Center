import { AceLayout } from './AceLayout';
import { P, SW } from './parts';

const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
const STALKS = [18, 26, 34, 42, 50, 58, 66, 74, 82];

/** Piros ász — summer: a smiling sun over ripe wheat. */
export function Nyar() {
  return (
    <AceLayout season="nyar" suit="piros" sky="#efdfb4">
      <g transform="translate(50 56)">
        {RAYS.map((a) => (
          <path key={a} d="M-2.6 -12.5 L0 -21 L2.6 -12.5 Z" transform={`rotate(${a})`} fill={P.ochre} stroke={P.ink} strokeWidth="0.7" strokeLinejoin="round" />
        ))}
        <circle r="11" fill={P.ochreLight} stroke={P.ink} strokeWidth={SW} />
        <circle cx="-3.6" cy="-2" r="0.9" fill={P.ink} />
        <circle cx="3.6" cy="-2" r="0.9" fill={P.ink} />
        <path d="M-4 3 Q0 6.4 4 3" fill="none" stroke={P.ink} strokeWidth="0.9" strokeLinecap="round" />
      </g>
      <path d="M10 94 Q50 86 92 94 L92 120 L10 120 Z" fill={P.ochre} stroke={P.ink} strokeWidth={SW} />
      {STALKS.map((x, i) => {
        const top = 84 + (i % 2) * 5;
        return (
          <g key={x}>
            <path d={`M${x} 118 Q${x + 1} ${top + 12} ${x + 2} ${top + 6}`} fill="none" stroke={P.oliveDark} strokeWidth="0.9" />
            <ellipse cx={x + 2} cy={top} rx="1.9" ry="5" fill={P.ochreLight} stroke={P.ink} strokeWidth="0.6" />
            <path d={`M${x + 2} ${top - 5} l-1.4 -4 M${x + 2} ${top - 5} l1.4 -4`} stroke={P.ink} strokeWidth="0.5" />
          </g>
        );
      })}
    </AceLayout>
  );
}
