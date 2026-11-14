import { Ground, Hand, Head, Limb, P, Shoe, SW, type Costume } from './parts';

const O = { stroke: P.ink, strokeWidth: SW, strokeLinejoin: 'round' as const };

/** Alsó: a smaller, younger man in a jerkin, short cape and soft cap, his sword resting on the shoulder. */
export function Also({ costume: c }: { costume: Costume }) {
  return (
    <g data-figure="also">
      <Ground />
      <g transform="translate(50 147) scale(0.88) translate(-50 -147)">
        {/* short cape behind the shoulders */}
        <path d="M37 63 Q50 60 63 63 L69 98 Q50 102 31 98 Z" fill={c.hat} {...O} />
        {/* legs */}
        <Limb d="M46 104 L44.5 140" color={c.hose} w={6} />
        <Limb d="M54 104 L55.5 140" color={c.hose} w={6} />
        <Shoe x={44.5} y={143} dir={-1} />
        <Shoe x={55.5} y={143} dir={1} />
        {/* sword on the right shoulder */}
        <Limb d="M60 79 L75 37" color={P.steel} w={2.2} />
        <path d="M56.5 74 L63.5 81" stroke={P.ink} strokeWidth="2.4" strokeLinecap="round" />
        {/* jerkin with buttons and trimmed hem */}
        <path d="M39 63 Q50 60 61 63 L64 104 Q50 108 36 104 Z" fill={c.main} {...O} />
        <path d="M36.4 100.5 Q50 104.5 63.6 100.5" fill="none" stroke={c.trim} strokeWidth="2.2" />
        <path d="M37.8 83 Q50 86 62.2 83 L62.5 87 Q50 90 37.5 87 Z" fill={P.brown} {...O} />
        {[70, 77, 93].map((y) => (
          <circle key={y} cx="50" cy={y} r="1.3" fill={P.ochre} stroke={P.ink} strokeWidth="0.6" />
        ))}
        {/* arms: left fist on the hip, right hand on the sword grip */}
        <Limb d="M40 66 Q31 76 38 84" color={c.main} w={6} />
        <Hand x={38.5} y={84.5} />
        <Limb d="M60 66 Q66 73 61 79" color={c.main} w={6} />
        <Hand x={60.5} y={79.5} />
        <path d="M43 61 Q50 64 57 61 L57 64 Q50 67 43 64 Z" fill={P.linen} {...O} />
        <Head x={50} y={51} r={7.6} />
        {/* soft round cap with a small plume */}
        <path d="M58 39 Q63 31 67 27 Q64 34 60 41 Z" fill={c.feather} {...O} />
        <path d="M41 46 Q39 36 50 35 Q62 35 61 44 Q56 42.5 50 43.5 Q45 44 41 46 Z" fill={c.hat} {...O} />
        <path d="M41.6 45 Q50 41.6 60.6 43.4" fill="none" stroke={c.trim} strokeWidth="1.6" />
      </g>
    </g>
  );
}
