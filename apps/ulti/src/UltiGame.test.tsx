import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSession } from './arcade';
import { dealCards, isHigherBid, legalBids, makeBid, nextPlayer, type DealState } from './engine';
import { dealSeed, isUltiSession, SESSION_SCHEMA, startSession, type UltiSession } from './game/session';
import { MESSAGES } from './i18n';
import { findSession, humanTurn, save } from './test/fixtures';
import { bidId } from './ui/labels';
import { UltiGame } from './UltiGame';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const en = MESSAGES.en;
const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const click = (el: Element) => act(() => void fireEvent.click(el));
const handButtons = () => [...document.querySelectorAll<HTMLButtonElement>('[data-hand-card]')];
/** data-card values ("suit-rank") of every face-up card in the DOM. */
const faceUp = () => new Set([...document.querySelectorAll('[data-card]')].map((el) => el.getAttribute('data-card')!.replace('-', ':')));
/** The live session, through the autosave (page hide flushes it at once). */
const saved = () => {
  act(() => void window.dispatchEvent(new Event('pagehide')));
  return loadSession<UltiSession>('ulti', SESSION_SCHEMA, isUltiSession)?.data ?? null;
};

function resume(s: UltiSession) {
  save(s);
  render(<UltiGame />);
  key('p');
}

/** No card a bot holds is ever drawn face up. */
function expectBotsHidden(s: UltiSession) {
  const up = faceUp();
  for (const c of [...s.deal.hands[1], ...s.deal.hands[2]]) expect(up.has(`${c.suit}:${c.rank}`)).toBe(false);
}

