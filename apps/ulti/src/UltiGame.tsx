import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  clearSession,
  formatClock,
  formatNumber,
  gameName,
  GameOverlay,
  KeyHelp,
  readString,
  SaveBadge,
  shouldIgnoreKey,
  StatPanel,
  useArcadeRun,
  useDental,
  useKitMessages,
  useLang,
  useMessages,
  useRestoredSession,
  useRunTimer,
  useSessionAutosave,
  writeString,
  type ArcadeGameProps,
  type ArcadeStatus,
  type OverlayAction,
} from './arcade';
import type { Action } from './bots/actions';
import { isLevel, LEVELS, type Level } from './bots/profiles';
import { talonOwner } from './bots/view';
import type { HCard, HSuit } from './deck/cards';
import { BASE_VALUE, canPickUp, cardKey, illegalReason, isLegalDiscard, type Bid, type BidKind, type DealState, type Player } from './engine';
import { sessionOutcome } from './game/scoring';
import {
  act,
  botStep,
  DEALS_PER_SESSION,
  isBotTurn,
  isUltiSession,
  nextDeal,
  SESSION_SCHEMA,
  sessionScore,
  startSession,
  type UltiSession,
} from './game/session';
import { botDelay, readSpeed, SPEED_FACTOR, SPEEDS, writeSpeed, type Speed } from './game/speed';
import { MESSAGES, type MessageKey } from './i18n';
import { ActionPanel } from './ui/ActionPanel';
import { DentalToggle } from './ui/DentalToggle';
import { SeatFigure } from './ui/figures/SeatFigure';
import { bidLabel, formatUnits, KIND_INFO, KIND_NAME, REASON_KEY, suitName, type Tr } from './ui/labels';
import { LogPanel } from './ui/LogPanel';
import { Table } from './ui/Table';
import type { TalonView } from './ui/TrickArea';
import styles from './UltiGame.module.css';

export { SESSION_SCHEMA } from './game/session';

export const DIFFICULTY_KEY = 'ulti.difficulty';
/** The two opponents' names (seat 1 sits to the player's right, seat 2 to the left). */
export const BOT_NAMES = { 1: 'Bandi', 2: 'Teri' } as const;

type UiPhase = 'idle' | 'live' | 'paused';
/** A message worded at render time, so a language switch re-words it. */
type Notice = { key: MessageKey; bid?: Bid | null; suit?: HSuit | null; led?: HSuit | null };

const DIFF_LABEL: Record<Level, MessageKey> = { easy: 'diffEasy', medium: 'diffMedium', hard: 'diffHard' };
const SPEED_LABEL: Record<Speed, MessageKey> = { slow: 'speedSlow', normal: 'speedNormal', fast: 'speedFast' };
const KINDS: readonly BidKind[] = ['passz', 'negyvenszaz', 'ulti', 'betli', 'durchmars', 'huszszaz', 'szintelenDurchmars'];

