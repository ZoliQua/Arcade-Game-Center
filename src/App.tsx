import { useCallback, useEffect, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { Overlay } from './components/Overlay';
import { ScoreBoard } from './components/ScoreBoard';
import { SpeedControl } from './components/SpeedControl';
import { WrapToggle } from './components/WrapToggle';
import { useElapsedSeconds } from './hooks/useElapsedSeconds';
import { useGameLoop } from './hooks/useGameLoop';
import { useHighScore } from './hooks/useHighScore';
import { useKeyboardDirection } from './hooks/useKeyboardDirection';
import { tickMsForSpeed } from './logic/constants';
import { advanceGame, createInitialState } from './logic/game';
import { isOppositeDirection } from './logic/snake';
import type { Direction } from './logic/types';
import styles from './App.module.css';

export default function App() {
  const [state, setState] = useState(createInitialState);
  const [gameId, setGameId] = useState(0);
  const { highScore, recordScore } = useHighScore();
  const elapsedSeconds = useElapsedSeconds(state.status === 'running', gameId);

  useEffect(() => {
    if (state.status === 'gameOver') {
      recordScore(state.score);
    }
  }, [state.status, state.score, recordScore]);

  const tick = useCallback(() => {
    setState((prev) => advanceGame(prev));
  }, []);

  useGameLoop(state.status === 'running', tickMsForSpeed(state.speed), tick);

  const handleStart = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'idle' && prev.status !== 'gameOver') return prev;
      setGameId((id) => id + 1);
      return createInitialState({
        status: 'running',
        wrapWalls: prev.wrapWalls,
        speed: prev.speed,
      });
    });
  }, []);

  const handleTogglePause = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'running') return { ...prev, status: 'paused' };
      if (prev.status === 'paused') return { ...prev, status: 'running' };
      return prev;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setGameId((id) => id + 1);
    setState((prev) =>
      createInitialState({
        status: 'running',
        wrapWalls: prev.wrapWalls,
        speed: prev.speed,
      }),
    );
  }, []);

  const handleWrapChange = useCallback((wrapWalls: boolean) => {
    setState((prev) => ({ ...prev, wrapWalls }));
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const handleDirection = useCallback((direction: Direction) => {
    setState((prev) => {
      if (prev.status !== 'running' && prev.status !== 'paused') return prev;
      if (isOppositeDirection(direction, prev.direction)) return prev;
      if (direction === prev.direction) return prev;
      return { ...prev, nextDirection: direction };
    });
  }, []);

  useKeyboardDirection({
    onDirection: handleDirection,
    onTogglePause: handleTogglePause,
    onRestart: handleRestart,
  });

  return (
    <main className={styles.app}>
      <ScoreBoard
        score={state.score}
        highScore={highScore}
        status={state.status}
        elapsedSeconds={elapsedSeconds}
      />
      <div className={styles.boardWrap}>
        <GameBoard gridSize={state.gridSize} snake={state.snake} food={state.food} />
        <Overlay
          status={state.status}
          score={state.score}
          onStart={handleStart}
          onResume={handleTogglePause}
          onRestart={handleRestart}
        />
      </div>
      <GameControls
        status={state.status}
        onStart={handleStart}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
      />
      <SpeedControl speed={state.speed} onChange={handleSpeedChange} />
      <WrapToggle wrapWalls={state.wrapWalls} onChange={handleWrapChange} />
    </main>
  );
}
