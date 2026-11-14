import { describe, expect, it } from 'vitest';
import { HUNGARIAN_DECK } from '../arcade/hungarian/cards';
import { cardKey, makeBid, mulberry32, type Player } from '../engine';
import { c, playState, trickOf } from '../engine/__tests__/helpers';
import { heuristicPlay } from './play';
import { inferConstraints, sampleDeal } from './sample';
import { toBotView } from './view';

describe('heuristic play (medium)', () => {
  it('last to play, the defender does not overtake its partner but smears a point card', () => {
    // Declarer 0 led zöld VIII, defender 1 won it with the zöld ace; defender 2 holds the X and a low card.
    const s = playState({
      hands: [
        [c('piros', 'VII'), c('piros', 'VIII')],
        [c('tok', 'VII'), c('tok', 'VIII')],
        [c('zold', 'X'), c('zold', 'VII'), c('tok', 'IX')],
      ],
      bid: makeBid(['passz'], 'piros'),
      declarer: 0,
      trick: { leader: 0, cards: [{ player: 0, card: c('zold', 'VIII') }, { player: 1, card: c('zold', 'asz') }], winner: null },
    });
    expect(heuristicPlay(toBotView(s, 2))).toEqual(c('zold', 'X'));
  });

  it('last to play against the declarer, wins with the cheapest card that does it', () => {
    const s = playState({
      hands: [
        [c('piros', 'VII')],
        [c('tok', 'VII'), c('tok', 'VIII')],
        [c('zold', 'asz'), c('zold', 'kiraly'), c('zold', 'VII')],
      ],
      bid: makeBid(['passz'], 'piros'),
      declarer: 0,
      trick: { leader: 0, cards: [{ player: 0, card: c('zold', 'felso') }, { player: 1, card: c('tok', 'IX') }], winner: null },
    });
    expect(heuristicPlay(toBotView(s, 2))).toEqual(c('zold', 'kiraly'));
  });

  it('a betli declarer ducks under the card on the table', () => {
    const s = playState({
      hands: [[c('zold', 'VII'), c('zold', 'IX'), c('zold', 'VIII'), c('makk', 'asz')], [c('tok', 'VII')], [c('tok', 'IX')]],
      bid: makeBid(['betli'], null),
      declarer: 0,
      turn: 0,
      trick: { leader: 1, cards: [{ player: 1, card: c('zold', 'X') }, { player: 2, card: c('tok', 'X') }], winner: null },
    });
    expect(heuristicPlay(toBotView(s, 0))).toEqual(c('zold', 'IX'));
  });
});

/** A consistent state after trick 1 of a piros Passz: 2 showed void in zöld and in trump. */
function endState() {
  const t1 = trickOf(0, [c('zold', 'asz'), c('zold', 'VII'), c('tok', 'VII')]);
  return playState({
    hands: [
      [c('zold', 'X'), c('zold', 'kiraly'), c('piros', 'asz'), c('piros', 'X'), c('piros', 'kiraly'), c('piros', 'felso'), c('piros', 'also'), c('piros', 'IX'), c('piros', 'VIII')],
      [c('zold', 'VIII'), c('zold', 'IX'), c('zold', 'also'), c('zold', 'felso'), c('makk', 'asz'), c('makk', 'X'), c('makk', 'kiraly'), c('makk', 'felso'), c('makk', 'also')],
      [c('tok', 'VIII'), c('tok', 'IX'), c('tok', 'X'), c('tok', 'also'), c('tok', 'felso'), c('tok', 'kiraly'), c('tok', 'asz'), c('makk', 'VII'), c('makk', 'VIII')],
    ],
    talon: [c('makk', 'IX'), c('piros', 'VII')],
    bid: makeBid(['passz'], 'piros'),
    declarer: 0,
    tricks: [t1],
    turn: 0,
  });
}

describe('sampling unseen cards (hard)', () => {
  it('deals exactly the unseen cards, respects hand sizes, voids and known talon', () => {
    // Trick 1: 0 led zöld ász, 1 followed, 2 showed void in zöld and in trump (played a tök card in a piros game).
    const s = endState();
    const view = toBotView(s, 1);
    const cons = inferConstraints(view);
    expect(cons[2].voids).toContain('zold');
    expect(cons[2].voids).toContain('piros');
    expect(cons[1].voids).toEqual([]);
    const rng = mulberry32(5);
    for (let i = 0; i < 50; i += 1) {
      const d = sampleDeal(view, cons, rng);
      expect(d.hands[1]).toEqual(view.hand);
      expect(d.hands[0]).toHaveLength(9);
      expect(d.hands[2]).toHaveLength(9);
      expect(d.talon).toHaveLength(2);
      expect(d.hands[2].some((x) => x.suit === 'zold' || x.suit === 'piros')).toBe(false);
      const all = [...d.hands.flat(), ...d.talon, ...s.tricks.flatMap((t) => t.cards.map((pc) => pc.card))].map(cardKey);
      expect(all.sort()).toEqual(HUNGARIAN_DECK.map(cardKey).sort());
    }
  });

  it('keeps announced 20/40 cards with the player who announced them', () => {
    const view = { ...toBotView(endState(), 2 as Player), announcements: [{ player: 0 as Player, suit: 'piros' as const, points: 40 as const }] };
    const cons = inferConstraints(view);
    const rng = mulberry32(1);
    for (let i = 0; i < 30; i += 1) {
      const d = sampleDeal(view, cons, rng);
      expect(d.hands[0].map(cardKey)).toEqual(expect.arrayContaining(['piros:kiraly', 'piros:felso']));
    }
  });
});
