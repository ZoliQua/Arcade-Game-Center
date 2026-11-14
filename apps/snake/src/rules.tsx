import type { ReactNode } from 'react';
import { formatNumber, PasteDrop, SmileTooth, Tooth, useDental, useIsTouch, useKitMessages, useLang, useMessages, type RulesSection } from './arcade';
import { DEFAULT_SPEED, GRID_SIZE, MAX_SPEED, MIN_SPEED } from './logic/constants';
import { MESSAGES } from './i18n';

const CELL = 28;
const STEP = 32;

type Piece = 'body' | 'head' | 'food';

/** One board cell of the diagram: plain mode uses shapes (square / arrow square / crossed ring), dental mode the tooth icons. */
function Cell({ kind, x, y, dental, isNew = false }: { kind: Piece; x: number; y: number; dental: boolean; isNew?: boolean }) {
  if (dental) {
    const Icon = kind === 'head' ? SmileTooth : kind === 'food' ? PasteDrop : Tooth;
    return (
      <g transform={`translate(${x} ${y})`}>
        <Icon size={CELL} />
        {isNew && <rect x={-1} y={-1} width={CELL + 2} height={CELL + 2} rx={5} fill="none" stroke="var(--text)" strokeWidth={2} strokeDasharray="4 3" />}
      </g>
    );
  }
  if (kind === 'food') {
    return (
      <g>
        <circle cx={x + CELL / 2} cy={y + CELL / 2} r={10} fill="var(--danger)" stroke="var(--text)" strokeWidth={2} />
        <path d={`M${x + 9} ${y + 9}l10 10M${x + 19} ${y + 9}l-10 10`} stroke="var(--text)" strokeWidth={2} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CELL}
        height={CELL}
        rx={4}
        fill={kind === 'head' ? 'color-mix(in oklab, var(--game-snake) 70%, white)' : 'var(--game-snake)'}
        stroke="var(--text)"
        strokeWidth={isNew ? 2 : 1}
        strokeDasharray={isNew ? '4 3' : undefined}
      />
      {kind === 'head' && <path d={`M${x + 9} ${y + 7}l12 7-12 7z`} fill="var(--text)" />}
    </g>
  );
}

/** Rules diagram: the head reaches the food (before), eats it, and the body is one segment longer (after, +1). */
export function GrowDiagram() {
  const m = useMessages(MESSAGES);
  const [dental] = useDental();
  const X0 = 10;
  const at = (i: number) => X0 + i * STEP;
  const row = (y: number, kind: 'before' | 'after') => {
    const bodyCount = kind === 'before' ? 3 : 4;
    const headX = kind === 'before' ? at(3) : at(4);
    return (
      <g>
        {Array.from({ length: bodyCount }, (_, i) => (
          <Cell key={i} kind="body" x={at(i)} y={y} dental={dental} isNew={kind === 'after' && i === 3} />
        ))}
        <Cell kind="head" x={headX} y={y} dental={dental} />
        {kind === 'before' && <Cell kind="food" x={headX + STEP + 6} y={y} dental={dental} />}
        <g fontSize="12" fill="var(--text)" textAnchor="middle">
          <text x={headX + CELL / 2} y={y + CELL + 14}>{m('rulesDiagramHead')}</text>
          {kind === 'before' && <text x={headX + STEP + 6 + CELL / 2} y={y + CELL + 14}>{m('rulesDiagramFood')}</text>}
          {kind === 'after' && <text x={at(3) + CELL / 2} y={y + CELL + 14} fontWeight="700">+1</text>}
        </g>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label={m('rulesDiagramLabel')} style={{ width: '100%', maxWidth: 300, height: 'auto', display: 'block', margin: '8px auto' }}>
      <g fontSize="12" fontWeight="700" fill="var(--text)">
        <text x={X0} y={14}>{m('rulesDiagramBefore')}</text>
        <text x={X0} y={88}>{m('rulesDiagramAfter')}</text>
      </g>
      {row(22, 'before')}
      <path d="M120 66v10m-4-4 4 4 4-4" fill="none" stroke="var(--text)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {row(96, 'after')}
    </svg>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- the diagram and its hook belong together
export function useRulesSections(): RulesSection[] {
  const m = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const touch = useIsTouch();
  const num = (n: number) => formatNumber(n, lang);
  const ios = typeof navigator !== 'undefined' && /iP(hone|od)/.test(navigator.userAgent);
  const mobile: ReactNode = (
    <ul>
      <li>{m('rulesMobileSwipe')}</li>
      <li>{m('rulesMobilePad')}</li>
      <li>{m('rulesMobileFs')}</li>
      {ios && <li>{k('iosHomeScreenTip')}</li>}
    </ul>
  );
  return [
    {
      id: 'goal',
      body: (
        <>
          <p>{m('rulesGoal')}</p>
          <GrowDiagram />
        </>
      ),
    },
    { id: 'play', body: <p>{touch ? m('rulesPlayTouch') : m('rulesPlayKeys')}</p> },
    {
      id: 'rules',
      body: (
        <ul>
          <li>{m('rulesRulesWalls', { size: num(GRID_SIZE) })}</li>
          <li>{m('rulesRulesSelf')}</li>
          <li>{m('rulesRulesPause')}</li>
        </ul>
      ),
    },
    { id: 'scoring', body: <p>{m('rulesScoringText', { min: num(MIN_SPEED), max: num(MAX_SPEED), def: num(DEFAULT_SPEED) })}</p> },
    { id: 'dental', body: <p>{m('rulesDentalText')}</p> },
    { id: 'mobile', body: mobile },
  ];
}
