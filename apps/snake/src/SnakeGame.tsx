import { useCallback, useState, type CSSProperties } from 'react';
import {
  clearSession,
  formatClock,
  GameOverlay,
  KeyHelp,
  SaveBadge,
  StatPanel,
  useArcadeRun,
  useRestoredSession,
  useRunTimer,
  useSessionAutosave,
  type ArcadeGameProps,
  type OverlayAction,
} from './arcade';
import { GameBoard } from './components/GameBoard';
import { SpeedControl } from './components/SpeedControl';
import { WrapToggle } from './components/WrapToggle';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboardDirection } from './hooks/useKeyboardDirection';
import { tickMsForSpeed } from './logic/constants';
import { advanceGame, createInitialState, isBoardFull } from './logic/game';
import { isSnakeState } from './logic/persist';
import { isOppositeDirection } from './logic/snake';
import type { Direction, GameState } from './logic/types';
import styles from './App.module.css';

/** Bump when GameState changes shape; older saves are then discarded. */
const SESSION_SCHEMA = 1;

const KEYS: [string, string][] = [
  ['← ↑ → ↓', 'Steer (or WASD)'],
  ['Space', 'Start / pause'],
  ['P Esc', 'Pause / resume'],
  ['R', 'Restart'],
];

export function SnakeGame(props: ArcadeGameProps = {}) {
  const { embedded = false } = props;
  const restored = useRestoredSession<GameState>('snake', SESSION_SCHEMA, isSnakeState);
  const [state, setState] = useState<GameState>(() =>
    restored ? { ...restored.data, status: 'paused' } : createInitialState(),
  );
  const [runId, setRunId] = useState(0);
  const [welcomeBack, setWelcomeBack] = useState(restored !== null);

  const seconds = useRunTimer(state.status === 'running', runId, runId === 0 ? (restored?.seconds ?? 0) : 0);

  const stats = useArcadeRun({
    gameId: 'snake',
    status: state.status,
    score: state.score,
    seconds,
    runKey: runId,
    outcome: () => (isBoardFull(state.snake, state.gridSize) ? 'win' : 'over'),
    props,
  });

  const inProgress = state.status === 'running' || state.status === 'paused';
  const savedAt = useSessionAutosave({
    gameId: 'snake',
    schema: SESSION_SCHEMA,
    enabled: inProgress,
    discard: state.status === 'gameOver',
    data: state,
    seconds,
    score: state.score,
  });

  const tick = useCallback(() => setState((prev) => advanceGame(prev)), []);
  useGameLoop(state.status === 'running', tickMsForSpeed(state.speed), tick);

  const startNewRun = useCallback(() => {
    setWelcomeBack(false);
    setRunId((id) => id + 1);
    setState((prev) =>
      createInitialState({ status: 'running', wrapWalls: prev.wrapWalls, speed: prev.speed }),
    );
  }, []);

  const togglePause = useCallback(() => {
    setWelcomeBack(false);
    setState((prev) => {
      if (prev.status === 'running') return { ...prev, status: 'paused' };
      if (prev.status === 'paused') return { ...prev, status: 'running' };
      return prev;
    });
  }, []);

  const primary = useCallback(() => {
    if (state.status === 'idle' || state.status === 'gameOver') startNewRun();
    else togglePause();
  }, [state.status, startNewRun, togglePause]);

  const discardSave = useCallback(() => {
    clearSession('snake');
    setWelcomeBack(false);
    setState((prev) => createInitialState({ wrapWalls: prev.wrapWalls, speed: prev.speed }));
    setRunId((id) => id + 1);
  }, []);

  const handleDirection = useCallback((direction: Direction) => {
    setState((prev) => {
      if (prev.status !== 'running') return prev;
      if (isOppositeDirection(direction, prev.direction)) return prev;
      if (direction === prev.direction) return prev;
      return { ...prev, nextDirection: direction };
    });
  }, []);

  useKeyboardDirection({
    onDirection: handleDirection,
    onPrimary: primary,
    onTogglePause: togglePause,
    onRestart: startNewRun,
  });

  const best = Math.max(stats.best, state.score);
  const newBest = state.score > 0 && state.score > stats.bestBeforeRun;
  const won = state.status === 'gameOver' && isBoardFull(state.snake, state.gridSize);

  let overlay: { title: string; message: string; actions: OverlayAction[] } | null = null;
  if (state.status === 'idle') {
    overlay = {
      title: 'Snake',
      message: 'Eat the red dots to grow. Each bite scores your current speed (1–10).',
      actions: [{ label: 'Start', onClick: startNewRun, primary: true, kbd: 'Space' }],
    };
  } else if (state.status === 'paused') {
    overlay = welcomeBack
      ? {
          title: 'Welcome back',
          message: `Your saved run was restored — score ${state.score}, ${formatClock(seconds)} played.`,
          actions: [
            { label: 'Continue', onClick: togglePause, primary: true, kbd: 'P' },
            { label: 'New game', onClick: startNewRun, kbd: 'R' },
          ],
        }
      : {
          title: 'Paused',
          message: 'Your run is autosaved — you can close the tab and continue later.',
          actions: [
            { label: 'Resume', onClick: togglePause, primary: true, kbd: 'P' },
            { label: 'Restart', onClick: startNewRun, kbd: 'R' },
          ],
        };
  } else if (state.status === 'gameOver') {
    overlay = {
      title: won ? 'Board cleared!' : 'Game over',
      message: `Score ${state.score} · Best ${best}${newBest ? ' — new best!' : ''}`,
      actions: [{ label: 'Play again', onClick: startNewRun, primary: true, kbd: 'R' }],
    };
  }

  return (
    <div className={`arc-game ${styles.game}`} style={{ '--game-color': 'var(--game-snake)' } as CSSProperties}>
      {!embedded && (
        <header className="arc-game__head">
          <div>
            <h1 className="arc-game__title">Snake</h1>
            <p className="arc-game__sub">Eat, grow, don&apos;t bite yourself.</p>
          </div>
        </header>
      )}

      <StatPanel
        status={state.status}
        items={[
          { label: 'Score', value: state.score },
          { label: 'Best', value: best, highlight: newBest },
          { label: 'Length', value: state.snake.length },
          { label: 'Time', value: formatClock(seconds) },
        ]}
      />

      <div className={styles.layout}>
        <div className={`arc-game__board ${styles.boardWrap}`}>
          <GameBoard gridSize={state.gridSize} snake={state.snake} food={state.food} />
          {overlay && <GameOverlay {...overlay} />}
        </div>

        <aside className={styles.side}>
          <section className="arc-panel">
            <h2 className="arc-panel__title">Game</h2>
            <div className={styles.buttons}>
              <button type="button" className="arc-btn arc-btn--primary" onClick={primary}>
                {state.status === 'running' ? 'Pause' : state.status === 'paused' ? 'Resume' : 'Start'}
              </button>
              <button type="button" className="arc-btn" onClick={startNewRun} disabled={state.status === 'idle'}>
                Restart
              </button>
            </div>
            <div className={styles.save}>
              <SaveBadge savedAt={inProgress ? savedAt : null} onDiscard={discardSave} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Settings</h2>
            <div className={styles.settings}>
              <SpeedControl speed={state.speed} onChange={(speed) => setState((p) => ({ ...p, speed }))} />
              <WrapToggle wrapWalls={state.wrapWalls} onChange={(wrapWalls) => setState((p) => ({ ...p, wrapWalls }))} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Keys</h2>
            <KeyHelp rows={KEYS} />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default SnakeGame;
