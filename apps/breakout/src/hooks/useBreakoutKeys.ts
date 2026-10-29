import { useEffect, useRef } from 'react';
import { ARCADE_KEYS, isKey, shouldIgnoreKey } from '../arcade';

const LEFT = new Set(['ArrowLeft', 'a', 'A']);
const RIGHT = new Set(['ArrowRight', 'd', 'D']);

export type BreakoutKeyHandlers = {
  /** Space / Enter: start when idle or over, resume when paused, launch while playing. */
  onPrimary: () => void;
  /** P / Esc. */
  onTogglePause: () => void;
  /** R. */
  onRestart: () => void;
  /** A steering key went down (the pointer stops driving the paddle). */
  onSteer?: () => void;
};

/**
 * One window listener pair for the component's lifetime. Tracks which
 * steering keys are held and returns a ref with the current direction
 * (-1 / 0 / 1), read by the frame loop. Releases everything on window blur so
 * a key let go in another window does not keep the paddle moving.
 */
export function useBreakoutKeys(handlers: BreakoutKeyHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;
  const held = useRef({ left: false, right: false });
  const dir = useRef<-1 | 0 | 1>(0);

  useEffect(() => {
    const update = () => {
      const { left, right } = held.current;
      dir.current = left === right ? 0 : left ? -1 : 1;
    };

    const onDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKey(e)) return;
      const h = ref.current;
      if (LEFT.has(e.key) || RIGHT.has(e.key)) {
        if (e.key.startsWith('Arrow')) e.preventDefault();
        if (LEFT.has(e.key)) held.current.left = true;
        else held.current.right = true;
        update();
        h.onSteer?.();
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!e.repeat) h.onPrimary();
        return;
      }
      if (isKey(e, ARCADE_KEYS.pause)) {
        e.preventDefault();
        if (!e.repeat) h.onTogglePause();
        return;
      }
      if (isKey(e, ARCADE_KEYS.restart) && !e.repeat) h.onRestart();
    };

    const onUp = (e: KeyboardEvent) => {
      if (LEFT.has(e.key)) held.current.left = false;
      else if (RIGHT.has(e.key)) held.current.right = false;
      else return;
      update();
    };

    const release = () => {
      held.current = { left: false, right: false };
      update();
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', release);
    };
  }, []);

  return dir;
}
