import type { Lang } from '../arcade';
import { H_SUITS } from '../deck/cards';
import { BID_SHAPES, bidValue, type Bid } from '../engine';
import { bidId, bidInfo, bidLabel, KIND_NAME, suitName, type Tr } from './labels';
import { SuitIcon } from './SuitIcon';
import styles from './BidPanel.module.css';

export type BidPanelProps = {
  /** The bids the engine allows now (strictly higher and feasible with the player's 10 cards). */
  bids: readonly Bid[];
  current: Bid | null;
  lang: Lang;
  tr: Tr;
  onBid(bid: Bid): void;
};

const sameShape = (bid: Bid, shape: readonly string[]) => bid.kinds.length === shape.length && bid.kinds.every((k) => shape.includes(k));

/**
 * The bid list: one row per contract (Hungarian names), one button per trump suit (suit sign + name). Only bids the
 * engine offers are buttons; everything else is left out, so a lower bid can never be chosen.
 */
export function BidPanel({ bids, current, lang, tr, onBid }: BidPanelProps) {
  const rows = BID_SHAPES.map((shape) => ({ shape, bids: bids.filter((b) => sameShape(b, shape)) })).filter((r) => r.bids.length > 0);
  return (
    <div className={styles.panel} role="group" aria-label={tr('bidTitle')} data-testid="ulti-bid-panel">
      <p className={styles.hint}>{current ? tr('bidHint', { bid: bidLabel(current, tr, lang) }) : tr('bidFirstHint')}</p>
      <ul className={styles.rows}>
        {rows.map(({ shape, bids: rowBids }) => (
          <li key={shape.join('+')} className={styles.row}>
            <span className={styles.kind}>{shape.map((k) => KIND_NAME[k]).join(' + ')}</span>
            <span className={styles.options}>
              {(rowBids[0].trump === null ? [null] : H_SUITS).map((suit) => {
                const bid = rowBids.find((b) => b.trump === suit);
                if (!bid) return <span key={suit ?? '-'} className={styles.gap} aria-hidden="true" />;
                const piros = suit === 'piros';
                return (
                  <button
                    key={bidId(bid)}
                    type="button"
                    className={`arc-btn ${styles.bidBtn}`}
                    title={bidInfo(bid, tr)}
                    aria-label={`${bidLabel(bid, tr, lang)} (${bidValue(bid)})`}
                    data-bid={bidId(bid)}
                    onClick={() => onBid(bid)}
                  >
                    {suit ? (
                      <>
                        <SuitIcon suit={suit} /> {suitName(suit, tr)}
                      </>
                    ) : (
                      KIND_NAME[shape[0]]
                    )}
                    <span className={styles.value}>
                      {piros ? '×2 ' : ''}
                      {bidValue(bid)}
                    </span>
                  </button>
                );
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BidPanel;
