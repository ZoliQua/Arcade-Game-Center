import type { Lang } from '../arcade';
import type { HCard } from '../arcade';
import { HungarianCard } from '../arcade';
import { cardKey, type Bid } from '../engine';
import { sortHand } from './tableUtils';
import styles from './Hand.module.css';

export type HandProps = {
  cards: readonly HCard[];
  bid: Bid | null;
  lang: Lang;
  label: string;
  /** Keys (`cardKey`) of the selected cards (discarding). */
  selected?: ReadonlySet<string>;
  /** Keys of the cards that may be played now; others are dimmed (and marked) but still clickable for the reason. */
  playable?: ReadonlySet<string> | null;
  /** Null makes the hand read-only. */
  onCard?: ((card: HCard) => void) | null;
};

/** The player's cards, face up, as buttons. */
export function Hand({ cards, bid, lang, label, selected, playable = null, onCard = null }: HandProps) {
  const sorted = sortHand(cards, bid);
  return (
    <ul className={styles.hand} aria-label={label} data-testid="ulti-hand">
      {sorted.map((card) => {
        const key = cardKey(card);
        const isSel = selected?.has(key) ?? false;
        const dim = playable !== null && !playable.has(key);
        return (
          <li key={key} className={styles.slot}>
            <button
              type="button"
              className={`${styles.cardBtn}${dim ? ` ${styles.dim}` : ''}`}
              disabled={onCard === null}
              aria-pressed={selected ? isSel : undefined}
              data-hand-card={key}
              data-playable={playable === null ? undefined : dim ? 'false' : 'true'}
              onClick={() => onCard?.(card)}
            >
              <HungarianCard card={card} size={0} lang={lang} selected={isSel} className={styles.card} />
              {isSel && (
                <span className={styles.mark} aria-hidden="true">
                  ▲
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default Hand;
