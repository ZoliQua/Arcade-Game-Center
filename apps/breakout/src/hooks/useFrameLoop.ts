import { useEffect, useRef } from 'react';
import { MAX_FRAME_MS } from '../logic/constants';

/**
 * requestAnimationFrame loop that runs only while `active`. Calls `onFrame`
 * with the elapsed milliseconds since the previous frame, clamped to
 * MAX_FRAME_MS so a stalled tab or a resume never makes the simulation jump.
 * The callback is read from a ref, so it never goes stale.
 */
export function useFrameLoop(active: boolean, onFrame: (dtMs: number) => void): void {
  const cb = useRef(onFrame);
  cb.current = onFrame;

  useEffect(() => {
    if (!active) return;
    const hasRaf = typeof window.requestAnimationFrame === 'function';
    let id = 0;
    let last: number | null = null;

    const frame = (now: number) => {
      const dt = last === null ? 0 : Math.min(MAX_FRAME_MS, Math.max(0, now - last));
      last = now;
      if (dt > 0) cb.current(dt);
      schedule();
    };
    const schedule = () => {
      id = hasRaf
        ? window.requestAnimationFrame(frame)
        : window.setTimeout(() => frame(performance.now()), 16);
    };
    schedule();

    return () => {
      if (hasRaf) window.cancelAnimationFrame(id);
      else window.clearTimeout(id);
    };
  }, [active]);
}
