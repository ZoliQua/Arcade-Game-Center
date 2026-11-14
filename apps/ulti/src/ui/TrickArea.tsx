import type { Lang } from '../arcade';
import type { HCard } from '../arcade';
import { HungarianCard } from '../arcade';
import type { DealState, Player } from '../engine';
import { bidInfo, bidLabel, suitName, type Tr } from './labels';
import { SuitIcon } from './SuitIcon';
import { shownTrick } from './tableUtils';
import styles from './TrickArea.module.css';

export type TalonView =
  /** Face down (nobody at this screen may know it). */
  | { mode: 'hidden' }
  /** Face up for the player: the player laid it down, looked at it, or the deal is over. */
  | { mode: 'open'; label: string };

export type TrickAreaProps = {
  deal: DealState;
  name: (p: Player) => string;
  lang: Lang;
  tr: Tr;
  dental: boolean;
  talon: TalonView;
};

const POS: Record<Player, string> = { 0: 'south', 1: 'east', 2: 'west' };

/** Centre of the table: the bid, the trump, the talon and the trick. */
export function TrickArea({ deal, name, lang, tr, dental, talon }: TrickAreaProps) {
  const shown = shownTrick(deal);
  const by = deal.declarer ?? deal.bidder;
  const talonCards: readonly HCard[] = deal.talon;
  return (
    <div className={styles.centre} data-testid="ulti-centre">
      <div className={styles.info}>
        <div className={styles.bid} data-testid="ulti-current-bid">
          <span className={styles.caption}>{tr('currentBid')}</span>
          {deal.bid && by !== null ? (
            <span title={bidInfo(deal.bid, tr)}>
              {deal.bid.trump && <SuitIcon suit={deal.bid.trump} />} <strong>{bidLabel(deal.bid, tr, lang)}</strong> · {name(by)}
              {deal.kontra && <strong className={styles.kontra}> · Kontra</strong>}
            </span>
          ) : (
            <span>{tr('noBidYet')}</span>
          )}
        </div>
        {deal.bid && (deal.phase === 'kontra' || deal.phase === 'play' || deal.phase === 'over') && (
          <div className={styles.trump}>
            {deal.bid.trump ? (
              <>
                <SuitIcon suit={deal.bid.trump} size={18} /> {tr('trumpIs', { suit: suitName(deal.bid.trump, tr) })}
              </>
            ) : (
              tr('noTrump')
            )}
          </div>
        )}
      </div>

      <div className={styles.talon} data-testid="ulti-talon" data-open={talon.mode === 'open' ? 'true' : 'false'}>
        <span className={styles.caption}>{talon.mode === 'open' ? talon.label : tr('talon')}</span>
        <div className={styles.talonCards}>
          {talonCards.length === 0 ? (
            <span className={styles.empty}>—</span>
          ) : (
            talonCards.map((c, i) =>
              talon.mode === 'open' ? (
                <HungarianCard key={i} card={c} size={0} lang={lang} className={styles.talonCard} />
              ) : (
                <HungarianCard key={i} card={{ suit: 'piros', rank: 'VII' }} faceDown dental={dental} size={0} lang={lang} className={styles.talonCard} />
              ),
            )
          )}
        </div>
      </div>

      <div className={styles.trick} data-testid="ulti-trick" aria-live="polite">
        {shown && (
          <>
            <span className={styles.caption}>
              {tr('trickN', { n: shown.index + 1 })}
              {shown.trick.winner !== null && ` · ${tr('takes', { name: name(shown.trick.winner) })}`}
            </span>
            <div className={styles.trickCards}>
              {shown.trick.cards.map((pc) => (
                <figure key={pc.player} className={`${styles.played} ${styles[POS[pc.player]]}`} data-played-by={pc.player}>
                  <HungarianCard card={pc.card} size={0} lang={lang} className={styles.trickCard} />
                  <figcaption>
                    {shown.trick.winner === pc.player && <span aria-hidden="true">★ </span>}
                    {name(pc.player)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TrickArea;
