import { describe, expect, it } from 'vitest';
import { translate } from '../arcade';
import { driveDeal } from '../bots/testkit';
import { makeBid, type Player } from '../engine';
import { MESSAGES, type MessageKey } from '../i18n';
import { bidLabel } from './labels';
import { logLines } from './logLines';

const names = (p: Player) => ['Te', 'Bandi', 'Teri'][p];
const tr = (lang: 'en' | 'hu' | 'de') => (k: MessageKey, v?: Record<string, string | number>) => translate(MESSAGES, lang, k, v);

describe('log lines', () => {
  it('word every bid and each trick as one line, with the winner', () => {
    const end = driveDeal({ seed: 12, levels: ['medium', 'medium', 'medium'] });
    const lines = logLines(end.log, names, tr('hu'), 'hu');
    const tricks = lines.filter((l) => l.kind === 'trick');
    expect(tricks).toHaveLength(end.tricks.length);
    tricks.forEach((l, i) => expect(l.text).toContain(end.tricks[i].winner === 0 ? '— te viszed' : `— ${names(end.tricks[i].winner as Player)} viszi`));
    expect(lines.some((l) => l.text.endsWith('felveszi a talont') || l.text === 'Felveszed a talont')).toBe(true);
    expect(lines[lines.length - 1].text).toBe('Vége az osztásnak');
  });

  it('words the player\'s own moves in the second person in every language', () => {
    const end = driveDeal({ seed: 12, levels: ['medium', 'medium', 'medium'] });
    const you = (p: Player) => ['You', 'Bandi', 'Teri'][p];
    const en = logLines(end.log, you, tr('en'), 'en').map((l) => l.text);
    expect(en.some((t) => /^You (passes|picks|lays|bids|plays|announces)/.test(t))).toBe(false);
    expect(en.some((t) => t.includes('— You takes it'))).toBe(false);
    const seat0 = end.log.filter((e) => 'player' in e && e.player === 0).map((e) => e.type);
    if (seat0.includes('pass')) expect(en).toContain('You pass');
    if (seat0.includes('pickup')) expect(en).toContain('You pick up the talon');
    if (end.tricks.some((t) => t.winner === 0)) expect(en.some((t) => t.endsWith('— you take it'))).toBe(true);
    const hu = logLines(end.log, names, tr('hu'), 'hu').map((l) => l.text);
    expect(hu.some((t) => t.startsWith('Te felveszi') || t.startsWith('Te passzol') || t.endsWith('Te viszi'))).toBe(false);
    const de = logLines(end.log, (p) => ['Du', 'Bandi', 'Teri'][p], tr('de'), 'de').map((l) => l.text);
    expect(de.some((t) => /^Du (passt|nimmt|legt|bietet|spielt|meldet)\b/.test(t) && !/^Du passt$/.test(t))).toBe(false);
  });

  it('keeps the Hungarian contract names in every language; the suit follows the deck names', () => {
    const bid = makeBid(['ulti', 'passz'], 'piros');
    expect(bidLabel(bid, tr('hu'), 'hu')).toBe('Piros ulti + passz');
    expect(bidLabel(bid, tr('en'), 'en')).toBe('Piros Ulti + Passz');
    expect(bidLabel(bid, tr('de'), 'de')).toBe('Rot Ulti + Passz');
    expect(bidLabel(makeBid(['szintelenDurchmars'], null), tr('de'), 'de')).toBe('Színtelen durchmars');
    expect(bidLabel(makeBid(['negyvenszaz'], 'tok'), tr('hu'), 'hu')).toBe('Tök negyvenszáz');
  });
});
