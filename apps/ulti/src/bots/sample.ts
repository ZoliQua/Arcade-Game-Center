import { HUNGARIAN_DECK, type HCard, type HSuit } from '../deck/cards';
import { cardKey, trickWinner, type DealState, type Hands, type PlayedCard, type Player } from '../engine';
import type { BotView } from './view';

/** What the public play revealed about one player's remaining cards. */
export interface SeatConstraints {
  /** Suits the player showed out of. */
  readonly voids: HSuit[];
  /** The player could not beat `best` in its suit then: holds no card of that suit beating it. */
  readonly caps: HCard[];
  /** Cards the player must still hold (announced 20/40, the declarer's contract cards). */
  readonly must: HCard[];
  /** For the declarer of a trump game: at least this many trumps at the start of play (a soft constraint). */
  readonly minTrumps: number;
}

export type Constraints = readonly [SeatConstraints, SeatConstraints, SeatConstraints];

/** A deal of the unseen cards consistent with the view. */
export interface SampledDeal {
  readonly hands: Hands;
  readonly talon: readonly HCard[];
}

const beats = (card: HCard, best: HCard, trump: HSuit | null): boolean =>
  trickWinner(
    [
      { player: 0, card: best },
      { player: 1, card },
    ],
    trump,
  ) === 1;

const PLAYERS: readonly Player[] = [0, 1, 2];

/** Cards that have been played (completed tricks and the trick on the table). */
export function playedCards(view: Pick<BotView, 'tricks' | 'trick'>): HCard[] {
  return [...view.tricks, ...(view.trick ? [view.trick] : [])].flatMap((t) => t.cards.map((pc) => pc.card));
}

/** Infers voids, caps and must-hold cards from the tricks, the announcements and the bid. */
export function inferConstraints(view: BotView): Constraints {
  const cons = PLAYERS.map(() => ({ voids: [] as HSuit[], caps: [] as HCard[], must: [] as HCard[], minTrumps: 0 }));
  const trump = view.bid?.trump ?? null;
  const tricks = [...view.tricks, ...(view.trick ? [view.trick] : [])];
  for (const t of tricks) {
    const led = t.cards[0]?.card.suit;
    for (let i = 1; i < t.cards.length; i += 1) {
      const prefix: PlayedCard[] = t.cards.slice(0, i) as PlayedCard[];
      const best = prefix[prefix.findIndex((pc) => pc.player === trickWinner(prefix, trump))].card;
      const { player, card } = t.cards[i];
      const c = cons[player];
      if (card.suit !== led) {
        if (!c.voids.includes(led)) c.voids.push(led);
        if (trump !== null && card.suit !== trump && !c.voids.includes(trump)) c.voids.push(trump);
        if (trump !== null && card.suit === trump && !beats(card, best, trump)) c.caps.push(best);
      } else if (!beats(card, best, trump) && best.suit === led) {
        c.caps.push(best);
      }
    }
  }
  const played = new Set(playedCards(view).map(cardKey));
  const keep = (p: Player, card: HCard) => {
    if (!played.has(cardKey(card)) && !cons[p].must.some((m) => cardKey(m) === cardKey(card))) cons[p].must.push(card);
  };
  for (const a of view.announcements) {
    keep(a.player, { suit: a.suit, rank: 'kiraly' });
    keep(a.player, { suit: a.suit, rank: 'felso' });
  }
  const d = view.declarer;
  if (d !== null && view.bid && trump !== null) {
    if (view.bid.kinds.includes('ulti')) keep(d, { suit: trump, rank: 'VII' });
    if (view.bid.kinds.includes('negyvenszaz')) {
      keep(d, { suit: trump, rank: 'kiraly' });
      keep(d, { suit: trump, rank: 'felso' });
    }
    const strong = view.bid.kinds.includes('ulti') || view.bid.kinds.includes('durchmars');
    cons[d].minTrumps = strong ? 5 : 4;
  }
  return cons as unknown as Constraints;
}

const allowed = (c: SeatConstraints, card: HCard, trump: HSuit | null): boolean =>
  !c.voids.includes(card.suit) && !c.caps.some((best) => best.suit === card.suit && beats(card, best, trump));

/** Seat index 3 is the talon. */
type Slot = 0 | 1 | 2 | 3;

/**
 * Deals the cards `view.me` cannot see among the other hands (and the talon when it is hidden), honouring the
 * constraints. Falls back to fewer constraints when they cannot all be met (after an unusual forced play).
 */
