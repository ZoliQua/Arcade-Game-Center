import type { Action } from './actions';
import { chooseBid, chooseDiscard, hardBid, hardDiscard, hardKontra, heuristicKontra, wantsPickUp } from './bid';
import { heuristicPlay, samplingPlay } from './play';
import { PROFILES, type Level } from './profiles';
import type { BotView } from './view';

/**
 * One bot decision for the player whose turn it is. Pure apart from the RNG passed in (seeded by the caller, so
 * games and tests replay exactly). Uses only the view: no other hands, no hidden talon.
 */
export function decide(view: BotView, level: Level, rng: () => number): Action {
  if (view.turn !== view.me) throw new Error('Not this bot’s turn');
  switch (view.phase) {
    case 'discard': {
      const cards = level === 'hard' ? hardDiscard(view, rng) : chooseDiscard(view.hand, view.bid, level, rng);
      return { type: 'discard', cards };
    }
    case 'declare':
      return { type: 'bid', bid: level === 'hard' ? hardBid(view, rng) : chooseBid(view.hand, view.bid, level) };
    case 'pickup':
      return wantsPickUp(view.hand, view.bid, level) ? { type: 'pickUp' } : { type: 'pass' };
    case 'kontra': {
      const double = level === 'easy' ? false : level === 'hard' ? hardKontra(view, rng) : heuristicKontra(view);
      return double ? { type: 'kontra' } : { type: 'skipKontra' };
    }
    case 'play': {
      if (level === 'easy') return { type: 'play', card: view.legalPlays[Math.floor(rng() * view.legalPlays.length)] };
      if (level === 'medium') return { type: 'play', card: heuristicPlay(view) };
      const { samples, playBudget } = PROFILES.hard;
      return { type: 'play', card: samplingPlay(view, rng, samples, playBudget) };
    }
    case 'over':
      throw new Error('The deal is over');
  }
}
