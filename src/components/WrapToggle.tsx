import styles from './WrapToggle.module.css';

type Props = {
  wrapWalls: boolean;
  onChange: (wrapWalls: boolean) => void;
};

export function WrapToggle({ wrapWalls, onChange }: Props) {
  return (
    <label className={styles.wrap}>
      <span className={styles.label}>Wrap walls</span>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={wrapWalls}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.state} aria-live="polite">{wrapWalls ? 'On' : 'Off'}</span>
    </label>
  );
}
