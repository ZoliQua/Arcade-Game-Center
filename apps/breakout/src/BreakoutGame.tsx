import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
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
import { Playfield } from './components/Playfield';
import { PowerUpList } from './components/PowerUpList';
import { SoundToggle } from './components/SoundToggle';
import { useBreakoutKeys } from './hooks/useBreakoutKeys';
import { useFrameLoop } from './hooks/useFrameLoop';
import { useSound } from './hooks/useSound';
import { FIELD_W, STEP_MS } from './logic/constants';
import { awaitingLaunch, createInitialState, step } from './logic/game';
import { layoutForLevel } from './logic/levels';
import { isBreakoutState } from './logic/persist';
import { randomSeed } from './logic/rng';
import type { GameEvent, GameState } from './logic/types';
import styles from './App.module.css';

/** Bump when GameState changes shape; older saves are then discarded. */
const SESSION_SCHEMA = 1;

const KEYS: [string, string][] = [
  ['← →', 'Move paddle (or A D)'],
  ['Space', 'Start · launch ball'],
  ['P Esc', 'Pause / resume'],
  ['R', 'Restart'],
];

/** Pointer position over the board → logical x of the playfield. */
function toLogicalX(e: ReactPointerEvent<SVGSVGElement>): number | null {
  const rect = e.currentTarget.getBoundingClientRect();
  if (rect.width <= 0) return null;
  return ((e.clientX - rect.left) / rect.width) * FIELD_W;
}

const newRun = (): GameState => createInitialState({ status: 'running', seed: randomSeed() });

