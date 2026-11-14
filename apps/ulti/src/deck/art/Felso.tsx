import { Ground, Hand, Head, Limb, P, Shoe, SW, type Costume } from './parts';

const O = { stroke: P.ink, strokeWidth: SW, strokeLinejoin: 'round' as const };

/** Felső: a tall standing Tell-story man in slashed doublet and feathered hat, the halberd raised in his right hand. */
export function Felso({ costume: c }: { costume: Costume }) {
  return (
    <g data-figure="felso">
      <Ground />
      {/* halberd: shaft, spike, axe blade, back hook */}
      <Limb d="M75 22 L75 147" color={P.brown} w={1.8} />
      <path d="M75 9 L77.6 23 L72.4 23 Z" fill={P.steel} {...O} />
      <path d="M76 24 C84 22 88 28 87 36 C83 32 79 32 76 33 Z" fill={P.steel} {...O} />
      <path d="M74 25 L67 27.5 L74 31 Z" fill={P.steel} {...O} />
      {/* legs */}
      <Limb d="M45.5 106 L44 140" color={c.hose} w={6} />
      <Limb d="M54.5 106 L56 140" color={c.hose} w={6} />
      <Shoe x={44} y={143} dir={-1} />
      <Shoe x={56} y={143} dir={1} />
      {/* sword at the left hip */}
      <Limb d="M38 92 L27 124" color={P.steel} w={1.8} />
      <path d="M34 89 L42 95" stroke={P.ink} strokeWidth="2.2" strokeLinecap="round" />
      {/* doublet with slashed panels, belt and buckle */}
      <path d="M38 62 Q50 58 62 62 L67 109 Q50 113 33 109 Z" fill={c.main} {...O} />
      <path d="M44 64 L41 108 M50 62 L50 111 M56 64 L59 108" stroke={c.trim} strokeWidth="1.6" />
      <path d="M36.6 86 Q50 89 63.4 86 L63.8 90.5 Q50 93.5 36.2 90.5 Z" fill={P.brown} {...O} />
      <rect x="47.8" y="86.8" width="4.4" height="5" fill={P.ochre} stroke={P.ink} strokeWidth="0.7" />
      {/* arms: left on the sword hilt, right raised to the halberd */}
      <Limb d="M39 65 Q32 76 36 89" color={c.main} w={6} />
      <Hand x={37} y={90} />
      <Limb d="M61 65 Q70 66 74 55" color={c.main} w={6} />
      <Hand x={75} y={53} r={2.8} />
      <ellipse cx="50" cy="61" rx="8.5" ry="3" fill={P.linen} {...O} />
      <Head x={50} y={50} beard={P.brown} />
      {/* broad hat with a big feather */}
      <path d="M44 37 C37 24 30 20 23 22 C28 26 33 31 40 40 Z" fill={c.feather} {...O} />
      <path d="M44 37 C39 29 33 25 27 23.5" fill="none" stroke={P.ink} strokeWidth="0.6" />
      <path d="M42.5 41 Q42 31 50 30 Q58 31 57.5 41 Z" fill={c.hat} {...O} />
      <path d="M42.7 37 H57.3" stroke={c.trim} strokeWidth="2" />
      <ellipse cx="50" cy="41.5" rx="14" ry="3.4" fill={c.hat} {...O} />
    </g>
  );
}
