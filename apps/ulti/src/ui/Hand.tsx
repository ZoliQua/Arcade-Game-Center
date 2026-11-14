import type { CSSProperties } from 'react';
import type { Lang } from '../arcade';
import type { HCard } from '../arcade';
import { HungarianCard } from '../arcade';
import { cardKey, type Bid } from '../engine';
import { RANK_SHORT } from './labels';
import { SuitIcon } from './SuitIcon';
import { sortHand } from './tableUtils';
import styles from './Hand.module.css';

export type HandProps = {
  cards: readonly HCard[];
  bid: Bid | null;
  lang: Lang;
  label: string;
  /** Keys (`cardKey`) of the selected cards (discarding, or the card raised to play on a touch screen). */
  selected?: ReadonlySet<string>;
  /** Keys of the cards that may be played now; others are dimmed (and marked) but still clickable for the reason. */
  playable?: ReadonlySet<string> | null;
  /** Null makes the hand read-only. */
  onCard?: ((card: HCard) => void) | null;
  /**
   * Touch layout: an overlapping fan sized from the hand's own width (all twelve cards fit at 360 px), each card with a
   * corner index (rank + suit sign) that stays visible where the next card covers it.
   */
  fan?: boolean;
};

/** Degrees between neighbouring cards of the fan, and the arc's drop (px) per step² from the middle. */
const FAN_DEG = 1.1;
const FAN_DROP = 0.4;

/** The player's cards, face up, as buttons. */
export function Hand({ cards, bid, lang, label, selected, playable = null, onCard = null, fan = false }: HandProps) {
  const sorted = sortHand(cards, bid);
  const n = sorted.length;
  return (
    <ul
      className={`${styles.hand}${fan ? ` ${styles.fan}` : ''}`}
      aria-label={label}
      data-testid="ulti-hand"
      data-fan={fan ? 'true' : 'false'}
      style={{ '--n': Math.max(2, n) } as CSSProperties}
    >
      {sorted.map((card, i) => {
        const key = cardKey(card);
        const isSel = selected?.has(key) ?? false;
        const dim = playable !== null && !playable.has(key);
        const offset = i - (n - 1) / 2;
        const slotStyle = fan ? ({ '--rot': `${(offset * FAN_DEG).toFixed(2)}deg`, '--drop': `${(offset * offset * FAN_DROP).toFixed(1)}px` } as CSSProperties) : undefined;
        return (
          <li key={key} className={styles.slot} style={slotStyle}>
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
              {fan && (
                <span className={styles.corner} data-corner-index="" data-suit={card.suit} aria-hidden="true">
                  {RANK_SHORT[lang][card.rank]}
                  <SuitIcon suit={card.suit} size={12} />
                </span>
              )}
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
