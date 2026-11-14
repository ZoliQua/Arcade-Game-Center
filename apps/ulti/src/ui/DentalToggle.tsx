import { useDental, useKitMessages } from '../arcade';

/**
 * Settings row for the shared dental mode (`arcade.dental`) — the same preference as the arcade top-bar toggle.
 * Presentation only (card backs and seat figures): switching it never touches the session.
 */
export function DentalToggle() {
  const k = useKitMessages();
  const [dental, setDental] = useDental();
  return (
    <label className="arc-field" title={k('dentalDesc')}>
      <input type="checkbox" checked={dental} onChange={(e) => setDental(e.currentTarget.checked)} />
      <span>
        {k('dental')}
        <small style={{ display: 'block', opacity: 0.7, fontSize: 11 }}>{k('dentalDesc')}</small>
      </span>
    </label>
  );
}

export default DentalToggle;