export function BreakoutGame(props: ArcadeGameProps = {}) {
  const { embedded = false } = props;
  const restored = useRestoredSession<GameState>('breakout', SESSION_SCHEMA, isBreakoutState);
  const [state, setState] = useState<GameState>(() =>
    restored && restored.data.status !== 'gameOver' ? { ...restored.data, status: 'paused' } : createInitialState(),
  );
  const [runId, setRunId] = useState(0);
  const [welcomeBack, setWelcomeBack] = useState(restored !== null && restored.data.status !== 'gameOver');
  const sound = useSound();

  // The frame loop and the input handlers share one authoritative copy of the
  // state, so a pause pressed between two frames is never overwritten.
  const stateRef = useRef(state);
  const commit = useCallback((next: GameState) => {
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
  }, []);

  const seconds = useRunTimer(state.status === 'running', runId, runId === 0 ? (restored?.seconds ?? 0) : 0);

  // Levels loop forever with a faster ball: a run only ends with the last life.
  const stats = useArcadeRun({
    gameId: 'breakout',
    status: state.status,
    score: state.score,
    seconds,
    runKey: runId,
    outcome: 'over',
    props,
  });

  const inProgress = state.status === 'running' || state.status === 'paused';
  const savedAt = useSessionAutosave({
    gameId: 'breakout',
    schema: SESSION_SCHEMA,
    enabled: inProgress,
    discard: state.status === 'gameOver',
    data: state,
    seconds,
    score: state.score,
  });

  // ── input ──
  const targetRef = useRef<number | null>(null);
  const launchRef = useRef(false);
  const accRef = useRef(0);

  const startNewRun = useCallback(() => {
    setWelcomeBack(false);
    setRunId((id) => id + 1);
    targetRef.current = null;
    launchRef.current = false;
    accRef.current = 0;
    commit(newRun());
  }, [commit]);

  const togglePause = useCallback(() => {
    setWelcomeBack(false);
    const s = stateRef.current;
    if (s.status === 'running') commit({ ...s, status: 'paused' });
    else if (s.status === 'paused') {
      accRef.current = 0;
      commit({ ...s, status: 'running' });
    }
  }, [commit]);

  const primary = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'idle' || s.status === 'gameOver') startNewRun();
    else if (s.status === 'paused') togglePause();
    else launchRef.current = true;
  }, [startNewRun, togglePause]);

  const discardSave = useCallback(() => {
    clearSession('breakout');
    setWelcomeBack(false);
    setRunId((id) => id + 1);
    commit(createInitialState());
  }, [commit]);

  const dirRef = useBreakoutKeys({
    onPrimary: primary,
    onTogglePause: togglePause,
    onRestart: startNewRun,
    onSteer: () => {
      targetRef.current = null;
    },
  });

  const onPointerMove = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    const x = toLogicalX(e);
    if (x !== null) targetRef.current = x;
  }, []);

  const onPointerDown = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    const x = toLogicalX(e);
    if (x !== null) targetRef.current = x;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* capture is optional (synthetic events) */
    }
    if (stateRef.current.status === 'running') launchRef.current = true;
  }, []);

  // ── simulation: fixed 120 Hz steps, accumulated over animation frames ──
  const playSound = sound.play;
  const onFrame = useCallback(
    (dtMs: number) => {
      let s = stateRef.current;
      if (s.status !== 'running') return;
      accRef.current += dtMs;
      const events: GameEvent[] = [];
      while (accRef.current >= STEP_MS && s.status === 'running') {
        accRef.current -= STEP_MS;
        s = step(s, STEP_MS, { dir: dirRef.current, targetX: targetRef.current, launch: launchRef.current }, events);
        launchRef.current = false;
      }
      commit(s);
      playSound(events);
    },
    [commit, dirRef, playSound],
  );
  useFrameLoop(state.status === 'running', onFrame);

  // Hidden tab → pause (and the frame clamp keeps the resume smooth).
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && stateRef.current.status === 'running') {
        commit({ ...stateRef.current, status: 'paused' });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [commit]);

  const best = Math.max(stats.best, state.score);
  const newBest = state.score > 0 && state.score > stats.bestBeforeRun;
  const layout = layoutForLevel(state.level);

  let overlay: { title: string; message: string; actions: OverlayAction[] } | null = null;
  if (state.status === 'idle') {
    overlay = {
      title: 'Breakout',
      message:
        'Keep the ball in play and smash every brick. Steer with ← → or the mouse; hit near the paddle edge for a sharper angle. Catch the falling capsules for power-ups.',
      actions: [{ label: 'Start', onClick: startNewRun, primary: true, kbd: 'Space' }],
    };
  } else if (state.status === 'paused') {
    overlay = welcomeBack
      ? {
          title: 'Welcome back',
          message: `Your saved run was restored — score ${state.score}, level ${state.level}, ${state.lives} ${
            state.lives === 1 ? 'life' : 'lives'
          } left, ${formatClock(seconds)} played.`,
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
      title: 'Game over',
      message: `Score ${state.score} · Level ${state.level} · Best ${best}${newBest ? ' — new best!' : ''}`,
      actions: [{ label: 'Play again', onClick: startNewRun, primary: true, kbd: 'R' }],
    };
  }

  const statusLabel = state.status === 'running' && awaitingLaunch(state) ? 'Launch!' : undefined;

  return (
    <div className={`arc-game ${styles.game}`} style={{ '--game-color': 'var(--game-breakout)' } as CSSProperties}>
      {!embedded && (
        <header className="arc-game__head">
          <div>
            <h1 className="arc-game__title">Breakout</h1>
            <p className="arc-game__sub">Bounce the ball, smash every brick.</p>
          </div>
        </header>
      )}

      <StatPanel
        status={state.status}
        statusLabel={statusLabel}
        items={[
          { label: 'Score', value: state.score },
          { label: 'Best', value: best, highlight: newBest },
          { label: 'Level', value: state.level },
          { label: 'Lives', value: state.lives },
          { label: 'Time', value: formatClock(seconds) },
        ]}
      />

      <div className={styles.layout}>
        <div className={`arc-game__board ${styles.boardWrap}`}>
          <Playfield state={state} onPointerMove={onPointerMove} onPointerDown={onPointerDown} />
          {overlay && <GameOverlay {...overlay} />}
        </div>

        <aside className={styles.side}>
          <section className="arc-panel">
            <h2 className="arc-panel__title">Game</h2>
            <div className={styles.buttons}>
              <button
                type="button"
                className="arc-btn arc-btn--primary"
                onClick={state.status === 'running' ? togglePause : primary}
              >
                {state.status === 'running' ? 'Pause' : state.status === 'paused' ? 'Resume' : 'Start'}
              </button>
              <button type="button" className="arc-btn" onClick={startNewRun} disabled={state.status === 'idle'}>
                Restart
              </button>
            </div>
            <p className={styles.level}>
              Level {state.level} · <strong>{layout.name}</strong>
            </p>
            <div className={styles.save}>
              <SaveBadge savedAt={inProgress ? savedAt : null} onDiscard={discardSave} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Power-ups</h2>
            <PowerUpList effects={state.effects} />
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Settings</h2>
            <SoundToggle enabled={sound.enabled} onChange={sound.setEnabled} />
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Keys</h2>
            <KeyHelp rows={KEYS} />
            <p className={styles.note}>Mouse or touch: move over the board to steer, click or tap to launch.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default BreakoutGame;
