import { useId, type ReactNode } from 'react';
import { SEASON_NAME, type HSuit, type Season } from '../cards';
import { Banner, P } from './parts';
import { SuitSign } from './SuitSign';
import { svgId } from './svgId';

/** Shared ace layout: season banner on top, the season scene in an oval cartouche, the large suit sign below. */
export function AceLayout({ season, suit, sky, children }: { season: Season; suit: HSuit; sky: string; children: ReactNode }) {
  const clip = svgId(useId(), 'hace');
  return (
    <g data-season={season}>
      <Banner y={11} text={SEASON_NAME[season]} />
      <defs>
        <clipPath id={clip}>
          <ellipse cx="50" cy="75" rx="35" ry="40" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="14" y="34" width="72" height="82" fill={sky} />
        {children}
      </g>
      <ellipse cx="50" cy="75" rx="35" ry="40" fill="none" stroke={P.ink} strokeWidth="1.4" />
      <ellipse cx="50" cy="75" rx="37.4" ry="42.4" fill="none" stroke={P.brown} strokeWidth="0.6" />
      <SuitSign suit={suit} x={50} y={135} size={26} />
    </g>
  );
}
