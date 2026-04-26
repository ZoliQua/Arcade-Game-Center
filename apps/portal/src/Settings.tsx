import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { Theme } from '@arcade/ui';

type SettingsProps = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

export function Settings({ theme, setTheme }: SettingsProps) {
  return (
    <div>
      <div className="section-head">
        <h2>Settings</h2>
        <span>Preferences are saved locally</span>
      </div>
      <div className="panel" style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
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
        <Row label="Reduced motion" hint="Limit board animations and transitions.">
          <button className="btn">Off</button>
          <button className="btn">On</button>
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
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </div>
  );
}
