import { formatNumber, hCardLabel, type HCard, type Lang } from '../arcade';
import type { LogEntry, Player } from '../engine';
import type { MessageKey } from '../i18n';
import { bidLabel, suitName, type Tr } from './labels';

/** Lines about the player (seat 0) use their own second-person wording ("You pass", „Passzolsz”, „Du passt”). */
const YOU: Partial<Record<MessageKey, MessageKey>> = {
  logPickup: 'logPickupYou',
  logDiscard: 'logDiscardYou',
  logBid: 'logBidYou',
  logPass: 'logPassYou',
  logDeclarer: 'logDeclarerYou',
  logAnnounce: 'logAnnounceYou',
  logTrick: 'logTrickYou',
};

export type LogLine = { id: number; kind: 'bid' | 'trick' | 'info'; text: string };

/** Words a deal's log in the current language: bidding events one per line, each trick as one line. */
export function logLines(log: readonly LogEntry[], name: (p: Player) => string, tr: Tr, lang: Lang): LogLine[] {
  const out: LogLine[] = [];
  let plays: { player: Player; card: HCard }[] = [];
  let trickNo = 0;
  const say = (key: MessageKey, p: Player, vars: Record<string, string | number> = {}) =>
    tr(p === 0 ? (YOU[key] ?? key) : key, { name: name(p), ...vars });
  const cards = () => plays.map((p) => `${name(p.player)}: ${hCardLabel(p.card, lang)}`).join(', ');
  log.forEach((e, id) => {
    switch (e.type) {
      case 'pickup':
        out.push({ id, kind: 'bid', text: say('logPickup', e.player) });
        break;
      case 'discard':
        out.push({ id, kind: 'bid', text: say('logDiscard', e.player) });
        break;
      case 'bid':
        out.push({ id, kind: 'bid', text: say('logBid', e.player, { bid: bidLabel(e.bid, tr, lang) }) });
        break;
      case 'pass':
        out.push({ id, kind: 'bid', text: say('logPass', e.player) });
        break;
      case 'declarer':
        out.push({ id, kind: 'info', text: say('logDeclarer', e.player, { bid: bidLabel(e.bid, tr, lang) }) });
        break;
      case 'kontra':
        out.push({ id, kind: 'bid', text: tr('logKontra', { name: name(e.player) }) });
        break;
      case 'noKontra':
        out.push({ id, kind: 'bid', text: tr('logNoKontra', { name: name(e.player) }) });
        break;
      case 'announce':
        out.push({ id, kind: 'info', text: say('logAnnounce', e.player, { points: formatNumber(e.points, lang), suit: suitName(e.suit, tr) }) });
        break;
      case 'play':
        plays.push({ player: e.player, card: e.card });
        break;
      case 'trick':
        trickNo = e.index + 1;
        out.push({ id, kind: 'trick', text: say('logTrick', e.winner, { n: formatNumber(trickNo, lang), cards: cards() }) });
        plays = [];
        break;
      case 'over':
        out.push({ id, kind: 'info', text: tr('logOver') });
        break;
    }
  });
  if (plays.length > 0) out.push({ id: log.length, kind: 'trick', text: tr('logTrickOpen', { n: trickNo + 1, cards: cards() }) });
  return out;
}
