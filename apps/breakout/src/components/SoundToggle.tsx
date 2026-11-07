import { useMessages } from '../arcade';
import { MESSAGES } from '../i18n';

type Props = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function SoundToggle({ enabled, onChange }: Props) {
  const t = useMessages(MESSAGES);
  return (
    <label className="arc-field">
      <input type="checkbox" checked={enabled} onChange={(event) => onChange(event.target.checked)} />
      <span>{t('sound')}</span>
      <strong aria-live="polite">{t(enabled ? 'on' : 'off')}</strong>
    </label>
  );
}
