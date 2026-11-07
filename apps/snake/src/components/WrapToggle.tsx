type Props = {
  /** Translated field label and On / Off values. */
  label: string;
  onLabel: string;
  offLabel: string;
  wrapWalls: boolean;
  onChange: (wrapWalls: boolean) => void;
};

export function WrapToggle({ label, onLabel, offLabel, wrapWalls, onChange }: Props) {
  return (
    <label className="arc-field">
      <input
        type="checkbox"
        checked={wrapWalls}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
      <strong aria-live="polite">{wrapWalls ? onLabel : offLabel}</strong>
    </label>
  );
}
