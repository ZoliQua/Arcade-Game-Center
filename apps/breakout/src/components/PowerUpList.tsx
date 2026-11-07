import { useMessages } from '../arcade';
import { MESSAGES, POWERUP_KEY } from '../i18n';
import type { Effects, PowerUpKind } from '../logic/types';
import { POWERUP_INFO } from './palette';
import styles from './PowerUpList.module.css';

const ORDER: PowerUpKind[] = ['wide', 'multi', 'slow', 'catch', 'life'];

const remaining = (kind: PowerUpKind, effects: Effects): number => {
  if (kind === 'wide') return effects.wideMs;
  if (kind === 'slow') return effects.slowMs;
  if (kind === 'catch') return effects.catchMs;
  return 0;
};

/** Legend of the capsules, with a countdown next to the active timed ones. */
export function PowerUpList({ effects }: { effects: Effects }) {
  const t = useMessages(MESSAGES);
  return (
    <ul className={styles.list}>
      {ORDER.map((kind) => {
        const info = POWERUP_INFO[kind];
        const ms = remaining(kind, effects);
        return (
          <li key={kind} className={ms > 0 ? styles.active : undefined}>
            <span className={styles.capsule} style={{ background: info.color }} aria-hidden="true">
              {info.letter}
            </span>
            <span className={styles.label}>{t(POWERUP_KEY[kind])}</span>
            {ms > 0 && <span className={styles.timer}>{Math.ceil(ms / 1000)}s</span>}
          </li>
        );
      })}
    </ul>
  );
}
