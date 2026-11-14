import { hasParti, kindValue } from './bids';
import { cardPoints } from './ranks';
import type { Bid, BidKind, DealResult, DealState, Player } from './types';

const LAST_TRICK = 10;

/**
 * Parti points per side: ász/X 10 each in won tricks, 10 for the last trick, the talon's ász/X count
 * for the defenders, plus the side's 20/40 announcements (defenders pool theirs).
 */
export function partiPoints(state: DealState): { declarer: number; defenders: number } {
  const totals = { declarer: 0, defenders: 0 };
  const side = (p: Player | null) => (p === state.declarer ? 'declarer' : 'defenders');
  state.tricks.forEach((t, i) => {
    const pts = t.cards.reduce((s, pc) => s + cardPoints(pc.card), 0) + (i === 9 ? LAST_TRICK : 0);
    totals[side(t.winner)] += pts;
  });
  totals.defenders += state.talon.reduce((s, card) => s + cardPoints(card), 0);
  state.announcements.forEach((a) => (totals[side(a.player)] += a.points));
  return totals;
}

function contractWon(state: DealState, kind: BidKind, parti: { declarer: number; defenders: number }): boolean {
  const { tricks, declarer } = state;
  const bid = state.bid as Bid;
  const all = tricks.length === 10;
  switch (kind) {
    case 'passz':
      return parti.declarer > parti.defenders;
    case 'negyvenszaz':
    case 'huszszaz':
      return parti.declarer >= 100;
    case 'betli':
      return all && tricks.every((t) => t.winner !== declarer);
    case 'durchmars':
    case 'szintelenDurchmars':
      return all && tricks.every((t) => t.winner === declarer);
    case 'ulti': {
      const last = tricks[9];
      if (!all || last.winner !== declarer) return false;
      const own = last.cards.find((pc) => pc.player === declarer);
      return !!own && own.card.suit === bid.trump && own.card.rank === 'VII';
    }
  }
}

/** The outcome of a finished deal. */
export function dealResult(state: DealState): DealResult {
  if (state.phase !== 'over' || state.declarer === null || !state.bid) throw new Error('Deal is not over');
  const bid = state.bid;
  const parti = partiPoints(state);
  const mult = state.kontra ? 2 : 1;
  const tricksWon = [0, 1, 2].map((p) => state.tricks.filter((t) => t.winner === p).length) as unknown as DealResult['tricksWon'];
  return {
    declarer: state.declarer,
    bid,
    kontra: state.kontra,
    contracts: bid.kinds.map((kind) => {
      const won = contractWon(state, kind, parti);
      // A failed Ulti (bukott ulti) pays double.
      const lostUlti = kind === 'ulti' && !won ? 2 : 1;
      return { kind, won, value: kindValue(bid, kind) * mult * lostUlti };
    }),
    parti: hasParti(bid) ? parti : null,
    tricksWon,
  };
}

/** Units per seat: the declarer gets ±value from each opponent (×2), each defender ∓value. Zero-sum. */
export function scoreDeal(result: DealResult): [number, number, number] {
  const net = result.contracts.reduce((s, c) => s + (c.won ? c.value : -c.value), 0);
  return [0, 1, 2].map((p) => (p === result.declarer ? 2 * net : -net)) as [number, number, number];
}
