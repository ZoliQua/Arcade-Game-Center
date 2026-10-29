import { useEffect, useState } from 'react';
import type { ArcadeDemoProps } from '../arcade';
import { Playfield } from '../components/Playfield';
import { demoAdvance } from '../logic/autopilot';
import { createInitialState } from '../logic/game';
import type { GameState } from '../logic/types';

/** One timer chain; each tick simulates this much game time in fixed 120 Hz steps. */
const DEMO_TICK_MS = 50;
const RESTART_MS = 1500;

let demoRuns = 0;
/** Different (but deterministic) walls of bricks and drops for each loop. */
const freshDemo = (): GameState => {
  demoRuns += 1;
  return createInitialState({ status: 'running', seed: demoRuns * 7919 });
};

/**
 * Attract mode for the portal landing page: the real Breakout engine with an
 * autopilot paddle that tracks the predicted landing point of the next ball
 * (slightly imperfectly, so it does miss now and then). No keyboard, no
 * sound, no stats, no saves.
 */
export function BreakoutDemo({ active = true }: ArcadeDemoProps) {
  const [state, setState] = useState(freshDemo);
  const over = state.status === 'gameOver';

  useEffect(() => {
    if (!active) return;
    if (over) {
      const id = window.setTimeout(() => setState(freshDemo()), RESTART_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => setState((s) => demoAdvance(s, DEMO_TICK_MS)), DEMO_TICK_MS);
    return () => window.clearInterval(id);
  }, [active, over]);

  return (
    <div className="arc-demo" aria-hidden="true">
      <Playfield state={state} variant="mini" />
    </div>
  );
}

export default BreakoutDemo;
