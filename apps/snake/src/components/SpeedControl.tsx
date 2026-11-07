import { MAX_SPEED, MIN_SPEED } from '../logic/constants';

type Props = {
  /** Translated field label ("Speed"). */
  label: string;
  speed: number;
  onChange: (speed: number) => void;
};

export function SpeedControl({ label, speed, onChange }: Props) {
  return (
    <label className="arc-field">
      <span>{label}</span>
      <input
        type="range"
        min={MIN_SPEED}
        max={MAX_SPEED}
        step={1}
        value={speed}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuemin={MIN_SPEED}
        aria-valuemax={MAX_SPEED}
        aria-valuenow={speed}
      />
      <strong aria-live="polite">{speed}</strong>
    </label>
  );
}