const newSeed = () => (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
const readDifficulty = (): Level => {
  const v = readString(DIFFICULTY_KEY);
  return isLevel(v) ? v : 'medium';
};

function Segmented<T extends string>({ label, value, options, names, onChange }: {
  label: string;
  value: T;
  options: readonly T[];
  names: (v: T) => string;
  onChange(v: T): void;
}) {
  return (
    <div className="arc-field" role="group" aria-label={label}>
      <span>{label}</span>
      <div className="arc-segmented">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={o === value} onClick={() => onChange(o)}>
            {names(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

const FIGURE_TITLE: Record<'classic' | 'dental', Record<Player, MessageKey>> = {
  classic: { 0: 'figurePlayer', 1: 'figureBandi', 2: 'figureTeri' },
  dental: { 0: 'figureDentist', 1: 'figureHygienist', 2: 'figureAssistant' },
};

/** The talon as this screen may show it. */
function talonView(deal: DealState, peek: boolean, tr: Tr): TalonView {
  if (deal.phase === 'over') return { mode: 'open', label: tr('talon') };
  if (peek) return { mode: 'open', label: tr('talonPeek') };
  if (talonOwner(deal) === 0 && deal.talon.length === 2) return { mode: 'open', label: tr('yourDiscards') };
  return { mode: 'hidden' };
}

export function UltiGame(props: ArcadeGameProps = {}) {
  const { embedded = false } = props;
  const tr = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const [dental] = useDental();
  const restored = useRestoredSession<UltiSession>('ulti', SESSION_SCHEMA, isUltiSession);
  const resumable = restored !== null && restored.data.phase !== 'finished';

  const [session, setSession] = useState<UltiSession | null>(() => (resumable ? restored.data : null));
  const [ui, setUi] = useState<UiPhase>(resumable ? 'paused' : 'idle');
  const [welcomeBack, setWelcomeBack] = useState(resumable);
  const [runKey, setRunKey] = useState(0);
  const [difficulty, setDifficulty] = useState<Level>(() => (resumable ? restored.data.difficulty : readDifficulty()));
  const [speed, setSpeedState] = useState<Speed>(readSpeed);
  const [confirmNew, setConfirmNew] = useState(false);
  const [selected, setSelected] = useState<HCard[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [peek, setPeek] = useState(false);

  const finished = session?.phase === 'finished';
  const status: ArcadeStatus = ui === 'idle' || !session ? 'idle' : finished ? 'gameOver' : ui === 'paused' ? 'paused' : 'running';
  const running = status === 'running';
  const score = session ? sessionScore(session) : 0;

  const seconds = useRunTimer(running, runKey, runKey === 0 && resumable ? (restored?.seconds ?? 0) : 0);
  const stats = useArcadeRun({
    gameId: 'ulti',
    status,
    score,
    seconds,
    runKey,
    outcome: () => (session ? sessionOutcome(session.scores) : 'over'),
    props,
  });
  const savedAt = useSessionAutosave({
    gameId: 'ulti',
    schema: SESSION_SCHEMA,
    enabled: ui !== 'idle' && session !== null && !finished,
    discard: ui === 'idle' || finished,
    data: session,
    seconds,
    score,
  });

  const name = useCallback((p: Player) => (p === 0 ? tr('you') : BOT_NAMES[p]), [tr]);
  const deal = session?.deal ?? null;
  const moveKey = session ? `${session.dealNo}:${session.deal.log.length}` : '';

  // Any move clears the player's half-made choices.
  useEffect(() => {
    setSelected([]);
    setNotice(null);
    setPeek(false);
  }, [moveKey]);

  // ── Bots: one move per turn after a visible delay (Speed setting); a pause or a turn change cancels it. ──
  const latest = useRef(session);
  latest.current = session;
  const botKey = session && running && !confirmNew && isBotTurn(session) ? moveKey : null;
  useEffect(() => {
    if (botKey === null || !latest.current) return;
    const ms = botDelay(latest.current.deal) * SPEED_FACTOR[speed];
    const id = window.setTimeout(() => setSession((s) => (s && isBotTurn(s) ? botStep(s) : s)), ms);
    return () => window.clearTimeout(id);
  }, [botKey, speed]);

  // Leaving the tab pauses, so neither the clock nor the bots run unseen.
  useEffect(() => {
    if (!running) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') setUi((p) => (p === 'live' ? 'paused' : p));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [running]);

  // ── Session control ─────────────────────────────────────────
  const start = useCallback(() => {
    writeString(DIFFICULTY_KEY, difficulty);
    setSession(startSession({ difficulty, seed: newSeed() }));
    setWelcomeBack(false);
    setConfirmNew(false);
    setUi('live');
    setRunKey((n) => n + 1);
  }, [difficulty]);

  const togglePause = useCallback(() => {
    if (ui === 'idle' || finished) return;
    setWelcomeBack(false);
    setUi((p) => (p === 'live' ? 'paused' : 'live'));
  }, [ui, finished]);

  const toSetup = useCallback(() => {
    clearSession('ulti');
    setSession(null);
    setConfirmNew(false);
    setWelcomeBack(false);
    setUi('idle');
  }, []);

  const requestNew = useCallback(() => {
    if (finished || ui === 'idle') toSetup();
    else setConfirmNew(true);
  }, [finished, ui, toSetup]);

  const goNextDeal = useCallback(() => setSession((s) => (s && s.phase === 'dealOver' ? nextDeal(s) : s)), []);

  // ── The player's moves (the engine rejects anything illegal) ──
  const myTurn = running && !confirmNew && session !== null && session.phase === 'playing' && session.deal.turn === 0;
  const doAct = useCallback((a: Action) => {
    const s = latest.current;
    if (!s) return;
    try {
      setSession(act(s, a));
    } catch {
      /* not legal now: nothing changes */
    }
  }, []);

  const onCard = useCallback(
    (card: HCard) => {
      if (!deal) return;
      if (deal.phase === 'discard') {
        setNotice(null);
        setSelected((sel) => {
          if (sel.some((c) => cardKey(c) === cardKey(card))) return sel.filter((c) => cardKey(c) !== cardKey(card));
          return [...sel, card].slice(-2);
        });
        return;
      }
      const reason = illegalReason(deal, 0, card);
      if (reason) {
        const led = deal.trick?.cards[0]?.card.suit ?? null;
        setNotice({ key: REASON_KEY[reason], suit: reason === 'mustFollow' ? led : (deal.bid?.trump ?? null), led });
        return;
      }
      doAct({ type: 'play', card });
    },
    [deal, doAct],
  );

  const onDiscard = useCallback(() => {
    if (!deal) return;
    if (selected.length !== 2) return setNotice({ key: 'discardNeedTwo' });
    if (!isLegalDiscard(deal, selected)) return setNotice({ key: 'discardNoBid', bid: deal.bid });
    doAct({ type: 'discard', cards: [selected[0], selected[1]] });
  }, [deal, selected, doAct]);

  const onPickUp = useCallback(() => {
    if (!deal) return;
    // Only now — after the player chose to take it — does the talon decide whether a higher bid exists.
    if (canPickUp(deal)) doAct({ type: 'pickUp' });
    else {
      setPeek(true);
      setNotice({ key: 'pickUpNoBid', bid: deal.bid });
    }
  }, [deal, doAct]);

  // ── Keys ────────────────────────────────────────────────────
  const dealOver = session?.phase === 'dealOver';
  const keyState = useRef({ status, confirmNew, dealOver, start, togglePause, toSetup, goNextDeal });
  keyState.current = { status, confirmNew, dealOver, start, togglePause, toSetup, goNextDeal };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shouldIgnoreKey(e)) return;
      const s = keyState.current;
      if (e.key === 'Escape' && s.confirmNew) {
        e.preventDefault();
        setConfirmNew(false);
        return;
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        s.togglePause();
        return;
      }
      if (e.key === 'Enter') {
        // A focused button answers Enter itself.
        if ((e.target as HTMLElement | null)?.closest?.('button, a, [role="button"]')) return;
        e.preventDefault();
        if (s.confirmNew) s.toSetup();
        else if (s.status === 'idle') s.start();
        else if (s.status === 'paused') s.togglePause();
        else if (s.status === 'gameOver') s.toSetup();
        else if (s.dealOver) s.goNextDeal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── View ────────────────────────────────────────────────────
  const fmt = useCallback((n: number) => formatNumber(n, lang), [lang]);
  const units = (n: number) => formatUnits(n, fmt);
  const noticeText = notice
    ? tr(notice.key, {
        bid: notice.bid ? bidLabel(notice.bid, tr, lang) : '—',
        suit: notice.suit ? suitName(notice.suit, tr) : '—',
        led: notice.led ? suitName(notice.led, tr) : '—',
      })
    : null;
  const keyRows = useMemo(
    (): [string, string][] => [
      ['Enter', tr('keyConfirm')],
      ['P Esc', tr('keyPause')],
      ['Tab', tr('keyCards')],
    ],
    [tr],
  );

  let statusLabel: string | undefined;
  if (running && session) {
    if (session.phase === 'dealOver') statusLabel = tr('dealOverStatus');
    else if (session.deal.turn === 0) statusLabel = tr('yourTurn');
    else statusLabel = tr('thinking', { name: name(session.deal.turn) });
  }

  const lastResult = (s: UltiSession): ReactNode => {
    const rec = s.history[s.history.length - 1];
    if (!rec) return null;
    const r = rec.result;
    return (
      <div className={styles.result} data-testid="ulti-deal-result">
        <p>
          <strong>{name(r.declarer)}</strong> · {bidLabel(r.bid, tr, lang)}
          {r.kontra && ` · ${tr('kontraTag')}`}
        </p>
        <ul>
          {r.contracts.map((c) => (
            <li key={c.kind}>
              <span aria-hidden="true">{c.won ? '✓ ' : '✗ '}</span>
              {tr(c.won ? 'contractWon' : 'contractLost', { bid: KIND_NAME[c.kind] })} ({units(c.won ? c.value : -c.value)})
            </li>
          ))}
        </ul>
        {r.parti && <p>{tr('partiLine', { declarer: fmt(r.parti.declarer), defenders: fmt(r.parti.defenders) })}</p>}
        <p>{([0, 1, 2] as Player[]).map((p) => tr('unitsLine', { name: name(p), units: units(rec.units[p]) })).join(' · ')}</p>
      </div>
    );
  };

  let overlay: { title: string; message?: string; actions: OverlayAction[]; children?: ReactNode } | null = null;
  if (confirmNew) {
    overlay = {
      title: tr('abandonTitle'),
      message: tr('abandonBody'),
      actions: [
        { label: tr('abandon'), onClick: toSetup, primary: true, kbd: 'Enter' },
        { label: tr('keepPlaying'), onClick: () => setConfirmNew(false), kbd: 'Esc' },
      ],
    };
  } else if (status === 'paused' && session) {
    overlay = welcomeBack
      ? {
          title: k('welcomeBack'),
          message: tr('welcomeBody', { deal: session.dealNo, total: DEALS_PER_SESSION, units: units(session.scores[0]) }),
          actions: [
            { label: tr('continue'), onClick: togglePause, primary: true, kbd: 'P' },
            { label: tr('newSession'), onClick: requestNew },
          ],
        }
      : {
          title: k('paused'),
          message: tr('pausedBody'),
          actions: [
            { label: k('resume'), onClick: togglePause, primary: true, kbd: 'P' },
            { label: tr('newSession'), onClick: requestNew },
          ],
        };
  } else if (status === 'gameOver' && session) {
    const outcome = sessionOutcome(session.scores);
    const best = Math.max(stats.best, score);
    overlay = {
      title: tr(outcome === 'win' ? 'wonTitle' : outcome === 'draw' ? 'drawTitle' : 'lostTitle'),
      message:
        (score > 0 ? tr('resultPoints', { points: fmt(score) }) : tr('resultNoPoints')) +
        tr('resultTail', { deals: fmt(DEALS_PER_SESSION), time: formatClock(seconds), best: fmt(best) }) +
        (score > 0 && score > stats.bestBeforeRun ? tr('newBestSuffix') : ''),
      children: lastResult(session),
      actions: [{ label: tr('newSession'), onClick: toSetup, primary: true, kbd: 'Enter' }],
    };
  } else if (running && session?.phase === 'dealOver') {
    overlay = {
      title: tr('dealOverTitle', { n: session.dealNo }),
      children: lastResult(session),
      actions: [{ label: tr('nextDeal'), onClick: goNextDeal, primary: true, kbd: 'Enter' }],
    };
  }

  const inSession = session !== null && ui !== 'idle';
  const style = { '--game-color': 'var(--game-ulti)' } as CSSProperties;
  const figure = (p: Player) => <SeatFigure seat={p} dental={dental} title={tr(FIGURE_TITLE[dental ? 'dental' : 'classic'][p])} />;

  return (
    <div className={`arc-game ${styles.game}`} style={style} data-testid="ulti-game">
      {!embedded && (
        <header className="arc-game__head">
          <div>
            <h1 className="arc-game__title">{gameName('ulti', lang)}</h1>
            <p className="arc-game__sub">{tr('subtitle')}</p>
          </div>
        </header>
      )}

      <StatPanel
        status={status}
        statusLabel={statusLabel}
        items={
          inSession && session
            ? [
                { label: tr('statDeal'), value: tr('statDealValue', { n: session.dealNo, total: DEALS_PER_SESSION }) },
                { label: tr('statUnits'), value: units(session.scores[0]) },
                { label: k('score'), value: fmt(score) },
                { label: k('best'), value: fmt(Math.max(stats.best, finished ? score : 0)) },
                { label: k('time'), value: formatClock(seconds) },
              ]
            : [
                { label: k('best'), value: fmt(stats.best) },
                { label: k('plays'), value: fmt(stats.plays) },
                { label: k('time'), value: formatClock(seconds) },
              ]
        }
      />

      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={`arc-game__board ${styles.board}`}>
            {deal && session ? (
              <Table
                deal={deal}
                scores={session.scores}
                name={name}
                figure={figure}
                lang={lang}
                tr={tr}
                dental={dental}
                talon={talonView(deal, peek, tr)}
                turn={session.phase === 'playing' ? deal.turn : null}
                hand={{
                  selected: deal.phase === 'discard' && myTurn ? new Set(selected.map(cardKey)) : undefined,
                  playable: deal.phase === 'play' && myTurn ? new Set(deal.hands[0].filter((c) => !illegalReason(deal, 0, c)).map(cardKey)) : null,
                  onCard: myTurn && (deal.phase === 'discard' || deal.phase === 'play') ? onCard : null,
                }}
              />
            ) : (
              <div className={styles.empty} />
            )}
            {status === 'idle' && (
              <div className="arc-overlay" role="dialog" aria-label={gameName('ulti', lang)}>
                <div className="arc-overlay__card">
                  <h2 className="arc-overlay__title">{gameName('ulti', lang)}</h2>
                  <p className="arc-overlay__msg">{tr('setupBody')}</p>
                  <Segmented<Level> label={tr('difficulty')} value={difficulty} options={LEVELS} names={(v) => tr(DIFF_LABEL[v])} onChange={setDifficulty} />
                  <div className="arc-overlay__actions">
                    <button type="button" className="arc-btn arc-btn--primary" onClick={start}>
                      {tr('startSession')}
                      <kbd className="arc-kbd">Enter</kbd>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {overlay && <GameOverlay {...overlay} />}
          </div>
          {deal && (
            <ActionPanel
              deal={deal}
              active={myTurn}
              name={name}
              tr={tr}
              lang={lang}
              peek={peek}
              notice={noticeText}
              onDiscard={onDiscard}
              onBid={(bid) => doAct({ type: 'bid', bid })}
              onPickUp={onPickUp}
              onPass={() => doAct({ type: 'pass' })}
              onKontra={() => doAct({ type: 'kontra' })}
              onSkipKontra={() => doAct({ type: 'skipKontra' })}
            />
          )}
        </div>

        <aside className={styles.side}>
          <LogPanel log={deal?.log ?? null} dealNo={session?.dealNo ?? 1} name={name} tr={tr} lang={lang} />

          <section className="arc-panel">
            <h2 className="arc-panel__title">{tr('panelSession')}</h2>
            <div className={styles.buttons}>
              <button type="button" className="arc-btn arc-btn--primary" onClick={status === 'idle' ? start : togglePause} disabled={finished}>
                {status === 'running' ? k('pause') : status === 'paused' ? k('resume') : k('start')}
              </button>
              <button type="button" className="arc-btn" onClick={requestNew} disabled={status === 'idle'}>
                {tr('newSession')}
              </button>
            </div>
            {inSession && session && (
              <p className={styles.note}>
                {tr('sessionNote', { difficulty: tr(DIFF_LABEL[session.difficulty]), deal: session.dealNo, total: DEALS_PER_SESSION })}
              </p>
            )}
            <SaveBadge savedAt={inSession ? savedAt : null} />
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{tr('panelDeals')}</h2>
            {session && session.history.length > 0 ? (
              <table className={styles.history} data-testid="ulti-history">
                <thead>
                  <tr>
                    <th scope="col">{tr('colDeal')}</th>
                    <th scope="col">{tr('colDeclarer')}</th>
                    <th scope="col">{tr('colBid')}</th>
                    <th scope="col">{tr('colResult')}</th>
                    <th scope="col">{tr('colYou')}</th>
                  </tr>
                </thead>
                <tbody>
                  {session.history.map((h, i) => (
                    <tr key={i}>
                      <td>{fmt(i + 1)}</td>
                      <td>{name(h.result.declarer)}</td>
                      <td>{bidLabel(h.result.bid, tr, lang)}</td>
                      <td>{h.result.contracts.map((c) => (c.won ? '✓' : '✗')).join(' ')}</td>
                      <td>{units(h.units[0])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.note}>{tr('noDealsYet')}</p>
            )}
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{tr('panelSettings')}</h2>
            <div className={styles.settings}>
              <Segmented
                label={tr('setSpeed')}
                value={speed}
                options={SPEEDS}
                names={(v) => tr(SPEED_LABEL[v])}
                onChange={(v) => {
                  setSpeedState(v);
                  writeSpeed(v);
                }}
              />
              <DentalToggle />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{tr('panelContracts')}</h2>
            <dl className={styles.glossary}>
              {KINDS.map((kind) => (
                <div key={kind}>
                  <dt>
                    {KIND_NAME[kind]} <span className={styles.value}>{fmt(BASE_VALUE[kind])}</span>
                  </dt>
                  <dd>{tr(KIND_INFO[kind])}</dd>
                </div>
              ))}
              <div>
                <dt>Piros</dt>
                <dd>{tr('infoPiros')}</dd>
              </div>
              <div>
                <dt>Kontra</dt>
                <dd>{tr('infoKontra')}</dd>
              </div>
            </dl>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{tr('panelKeys')}</h2>
            <KeyHelp rows={keyRows} />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default UltiGame;
