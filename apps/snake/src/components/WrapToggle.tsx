type Props = {
  wrapWalls: boolean;
  onChange: (wrapWalls: boolean) => void;
};

export function WrapToggle({ wrapWalls, onChange }: Props) {
  return (
    <label className="arc-field">
      <input
        type="checkbox"
        checked={wrapWalls}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>Wrap walls</span>
      <strong aria-live="polite">{wrapWalls ? 'On' : 'Off'}</strong>
    </label>
  );
}
