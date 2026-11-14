import { describe, expect, it } from 'vitest';
import type { HCard } from '../arcade/hungarian/cards';
import { makeBid } from './bids';
import { applyBid, applyKontra, dealCards, discard, legalBids, mulberry32, pass, skipKontra } from './deal';
import { legalPlays, playCard } from './play';
import { rankStrength } from './ranks';
import { dealResult, partiPoints, scoreDeal } from './scoreDeal';
import { c, playOut, playState, trickOf } from './__tests__/helpers';
import type { Announcement, Bid, DealState, Player } from './types';

const opponentsAvoidMakk = (_s: DealState, _p: Player, legal: HCard[]) => legal.find((x) => x.suit !== 'makk') ?? legal[0];

describe('durchmars', () => {
  // Declarer 0 holds all 8 zöld (trump), makk ász and one more makk card.
  const durch = (lastMakk: HCard, p1Makk: HCard) =>
    playState({
      hands: [
        [...['VII', 'VIII', 'IX', 'X', 'also', 'felso', 'kiraly', 'asz'].map((r) => c('zold', r as HCard['rank'])), c('makk', 'asz'), lastMakk],
        [p1Makk, c('makk', 'kiraly'), c('makk', 'felso'), c('makk', 'also'), c('makk', 'IX'), c('makk', 'VIII'),
          c('piros', 'VII'), c('piros', 'VIII'), c('piros', 'IX'), c('piros', 'X')],
        [c('piros', 'kiraly'), c('piros', 'felso'), c('piros', 'also'), c('piros', 'asz'),
          c('tok', 'IX'), c('tok', 'X'), c('tok', 'also'), c('tok', 'felso'), c('tok', 'kiraly'), c('tok', 'asz')],
      ],
      talon: [c('tok', 'VII'), c('tok', 'VIII')],
      bid: makeBid(['durchmars'], 'zold'),
      declarer: 0,
    });
  const declarerFirst = (s: DealState, p: Player, legal: HCard[]) =>
    p === 0
      ? [...legal].sort((a, b) => (a.suit === 'zold' ? 0 : 1) - (b.suit === 'zold' ? 0 : 1) || rankStrength(b.rank, false) - rankStrength(a.rank, false))[0]
      : opponentsAvoidMakk(s, p, legal);

  it('succeeds with all 10 tricks', () => {
    const end = playOut(durch(c('makk', 'X'), c('makk', 'VII')), declarerFirst, legalPlays, playCard);
    const r = dealResult(end);
    expect(r.tricksWon).toEqual([10, 0, 0]);
    expect(r.contracts).toEqual([{ kind: 'durchmars', won: true, value: 6 }]);
    expect(scoreDeal(r)).toEqual([12, -6, -6]);
  });
  it('fails when only the last trick is lost', () => {
    const end = playOut(durch(c('makk', 'VII'), c('makk', 'X')), declarerFirst, legalPlays, playCard);
    const r = dealResult(end);
    expect(end.tricks).toHaveLength(10);
    expect(r.tricksWon[0]).toBe(9);
    expect(r.contracts[0].won).toBe(false);
    expect(scoreDeal(r)).toEqual([-12, 6, 6]);
  });
});

describe('betli', () => {
  it('declarer wins the first trick → lost immediately, −5 per opponent', () => {
    const s = playState({
      hands: [[c('piros', 'asz'), c('zold', 'VII')], [c('piros', 'VII'), c('tok', 'VII')], [c('piros', 'VIII'), c('tok', 'VIII')]],
      bid: makeBid(['betli'], null),
      declarer: 0,
    });
    const end = playCard(playCard(playCard(s, 0, c('piros', 'asz')), 1, c('piros', 'VII')), 2, c('piros', 'VIII'));
    const r = dealResult(end);
    expect(end.phase).toBe('over');
    expect(r.contracts).toEqual([{ kind: 'betli', won: false, value: 5 }]);
    expect(scoreDeal(r)).toEqual([-10, 5, 5]);
  });
  it('won when the declarer takes no trick in 10', () => {
    const s = playState({
      hands: [[c('piros', 'VII')], [c('piros', 'asz')], [c('tok', 'VII')]],
      bid: makeBid(['betli'], null),
      declarer: 2,
      turn: 0,
      tricks: Array.from({ length: 9 }, () => trickOf(1, [c('makk', 'VII'), c('makk', 'VIII'), c('makk', 'IX')])),
    });
    const end = playCard(playCard(playCard(s, 0, c('piros', 'VII')), 1, c('piros', 'asz')), 2, c('tok', 'VII'));
    expect(scoreDeal(dealResult(end))).toEqual([-5, -5, 10]);
  });
});

