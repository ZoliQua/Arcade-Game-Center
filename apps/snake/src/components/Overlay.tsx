import type { GameStatus } from '../logic/types';
import styles from './Overlay.module.css';

type Props = {
  status: GameStatus;
  score: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
};

export function Overlay({ status, score, onStart, onResume, onRestart }: Props) {
  if (status === 'running') return null;

  return (
    <div className={styles.overlay} role="dialog" aria-live="polite">
      <div className={styles.panel}>
        {status === 'idle' && (
          <>
            <h2>Snake</h2>
            <p>Arrows or WASD to move. Space/P to pause. R to restart.</p>
            <button type="button" onClick={onStart}>Start</button>
          </>
        )}
        {status === 'paused' && (
          <>
            <h2>Paused</h2>
            <button type="button" onClick={onResume}>Resume</button>
          </>
        )}
        {status === 'gameOver' && (
          <>
            <h2>Game over</h2>
            <p>Final score: {score}</p>
            <button type="button" onClick={onRestart}>Play again</button>
          </>
        )}
      </div>
    </div>
  );
}
