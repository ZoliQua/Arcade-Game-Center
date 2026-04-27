import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import './styles/index.css';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { Overlay } from './components/Overlay';
import { ScoreBoard } from './components/ScoreBoard';
import { useElapsedSeconds } from './hooks/useElapsedSeconds';
import { useHighScore } from './hooks/useHighScore';
import { useKeyboardMove } from './hooks/useKeyboardMove';
import { useSwipeInput } from './hooks/useSwipeInput';
import { ANIMATION_MS } from './logic/constants';
import { advanceGame, createInitialState } from './logic/game';
import type { GameAction, GameState } from './logic/types';

const defaultRng: () => number = Math.random;

function init(best: number): GameState {
  return createInitialState(defaultRng, { best });
}

function reducer(state: GameState, action: GameAction): GameState {
  return advanceGame(state, action, defaultRng);
}

type Game2048Props = {
  onGameOver?: (score: number) => void;
};

export function Game2048({ onGameOver }: Game2048Props = {}) {
  const { best, recordScore } = useHighScore();
  const [state, dispatch] = useReducer(reducer, best, init);
  const [sessionId, setSessionId] = useState(0);

  useEffect(() => {
    recordScore(state.score);
  }, [state.score, recordScore]);

  const lastReportedRef = useRef<typeof state.status>(state.status);
  useEffect(() => {
    if (state.status === 'gameOver' && lastReportedRef.current !== 'gameOver') {
      onGameOver?.(state.score);
    }
    lastReportedRef.current = state.status;
  }, [state.status, state.score, onGameOver]);

  const hasDying = useMemo(
    () => state.tiles.some((t) => t.isDying || t.isNew || t.mergedFrom),
    [state.tiles],
  );

  useEffect(() => {
    if (!hasDying) return;
    const id = window.setTimeout(() => {
      dispatch({ type: 'commitAnimation' });
    }, ANIMATION_MS + 40);
    return () => window.clearTimeout(id);
  }, [hasDying, state.moveCount]);

  useKeyboardMove(state.status, dispatch);
  const swipeEnabled = state.status === 'idle' || state.status === 'running';
  const boardRef = useSwipeInput(swipeEnabled, dispatch);

  const onRestart = useCallback(() => {
    dispatch({ type: 'restart' });
    setSessionId((s) => s + 1);
  }, []);
  const onContinue = useCallback(() => dispatch({ type: 'continueAfterWin' }), []);
  const onResume = useCallback(() => dispatch({ type: 'resume' }), []);
  const onUndo = useCallback(() => dispatch({ type: 'undo' }), []);
  const onPauseToggle = useCallback(() => {
    dispatch(state.status === 'paused' ? { type: 'resume' } : { type: 'pause' });
  }, [state.status]);

  const elapsed = useElapsedSeconds(state.status === 'running', sessionId);

  const displayedBest = Math.max(best, state.best);

  return (
    <div className="g2048">
      <ScoreBoard
        score={state.score}
        best={displayedBest}
        moves={state.moveCount}
        elapsedSeconds={elapsed}
        status={state.status}
      />

      <div className="app__board-wrap">
        <GameBoard ref={boardRef} tiles={state.tiles} />
        <Overlay
          status={state.status}
          score={state.score}
          onContinue={onContinue}
          onRestart={onRestart}
          onResume={onResume}
        />
      </div>

      <GameControls
        status={state.status}
        canUndo={state.history.length > 0}
        onRestart={onRestart}
        onPauseToggle={onPauseToggle}
        onContinue={onContinue}
        onUndo={onUndo}
      />
    </div>
  );
}

export default Game2048;
