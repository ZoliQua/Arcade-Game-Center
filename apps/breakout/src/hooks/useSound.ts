import { useCallback, useEffect, useRef, useState } from 'react';
import { readString, writeString } from '../arcade';
import type { GameEvent } from '../logic/types';

const PREF_KEY = 'breakout.sound';

type Tone = { freq: number; ms: number; type: OscillatorType; gain: number; slide?: number };

const TONES: Partial<Record<GameEvent, Tone>> = {
  paddle: { freq: 330, ms: 60, type: 'square', gain: 0.05 },
  wall: { freq: 220, ms: 35, type: 'square', gain: 0.03 },
  brick: { freq: 660, ms: 70, type: 'square', gain: 0.05 },
  hard: { freq: 520, ms: 50, type: 'triangle', gain: 0.06 },
  steel: { freq: 180, ms: 60, type: 'triangle', gain: 0.06 },
  powerup: { freq: 520, ms: 180, type: 'sine', gain: 0.08, slide: 1040 },
  launch: { freq: 440, ms: 60, type: 'sine', gain: 0.05, slide: 660 },
  lifeLost: { freq: 300, ms: 380, type: 'sawtooth', gain: 0.05, slide: 90 },
  levelClear: { freq: 520, ms: 420, type: 'sine', gain: 0.08, slide: 1320 },
  gameOver: { freq: 260, ms: 700, type: 'sawtooth', gain: 0.05, slide: 60 },
};

type AudioCtor = typeof AudioContext;

function audioCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * Tiny Web Audio synth for game events. The AudioContext is created lazily on
 * the first sound (always after a user gesture) and silently does nothing
 * where Web Audio is missing (tests, old browsers). The on/off preference is
 * remembered in localStorage.
 */
export function useSound() {
  const [enabled, setEnabledState] = useState(() => readString(PREF_KEY) !== 'off');
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on);
    writeString(PREF_KEY, on ? 'on' : 'off');
  }, []);

  const play = useCallback((events: readonly GameEvent[]) => {
    if (!enabledRef.current || events.length === 0) return;
    const Ctor = audioCtor();
    if (!Ctor) return;
    try {
      const ctx = ctxRef.current ?? (ctxRef.current = new Ctor());
      if (ctx.state === 'suspended') void ctx.resume();
      for (const ev of new Set(events)) {
        const tone = TONES[ev];
        if (!tone) continue;
        const t0 = ctx.currentTime;
        const t1 = t0 + tone.ms / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.type;
        osc.frequency.setValueAtTime(tone.freq, t0);
        if (tone.slide) osc.frequency.exponentialRampToValueAtTime(tone.slide, t1);
        gain.gain.setValueAtTime(tone.gain, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t1 + 0.02);
      }
    } catch {
      /* audio is a nicety; never break the game over it */
    }
  }, []);

  useEffect(
    () => () => {
      void ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    },
    [],
  );

  return { enabled, setEnabled, play };
}
