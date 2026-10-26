import { useState, type ReactNode } from 'react';
import { ARCADE_GAMES, clearSession, resetStats, type ArcadeTheme } from '@arcade/kit';
import { nicknameLimits, setNickname } from './services/nickname';

type SettingsProps = {
  theme: ArcadeTheme;
  setTheme: (t: ArcadeTheme) => void;
  nickname: string | null;
  onNicknameChange: (next: string | null) => void;
};

export function Settings({ theme, setTheme, nickname, onNicknameChange }: SettingsProps) {
  const [draft, setDraft] = useState(nickname ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  const draftIsValid =
    draft.trim().length >= nicknameLimits.min && draft.trim().length <= nicknameLimits.max;
  const changed = draft.trim() !== (nickname ?? '');

  const saveNick = () => {
    const cleaned = setNickname(draft);
    if (cleaned === null) return;
    onNicknameChange(cleaned);
    setDraft(cleaned);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <div>
      <div className="section-head">
        <h2>Settings</h2>
        <span>Stored in this browser only</span>
      </div>
      <div className="arc-panel" style={{ display: 'grid', gap: 14, maxWidth: 620 }}>
        <Row label="Nickname" hint={`Shown on the leaderboard. ${nicknameLimits.min}–${nicknameLimits.max} characters.`}>
          <form
            style={{ display: 'flex', gap: 8, flex: 1 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (draftIsValid && changed) saveNick();
            }}
          >
            <input
              className="portal-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={nicknameLimits.max}
              placeholder="Your name"
              aria-label="Nickname"
            />
            <button type="submit" className={`arc-btn ${draftIsValid && changed ? 'arc-btn--primary' : ''}`} disabled={!draftIsValid || !changed}>
              {savedFlash ? 'Saved' : 'Save'}
            </button>
          </form>
        </Row>

        <Row label="Theme" hint="Shared by the portal and every standalone game. Press T anywhere.">
          <div className="arc-segmented" role="group" aria-label="Theme">
            {(['dark', 'light'] as const).map((t) => (
              <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                {t === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Saved games" hint="Throw away every autosaved run in progress.">
          <ConfirmButton
            label="Delete saves"
            confirmLabel="Delete all saves?"
            onConfirm={() => ARCADE_GAMES.forEach((g) => clearSession(g.id))}
          />
        </Row>

        <Row label="Statistics" hint="Reset best scores, plays and play time for all six games.">
          <ConfirmButton label="Reset stats" confirmLabel="Reset all stats?" onConfirm={() => resetStats()} />
        </Row>
      </div>
    </div>
  );
}

/** Two-step destructive button: first click arms it, second confirms. */
function ConfirmButton({ label, confirmLabel, onConfirm }: { label: string; confirmLabel: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <span style={{ color: 'var(--text-mute)', fontSize: 13 }}>Done.</span>;
  return (
    <>
      <button
        type="button"
        className="arc-btn arc-btn--danger"
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          onConfirm();
          setDone(true);
        }}
      >
        {armed ? confirmLabel : label}
      </button>
      {armed && (
        <button type="button" className="arc-btn arc-btn--ghost" onClick={() => setArmed(false)}>
          Cancel
        </button>
      )}
    </>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row__label">{label}</div>
        <div className="settings-row__hint">{hint}</div>
      </div>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}
