import { useEffect, useState } from 'react';

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
