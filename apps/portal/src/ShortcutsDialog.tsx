import { useEffect, useRef } from 'react';
import { gameInfo, KeyHelp, type ArcadeGameId } from '@arcade/kit';

const GLOBAL_KEYS: [string, string][] = [
  ['T', 'Toggle dark / light theme'],
  ['?', 'Show / hide this help'],
];

const GAME_KEYS: [string, string][] = [
  ['P Esc', 'Pause / resume'],
  ['R', 'Restart / new round'],
  ['Space Enter', 'Start · primary action'],
];

export function ShortcutsDialog({ gameId, onClose }: { gameId: ArcadeGameId | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="portal-dialog" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={onClose}>
      <div className="arc-panel portal-dialog__card" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard shortcuts</h2>
        <section>
          <h3 className="arc-panel__title">Everywhere</h3>
          <KeyHelp rows={GLOBAL_KEYS} />
        </section>
        <section>
          <h3 className="arc-panel__title">In every game</h3>
          <KeyHelp rows={GAME_KEYS} />
        </section>
        <p>
          {gameId
            ? `${gameInfo(gameId).name}'s own controls are listed in the Keys panel next to the board.`
            : 'Each game lists its own controls in the Keys panel next to the board.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button ref={closeRef} type="button" className="arc-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