export function sampleDeal(view: BotView, cons: Constraints, rng: () => number): SampledDeal {
  const seen = new Set([...view.hand, ...playedCards(view), ...(view.talon ?? [])].map(cardKey));
  const unseen = HUNGARIAN_DECK.filter((card) => !seen.has(cardKey(card)));
  const capacity: number[] = [0, 1, 2].map((p) => (p === view.me ? 0 : view.handSizes[p]));
  capacity[3] = unseen.length - capacity[0] - capacity[1] - capacity[2];
  if (capacity[3] < 0) throw new Error('Inconsistent view: more cards in hands than unseen');
  const trump = view.bid?.trump ?? null;
  // Soft constraint: the declarer of a trump game holds a fair number of trumps (checked while few cards are out).
  const d = view.declarer;
  const all = [...view.tricks, ...(view.trick ? [view.trick] : [])].flatMap((t) => t.cards);
  const checkTrumps = d !== null && d !== view.me && trump !== null && all.filter((pc) => pc.player === d).length < 3;
  const playedTrumps = all.filter((pc) => pc.player === d && pc.card.suit === trump).length;
  const need = checkTrumps
    ? Math.min(cons[d as Player].minTrumps, playedTrumps + unseen.filter((c) => c.suit === trump).length)
    : 0;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const out = withOwn(tryDeal(unseen, capacity, cons, view.me, trump, rng, attempt < 30), view);
    if (!out) continue;
    if (attempt < 12 && need > 0 && out.hands[d as Player].filter((c) => c.suit === trump).length + playedTrumps < need) continue;
    return out;
  }
  // Last resort: only the must-hold cards and the sizes.
  return withOwn(tryDeal(unseen, capacity, cons, view.me, trump, rng, false), view) as SampledDeal;
}

function tryDeal(
  unseen: readonly HCard[],
  capacity: readonly number[],
  cons: Constraints,
  me: Player,
  trump: HSuit | null,
  rng: () => number,
  strict: boolean,
): SampledDeal | null {
  const cap = capacity.slice();
  const piles: HCard[][] = [[], [], [], []];
  const rest: HCard[] = [];
  for (const card of unseen) {
    const owner = PLAYERS.find((p) => p !== me && cons[p].must.some((m) => m.suit === card.suit && m.rank === card.rank));
    if (owner !== undefined && cap[owner] > 0) {
      piles[owner].push(card);
      cap[owner] -= 1;
    } else rest.push(card);
  }
  // Random order, then most constrained first.
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const slotsFor = (card: HCard): Slot[] =>
    ([0, 1, 2, 3] as Slot[]).filter((s) => s === 3 || (s !== me && (!strict || allowed(cons[s], card, trump))));
  const options = rest.map((card) => ({ card, slots: slotsFor(card) }));
  options.sort((a, b) => a.slots.length - b.slots.length);
  for (const { card, slots } of options) {
    const open = slots.filter((s) => cap[s] > 0);
    const total = open.reduce((n: number, s) => n + cap[s], 0);
    if (total === 0) return null;
    let r = rng() * total;
    let pick = open[open.length - 1];
    for (const s of open) {
      r -= cap[s];
      if (r < 0) {
        pick = s;
        break;
      }
    }
    piles[pick].push(card);
    cap[pick] -= 1;
  }
  return { hands: [piles[0], piles[1], piles[2]], talon: piles[3] };
}

const withOwn = (deal: SampledDeal | null, view: BotView): SampledDeal | null =>
  deal && {
    hands: PLAYERS.map((p) => (p === view.me ? view.hand.slice() : deal.hands[p])) as unknown as Hands,
    talon: deal.talon,
  };


/** A full deal state for simulation: the public view with the sampled hidden cards filled in (no log, seed 0). */
export function stateFromSample(view: BotView, deal: SampledDeal, patch: Partial<DealState> = {}): DealState {
  const hands = PLAYERS.map((p) => (p === view.me ? view.hand : deal.hands[p])) as unknown as Hands;
  return {
    seed: 0,
    dealer: view.dealer,
    forehand: view.forehand,
    phase: view.phase,
    turn: view.turn,
    hands,
    talon: view.talon ?? deal.talon,
    bid: view.bid,
    bidder: view.bidder,
    passes: view.passes,
    declarer: view.declarer,
    kontra: view.kontra,
    kontraBy: null,
    tricks: view.tricks,
    trick: view.trick,
    announcements: view.announcements,
    log: [],
    ...patch,
  };
}
