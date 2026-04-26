import { useEffect, useRef } from 'react';

export function useGameLoop(active: boolean, tickMs: number, onTick: () => void): void {
  const callbackRef = useRef(onTick);

  useEffect(() => {
    callbackRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const id = window.setInterval(() => {
      callbackRef.current();
    }, tickMs);

    return () => {
      window.clearInterval(id);
    };
  }, [active, tickMs]);
}
