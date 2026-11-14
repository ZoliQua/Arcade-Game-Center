import type { Lang } from '../arcade';
import { hCardLabel, type HCard } from '../arcade';
import type { LogEntry, Player } from '../engine';
import { bidLabel, suitName, type Tr } from './labels';

export type LogLine = { id: number; kind: 'bid' | 'trick' | 'info'; text: string };

/** Words a deal's log in the current language: bidding events one per line, each trick as one line. */
export function logLines(log: readonly LogEntry[], name: (p: Player) => string, tr: Tr, lang: Lang): LogLine[] {
  const out: LogLine[] = [];
  let plays: { player: Player; card: HCard }[] = [];
  let trickNo = 0;
  const cards = () => plays.map((p) => `${name(p.player)}: ${hCardLabel(p.card, lang)}`).join(', ');
  log.forEach((e, id) => {
    switch (e.type) {
      case 'pickup':
        out.push({ id, kind: 'bid', text: tr('logPickup', { name: name(e.player) }) });
        break;
      case 'discard':
        out.push({ id, kind: 'bid', text: tr('logDiscard', { name: name(e.player) }) });
        break;
      case 'bid':
        out.push({ id, kind: 'bid', text: tr('logBid', { name: name(e.player), bid: bidLabel(e.bid, tr, lang) }) });
        break;
      case 'pass':
        out.push({ id, kind: 'bid', text: tr('logPass', { name: name(e.player) }) });
        break;
      case 'declarer':
        out.push({ id, kind: 'info', text: tr('logDeclarer', { name: name(e.player), bid: bidLabel(e.bid, tr, lang) }) });
        break;
      case 'kontra':
        out.push({ id, kind: 'bid', text: tr('logKontra', { name: name(e.player) }) });
        break;
      case 'noKontra':
        out.push({ id, kind: 'bid', text: tr('logNoKontra', { name: name(e.player) }) });
        break;
      case 'announce':
        out.push({ id, kind: 'info', text: tr('logAnnounce', { name: name(e.player), points: e.points, suit: suitName(e.suit, tr) }) });
        break;
      case 'play':
        plays.push({ player: e.player, card: e.card });
        break;
      case 'trick':
        trickNo = e.index + 1;
        out.push({ id, kind: 'trick', text: tr('logTrick', { n: trickNo, cards: cards(), name: name(e.winner) }) });
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
