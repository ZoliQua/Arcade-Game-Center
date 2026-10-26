import { useState } from 'react';
import { nicknameLimits, setNickname } from './services/nickname';

type Props = {
  onSet: (nick: string) => void;
  onSkip: () => void;
};

export function NicknamePrompt({ onSet, onSkip }: Props) {
  const [draft, setDraft] = useState('');
  const valid = draft.trim().length >= nicknameLimits.min && draft.trim().length <= nicknameLimits.max;

  const submit = () => {
    if (!valid) return;
    const cleaned = setNickname(draft);
    if (cleaned !== null) onSet(cleaned);
  };

  return (
    <div className="portal-dialog" role="dialog" aria-modal="true" aria-labelledby="nick-title">
      <form
        className="arc-panel portal-dialog__card"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <h2 id="nick-title">Pick a nickname</h2>
          <p>Shown on the global leaderboard. You can change it later in Settings.</p>
        </div>

        <input
          autoFocus
          className="portal-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={nicknameLimits.max}
          placeholder={`${nicknameLimits.min}–${nicknameLimits.max} characters`}
          aria-label="Nickname"
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="arc-btn arc-btn--ghost" onClick={onSkip}>
            Play anonymously
          </button>
          <button type="submit" className="arc-btn arc-btn--primary" disabled={!valid}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
