import type { HCard, HSuit } from '../arcade/hungarian/cards';
import {
  cardKey, cardPoints, dealResult, legalPlays, playCard, rankStrength, sameCard, scoreDeal, trickWinner, type Bid, type DealState,
  type Player, type Trick,
} from '../engine';
import { inferConstraints, playedCards, sampleDeal, stateFromSample, type SampledDeal } from './sample';
import type { BotView } from './view';

/** What the rule-of-thumb player looks at: its own cards and the public table, nothing else. */
export interface PlayContext {
  readonly me: Player;
  readonly hand: readonly HCard[];
  readonly legal: readonly HCard[];
  readonly bid: Bid;
  readonly declarer: Player;
  readonly tricks: readonly Trick[];
  readonly trick: Trick | null;
}

/** Higher = stronger card in this game (trumps above everything else). */
const power = (card: HCard, trump: HSuit | null): number =>
  (trump !== null && card.suit === trump ? 100 : 0) + rankStrength(card.rank, trump === null);

/** Cost of throwing a card away: weak, pointless cards first. */
const dumpCost = (card: HCard, trump: HSuit | null): number => power(card, trump) + (trump !== null ? cardPoints(card) * 3 : 0);

const minBy = <T>(xs: readonly T[], f: (x: T) => number): T => xs.reduce((a, b) => (f(b) < f(a) ? b : a));
const maxBy = <T>(xs: readonly T[], f: (x: T) => number): T => xs.reduce((a, b) => (f(b) > f(a) ? b : a));

/** Would `card` take the lead in the trick so far? */
function takesLead(trick: Trick, player: Player, card: HCard, trump: HSuit | null): boolean {
  return trickWinner([...trick.cards, { player, card }], trump) === player;
}

function isBetli(bid: Bid): boolean {
  return bid.kinds.includes('betli');
}

/** Rule-of-thumb card choice (medium, and every seat inside the hard bot's simulations). */
export function chooseCard(ctx: PlayContext): HCard {
  const { legal, bid, declarer, me, trick } = ctx;
  if (legal.length === 1) return legal[0];
  const trump = bid.trump;
  const iAmDeclarer = me === declarer;
  const sameSide = (p: Player) => (p === declarer) === iAmDeclarer;

  if (isBetli(bid)) return betliCard(ctx);

  if (!trick || trick.cards.length === 0) return leadCard(ctx);

  const winner = trickWinner(trick.cards, trump);
  const last = trick.cards.length === 2;
  const winning = legal.filter((c) => takesLead(trick, me, c, trump));
  if (sameSide(winner) && winner !== me) {
    // Partner is winning: if it is safe, smear points; otherwise stay low.
    const nextIsOpponent = !last;
    const pointCards = legal.filter((c) => cardPoints(c) > 0 && c.suit !== trump);
    if (!nextIsOpponent && pointCards.length > 0) return maxBy(pointCards, (c) => cardPoints(c) * 10 - power(c, trump));
    return minBy(legal, (c) => dumpCost(c, trump));
  }
  if (winning.length > 0) {
    // Cheapest winner; a winning X is banked at once (it is the card an ace would catch later).
    if (last) return minBy(winning, (c) => power(c, trump) - (c.rank === 'X' && c.suit !== trump ? 3 : 0));
    // Second hand: take it with a card the last player is unlikely to beat; otherwise stay low.
    const top = maxBy(winning, (c) => power(c, trump));
    if (top.rank === 'asz' || (trump !== null && top.suit === trump)) return top;
    return minBy(legal, (c) => dumpCost(c, trump));
  }
  return minBy(legal, (c) => dumpCost(c, trump));
}

const ALL_RANKS = ['VII', 'VIII', 'IX', 'X', 'also', 'felso', 'kiraly', 'asz'] as const;

function countOutstanding(suit: HSuit, hand: readonly HCard[], played: Set<string>): number {
  return ALL_RANKS.filter((r) => !played.has(`${suit}:${r}`) && !hand.some((h) => h.suit === suit && h.rank === r)).length;
}

