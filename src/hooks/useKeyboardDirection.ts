import { useEffect } from 'react';
import type { Direction } from '../logic/types';

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT',
};

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export type KeyboardDirectionHandlers = {
  onDirection: (direction: Direction) => void;
  onTogglePause?: () => void;
  onRestart?: () => void;
};

export function useKeyboardDirection(handlers: KeyboardDirectionHandlers): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (ARROW_KEYS.has(event.key)) {
        event.preventDefault();
      }

      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        handlers.onDirection(direction);
        return;
      }

      if ((event.key === ' ' || event.key === 'p' || event.key === 'P') && handlers.onTogglePause) {
        event.preventDefault();
        handlers.onTogglePause();
        return;
      }

      if ((event.key === 'r' || event.key === 'R') && handlers.onRestart) {
        handlers.onRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}
