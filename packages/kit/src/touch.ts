import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

const COARSE = '(pointer: coarse)';

function coarseQuery(): MediaQueryList | null {
  try {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(COARSE) : null;
  } catch {
    return null;
  }
}

/**
 * True on a touch-first device (`(pointer: coarse)`), live: follows the media query when it changes
 * (e.g. a tablet docking a mouse). False where `matchMedia` is missing (old browsers, jsdom).
 */
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(() => coarseQuery()?.matches ?? false);
  useEffect(() => {
    const mq = coarseQuery();
    if (!mq) return;
    setTouch(mq.matches);
    const onChange = () => setTouch(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    mq.addListener?.(onChange);
    return () => mq.removeListener?.(onChange);
  }, []);
  return touch;
}

export type SwipeDir = 'up' | 'down' | 'left' | 'right';
export type SwipeInfo = { dx: number; dy: number; ms: number };

/** Gestures that start on these never become a swipe or a tap (controls inside a board keep working). */
const NO_SWIPE = 'button, a, input, select, textarea, [data-no-swipe]';

function startsOnControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(NO_SWIPE) !== null;
}

/**
 * Swipe and tap on `ref` with Pointer Events (touch, pen and mouse alike).
 * - A gesture is one pointer from `pointerdown` to `pointerup`; a second finger meanwhile is ignored.
 * - Distance >= `threshold` (24 px) on the dominant axis → `onSwipe(dir, { dx, dy, ms })`; less → `opts.onTap(e)`.
 * - `pointercancel` (the browser took the gesture, e.g. a scroll) drops it.
 * - Gestures that start on `button, a, input, select, textarea, [data-no-swipe]` are ignored.
 * Give the board `.arc-board-touch` so the page does not scroll or zoom under the finger.
 */
export function useSwipe(
  ref: RefObject<HTMLElement>,
  onSwipe: (dir: SwipeDir, info: SwipeInfo) => void,
  opts: { threshold?: number; onTap?: (e: PointerEvent) => void } = {},
): void {
  const latest = useRef({ onSwipe, onTap: opts.onTap, threshold: opts.threshold ?? 24 });
  latest.current = { onSwipe, onTap: opts.onTap, threshold: opts.threshold ?? 24 };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { id: number; x: number; y: number; t: number } | null = null;

    const end = () => {
      start = null;
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
    const onUp = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const ms = Date.now() - start.t;
      end();
      const { onSwipe: swipe, onTap, threshold } = latest.current;
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= threshold) {
        const dir: SwipeDir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
        swipe(dir, { dx, dy, ms });
      } else {
        onTap?.(e);
      }
    };
    const onCancel = (e: PointerEvent) => {
      if (start && e.pointerId === start.id) end();
    };
    const onDown = (e: PointerEvent) => {
      if (start) return; // second finger
      if (e.button > 0) return; // right/middle mouse button
      if (startsOnControl(e.target)) return;
      start = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now() };
      // Listen on window: a mouse released outside the board still ends the gesture.
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    };

    el.addEventListener('pointerdown', onDown);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      end();
    };
  }, [ref]);
}

export type LongPressHandlers = {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerLeave: (e: ReactPointerEvent) => void;
  onPointerCancel: (e: ReactPointerEvent) => void;
};

/** A finger that drifts further than this is panning, not pressing. */
const LONG_PRESS_SLOP = 10;

/**
 * Long press (default 400 ms) for a cell or button; spread the returned handlers on the element.
 * - On fire: `navigator.vibrate?.(15)` and `onLongPress(nativeEvent)`.
 * - The click the browser sends after that release is swallowed, so a flag never also opens the cell.
 * - Release, leave, cancel or a drift of more than 10 px before the time is up: nothing happens
 *   (the ordinary click goes through).
 * Pair with `.arc-board-tap`/`.arc-board-touch` (they also turn off the iOS callout).
 */
export function useLongPress(onLongPress: (e: PointerEvent) => void, opts: { ms?: number } = {}): LongPressHandlers {
  const ms = opts.ms ?? 400;
  const cb = useRef(onLongPress);
  cb.current = onLongPress;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const swallow = useRef<{ fn: (e: MouseEvent) => void; drop: ReturnType<typeof setTimeout> | null } | null>(null);

  const handlers = useMemo(() => {
    const onMove = (e: PointerEvent) => {
      const o = origin.current;
      if (o && Math.hypot(e.clientX - o.x, e.clientY - o.y) > LONG_PRESS_SLOP) cancel();
    };
    const cancel = () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
      origin.current = null;
      window.removeEventListener('pointermove', onMove);
    };
    const unswallow = () => {
      const s = swallow.current;
      if (!s) return;
      window.removeEventListener('click', s.fn, true);
      if (s.drop !== null) clearTimeout(s.drop);
      swallow.current = null;
    };
    const armSwallow = () => {
      unswallow();
      const fn = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        unswallow();
      };
      swallow.current = { fn, drop: null };
      window.addEventListener('click', fn, true);
    };
    const release = () => {
      cancel();
      // The click follows the release at once; if none comes (finger moved off), stop waiting.
      const s = swallow.current;
      if (s && s.drop === null) s.drop = setTimeout(unswallow, 400);
    };
    const down = (e: ReactPointerEvent) => {
      if (e.button > 0) return;
      cancel();
      unswallow();
      const native = e.nativeEvent;
      origin.current = { x: e.clientX, y: e.clientY };
      window.addEventListener('pointermove', onMove);
      timer.current = setTimeout(() => {
        timer.current = null;
        window.removeEventListener('pointermove', onMove);
        try {
          navigator.vibrate?.(15);
        } catch {
          /* some browsers throw without a user gesture */
        }
        armSwallow();
        cb.current(native);
      }, ms);
    };
    return {
      handlers: {
        onPointerDown: down,
        onPointerUp: release,
        onPointerLeave: release,
        onPointerCancel: release,
      } satisfies LongPressHandlers,
      dispose: () => {
        cancel();
        unswallow();
      },
    };
  }, [ms]);

  useEffect(() => handlers.dispose, [handlers]);
  return handlers.handlers;
}
