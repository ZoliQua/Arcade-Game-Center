import { describe, expect, it } from 'vitest';
import type { HCard, HSuit } from '../deck/cards';
import { makeBid } from './bids';
import { applyBid, dealCards, discard, legalBids, pass, skipKontra } from './deal';
import { illegalReason, isDealOver, legalPlays, playCard } from './play';
import { cardKey } from './ranks';
import { c, playState } from './__tests__/helpers';
import type { BidKind, DealState, Player } from './types';

const keys = (cards: readonly HCard[]) => cards.map(cardKey).sort();
const filler = (n: number): HCard[] => [c('makk', 'VII'), c('makk', 'VIII'), c('makk', 'IX')].slice(0, n);

/** Player 0 is to play second in a trick led by player 2. */
function second(hand: HCard[], led: HCard[], trump: HSuit | null, kinds = trump ? ['passz'] : ['betli']) {
  return playState({
    hands: [hand, filler(3), filler(3)],
    bid: makeBid(kinds as BidKind[], trump),
    declarer: 2,
    trick: { leader: 2, cards: led.map((card, i) => ({ player: ((2 + i) % 3) as Player, card })), winner: null },
  });
}

describe('legalPlays', () => {
  it('must follow suit', () => {
    const s = second([c('tok', 'VII'), c('zold', 'asz'), c('piros', 'asz')], [c('tok', 'asz')], 'makk');
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('tok', 'VII')]));
    expect(illegalReason(s, 0, c('zold', 'asz'))).toBe('mustFollow');
  });
  it('must beat the highest card when able', () => {
    const s = second([c('tok', 'VII'), c('tok', 'asz'), c('tok', 'kiraly')], [c('tok', 'X')], 'zold');
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('tok', 'asz')]));
    expect(illegalReason(s, 0, c('tok', 'kiraly'))).toBe('mustBeat');
  });
  it('Review Focus: can follow but not beat → following (any of the suit) is mandatory', () => {
    const s = second([c('tok', 'VII'), c('tok', 'IX'), c('zold', 'asz')], [c('tok', 'X')], 'zold');
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('tok', 'VII'), c('tok', 'IX')]));
    expect(illegalReason(s, 0, c('zold', 'asz'))).toBe('mustFollow');
  });
  it('a trump already in the trick cannot be beaten by the led suit: any card of the suit', () => {
    const s = playState({
      hands: [[c('tok', 'VII'), c('tok', 'asz'), c('zold', 'asz')], filler(3), filler(3)],
      bid: makeBid(['passz'], 'zold'),
      declarer: 1,
      trick: { leader: 1, cards: [{ player: 1, card: c('tok', 'X') }, { player: 2, card: c('zold', 'VII') }], winner: null },
    });
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('tok', 'VII'), c('tok', 'asz')]));
  });
  it('void in the led suit → must trump', () => {
    const s = second([c('zold', 'VII'), c('piros', 'asz'), c('makk', 'X')], [c('tok', 'asz')], 'zold');
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('zold', 'VII')]));
    expect(illegalReason(s, 0, c('piros', 'asz'))).toBe('mustTrump');
  });
  it('void → must overtrump when able, else any trump', () => {
    const led = [c('tok', 'asz'), c('zold', 'felso')];
    const s = playState({
      hands: [[c('zold', 'VII'), c('zold', 'X'), c('piros', 'asz')], filler(3), filler(3)],
      bid: makeBid(['passz'], 'zold'),
      declarer: 1,
      trick: { leader: 1, cards: [{ player: 1, card: led[0] }, { player: 2, card: led[1] }], winner: null },
    });
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('zold', 'X')]));
    expect(illegalReason(s, 0, c('zold', 'VII'))).toBe('mustOvertrump');
    const low = { ...s, hands: [[c('zold', 'VII'), c('zold', 'VIII'), c('piros', 'asz')], s.hands[1], s.hands[2]] } as DealState;
    expect(keys(legalPlays(low, 0))).toEqual(keys([c('zold', 'VII'), c('zold', 'VIII')]));
  });
  it('Review Focus: void and no trump → any card is legal', () => {
    const hand = [c('piros', 'VII'), c('makk', 'asz'), c('piros', 'X')];
    const s = second(hand, [c('tok', 'asz')], 'zold');
    expect(keys(legalPlays(s, 0))).toEqual(keys(hand));
  });
  it('colourless games: no trump, colourless order for beating', () => {
    const s = second([c('tok', 'X'), c('tok', 'asz'), c('zold', 'VII')], [c('tok', 'kiraly')], null);
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('tok', 'asz')]));
    const v = second([c('zold', 'VII'), c('piros', 'asz')], [c('tok', 'kiraly')], null);
    expect(keys(legalPlays(v, 0))).toEqual(keys([c('zold', 'VII'), c('piros', 'asz')]));
  });
  it('not your turn → nothing legal', () => {
    const s = second([c('tok', 'VII')], [c('tok', 'X')], 'zold');
    expect(legalPlays(s, 1)).toEqual([]);
    expect(illegalReason(s, 1, c('tok', 'VII'))).toBe('notYourTurn');
  });
});

