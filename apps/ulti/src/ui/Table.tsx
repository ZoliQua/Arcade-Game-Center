import type { ReactNode } from 'react';
import { formatNumber, type Lang } from '../arcade';
import type { DealState, Player } from '../engine';
import { Hand, type HandProps } from './Hand';
import { formatUnits, type Tr } from './labels';
import { Seat } from './Seat';
import { TrickArea, type TalonView } from './TrickArea';
import styles from './Table.module.css';

export type TableProps = {
  deal: DealState;
  scores: readonly [number, number, number];
  name: (p: Player) => string;
  figure: (p: Player) => ReactNode;
  lang: Lang;
  tr: Tr;
  dental: boolean;
  talon: TalonView;
  /** Whose turn is highlighted (null while nobody is to move, e.g. paused or the deal is over). */
  turn: Player | null;
  /** The bottom hand (seat 0). */
  hand: Omit<HandProps, 'cards' | 'bid' | 'lang' | 'label'>;
};

/**
 * The table seen from seat 0: the player at the bottom, the next player (seat 1) top-right and seat 2 top-left —
 * Ulti goes round to the right — with the bid, talon and trick in the centre. Only seat 0's cards are ever face up.
 */
export function Table({ deal, scores, name, figure, lang, tr, dental, talon, turn, hand }: TableProps) {
  const seat = (p: Player, position: 'bottom' | 'left' | 'right') => {
    const units = formatUnits(scores[p], (n) => formatNumber(n, lang));
    return (
      <Seat
        seat={p}
        name={name(p)}
        units={units}
        isTurn={turn === p}
        isDealer={deal.dealer === p}
        role={deal.declarer === null ? null : deal.declarer === p ? 'declarer' : 'defender'}
        backs={p === 0 ? undefined : deal.hands[p].length}
        dental={dental}
        lang={lang}
        figure={figure(p)}
        position={position}
        labels={{
          onTurn: tr('onTurn'),
          dealer: tr('dealer'),
          declarer: tr('declarer'),
          defender: tr('defender'),
          cards: tr('cardsCount', { n: deal.hands[p].length }),
          seat: tr('seatLabel', { name: name(p), units }),
        }}
      />
    );
  };
  return (
    <div className={styles.table} data-testid="ulti-table" data-dental={dental ? 'true' : 'false'}>
      <div className={styles.top}>
        {seat(2, 'left')}
        {seat(1, 'right')}
      </div>
      <TrickArea deal={deal} name={name} lang={lang} tr={tr} dental={dental} talon={talon} />
      <div className={styles.bottom}>
        {seat(0, 'bottom')}
        <Hand cards={deal.hands[0]} bid={deal.bid} lang={lang} label={tr('yourHand')} {...hand} />
      </div>
    </div>
  );
}

export default Table;
