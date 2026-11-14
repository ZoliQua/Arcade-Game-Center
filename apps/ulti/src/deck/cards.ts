import type { Lang } from '../arcade/i18n';

/** Hungarian (Tell) suits: piros = hearts, tök = bells, zöld = leaves, makk = acorns. */
export type HSuit = 'piros' | 'tok' | 'zold' | 'makk';
/** Deck order only; trick-taking order belongs to the engine (in Ulti's trump games the X ranks below the ace only). */
export type HRank = 'VII' | 'VIII' | 'IX' | 'X' | 'also' | 'felso' | 'kiraly' | 'asz';
export type HCard = { suit: HSuit; rank: HRank };
export type Season = 'tavasz' | 'nyar' | 'osz' | 'tel';

export const H_SUITS: readonly HSuit[] = ['piros', 'tok', 'zold', 'makk'];
export const H_RANKS: readonly HRank[] = ['VII', 'VIII', 'IX', 'X', 'also', 'felso', 'kiraly', 'asz'];

export const HUNGARIAN_DECK: readonly HCard[] = H_SUITS.flatMap((suit) => H_RANKS.map((rank) => ({ suit, rank })));

/** Each suit has its own silhouette, so the suits never rely on colour. */
export const SUIT_SHAPE: Record<HSuit, 'heart' | 'bell' | 'leaf' | 'acorn'> = {
  piros: 'heart',
  tok: 'bell',
  zold: 'leaf',
  makk: 'acorn',
};

/** The aces show the seasons, as on the 1835 Schneider deck. */
export const SEASON_OF_SUIT: Record<HSuit, Season> = { piros: 'nyar', tok: 'osz', zold: 'tavasz', makk: 'tel' };

/** Banner text on the aces (Hungarian in every language: it is part of the art). */
export const SEASON_NAME: Record<Season, string> = { tavasz: 'TAVASZ', nyar: 'NYÁR', osz: 'ŐSZ', tel: 'TÉL' };

const PIP_COUNT: Partial<Record<HRank, number>> = { VII: 7, VIII: 8, IX: 9, X: 10 };
export const pipCount = (rank: HRank): number => PIP_COUNT[rank] ?? 0;

const HU_SUIT: Record<HSuit, string> = { piros: 'Piros', tok: 'Tök', zold: 'Zöld', makk: 'Makk' };
const DE_SUIT: Record<HSuit, string> = { piros: 'Rot', tok: 'Schellen', zold: 'Grün', makk: 'Eichel' };

const RANK_NAME: Record<Lang, Record<HRank, string>> = {
  en: { VII: 'Seven', VIII: 'Eight', IX: 'Nine', X: 'Ten', also: 'Under', felso: 'Over', kiraly: 'King', asz: 'Ace' },
  hu: { VII: 'hetes', VIII: 'nyolcas', IX: 'kilences', X: 'tízes', also: 'alsó', felso: 'felső', kiraly: 'király', asz: 'ász' },
  de: { VII: 'Sieben', VIII: 'Acht', IX: 'Neun', X: 'Zehn', also: 'Unter', felso: 'Ober', kiraly: 'König', asz: 'Ass' },
};

/** hu „Piros ász”, en "Ace of Piros" (Hungarian suit names kept), de „Rot-Ass”. */
export function hCardLabel(card: HCard, lang: Lang): string {
  const rank = RANK_NAME[lang][card.rank];
  if (lang === 'hu') return `${HU_SUIT[card.suit]} ${rank}`;
  if (lang === 'de') return `${DE_SUIT[card.suit]}-${rank}`;
  return `${rank} of ${HU_SUIT[card.suit]}`;
}

const BACK: Record<Lang, string> = { en: 'Face-down card', hu: 'Lefordított kártya', de: 'Verdeckte Karte' };
export const hCardBackLabel = (lang: Lang): string => BACK[lang];