function leadCard(ctx: PlayContext): HCard {
  const { legal, bid, declarer, me, hand } = ctx;
  const trump = bid.trump;
  const played = new Set(playedCards(ctx).map(cardKey));
  const outstanding = (suit: HSuit) => countOutstanding(suit, hand, played);
  const isMaster = (card: HCard) => {
    // No unseen card of the suit beats it.
    const colourless = trump === null;
    return !ALL_RANKS.some(
      (r) =>
        rankStrength(r, colourless) > rankStrength(card.rank, colourless) &&
        !played.has(`${card.suit}:${r}`) &&
        !hand.some((h) => h.suit === card.suit && h.rank === r),
    );
  };
  const trumps = trump === null ? [] : legal.filter((c) => c.suit === trump);
  const side = legal.filter((c) => c.suit !== trump);
  if (me === declarer) {
    if (trump !== null && trumps.length > 0 && outstanding(trump) > 0) {
      const master = trumps.filter(isMaster);
      if (master.length > 0) return maxBy(master, (c) => power(c, trump));
    }
    const masters = side.filter(isMaster);
    if (masters.length > 0) return maxBy(masters, (c) => cardPoints(c) * 10 + power(c, trump));
    if (trump !== null && trumps.length > 0 && outstanding(trump) > 0 && trumps.length >= 3) return maxBy(trumps, (c) => power(c, trump));
    return minBy(side.length > 0 ? side : legal, (c) => dumpCost(c, trump));
  }
  // Defender: cash masters in side suits, attack the ulti by leading trumps, else lead low from a long suit.
  const masters = side.filter(isMaster);
  if (masters.length > 0) return maxBy(masters, (c) => cardPoints(c) * 10 + power(c, trump));
  if (bid.kinds.includes('ulti') && trumps.length >= 2) return maxBy(trumps, (c) => power(c, trump));
  const pool = side.length > 0 ? side : legal;
  const length = (suit: HSuit) => hand.filter((c) => c.suit === suit).length;
  return minBy(pool, (c) => dumpCost(c, trump) - length(c.suit) * 3);
}

/** Betli: the declarer keeps under the cards on the table; the defenders try to force a trick on it. */
function betliCard(ctx: PlayContext): HCard {
  const { legal, declarer, me, trick } = ctx;
  const p = (c: HCard) => rankStrength(c.rank, true);
  if (me === declarer) {
    if (!trick || trick.cards.length === 0) return minBy(legal, p);
    const safe = legal.filter((c) => !takesLead(trick, me, c, null));
    // Duck as high as possible (get rid of danger); if every card wins, the game is lost anyway.
    return safe.length > 0 ? maxBy(safe, p) : minBy(legal, p);
  }
  if (!trick || trick.cards.length === 0) {
    // Lead low from the longest suit so the declarer has to come over it.
    const length = (suit: HSuit) => ctx.hand.filter((c) => c.suit === suit).length;
    return minBy(legal, (c) => p(c) - length(c.suit) * 0.5);
  }
  const declarerPlayed = trick.cards.some((pc) => pc.player === declarer);
  if (declarerPlayed && trickWinner(trick.cards, null) === declarer) {
    const under = legal.filter((c) => !takesLead(trick, me, c, null));
    if (under.length > 0) return maxBy(under, p);
  }
  return minBy(legal, p);
}

/** The medium bot's card: rules of thumb on the view. */
export function heuristicPlay(view: BotView): HCard {
  if (!view.bid || view.declarer === null || view.legalPlays.length === 0) throw new Error('Not this bot’s card');
  return chooseCard({
    me: view.me,
    hand: view.hand,
    legal: view.legalPlays,
    bid: view.bid,
    declarer: view.declarer,
    tricks: view.tricks,
    trick: view.trick,
  });
}

/** Plays a full-information state to the end with the rule-of-thumb player in every seat. */
export function rollout(state: DealState): DealState {
  let s = state;
  while (s.phase === 'play') {
    const p = s.turn;
    const legal = legalPlays(s, p);
    const card = chooseCard({
      me: p,
      hand: s.hands[p],
      legal,
      bid: s.bid as Bid,
      declarer: s.declarer as Player,
      tricks: s.tricks,
      trick: s.trick,
    });
    s = playCard(s, p, card);
  }
  return s;
}

/** Units won by `me` in a finished simulated deal. */
export const unitsFor = (state: DealState, me: Player): number => scoreDeal(dealResult(state))[me];

/** Cards still to be played in the deal (all hands). */
const cardsLeft = (view: BotView) => view.handSizes[0] + view.handSizes[1] + view.handSizes[2];

/**
 * Hard: samples deals of the unseen cards consistent with everything seen so far and plays each legal card out with
 * the rule-of-thumb player in every seat; the card with the best average units wins. Same samples for every candidate.
 */
export function samplingPlay(view: BotView, rng: () => number, samples: number, playBudget: number): HCard {
  const legal = view.legalPlays;
  if (legal.length === 1) return legal[0];
  const n = Math.max(8, Math.min(samples, Math.floor(playBudget / (legal.length * cardsLeft(view)))));
  const cons = inferConstraints(view);
  const deals: SampledDeal[] = [];
  for (let i = 0; i < n; i += 1) deals.push(sampleDeal(view, cons, rng));
  let best = legal[0];
  let bestValue = -Infinity;
  for (const card of legal) {
    let total = 0;
    for (const deal of deals) {
      const s = playCard(stateFromSample(view, deal), view.me, card);
      total += unitsFor(rollout(s), view.me);
    }
    // Ties: keep the rule-of-thumb order (first legal wins only when values are equal).
    if (total > bestValue) {
      bestValue = total;
      best = card;
    }
  }
  return legal.find((c) => sameCard(c, best)) as HCard;
}
