import type { Lang } from '../arcade';
import { legalBids, type Bid, type DealState, type Player } from '../engine';
import { BidPanel } from './BidPanel';
import { bidLabel, type Tr } from './labels';
import styles from './ActionPanel.module.css';

export type ActionPanelProps = {
  deal: DealState;
  /** False while paused, between deals or before the session: everything is read-only. */
  active: boolean;
  name: (p: Player) => string;
  tr: Tr;
  lang: Lang;
  /** The player looked at the talon but cannot bid higher with it. */
  peek: boolean;
  notice: string | null;
  onDiscard(): void;
  onBid(bid: Bid): void;
  onPickUp(): void;
  onPass(): void;
  onKontra(): void;
  onSkipKontra(): void;
};

/** What the player is asked to do now, with exactly the controls the moment allows. */
export function ActionPanel(p: ActionPanelProps) {
  const { deal, active, name, tr, lang } = p;
  const mine = active && deal.turn === 0 && deal.phase !== 'over';
  const bidder = deal.bidder ?? deal.declarer;
  const bidText = deal.bid ? bidLabel(deal.bid, tr, lang) : '';
  let prompt = '';
  if (!active || deal.phase === 'over') prompt = '';
  else if (!mine) prompt = tr('promptWait', { name: name(deal.turn) });
  else if (deal.phase === 'discard') prompt = tr('promptDiscard');
  else if (deal.phase === 'declare') prompt = tr('promptBid');
  else if (deal.phase === 'pickup') prompt = tr('promptPickup', { name: name(bidder ?? 0), bid: bidText });
  else if (deal.phase === 'kontra') prompt = tr('promptKontra', { name: name(deal.declarer ?? 0), bid: bidText });
  else prompt = tr('promptPlay');

  return (
    <section className={`arc-panel ${styles.panel}`} aria-label={tr('bidTitle')} data-testid="ulti-actions">
      {prompt && (
        <p className={styles.prompt} data-testid="ulti-prompt">
          {mine && <span aria-hidden="true">▶ </span>}
          {prompt}
        </p>
      )}
      {mine && deal.phase === 'discard' && (
        <div className={styles.buttons}>
          <button type="button" className="arc-btn arc-btn--primary" onClick={p.onDiscard}>
            {tr('discardBtn')}
          </button>
        </div>
      )}
      {mine && deal.phase === 'declare' && <BidPanel bids={legalBids(deal)} current={deal.bid} lang={lang} tr={tr} onBid={p.onBid} />}
      {mine && deal.phase === 'pickup' && (
        <div className={styles.buttons}>
          {p.peek ? (
            <button type="button" className="arc-btn arc-btn--primary" onClick={p.onPass}>
              {tr('putBack')}
            </button>
          ) : (
            <>
              {/* Always offered: whether it helps depends on the hidden talon, which the player sees only after taking it. */}
              <button type="button" className="arc-btn arc-btn--primary" onClick={p.onPickUp}>
                {tr('pickUp')}
              </button>
              <button type="button" className="arc-btn" onClick={p.onPass}>
                {tr('passBtn')}
              </button>
            </>
          )}
        </div>
      )}
      {mine && deal.phase === 'kontra' && (
        <div className={styles.buttons}>
          <button type="button" className="arc-btn arc-btn--primary" title={tr('infoKontra')} onClick={p.onKontra}>
            {tr('kontraBtn')}
          </button>
          <button type="button" className="arc-btn" onClick={p.onSkipKontra}>
            {tr('noKontra')}
          </button>
        </div>
      )}
      {p.notice && (
        <p className={styles.notice} role="alert" data-testid="ulti-notice">
          <span aria-hidden="true">⚠ </span>
          {p.notice}
        </p>
      )}
    </section>
  );
}

export default ActionPanel;