describe('ulti', () => {
  const nine = Array.from({ length: 9 }, () => trickOf(0, [c('makk', 'VII'), c('makk', 'VIII'), c('makk', 'IX')]));
  const last = (hands: [HCard[], HCard[], HCard[]], kontra = false) =>
    playState({ hands, bid: makeBid(['ulti'], 'piros'), declarer: 0, tricks: nine, kontra });
  const finish = (s: DealState) => playOut(s, (_s, _p, legal) => legal[0], legalPlays, playCard);

  it('won when the trump VII wins the last trick', () => {
    const r = dealResult(finish(last([[c('piros', 'VII')], [c('tok', 'asz')], [c('zold', 'asz')]])));
    expect(r.contracts).toEqual([{ kind: 'ulti', won: true, value: 8 }]);
  });
  it('fails if the VII is beaten in the last trick', () => {
    const r = dealResult(finish(last([[c('piros', 'VII')], [c('piros', 'VIII')], [c('zold', 'asz')]])));
    expect(r.contracts[0].won).toBe(false);
  });
  it('fails if the last trick is won with another card (the VII went earlier)', () => {
    const r = dealResult(finish(last([[c('piros', 'asz')], [c('tok', 'asz')], [c('zold', 'asz')]])));
    expect(r.tricksWon[0]).toBe(10);
    expect(r.contracts[0].won).toBe(false);
  });
  it('scoreDeal table: piros ulti (8) with kontra (×2) = 16 per opponent', () => {
    const won = dealResult(finish(last([[c('piros', 'VII')], [c('tok', 'asz')], [c('zold', 'asz')]], true)));
    expect(won.contracts).toEqual([{ kind: 'ulti', won: true, value: 16 }]);
    expect(scoreDeal(won)).toEqual([32, -16, -16]);
    const lost = dealResult(finish(last([[c('piros', 'VII')], [c('piros', 'VIII')], [c('zold', 'asz')]], true)));
    expect(lost.contracts).toEqual([{ kind: 'ulti', won: false, value: 32 }]); // bukott ulti pays double
    expect(scoreDeal(lost)).toEqual([-64, 32, 32]);
    const plain = dealResult(finish(last([[c('piros', 'VII')], [c('tok', 'asz')], [c('zold', 'asz')]])));
    expect(scoreDeal(plain)).toEqual([16, -8, -8]);
  });
  it('a plain (non-piros) failed ulti pays double: 4 × 2 per opponent', () => {
    const s = playState({
      hands: [[c('zold', 'VII')], [c('zold', 'VIII')], [c('tok', 'asz')]],
      bid: makeBid(['ulti'], 'zold'),
      declarer: 0,
      tricks: nine,
    });
    const r = dealResult(finish(s));
    expect(r.contracts).toEqual([{ kind: 'ulti', won: false, value: 8 }]);
    expect(scoreDeal(r)).toEqual([-16, 8, 8]);
  });
  it('declarer seat moves the signs; kontra on non-piros ulti', () => {
    const s = playState({
      hands: [[c('tok', 'asz')], [c('zold', 'VII')], [c('makk', 'asz')]],
      bid: makeBid(['ulti'], 'zold'),
      declarer: 1,
      turn: 0,
      kontra: true,
      tricks: nine,
    });
    expect(scoreDeal(dealResult(finish(s)))).toEqual([-8, 16, -8]);
  });
});

