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
    tricks.forEach((l, i) => expect(l.text).toContain(`— ${names(end.tricks[i].winner as Player)} viszi`));
    expect(lines.some((l) => l.text.endsWith('felveszi a talont'))).toBe(true);
    expect(lines[lines.length - 1].text).toBe('Vége az osztásnak');
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
