import { useCallback, useRef, useState, type CSSProperties } from 'react';
import {
  clearSession,
  formatClock,
  FinishButton,
  formatNumber,
  FullscreenButton,
  gameName,
  GameOverlay,
  KeyHelp,
  RulesButton,
  SaveBadge,
  StatPanel,
  TouchHelp,
  TouchPad,
  useArcadeRun,
  useDental,
  useImmersive,
  useKitMessages,
  useLang,
  useMessages,
  useRestoredSession,
  useRunTimer,
  useSessionAutosave,
  useSwipe,
  type ArcadeGameProps,
  type OverlayAction,
} from './arcade';
import { DentalToggle } from './components/DentalToggle';
import { GameBoard } from './components/GameBoard';
import { SpeedControl } from './components/SpeedControl';
import { WrapToggle } from './components/WrapToggle';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboardDirection } from './hooks/useKeyboardDirection';
import { MESSAGES, type SnakeMessageKey } from './i18n';
import { useRulesSections } from './rules';
import { tickMsForSpeed } from './logic/constants';
import { advanceGame, createInitialState, isBoardFull } from './logic/game';
import { isSnakeState } from './logic/persist';
import { isOppositeDirection } from './logic/snake';
import type { Direction, GameState } from './logic/types';
import styles from './App.module.css';

/** Bump when GameState changes shape; older saves are then discarded. */
const SESSION_SCHEMA = 1;

/** Key-help rows; `null` keys stand for the translated name of the Space bar. */
const KEYS: [string | null, SnakeMessageKey][] = [
  ['← ↑ → ↓', 'keySteer'],
  [null, 'keyStartPause'],
  ['P Esc', 'keyPauseResume'],
  ['R', 'keyRestart'],
];

