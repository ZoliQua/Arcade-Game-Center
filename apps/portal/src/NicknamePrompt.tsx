import { useState } from 'react';
import { nicknameLimits, setNickname } from './services/nickname';

type Props = {
  onSet: (nick: string) => void;
  onSkip: () => void;
};

export function NicknamePrompt({ onSet, onSkip }: Props) {
  const [draft, setDraft] = useState('');
  const valid =
    draft.trim().length >= nicknameLimits.min &&
    draft.trim().length <= nicknameLimits.max;

  const submit = () => {
    if (!valid) return;
    const cleaned = setNickname(draft);
    if (cleaned !== null) onSet(cleaned);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 11, 18, 0.78)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
      role="dialog"
      aria-label="Choose a nickname"
    >
      <div
        className="panel"
        style={{
          maxWidth: 420,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 22,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: 'var(--text-strong)' }}>
            Pick a nickname
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-mute)', fontSize: 13 }}>
            Shown on the global leaderboard. You can change it later in Settings.
          </p>
        </div>

        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) submit();
          }}
          maxLength={nicknameLimits.max}
          placeholder={`${nicknameLimits.min}–${nicknameLimits.max} characters`}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--panel-border)',
            background: 'var(--panel-bg-soft)',
            color: 'var(--text-strong)',
            font: 'inherit',
            fontSize: 14,
          }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onSkip}>
            Play anonymously
          </button>
          <button
            className={`btn ${valid ? 'btn--primary' : ''}`}
            onClick={submit}
            disabled={!valid}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
