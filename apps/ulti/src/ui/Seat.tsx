import type { ReactNode } from 'react';
import type { Lang } from '../arcade';
import { HungarianCard } from '../deck/HungarianCard';
import styles from './Seat.module.css';

export type SeatProps = {
  seat: 0 | 1 | 2;
  name: string;
  /** Running balance, already formatted (formatNumber) and signed. */
  units: string;
  isTurn: boolean;
  isDealer: boolean;
  role: 'declarer' | 'defender' | null;
  /** Bots: number of cards in hand, drawn as backs only. Omitted for the player (the hand is shown below). */
  backs?: number;
  dental: boolean;
  lang: Lang;
  figure: ReactNode;
  labels: { onTurn: string; dealer: string; declarer: string; defender: string; cards: string; seat: string };
  position: 'bottom' | 'left' | 'right';
};

/**
 * A seat: portrait, name, balance and badges. The turn is shown by a framed ▶ badge with text and a thicker
 * outline (never by colour alone). Bots' cards are only ever drawn face down.
 */
export function Seat({ seat, name, units, isTurn, isDealer, role, backs, dental, lang, figure, labels, position }: SeatProps) {
  return (
    <section
      className={`${styles.seat} ${styles[position]}${isTurn ? ` ${styles.turn}` : ''}`}
      aria-label={labels.seat}
      aria-current={isTurn ? 'true' : undefined}
      data-seat={seat}
      data-turn={isTurn ? 'true' : 'false'}
    >
      <div className={styles.figure}>{figure}</div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.units} data-testid={`seat-units-${seat}`}>
          {units}
        </span>
        <span className={styles.badges}>
          {isTurn && (
            <span className={`${styles.badge} ${styles.turnBadge}`} data-testid={`seat-turn-${seat}`}>
              <span aria-hidden="true">▶ </span>
              {labels.onTurn}
            </span>
          )}
          {isDealer && <span className={styles.badge}>{labels.dealer}</span>}
          {role && <span className={styles.badge}>{role === 'declarer' ? `★ ${labels.declarer}` : labels.defender}</span>}
        </span>
      </div>
      {backs !== undefined && (
        <div className={styles.backs} aria-label={labels.cards} role="img" data-testid={`seat-backs-${seat}`}>
          {Array.from({ length: backs }, (_, i) => (
            <HungarianCard key={i} card={{ suit: 'piros', rank: 'VII' }} faceDown dental={dental} size={0} lang={lang} className={styles.back} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Seat;
