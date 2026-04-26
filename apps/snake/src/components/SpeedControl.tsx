import { MAX_SPEED, MIN_SPEED } from '../logic/constants';
import styles from './SpeedControl.module.css';

type Props = {
  speed: number;
  onChange: (speed: number) => void;
};

export function SpeedControl({ speed, onChange }: Props) {
  return (
    <label className={styles.wrap}>
      <span className={styles.label}>Speed</span>
      <input
        type="range"
        min={MIN_SPEED}
        max={MAX_SPEED}
        step={1}
        value={speed}
        onChange={(event) => onChange(Number(event.target.value))}
        className={styles.slider}
        aria-valuemin={MIN_SPEED}
        aria-valuemax={MAX_SPEED}
        aria-valuenow={speed}
      />
      <span className={styles.value} aria-live="polite">{speed}</span>
    </label>
  );
}
