import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Theme } from '@arcade/ui';
import { getNickname, nicknameLimits, setNickname } from './services/nickname';

type SettingsProps = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  nickname: string | null;
  onNicknameChange: (next: string | null) => void;
};

export function Settings({ theme, setTheme, nickname, onNicknameChange }: SettingsProps) {
  const [draft, setDraft] = useState(nickname ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  const saveNick = () => {
    const cleaned = setNickname(draft);
    if (cleaned !== null) {
      onNicknameChange(cleaned);
      setDraft(cleaned);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1200);
    }
  };

  const draftIsValid =
    draft.trim().length >= nicknameLimits.min &&
    draft.trim().length <= nicknameLimits.max;

  return (
    <div>
      <div className="section-head">
        <h2>Settings</h2>
        <span>Preferences are saved locally</span>
      </div>
      <div className="panel" style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
        <Row
          label="Nickname"
          hint={`Shown on the leaderboard. ${nicknameLimits.min}–${nicknameLimits.max} characters.`}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draftIsValid) saveNick();
            }}
            maxLength={nicknameLimits.max}
            placeholder="Your name"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--panel-border)',
              background: 'var(--panel-bg-soft)',
              color: 'var(--text-strong)',
              font: 'inherit',
              fontSize: 13,
              minWidth: 0,
            }}
          />
          <button
            className={`btn ${draftIsValid && draft !== (nickname ?? '') ? 'btn--primary' : ''}`}
            onClick={saveNick}
            disabled={!draftIsValid || draft.trim() === (nickname ?? '')}
          >
            {savedFlash ? 'Saved' : 'Save'}
          </button>
        </Row>

        <Row label="Theme" hint="Toggle between dark and light. Press T anywhere.">
          <button
            className={`btn ${theme === 'dark' ? 'btn--primary' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Dark
          </button>
          <button
            className={`btn ${theme === 'light' ? 'btn--primary' : ''}`}
            onClick={() => setTheme('light')}
          >
            Light
          </button>
        </Row>

        <Row label="Reset high scores" hint="Clears local storage for all games.">
          <button
            className="btn"
            style={{ color: 'var(--tetro-Z)', borderColor: 'rgba(239,32,41,0.4)' }}
            onClick={() => {
              try {
                localStorage.removeItem('tetris.highScore');
                localStorage.removeItem('snake.highScore');
                localStorage.removeItem('2048.highScore');
              } catch {
                /* ignore */
              }
            }}
          >
            Reset
          </button>
        </Row>
      </div>
    </div>
  );
}

type RowProps = {
  label: string;
  hint: string;
  children: ReactNode;
};

function Row({ label, hint, children }: RowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        alignItems: 'center',
        gap: 16,
        padding: '4px 0',
      }}
    >
      <div>
        <div style={{ color: 'var(--text-strong)', fontWeight: 500, fontSize: 13.5 }}>
          {label}
        </div>
        <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>{hint}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>
    </div>
  );
}

export { getNickname };