const DIR_OF_SWIPE = { up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT' } as const satisfies Record<string, Direction>;

const PAD: [string, string, SnakeMessageKey][] = [
  ['up', '↑', 'padUp'],
  ['left', '←', 'padLeft'],
  ['right', '→', 'padRight'],
  ['down', '↓', 'padDown'],
];
const PAD_DIRECTION: Record<string, Direction> = { up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT' };

export function SnakeGame(props: ArcadeGameProps = {}) {
  const { embedded = false } = props;
  const t = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const num = (n: number) => formatNumber(n, lang);
  const restored = useRestoredSession<GameState>('snake', SESSION_SCHEMA, isSnakeState);
  const [state, setState] = useState<GameState>(() =>
    restored ? { ...restored.data, status: 'paused' } : createInitialState(),
  );
  const [runId, setRunId] = useState(0);
  const [welcomeBack, setWelcomeBack] = useState(restored !== null);
  const [dental] = useDental();
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const immersive = useImmersive(rootRef);
  const rulesSections = useRulesSections();
  // The Finish confirm is open: the snake and the clock stand still without leaving `running`.
  const [finishOpen, setFinishOpen] = useState(false);
  const live = state.status === 'running' && !finishOpen;

  const seconds = useRunTimer(live, runId, runId === 0 ? (restored?.seconds ?? 0) : 0);

  const stats = useArcadeRun({
    gameId: 'snake',
    status: state.status,
    score: state.score,
    seconds,
    runKey: runId,
    outcome: () => (state.finishedEarly ? 'finished' : isBoardFull(state.snake, state.gridSize) ? 'win' : 'over'),
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
  useGameLoop(live, tickMsForSpeed(state.speed), tick);

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

  const openRules = useCallback((open: boolean) => {
    if (!open) return;
    setState((prev) => (prev.status === 'running' ? { ...prev, status: 'paused' } : prev));
  }, []);

  const finishEarly = useCallback(() => {
    setWelcomeBack(false);
    setState((prev) => (prev.status === 'running' || prev.status === 'paused' ? { ...prev, status: 'gameOver', finishedEarly: true } : prev));
  }, []);

  useSwipe(boardRef, (dir) => handleDirection(DIR_OF_SWIPE[dir]), {
    onTap: () => {
      if (state.status === 'idle') startNewRun();
    },
  });

  useKeyboardDirection({
    onDirection: handleDirection,
    onPrimary: primary,
    onTogglePause: togglePause,
    onRestart: startNewRun,
  });

  const best = Math.max(stats.best, state.score);
  const newBest = state.score > 0 && state.score > stats.bestBeforeRun;
  const won = state.status === 'gameOver' && !state.finishedEarly && isBoardFull(state.snake, state.gridSize);

  let overlay: { title: string; message: string; actions: OverlayAction[] } | null = null;
  if (state.status === 'idle') {
    overlay = {
      title: gameName('snake', lang),
      message: t('idleMessage'),
      actions: [{ label: k('start'), onClick: startNewRun, primary: true, kbd: t('keySpace') }],
    };
  } else if (state.status === 'paused') {
    overlay = welcomeBack
      ? {
          title: k('welcomeBack'),
          message: t('welcomeMessage', { score: num(state.score), time: formatClock(seconds) }),
          actions: [
            { label: t('continue'), onClick: togglePause, primary: true, kbd: 'P' },
            { label: k('newGame'), onClick: startNewRun, kbd: 'R' },
          ],
        }
      : {
          title: k('paused'),
          message: t('pausedMessage'),
          actions: [
            { label: k('resume'), onClick: togglePause, primary: true, kbd: 'P' },
            { label: k('restart'), onClick: startNewRun, kbd: 'R' },
          ],
        };
  } else if (state.status === 'gameOver') {
    overlay = {
      title: state.finishedEarly ? k('finishedEarly') : won ? t('boardCleared') : k('gameOver'),
      message: t('gameOverMessage', { score: num(state.score), best: num(best) }) + (newBest ? t('newBestSuffix') : ''),
      actions: [{ label: t('playAgain'), onClick: startNewRun, primary: true, kbd: 'R' }],
    };
  }

  return (
    <div ref={rootRef} className={`arc-game ${styles.game}`} style={{ '--game-color': 'var(--game-snake)' } as CSSProperties}>
      {!embedded && (
        <header className="arc-game__head">
          <div>
            <h1 className="arc-game__title">{gameName('snake', lang)}</h1>
            <p className="arc-game__sub">{t('subtitle')}</p>
          </div>
        </header>
      )}

      <StatPanel
        status={state.status}
        items={[
          { label: k('score'), value: num(state.score) },
          { label: k('best'), value: num(best), highlight: newBest },
          { label: t('length'), value: state.snake.length },
          { label: k('time'), value: formatClock(seconds) },
        ]}
      />

      <div className={styles.layout}>
        <div className={styles.boardCol}>
        <div ref={boardRef} className={`arc-game__board arc-board-touch ${styles.boardWrap}`}>
          <GameBoard
            gridSize={state.gridSize}
            snake={state.snake}
            food={state.food}
            direction={state.direction}
            dental={dental}
            label={t('board')}
          />
          {overlay && <GameOverlay {...overlay} />}
        </div>
        <TouchPad
          layout="dpad"
          buttons={PAD.map(([id, icon, label]) => ({
            id,
            icon,
            label: t(label),
            onPress: () => handleDirection(PAD_DIRECTION[id]),
          }))}
        />
        </div>

        <aside className={styles.side}>
          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelGame')}</h2>
            <div className={styles.buttons}>
              <button type="button" className="arc-btn arc-btn--primary" onClick={primary}>
                {state.status === 'running' ? k('pause') : state.status === 'paused' ? k('resume') : k('start')}
              </button>
              <button type="button" className="arc-btn" onClick={startNewRun} disabled={state.status === 'idle'}>
                {k('restart')}
              </button>
            </div>
            <div className={styles.tools}>
              <RulesButton sections={rulesSections} gameId="snake" onOpenChange={openRules} hotkey={false} />
              <FinishButton score={state.score} visible={inProgress} onFinish={finishEarly} onOpenChange={setFinishOpen} />
              <FullscreenButton immersive={immersive} />
            </div>
            <div className={styles.save}>
              <SaveBadge savedAt={inProgress ? savedAt : null} onDiscard={discardSave} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelSettings')}</h2>
            <div className={styles.settings}>
              <SpeedControl label={t('speed')} speed={state.speed} onChange={(speed) => setState((p) => ({ ...p, speed }))} />
              <WrapToggle
                label={t('wrapWalls')}
                onLabel={t('on')}
                offLabel={t('off')}
                wrapWalls={state.wrapWalls}
                onChange={(wrapWalls) => setState((p) => ({ ...p, wrapWalls }))}
              />
              <DentalToggle hintClassName={styles.hint} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelKeys')}</h2>
            <KeyHelp rows={KEYS.map(([keys, action]) => [keys ?? t('keySpace'), t(action)])} />
            <TouchHelp
              rows={[
                [t('touchSwipe'), t('touchSwipeAction')],
                [t('touchTap'), t('touchTapAction')],
                [t('touchDpad'), t('touchDpadAction')],
              ]}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default SnakeGame;
