import type { ReactNode } from 'react';
import {
  formatNumber,
  Tooth,
  useDental,
  useIsTouch,
  useKitMessages,
  useLang,
  useMessages,
  type HRank,
  type RulesSection,
} from './arcade';
import { LEVELS, type Level } from './bots/profiles';
import {
  ALL_BIDS,
  BID_SHAPES,
  bidValue,
  cardPoints,
  COLOURLESS_ORDER,
  FAILED_ULTI_FACTOR,
  HAND_SIZE,
  KONTRA_FACTOR,
  kindValue,
  LAST_TRICK_POINTS,
  makeBid,
  PAIR_POINTS,
  scoreDeal,
  TALON_SIZE,
  TRUMP_ORDER,
  type Bid,
  type BidKind,
} from './engine';
import { arcadeScore, DIFFICULTY_FACTOR, MAX_SCORE, POINTS_PER_UNIT } from './game/scoring';
import { DEALS_PER_SESSION, MIN_FINISH_DEALS } from './game/session';
import { MESSAGES, type MessageKey } from './i18n';
import { bidLabel, formatUnits, KIND_NAME, RANK_NAME, RANK_SHORT } from './ui/labels';
import { SuitIcon } from './ui/SuitIcon';
import styles from './rules.module.css';

const LEVEL_KEY: Record<Level, MessageKey> = { easy: 'diffEasy', medium: 'diffMedium', hard: 'diffHard' };

const BOX = 36;
const GAP = 4;
const X0 = 12;
const boxX = (i: number) => X0 + i * (BOX + GAP);
const ROW_W = boxX(7) + BOX - X0;

/**
 * Rules diagram: the card order, low to high, in trump games (Passz, Ulti, …: the X right below the ace) and in the
 * colourless games (Betli, Színtelen durchmars: natural order). The X is drawn with a dashed frame in both rows, so the
 * one card that moves stands out by shape, not colour. In dental mode a tooth marks the high end.
 */
export function RankDiagram() {
  const m = useMessages(MESSAGES);
  const [lang] = useLang();
  const [dental] = useDental();
  const names = (order: readonly HRank[]) => order.map((r) => RANK_NAME[lang][r]).join(', ');
  const label = m('rulesDiagramLabel', { trump: names(TRUMP_ORDER), colourless: names(COLOURLESS_ORDER) });
  const row = (title: string, order: readonly HRank[], y: number) => (
    <g>
      <text x={X0} y={y} fontSize="12" fontWeight="700" fill="var(--text-strong)">
        {title}
      </text>
      {order.map((rank, i) => (
        <g key={rank} data-rank={rank}>
          <rect
            x={boxX(i)}
            y={y + 6}
            width={BOX}
            height={44}
            rx={5}
            fill="var(--panel-bg-soft)"
            stroke="var(--text)"
            strokeWidth={rank === 'X' ? 2.2 : 1.2}
            strokeDasharray={rank === 'X' ? '4 3' : undefined}
          />
          <text x={boxX(i) + BOX / 2} y={y + 34} fontSize={RANK_SHORT[lang][rank].length > 2 ? 12 : 15} fontWeight="700" textAnchor="middle" fill="var(--text-strong)">
            {RANK_SHORT[lang][rank]}
          </text>
        </g>
      ))}
    </g>
  );
  const arrowY = 150;
  return (
    <svg viewBox="0 0 340 176" role="img" aria-label={label} data-dental={dental ? 'true' : 'false'} className={styles.diagram}>
      {row(m('rulesDiagramTrump'), TRUMP_ORDER, 16)}
      {row(m('rulesDiagramColourless'), COLOURLESS_ORDER, 84)}
      <path d={`M${X0} ${arrowY}H${X0 + ROW_W - 2}`} stroke="var(--text)" strokeWidth={2} />
      <path d={`M${X0 + ROW_W - 10} ${arrowY - 6}l10 6-10 6z`} fill="var(--text)" />
      <text x={X0} y={arrowY + 18} fontSize="12" fill="var(--text-dim)">
        {m('rulesDiagramLow')}
      </text>
      <text x={X0 + ROW_W - (dental ? 22 : 0)} y={arrowY + 18} fontSize="12" fontWeight="700" textAnchor="end" fill="var(--text-strong)">
        {m('rulesDiagramHigh')}
      </text>
      {dental && (
        <g transform={`translate(${X0 + ROW_W - 18} ${arrowY + 4})`} data-tooth="">
          <Tooth size={18} />
        </g>
      )}
    </svg>
  );
}

const sameShape = (bid: Bid, shape: readonly BidKind[]) => bid.kinds.length === shape.length && bid.kinds.every((k) => shape.includes(k));

