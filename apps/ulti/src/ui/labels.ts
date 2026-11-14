import { formatNumber, type HRank, type HSuit, type Lang, type MessageVars } from '../arcade';
import { bidValue, PAIR_POINTS, PARTI_TARGET, type Bid, type BidKind, type IllegalReason } from '../engine';
import type { MessageKey } from '../i18n';

export type Tr = (key: MessageKey, vars?: MessageVars) => string;

/** The Hungarian contract names: canonical in every language. */
export const KIND_NAME: Readonly<Record<BidKind, string>> = {
  passz: 'Passz',
  negyvenszaz: 'Negyvenszáz',
  ulti: 'Ulti',
  betli: 'Betli',
  durchmars: 'Durchmars',
  huszszaz: 'Húszszáz',
  szintelenDurchmars: 'Színtelen durchmars',
};

export const KIND_INFO: Readonly<Record<BidKind, MessageKey>> = {
  passz: 'infoPassz',
  negyvenszaz: 'infoNegyvenszaz',
  ulti: 'infoUlti',
  betli: 'infoBetli',
  durchmars: 'infoDurchmars',
  huszszaz: 'infoHuszszaz',
  szintelenDurchmars: 'infoSzintelenDurchmars',
};

export const SUIT_KEY: Readonly<Record<HSuit, MessageKey>> = {
  piros: 'suitPiros',
  tok: 'suitTok',
  zold: 'suitZold',
  makk: 'suitMakk',
};

/** The explanation of a contract, with its point numbers (20/40, the 100-point target) from the engine constants. */
export function kindInfo(kind: BidKind, tr: Tr, lang: Lang): string {
  const num = (n: number) => formatNumber(n, lang);
  return tr(KIND_INFO[kind], { twenty: num(PAIR_POINTS.other), forty: num(PAIR_POINTS.trump), target: num(PARTI_TARGET) });
}

export const suitName = (suit: HSuit, tr: Tr): string => tr(SUIT_KEY[suit]);

/**
 * hu „Piros ulti + passz”, „Tök negyvenszáz”, „Betli”; en „Piros Ulti + Passz”; de „Rot Ulti + Passz”
 * (the suit follows the deck's names in that language, the contract terms stay Hungarian).
 */
export function bidLabel(bid: Bid, tr: Tr, lang: Lang): string {
  const kinds = bid.kinds.map((k) => KIND_NAME[k]);
  if (bid.trump === null) return kinds.join(' + ');
  const terms = lang === 'hu' ? kinds.map((k) => k.toLowerCase()) : kinds;
  return `${suitName(bid.trump, tr)} ${terms.join(' + ')}`;
}

/** Tooltip: what each contract of the bid means (plus the piros doubling), and its value. */
export function bidInfo(bid: Bid, tr: Tr, lang: Lang): string {
  const lines = bid.kinds.map((k) => kindInfo(k, tr, lang));
  if (bid.trump === 'piros') lines.push(tr('infoPiros'));
  return `${lines.join('\n')}\n${tr('valueTitle')}: ${formatNumber(bidValue(bid), lang)}`;
}

/** Stable id for tests and React keys: `ulti+passz:piros`, `betli:-`. */
export const bidId = (bid: Bid): string => `${bid.kinds.join('+')}:${bid.trump ?? '-'}`;

export const REASON_KEY: Readonly<Record<IllegalReason, MessageKey>> = {
  notPlayPhase: 'reasonNotPlayPhase',
  notYourTurn: 'reasonNotYourTurn',
  notInHand: 'reasonNotInHand',
  mustFollow: 'reasonMustFollow',
  mustBeat: 'reasonMustBeat',
  mustTrump: 'reasonMustTrump',
  mustOvertrump: 'reasonMustOvertrump',
  keepUltiSeven: 'reasonKeepUltiSeven',
};

/** Signed units, e.g. +8 / −4 / 0, with the language's grouping. */
export function formatUnits(n: number, format: (n: number) => string): string {
  if (n > 0) return `+${format(n)}`;
  if (n < 0) return `−${format(-n)}`;
  return format(0);
}

/** Rank names as in the deck's own card labels (`hCardLabel`), for the rules diagram. */
export const RANK_NAME: Readonly<Record<Lang, Readonly<Record<HRank, string>>>> = {
  en: { VII: 'Seven', VIII: 'Eight', IX: 'Nine', X: 'Ten', also: 'Under', felso: 'Over', kiraly: 'King', asz: 'Ace' },
  hu: { VII: 'hetes', VIII: 'nyolcas', IX: 'kilences', X: 'tízes', also: 'alsó', felso: 'felső', kiraly: 'király', asz: 'ász' },
  de: { VII: 'Sieben', VIII: 'Acht', IX: 'Neun', X: 'Zehn', also: 'Unter', felso: 'Ober', kiraly: 'König', asz: 'Ass' },
};

/** Corner index of a card: the numerals as printed, the court cards and the ace by their initial in that language. */
export const RANK_SHORT: Readonly<Record<Lang, Readonly<Record<HRank, string>>>> = {
  en: { VII: 'VII', VIII: 'VIII', IX: 'IX', X: 'X', also: 'U', felso: 'O', kiraly: 'K', asz: 'A' },
  hu: { VII: 'VII', VIII: 'VIII', IX: 'IX', X: 'X', also: 'A', felso: 'F', kiraly: 'K', asz: 'Á' },
  de: { VII: 'VII', VIII: 'VIII', IX: 'IX', X: 'X', also: 'U', felso: 'O', kiraly: 'K', asz: 'A' },
};
