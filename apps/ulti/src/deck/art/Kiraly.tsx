import { Hand, Head, Limb, P, Shoe, SW, type Costume } from './parts';

const O = { stroke: P.ink, strokeWidth: SW, strokeLinejoin: 'round' as const };
const ERMINE = [74, 84, 94, 104, 114, 124, 133];

/** Király: crowned and bearded, seated on his throne in an ermine-trimmed mantle, sceptre in hand. */
export function Kiraly({ costume: c }: { costume: Costume }) {
  return (
    <g data-figure="kiraly">
      {/* dais */}
      <rect x="14" y="144" width="72" height="7" fill={P.stockShade} {...O} />
      <path d="M26 144 V151 M38 144 V151 M50 144 V151 M62 144 V151 M74 144 V151" stroke={P.ink} strokeWidth="0.6" />
      {/* throne: back with finials, seat, legs */}
      <rect x="26" y="112" width="5" height="32" fill={P.brown} {...O} />
      <rect x="69" y="112" width="5" height="32" fill={P.brown} {...O} />
      <rect x="29" y="44" width="42" height="66" rx="2" fill={P.brown} {...O} />
      <rect x="33" y="48" width="34" height="56" rx="1.5" fill={P.brownLight} {...O} />
      <circle cx="29" cy="43" r="3.2" fill={P.ochre} {...O} />
      <circle cx="71" cy="43" r="3.2" fill={P.ochre} {...O} />
      <rect x="24" y="104" width="52" height="8" rx="1.5" fill={P.brown} {...O} />
      <Shoe x={44} y={143} dir={-1} />
      <Shoe x={56} y={143} dir={1} />
      {/* mantle over the knees, ermine front band and collar */}
      <path d="M38 64 Q50 60 62 64 L70 102 L72 138 Q50 142 28 138 L30 102 Z" fill={c.main} {...O} />
      <path d="M30.5 103 Q50 97 69.5 103" fill="none" stroke={P.ink} strokeWidth="0.8" />
      <rect x="46" y="66" width="8" height="74" fill={P.linen} {...O} />
      {ERMINE.map((y, i) => (
        <path key={y} d={`M${i % 2 ? 51.4 : 47.6} ${y} l1 0 l-0.5 2.6 z`} fill={P.ink} stroke={P.ink} strokeWidth="0.6" />
      ))}
      <path d="M38 64 Q50 70 62 64 L62 68.5 Q50 75 38 68.5 Z" fill={P.linen} {...O} />
      {/* sceptre with a ball and cross */}
      <Limb d="M67 40 L61.5 104" color={P.ochre} w={1.8} />
      <circle cx="67.2" cy="37" r="3" fill={P.ochre} {...O} />
      <path d="M67.4 34 V28 M65 30.5 H69.8" stroke={P.ink} strokeWidth="1.2" strokeLinecap="round" />
      {/* arms: left hand on the knee, right hand on the sceptre */}
      <Limb d="M39 67 Q33 84 40 98" color={c.trim} w={6.5} />
      <Hand x={41} y={99} />
      <Limb d="M61 67 Q68 80 63 90" color={c.trim} w={6.5} />
      <Hand x={63} y={91} r={2.8} />
      <Head x={50} y={52} beard={P.brownLight} long />
      {/* crown */}
      <path d="M41 45 L41 34 L44.5 39 L48 32 L50 37.5 L52 32 L55.5 39 L59 34 L59 45 Z" fill={P.ochre} {...O} />
      <rect x="41" y="42" width="18" height="3.6" fill={P.ochreLight} {...O} />
      {[45, 50, 55].map((x) => (
        <circle key={x} cx={x} cy="43.8" r="0.95" fill={P.brick} />
      ))}
    </g>
  );
}