/** The value table, built from the same bid list the bid panel offers (`BID_SHAPES` × `ALL_BIDS`). */
export function BidValueTable() {
  const m = useMessages(MESSAGES);
  const [lang] = useLang();
  const num = (v: number) => formatNumber(v, lang);
  return (
    <table className={styles.bids} data-testid="ulti-rules-bids">
      <thead>
        <tr>
          <th scope="col">{m('rulesTableContract')}</th>
          <th scope="col">{m('rulesTableValue')}</th>
          <th scope="col">
            <span className={styles.icon}>
              <SuitIcon suit="piros" size={13} />
            </span>{' '}
            {m('rulesTablePiros')}
          </th>
        </tr>
      </thead>
      <tbody>
        {BID_SHAPES.map((shape) => {
          const bids = ALL_BIDS.filter((b) => sameShape(b, shape));
          const plain = bids.find((b) => b.trump !== 'piros') as Bid;
          const red = bids.find((b) => b.trump === 'piros');
          return (
            <tr key={shape.join('+')}>
              <th scope="row">{shape.map((k) => KIND_NAME[k]).join(' + ')}</th>
              <td>{num(bidValue(plain))}</td>
              {red ? <td>{num(bidValue(red))}</td> : <td title={m('rulesTableNoPiros')} aria-label={m('rulesTableNoPiros')}>—</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- the diagrams and their hook belong together
export function useRulesSections(): RulesSection[] {
  const m = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const touch = useIsTouch();
  const num = (v: number) => formatNumber(v, lang);
  const ios = typeof navigator !== 'undefined' && /iP(hone|od)/.test(navigator.userAgent);

  // Worked example: a made Piros ulti, scored by the engine itself.
  const piros = makeBid(['ulti'], 'piros');
  const value = kindValue(piros, 'ulti');
  const units = scoreDeal({ declarer: 0, bid: piros, kontra: false, contracts: [{ kind: 'ulti', won: true, value }], parti: null, tricksWon: [HAND_SIZE, 0, 0] });
  const exampleUnits = 10;
  const level = (l: Level) => m(LEVEL_KEY[l]);
  const factors = Object.fromEntries(LEVELS.map((l) => [l, level(l)]));

  const mobile: ReactNode = (
    <ul>
      <li>{m('rulesMobileTap')}</li>
      <li>{m('rulesMobileFan')}</li>
      <li>{m('rulesMobileBar')}</li>
      <li>{m('rulesMobileFs', { fs: k('fullscreen') })}</li>
      {ios && <li>{k('iosHomeScreenTip')}</li>}
    </ul>
  );

  return [
    { id: 'goal', body: <p>{m('rulesGoalText', { deals: num(DEALS_PER_SESSION) })}</p> },
    { id: 'play', body: <p>{touch ? m('rulesPlayTouch') : m('rulesPlayKeys')}</p> },
    {
      id: 'rules',
      body: (
        <>
          <ul>
            <li>{m('rulesRuleDeal', { hand: num(HAND_SIZE), talon: num(TALON_SIZE), twelve: num(HAND_SIZE + TALON_SIZE) })}</li>
            <li>{m('rulesRuleBid')}</li>
            <li>{m('rulesRuleKontra')}</li>
            <li>{m('rulesRulePlay')}</li>
            <li>
              {m('rulesRulePoints', {
                ten: num(cardPoints({ suit: 'makk', rank: 'asz' })),
                last: num(LAST_TRICK_POINTS),
                twenty: num(PAIR_POINTS.other),
                forty: num(PAIR_POINTS.trump),
              })}
            </li>
          </ul>
          <p>{m('rulesOrderIntro')}</p>
          <RankDiagram />
        </>
      ),
    },
    {
      id: 'scoring',
      body: (
        <>
          <p>{m('rulesTableIntro')}</p>
          <BidValueTable />
          <p>{m('rulesScoringDeal', { kontra: num(KONTRA_FACTOR), ulti: num(FAILED_ULTI_FACTOR) })}</p>
          <p>
            {m('rulesScoringExample', {
              bid: bidLabel(piros, m, lang),
              value: num(value),
              declarer: formatUnits(units[0], num),
              defender: formatUnits(units[1], num),
            })}
          </p>
          <p>
            {m('rulesScoringFormula', {
              deals: num(DEALS_PER_SESSION),
              ppu: num(POINTS_PER_UNIT),
              easy: factors.easy,
              medium: factors.medium,
              hard: factors.hard,
              fe: num(DIFFICULTY_FACTOR.easy),
              fm: num(DIFFICULTY_FACTOR.medium),
              fh: num(DIFFICULTY_FACTOR.hard),
              zero: num(0),
              max: num(MAX_SCORE),
            })}
          </p>
          <p>{m('rulesScoringScoreExample', { units: num(exampleUnits), level: level('hard'), points: num(arcadeScore(exampleUnits, 'hard')) })}</p>
          <p>{m('rulesScoringOutcome')}</p>
          <p>{m('rulesScoringFinish', { min: num(MIN_FINISH_DEALS), deals: num(DEALS_PER_SESSION), zero: num(0) })}</p>
        </>
      ),
    },
    { id: 'dental', body: <p>{m('rulesDentalText')}</p> },
    { id: 'mobile', body: mobile },
  ];
}
