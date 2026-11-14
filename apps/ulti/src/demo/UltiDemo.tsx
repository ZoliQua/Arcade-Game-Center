import { useCallback, useEffect, useState } from 'react';
import { useDental, useLang, useMessages, type ArcadeDemoProps } from '../arcade';
import type { Player } from '../engine';
import { botStep, nextDeal, startSession, type UltiSession } from '../game/session';
import { botDelay } from '../game/speed';
import { MESSAGES } from '../i18n';
import { SeatFigure } from '../ui/figures/SeatFigure';
import { Table } from '../ui/Table';
import styles from './UltiDemo.module.css';

export const DEMO_SEED = 1835;
/** The demo runs faster than Normal play. */
export const DEMO_FACTOR = 0.55;
export const DEMO_DEAL_PAUSE_MS = 2600;

const NAMES = { 1: 'Bandi', 2: 'Teri' } as const;
const demoSession = (seed: number): UltiSession =>
  startSession({ difficulty: 'medium', seed, seats: ['medium', 'medium', 'medium'] });

/**
 * Attract mode: three medium bots play real deals on the real engine, one move per beat. Writes nothing to
 * storage; freezes on its current frame while `active` is false.
 */
export function UltiDemo({ active = true }: ArcadeDemoProps) {
  const tr = useMessages(MESSAGES);
  const [lang] = useLang();
  const [dental] = useDental();
  const [s, setS] = useState(() => demoSession(DEMO_SEED));

  useEffect(() => {
    if (!active) return;
    const ms = s.phase === 'playing' ? botDelay(s.deal) * DEMO_FACTOR : DEMO_DEAL_PAUSE_MS;
    const id = window.setTimeout(
      () =>
        setS((x) => {
          if (x.phase === 'finished') return demoSession(x.seed + 1);
          if (x.phase === 'dealOver') return nextDeal(x);
          return botStep(x);
        }),
      ms,
    );
    return () => window.clearTimeout(id);
  }, [s, active]);

  const name = useCallback((p: Player) => (p === 0 ? tr('you') : NAMES[p]), [tr]);
  return (
    <div className={styles.demo} data-testid="ulti-demo" data-active={active ? 'true' : 'false'} aria-hidden="true">
      <Table
        deal={s.deal}
        scores={s.scores}
        name={name}
        figure={(p) => <SeatFigure seat={p} dental={dental} title={name(p)} />}
        lang={lang}
        tr={tr}
        dental={dental}
        talon={s.deal.phase === 'over' ? { mode: 'open', label: tr('talon') } : { mode: 'hidden' }}
        turn={s.phase === 'playing' ? s.deal.turn : null}
        hand={{ onCard: null }}
      />
    </div>
  );
}

export default UltiDemo;