describe('parti with 20/40', () => {
  const ann = (player: Player, suit: Announcement['suit'], points: 20 | 40): Announcement => ({ player, suit, points });
  const tricks = [
    trickOf(0, [c('tok', 'asz'), c('tok', 'X'), c('tok', 'VII')]), // 20 → declarer
    trickOf(1, [c('zold', 'asz'), c('zold', 'VII'), c('zold', 'VIII')]), // 10 → defenders
    trickOf(0, [c('makk', 'X'), c('makk', 'VIII'), c('makk', 'IX')]), // 10 → declarer
    ...Array.from({ length: 6 }, () => trickOf(2, [c('piros', 'VII'), c('piros', 'VIII'), c('piros', 'IX')])),
    trickOf(2, [c('piros', 'X'), c('piros', 'also'), c('tok', 'IX')]), // 10 + last trick 10 → defenders
  ];
  const over = (bid: Bid, announcements: Announcement[]): DealState => ({
    ...playState({ hands: [[], [], []], bid, declarer: 0, tricks, talon: [c('piros', 'asz'), c('makk', 'VII')] }),
    phase: 'over',
    announcements,
  });

  it('counts ász/X, last trick, talon (defenders) and announcements per side', () => {
    const s = over(makeBid(['passz'], 'tok'), [ann(0, 'tok', 40), ann(1, 'zold', 20)]);
    expect(partiPoints(s)).toEqual({ declarer: 70, defenders: 60 });
    const r = dealResult(s);
    expect(r.parti).toEqual({ declarer: 70, defenders: 60 });
    expect(r.contracts).toEqual([{ kind: 'passz', won: true, value: 1 }]);
    expect(scoreDeal(r)).toEqual([2, -1, -1]);
  });
  it('a tie loses the passz; defenders pool their announcements', () => {
    const s = over(makeBid(['passz'], 'tok'), [ann(0, 'tok', 40), ann(1, 'zold', 20), ann(2, 'makk', 20)]);
    expect(partiPoints(s)).toEqual({ declarer: 70, defenders: 80 });
    expect(dealResult(s).contracts[0].won).toBe(false);
    const tie = { ...over(makeBid(['passz'], 'tok'), []), talon: [c('makk', 'VII'), c('makk', 'VIII')] };
    expect(partiPoints(tie)).toEqual({ declarer: 30, defenders: 30 });
    expect(dealResult(tie).contracts[0].won).toBe(false);
  });
  it('negyvenszáz: 100 with the 40 wins, less loses', () => {
    const s = over(makeBid(['negyvenszaz'], 'tok'), [ann(0, 'tok', 40)]);
    expect(dealResult(s).contracts[0]).toEqual({ kind: 'negyvenszaz', won: false, value: 4 }); // 30 + 40
    const rich = { ...s, tricks: s.tricks.map((t) => ({ ...t, winner: 0 as Player })) };
    expect(partiPoints(rich)).toEqual({ declarer: 60 + 40, defenders: 10 }); // the talon ász stays with the defenders
    expect(dealResult(rich).contracts[0]).toEqual({ kind: 'negyvenszaz', won: true, value: 4 });
  });
  it('ulti + passz scores both parts (piros doubles each)', () => {
    const s = over(makeBid(['ulti', 'passz'], 'piros'), [ann(0, 'piros', 40)]);
    const r = dealResult(s);
    expect(r.contracts).toEqual([
      { kind: 'ulti', won: false, value: 16 },
      { kind: 'passz', won: true, value: 2 },
    ]);
    expect(scoreDeal(r)).toEqual([-28, 14, 14]);
  });
});

describe('seeded deals end to end', () => {
  it('full passz deals: 90 parti card points in total, zero-sum units', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rng = mulberry32(seed);
      const dealer = (seed % 3) as Player;
      let s = dealCards(seed, dealer);
      const fh = s.turn;
      s = discard(s, [s.hands[fh][0], s.hands[fh][1]]);
      s = applyBid(s, legalBids(s).find((b) => b.kinds.length === 1 && b.kinds[0] === 'passz' && b.trump !== 'piros')!);
      s = pass(pass(s));
      s = seed % 2 ? applyKontra(s) : skipKontra(skipKontra(s));
      s = playOut(s, (_s, _p, legal) => legal[Math.floor(rng() * legal.length)], legalPlays, playCard);
      const ann = s.announcements.reduce((sum, a) => sum + a.points, 0);
      const p = partiPoints(s);
      expect(p.declarer + p.defenders - ann).toBe(90);
      const units = scoreDeal(dealResult(s));
      expect(units[0] + units[1] + units[2]).toBe(0);
      expect(Math.abs(units[fh])).toBe(seed % 2 ? 4 : 2);
    }
  });
  it('dealResult refuses a deal that is not over', () => {
    expect(() => dealResult(dealCards(1, 0))).toThrow();
  });
});
