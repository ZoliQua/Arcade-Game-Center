import { useEffect, useRef, useState } from 'react';

export function useElapsedSeconds(running: boolean, resetKey: unknown): number {
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef<number | null>(null);
  const accumMsRef = useRef(0);

  useEffect(() => {
    setSeconds(0);
    startRef.current = null;
    accumMsRef.current = 0;
  }, [resetKey]);

  useEffect(() => {
    if (!running) {
      return;
    }

    startRef.current = Date.now();
    const id = window.setInterval(() => {
      const base = startRef.current ?? Date.now();
      const total = accumMsRef.current + (Date.now() - base);
      setSeconds(Math.floor(total / 1000));
    }, 250);

    return () => {
      window.clearInterval(id);
      if (startRef.current !== null) {
        accumMsRef.current += Date.now() - startRef.current;
        startRef.current = null;
      }
      setSeconds(Math.floor(accumMsRef.current / 1000));
    };
  }, [running]);

  return seconds;
}

export function formatSeconds(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
