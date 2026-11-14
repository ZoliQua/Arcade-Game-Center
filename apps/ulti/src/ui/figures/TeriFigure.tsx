import { P } from '../../deck/art/parts';
import { Tooth } from '../../arcade';
import { Cameo, Features, HeadBase, Shoulders, WhiteCoat } from './parts';
import { O, WHITE, WHITE_SHADE } from './palette';

/** Teri: a woman with a braid and a flower — embroidered blouse and vest; dental: the assistant in a cap. */
export function TeriFigure({ dental, title }: { dental: boolean; title: string }) {
  return (
    <Cameo title={title} testId={dental ? 'ulti-figure-dental' : 'ulti-figure-classic'} figure="teri">
      {/* hair behind the head */}
      <path d="M26 40 Q24 20 40 19 Q56 20 54 40 L54 56 Q50 60 46 56 L34 56 Q30 60 26 56 Z" fill={P.brown} {...O} />
      {dental ? (
        <WhiteCoat collar="tunic" />
      ) : (
        <g data-outfit="blouse">
          <Shoulders fill={P.linen} />
          <path d="M14 96 L18 72 Q26 66 32 64 L36 96 Z M66 96 L62 72 Q54 66 48 64 L44 96 Z" fill={P.plum} {...O} />
          <path d="M33 61 Q40 67 47 61" fill="none" stroke={P.brick} strokeWidth="1.6" />
          {[36, 40, 44].map((x) => (
            <circle key={x} cx={x} cy={x === 40 ? 66 : 64.6} r="1.1" fill={P.brick} />
          ))}
          <path d="M37 76 l3 -3 l3 3 l-3 3 Z" fill={P.ochre} {...O} strokeWidth="0.6" />
        </g>
      )}
      <HeadBase />
      {/* centre-parted hair over the forehead */}
      <path d="M28 37 Q27 23 40 22 Q53 23 52 37 Q48 28 40 27.5 Q32 28 28 37 Z" fill={P.brown} {...O} />
      <path d="M40 22.4 L40 27.6" stroke={P.ink} strokeWidth="0.7" />
      <Features lashes />
      {/* the braid over her right shoulder */}
      <path d="M53 50 Q58 60 56 72 Q54 76 52 72 Q53 62 50 54 Z" fill={P.brown} {...O} />
      <path d="M52.6 56 l3 1.4 M53.6 61 l3 1.2 M53.8 66 l2.6 1" stroke={P.ink} strokeWidth="0.6" />
      {dental ? (
        <g data-outfit="cap">
          <path d="M27 31 Q26 16 40 15.5 Q54 16 53 31 Q40 26 27 31 Z" fill={WHITE} {...O} />
          <path d="M27.4 30 Q40 25 52.6 30" fill="none" stroke={WHITE_SHADE} strokeWidth="1.4" />
          <g transform="translate(35.5 17.5)">
            <Tooth size={9} fill={WHITE} stroke={P.ink} />
          </g>
          <g transform="translate(49.5 77)">
            <Tooth size={9} fill={WHITE} stroke={P.ink} />
          </g>
        </g>
      ) : (
        <g data-outfit="flower">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="29" cy="23" rx="2.2" ry="3.6" transform={`rotate(${a} 29 27)`} fill={P.brick} {...O} strokeWidth="0.7" />
          ))}
          <circle cx="29" cy="27" r="1.8" fill={P.ochreLight} {...O} strokeWidth="0.7" />
          <path d="M31 30 q4 1 6 -1" fill="none" stroke={P.oliveDark} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      )}
    </Cameo>
  );
}
