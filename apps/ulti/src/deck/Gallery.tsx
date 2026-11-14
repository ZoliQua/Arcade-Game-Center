import { useDental, useLang } from '../arcade';
import { H_SUITS, HUNGARIAN_DECK, hCardBackLabel, hCardLabel } from './cards';
import { HungarianCard } from './HungarianCard';
import styles from './Gallery.module.css';

/** Dev-only review page (`?gallery=1`): the whole deck plus both backs. Not part of the game. */
export function Gallery() {
  const [lang] = useLang();
  const [dental] = useDental();
  return (
    <div className={styles.gallery} data-dental={dental ? 'true' : 'false'}>
      {H_SUITS.map((suit) => (
        <div key={suit} className={styles.row}>
          {HUNGARIAN_DECK.filter((c) => c.suit === suit).map((c) => (
            <figure key={`${c.suit}-${c.rank}`} className={styles.cell}>
              <HungarianCard card={c} size={128} lang={lang} />
              <figcaption>{hCardLabel(c, lang)}</figcaption>
            </figure>
          ))}
        </div>
      ))}
      <div className={styles.row}>
        <figure className={styles.cell}>
          <HungarianCard card={HUNGARIAN_DECK[0]} faceDown size={128} lang={lang} />
          <figcaption>{hCardBackLabel(lang)}</figcaption>
        </figure>
        <figure className={styles.cell}>
          <HungarianCard card={HUNGARIAN_DECK[0]} faceDown dental size={128} lang={lang} />
          <figcaption>{hCardBackLabel(lang)} · dental</figcaption>
        </figure>
      </div>
    </div>
  );
}

export default Gallery;
