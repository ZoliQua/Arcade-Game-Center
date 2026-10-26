import { useCallback, useEffect, useState } from 'react';
import type { ArcadeDemoProps } from '../arcade';
import { GameBoard } from '../components/GameBoard';
import { useGameLoop } from '../hooks/useGameLoop';
import { chooseDirection } from '../logic/autopilot';
import { advanceGame, createInitialState } from '../logic/game';
import type { GameState } from '../logic/types';

const DEMO_GRID = 16;
const DEMO_TICK_MS = 110;

const freshDemo = (): GameState =>
  createInitialState({ status: 'running', gridSize: DEMO_GRID, wrapWalls: true, speed: 6 });

/**
 * Attract mode for the portal landing page: the real Snake engine steered by
 * a BFS autopilot. No keyboard, no stats, no saves.
 */
export function SnakeDemo({ active = true }: ArcadeDemoProps) {
  const [state, setState] = useState(freshDemo);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running') return prev;
      return advanceGame({ ...prev, nextDirection: chooseDirection(prev) });
    });
  }, []);

  useGameLoop(active && state.status === 'running', DEMO_TICK_MS, tick);

  useEffect(() => {
    if (!active || state.status !== 'gameOver') return;
    const id = window.setTimeout(() => setState(freshDemo), 1200);
    return () => window.clearTimeout(id);
  }, [active, state.status]);

  return (
    <div className="arc-demo">
      <GameBoard gridSize={state.gridSize} snake={state.snake} food={state.food} variant="mini" />
    </div>
  );
}

export default SnakeDemo;
