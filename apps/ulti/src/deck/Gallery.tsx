import { H_SUITS, HUNGARIAN_DECK, HungarianCard, hCardBackLabel, hCardLabel, hFigureName, useDental, useLang, type HCard, type Lang } from '../arcade';
import styles from './Gallery.module.css';

/** Caption: the card's name plus who or what it shows (Tell figure, mounted king or season). */
function caption(c: HCard, lang: Lang): string {
  const figure = hFigureName(c, lang);
  return figure ? `${hCardLabel(c, lang)} · ${figure}` : hCardLabel(c, lang);
}

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
              <figcaption>{caption(c, lang)}</figcaption>
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