describe('ulti: keep the trump VII for the last trick', () => {
  const ulti = makeBid(['ulti'], 'tok');
  it('the declarer may not lead or play the VII early when another card is legal', () => {
    const s = playState({
      hands: [[c('tok', 'VII'), c('tok', 'asz'), c('zold', 'IX')], filler(3), filler(3)],
      bid: ulti,
      declarer: 0,
    });
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('tok', 'asz'), c('zold', 'IX')]));
    expect(illegalReason(s, 0, c('tok', 'VII'))).toBe('keepUltiSeven');
  });
  it('forced when the VII is the only legal card', () => {
    const s = playState({
      hands: [[c('tok', 'VII'), c('piros', 'IX')], filler(2), filler(2)],
      bid: ulti,
      declarer: 0,
      trick: { leader: 1, cards: [{ player: 1, card: c('makk', 'asz') }, { player: 2, card: c('makk', 'X') }], winner: null },
    });
    expect(keys(legalPlays(s, 0))).toEqual(keys([c('tok', 'VII')]));
  });
  it('defenders are not restricted', () => {
    const s = playState({
      hands: [[c('tok', 'VII'), c('tok', 'asz')], filler(2), filler(2)],
      bid: ulti,
      declarer: 1,
      turn: 0,
    });
    expect(legalPlays(s, 0)).toHaveLength(2);
  });
});

describe('playCard', () => {
  it('completes tricks, the winner leads next, and rejects illegal cards', () => {
    const s = playState({
      hands: [[c('tok', 'asz'), c('zold', 'VII')], [c('tok', 'VII'), c('piros', 'VII')], [c('makk', 'VII'), c('zold', 'VIII')]],
      bid: makeBid(['passz'], 'zold'),
      declarer: 0,
    });
    expect(() => playCard(s, 1, c('tok', 'VII'))).toThrow();
    const a = playCard(s, 0, c('tok', 'asz'));
    expect(() => playCard(a, 1, c('piros', 'VII'))).toThrow(/mustFollow/);
    const b = playCard(playCard(a, 1, c('tok', 'VII')), 2, c('zold', 'VIII'));
    expect(b.tricks).toHaveLength(1);
    expect(b.tricks[0].winner).toBe(2);
    expect(b.turn).toBe(2);
    expect(b.trick).toBeNull();
    expect(s.tricks).toHaveLength(0);
  });

  it('announces 20/40 automatically at the first play in parti games (logged)', () => {
    const hand0 = [c('tok', 'kiraly'), c('tok', 'felso'), c('zold', 'kiraly'), c('zold', 'felso'), c('piros', 'VII')];
    const hand1 = [c('makk', 'kiraly'), c('makk', 'felso'), c('piros', 'VIII'), c('piros', 'IX'), c('piros', 'X')];
    const hand2 = [c('piros', 'kiraly'), c('piros', 'felso'), c('piros', 'asz'), c('zold', 'VII'), c('zold', 'VIII')];
    const s = playState({ hands: [hand0, hand1, hand2], bid: makeBid(['passz'], 'tok'), declarer: 0 });
    const a = playCard(s, 0, c('piros', 'VII'));
    expect(a.announcements).toEqual([
      { player: 0, suit: 'tok', points: 40 },
      { player: 0, suit: 'zold', points: 20 },
    ]);
    expect(a.log).toContainEqual({ type: 'announce', player: 0, suit: 'tok', points: 40 });
    const b = playCard(playCard(a, 1, c('piros', 'X')), 2, c('piros', 'asz'));
    expect(b.announcements).toHaveLength(4);
    // the second trick adds nothing
    const d = playCard(b, 2, c('zold', 'VII'));
    expect(d.announcements).toHaveLength(4);
    // betli: no announcements
    const e = playCard({ ...s, bid: makeBid(['betli'], null) }, 0, c('piros', 'VII'));
    expect(e.announcements).toEqual([]);
  });

  it('negyvenszáz: only the declarer announces the 40', () => {
    const hand0 = [c('tok', 'kiraly'), c('tok', 'felso'), c('zold', 'kiraly'), c('zold', 'felso'), c('piros', 'VII')];
    const hand1 = [c('makk', 'kiraly'), c('makk', 'felso'), c('piros', 'VIII')];
    const s = playState({ hands: [hand0, hand1, filler(3)], bid: makeBid(['negyvenszaz'], 'tok'), declarer: 0 });
    const a = playCard(playCard(s, 0, c('piros', 'VII')), 1, c('piros', 'VIII'));
    expect(a.announcements).toEqual([{ player: 0, suit: 'tok', points: 40 }]);
  });

  it('betli is over as soon as the declarer wins a trick', () => {
    const s = playState({
      hands: [[c('piros', 'asz'), c('zold', 'VII')], [c('piros', 'VII'), c('tok', 'VII')], [c('piros', 'VIII'), c('tok', 'VIII')]],
      bid: makeBid(['betli'], null),
      declarer: 0,
    });
    const done = playCard(playCard(playCard(s, 0, c('piros', 'asz')), 1, c('piros', 'VII')), 2, c('piros', 'VIII'));
    expect(isDealOver(done)).toBe(true);
    expect(done.phase).toBe('over');
    expect(done.tricks).toHaveLength(1);
  });

  it('a seeded deal plays through all 10 tricks with legal cards only', () => {
    let s: DealState = dealCards(2026, 0);
    s = discard(s, [s.hands[1][0], s.hands[1][1]]);
    s = applyBid(s, legalBids(s).find((b) => b.kinds[0] === 'passz')!);
    s = skipKontra(skipKontra(pass(pass(s))));
    while (!isDealOver(s)) s = playCard(s, s.turn, legalPlays(s, s.turn)[0]);
    expect(s.tricks).toHaveLength(10);
    expect(s.hands.every((h) => h.length === 0)).toBe(true);
    expect(s.tricks.every((t) => t.cards.length === 3)).toBe(true);
  });
});
