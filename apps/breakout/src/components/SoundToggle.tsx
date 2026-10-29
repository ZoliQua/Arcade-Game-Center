type Props = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function SoundToggle({ enabled, onChange }: Props) {
  return (
    <label className="arc-field">
      <input type="checkbox" checked={enabled} onChange={(event) => onChange(event.target.checked)} />
      <span>Sound effects</span>
      <strong aria-live="polite">{enabled ? 'On' : 'Off'}</strong>
    </label>
  );
}
