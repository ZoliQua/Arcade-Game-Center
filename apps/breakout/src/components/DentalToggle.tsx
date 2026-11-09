import { useDental, useKitMessages, useMessages } from '../arcade';
import { MESSAGES } from '../i18n';
import styles from './DentalToggle.module.css';

/** Settings row for the shared dental mode (`arcade.dental`). */
export function DentalToggle() {
  const t = useMessages(MESSAGES);
  const k = useKitMessages();
  const [dental, setDental] = useDental();
  return (
    <label className={`arc-field ${styles.row}`}>
      <input type="checkbox" checked={dental} onChange={(event) => setDental(event.target.checked)} />
      <span>{k('dental')}</span>
      <strong aria-live="polite">{t(dental ? 'on' : 'off')}</strong>
      <small className={styles.hint}>{t('dentalHint')}</small>
    </label>
  );
}
