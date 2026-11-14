import { P } from '../../deck/art/parts';
import { Cameo, Features, HeadBase, Probe, Shoulders, WhiteCoat } from './parts';
import { O, WHITE, WHITE_SHADE } from './palette';

/** Bandi: an older man with a curled handlebar moustache — hat, jacket and pipe; dental: the hygienist, mask and probe. */
export function BandiFigure({ dental, title }: { dental: boolean; title: string }) {
  return (
    <Cameo title={title} testId={dental ? 'ulti-figure-dental' : 'ulti-figure-classic'} figure="bandi">
      {dental ? (
        <WhiteCoat collar="tunic" />
      ) : (
        <g data-outfit="jacket">
          <Shoulders fill={P.olive} />
          <path d="M34 61 L40 74 L46 61" fill={P.linen} {...O} />
          <path d="M30 62 L40 84 L50 62" fill="none" stroke={P.oliveDark} strokeWidth="1.4" />
          <circle cx="40" cy="88" r="1.4" fill={P.ochre} {...O} />
          <circle cx="35" cy="78" r="1.3" fill={P.ochre} {...O} />
          <circle cx="45" cy="78" r="1.3" fill={P.ochre} {...O} />
        </g>
      )}
      <HeadBase chin={1} />
      {/* grey temples and a receding line */}
      <path d="M28 40 Q26 30 30 26 Q31 31 30.5 40 Z M52 40 Q54 30 50 26 Q49 31 49.5 40 Z" fill={P.steel} {...O} />
      <Features brow={P.steel} smile={false} />
      {/* curled handlebar moustache */}
      <path
        d="M40 46.4 Q35 44.6 31 47.6 Q28.6 49.6 26.8 47.2 Q27.6 51.2 31.4 50.2 Q36 49 40 48.4 Q44 49 48.6 50.2 Q52.4 51.2 53.2 47.2 Q51.4 49.6 49 47.6 Q45 44.6 40 46.4 Z"
        fill={P.steel}
        {...O}
        strokeWidth="0.8"
      />
      {dental ? (
        <g data-tool="mask">
          {/* mask lowered to the chin, so his face stays the same */}
          <path d="M31.5 53 Q40 60 48.5 53 L48 58.6 Q40 63.6 32 58.6 Z" fill="#cfe3dd" {...O} />
          <path d="M33 55.6 Q40 60 47 55.6" fill="none" stroke={P.ink} strokeWidth="0.5" />
          <path d="M31.5 53.4 L28 42 M48.5 53.4 L52 42" stroke={WHITE_SHADE} strokeWidth="1" />
          <path d="M30 26 Q40 21 50 26 L50 29 Q40 25 30 29 Z" fill={WHITE} {...O} />
          <Probe x={27} y={86} />
        </g>
      ) : (
        <g data-outfit="hat">
          <path d="M30 27 Q30 15 40 14.5 Q50 15 50 27 Z" fill={P.brown} {...O} />
          <path d="M30.4 23.5 H49.6" stroke={P.brickDark} strokeWidth="2" />
          <ellipse cx="40" cy="27.4" rx="15.5" ry="3.2" fill={P.brown} {...O} />
          {/* pipe at the corner of the mouth */}
          <path d="M44 50.4 Q50 53 53 56" fill="none" stroke={P.ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M44 50.4 Q50 53 53 56" fill="none" stroke={P.brownLight} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M51 53 L51 60 Q55 62 58 59.5 L58 53 Z" fill={P.brownLight} {...O} />
          <path d="M54.5 51 q-1 -3 1 -5 q2 -2 0.5 -5" fill="none" stroke={P.steel} strokeWidth="0.8" strokeLinecap="round" />
        </g>
      )}
    </Cameo>
  );
}