describe('UltiGame', () => {
  it('a full deal plays through with bots, driven only through the UI', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.37);
    render(<UltiGame />);
    click(screen.getByRole('button', { name: /Deal the cards/ }));
    let guard = 0;
    while (!screen.queryByTestId('ulti-deal-result')) {
      if (++guard > 400) throw new Error('deal did not finish');
      const s = saved();
      if (s) expectBotsHidden(s);
      const actions = screen.getByTestId('ulti-actions');
      const bid = actions.querySelector('[data-bid]');
      const pass = within(actions).queryByRole('button', { name: en.passBtn });
      const noKontra = within(actions).queryByRole('button', { name: en.noKontra });
      const discardBtn = within(actions).queryByRole('button', { name: en.discardBtn });
      const playable = document.querySelector('[data-playable="true"]');
      if (bid) click(bid);
      else if (pass) click(pass);
      else if (noKontra) click(noKontra);
      else if (discardBtn) {
        // Try pairs until the engine accepts the discard.
        const n = handButtons().length;
        outer: for (let i = 0; i < n; i += 1)
          for (let j = i + 1; j < n; j += 1) {
            click(handButtons()[i]);
            click(handButtons()[j]);
            click(within(actions).getByRole('button', { name: en.discardBtn }));
            if (!within(screen.getByTestId('ulti-actions')).queryByRole('button', { name: en.discardBtn })) break outer;
            handButtons().filter((b) => b.getAttribute('aria-pressed') === 'true').forEach((b) => click(b));
          }
      } else if (playable) click(playable);
      else tick(1500);
    }
    const end = saved();
    expect(end?.phase).toBe('dealOver');
    expect(end?.history).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: en.dealOverTitle.replace('{n}', '1') })).toBeTruthy();
    expect(screen.getByTestId('ulti-history').querySelectorAll('tbody tr')).toHaveLength(1);
    expect(screen.getByTestId('ulti-log').textContent).toContain('takes it');
    click(screen.getByRole('button', { name: /Next deal/ }));
    expect(saved()?.dealNo).toBe(2);
  });

  it('rejects an illegal card with the rule as a reason, and nothing changes', () => {
    const s = findSession(
      (x) => humanTurn(x, 'play') && x.deal.trick !== null && x.deal.hands[0].length > 3,
    );
    resume(s);
    const illegal = document.querySelector<HTMLButtonElement>('[data-playable="false"]');
    expect(illegal).not.toBeNull();
    const before = handButtons().length;
    click(illegal!);
    const notice = screen.getByTestId('ulti-notice').textContent ?? '';
    const reasons = [en.reasonMustFollow, en.reasonMustBeat, en.reasonMustTrump, en.reasonMustOvertrump, en.reasonKeepUltiSeven].map(
      (r) => r.split('{')[0].trim(),
    );
    expect(reasons.some((r) => notice.includes(r))).toBe(true);
    expect(handButtons()).toHaveLength(before);
    expect(saved()?.deal.log.length).toBe(s.deal.log.length);
    // A legal card is played.
    click(document.querySelector('[data-playable="true"]')!);
    expect(handButtons()).toHaveLength(before - 1);
    expect(screen.queryByTestId('ulti-notice')).toBeNull();
  });

  it('the bid panel offers exactly the higher bids the engine allows', () => {
    const s = findSession((x) => humanTurn(x, 'declare') && x.deal.bid !== null);
    resume(s);
    const offered = [...screen.getByTestId('ulti-bid-panel').querySelectorAll('[data-bid]')].map((b) => b.getAttribute('data-bid'));
    const legal = legalBids(s.deal);
    expect(offered.sort()).toEqual(legal.map(bidId).sort());
    expect(legal.every((b) => isHigherBid(b, s.deal.bid))).toBe(true);
    expect(legal.length).toBeGreaterThan(0);
    // Choosing one makes it the bid.
    click(screen.getByTestId('ulti-bid-panel').querySelector('[data-bid]')!);
    expect(saved()?.deal.bidder).toBe(0);
    expect(saved()?.deal.phase).toBe('pickup');
  });

  it('shows the kontra button only to a defender at kontra time', () => {
    const kontra = findSession((x) => humanTurn(x, 'kontra'));
    expect(kontra.deal.declarer).not.toBe(0);
    resume(kontra);
    click(screen.getByRole('button', { name: en.kontraBtn }));
    expect(saved()?.deal.kontra).toBe(true);
    expect(screen.queryByRole('button', { name: en.kontraBtn })).toBeNull();
  });

  it('never shows kontra to the declarer, nor during play', () => {
    const declarer = findSession((x) => x.phase === 'playing' && x.deal.phase === 'kontra' && x.deal.declarer === 0);
    resume(declarer);
    expect(screen.queryByRole('button', { name: en.kontraBtn })).toBeNull();
    cleanup();
    localStorage.clear();
    const play = findSession((x) => humanTurn(x, 'play'));
    resume(play);
    expect(screen.queryByRole('button', { name: en.kontraBtn })).toBeNull();
  });

  it('always offers to pick up the talon; picking it up hands over 12 cards', () => {
    const s = findSession((x) => humanTurn(x, 'pickup'));
    resume(s);
    const btn = screen.getByRole('button', { name: en.pickUp }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
    expect(screen.getByRole('button', { name: en.passBtn })).toBeTruthy();
    click(btn);
    const after = saved()!;
    if (after.deal.phase === 'discard') {
      expect(handButtons()).toHaveLength(12);
    } else {
      // No higher bid with the talon: it is shown, then put back.
      expect(screen.getByTestId('ulti-talon').getAttribute('data-open')).toBe('true');
    }
  });

  it('when even the talon cannot beat the bid, it shows the talon, explains, and puts it back with a pass', () => {
    // Seat 2 is forehand (dealer 1), lays two down and bids the top of the ladder; the player is next.
    const base = startSession({ difficulty: 'easy', seed: 77, firstDealer: 1 });
    const d0: DealState = dealCards(dealSeed(77, 1), 1);
    expect(d0.forehand).toBe(2);
    const down = d0.hands[2].slice(0, 2);
    const bid = makeBid(['ulti', 'huszszaz'], 'piros');
    const deal: DealState = {
      ...d0,
      phase: 'pickup',
      turn: nextPlayer(2),
      hands: [d0.hands[0], d0.hands[1], d0.hands[2].slice(2)],
      talon: down,
      bid,
      bidder: 2,
      log: [...d0.log, { type: 'discard', player: 2 }, { type: 'bid', player: 2, bid }],
    };
    const s: UltiSession = { ...base, deal };
    expect(isUltiSession(JSON.parse(JSON.stringify(s)))).toBe(true);
    resume(s);
    expect(screen.getByTestId('ulti-talon').getAttribute('data-open')).toBe('false');
    click(screen.getByRole('button', { name: en.pickUp }));
    expect(screen.getByTestId('ulti-talon').getAttribute('data-open')).toBe('true');
    expect(faceUp().has(`${down[0].suit}:${down[0].rank}`)).toBe(true);
    expect(screen.getByTestId('ulti-notice').textContent).toContain('no bid higher than');
    expect(screen.queryByRole('button', { name: en.pickUp })).toBeNull();
    click(screen.getByRole('button', { name: en.putBack }));
    const after = saved()!;
    expect(after.deal.log[after.deal.log.length - 1]).toEqual({ type: 'pass', player: 0 });
    expect(after.deal.hands[0]).toHaveLength(10);
  });

  it('after a restore the bots’ cards stay face down (paused and running)', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.deal.tricks.length >= 3);
    save(s);
    render(<UltiGame />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
    expectBotsHidden(s);
    key('p');
    expectBotsHidden(s);
    expect(screen.getAllByTestId(/seat-backs-/)).toHaveLength(2);
    expect(screen.getByTestId('seat-backs-1').querySelectorAll('[data-back]')).toHaveLength(s.deal.hands[1].length);
    expect(handButtons()).toHaveLength(s.deal.hands[0].length);
  });

  it('marks the seat on turn with a text badge, not colour alone, and shows balances', () => {
    const s = findSession((x) => humanTurn(x, 'play') && x.history.length > 0);
    resume(s);
    expect(screen.getByTestId('seat-turn-0').textContent).toContain(en.onTurn);
    expect(screen.queryByTestId('seat-turn-1')).toBeNull();
    const u = s.scores[1];
    expect(screen.getByTestId('seat-units-1').textContent).toBe(u > 0 ? `+${u}` : u < 0 ? `−${-u}` : '0');
  });

  it('bots move only after a visible delay, slower at Slow speed', () => {
    const s = findSession((x) => x.phase === 'playing' && x.deal.phase === 'play' && x.deal.turn !== 0 && x.deal.trick !== null);
    resume(s);
    const len = s.deal.log.length;
    tick(300);
    expect(saved()?.deal.log.length ?? len).toBe(len);
    click(screen.getByRole('button', { name: en.speedSlow }));
    tick(1000);
    expect(saved()?.deal.log.length ?? len).toBe(len);
    tick(1500);
    expect(saved()!.deal.log.length).toBeGreaterThan(len);
  });
});
