import type { Lang, MessageVars } from '../arcade';
import type { HSuit } from '../arcade';
import { bidValue, type Bid, type BidKind, type IllegalReason } from '../engine';
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
export function bidInfo(bid: Bid, tr: Tr): string {
  const lines = bid.kinds.map((k) => tr(KIND_INFO[k]));
  if (bid.trump === 'piros') lines.push(tr('infoPiros'));
  return `${lines.join('\n')}\n${tr('valueTitle')}: ${bidValue(bid)}`;
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
