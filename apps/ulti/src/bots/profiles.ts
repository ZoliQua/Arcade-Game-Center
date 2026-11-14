/** Bot difficulty levels and their knobs. */
export type Level = 'easy' | 'medium' | 'hard';
export const LEVELS: readonly Level[] = ['easy', 'medium', 'hard'];

export const isLevel = (v: unknown): v is Level => v === 'easy' || v === 'medium' || v === 'hard';

export interface BotProfile {
  readonly level: Level;
  /**
   * easy: random legal cards, only Passz bids (talon only with a strong hand), never kontra.
   * medium: hand-evaluation heuristics for bids, discards, kontra; rule-of-thumb card play.
   * hard: tracks played cards and samples deals of the unseen cards consistent with what it saw.
   */
  readonly style: 'random' | 'heuristic' | 'sampling';
  /** Consistent deals sampled per card decision (hard). */
  readonly samples: number;
  /**
   * Cap on simulated card plays per decision (samples × candidates × cards left); keeps one decision bounded in time
   * and, unlike a clock, deterministic.
   */
  readonly playBudget: number;
  /** Deals sampled per bid / kontra evaluation (hard). */
  readonly bidSamples: number;
  /** Minimum expected units per opponent before taking the talon or doubling. */
  readonly pickUpMargin: number;
  readonly kontraMargin: number;
}

export const PROFILES: Readonly<Record<Level, BotProfile>> = {
  easy: { level: 'easy', style: 'random', samples: 0, playBudget: 0, bidSamples: 0, pickUpMargin: 0, kontraMargin: Infinity },
  medium: { level: 'medium', style: 'heuristic', samples: 0, playBudget: 0, bidSamples: 0, pickUpMargin: 0.3, kontraMargin: 0 },
  hard: { level: 'hard', style: 'sampling', samples: 300, playBudget: 24_000, bidSamples: 48, pickUpMargin: 0.3, kontraMargin: 0.6 },
};
