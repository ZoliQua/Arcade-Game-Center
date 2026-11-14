#!/usr/bin/env node
/**
 * Mobile smoke run: every game inside the built portal on an emulated iPhone 13.
 *
 *   npm run build
 *   CHROMIUM_PATH=/path/to/chrome-headless-shell node scripts/mobile-smoke.mjs [--shots=<path prefix>] [id …]
 *
 * Builds nothing: serves apps/portal/dist on 127.0.0.1 (random port) and drives Chromium (playwright-core)
 * at 390 × 844, isMobile, hasTouch, DPR 3, an iPhone user agent, Hungarian UI, and without the element
 * Fullscreen API (like iPhone Safari, so the kit's CSS immersive mode is what gets tested).
 * Per game: open #/play/<id>, assert no horizontal page overflow (again after the first touch action and in full
 * screen), start the run with a tap, perform the game's first touch action, open Rules (the „Mobilon” section
 * must be there), toggle full screen (html[data-arcade-immersive] must be set) and leave it again. Any page error also fails the game.
 * Prints one line per game; exits 1 if any game failed. Not part of CI.
 * --shots=<prefix> saves a 390 × 844 screenshot per game after the first touch action as <prefix><id>.png.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'apps/portal/dist');
const WIDTH = 390;
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
};

/** The board element (gesture or tap board) of the current game. */
const board = (page) => page.locator('.arc-board-touch, .arc-board-tap').first();
const button = (page, name) => page.getByRole('button', { name, exact: true }).first();
const label = (loc) => loc.getAttribute('aria-label');
/** A board cell by the start of its aria-label (stays the same element when the rest of the label changes). */
const cell = (page, prefix) => page.locator(`[aria-label^="${prefix}"]`).first();

/** A one-finger swipe through the Chrome DevTools touch input (pointerType "touch" in the page). */
async function swipe(page, loc, dx, dy) {
  await loc.scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  if (!box) throw new Error('board not visible for a swipe');
  const x0 = box.x + box.width / 2;
  const y0 = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 6; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (dx * i) / 6, y: y0 + (dy * i) / 6 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

/** Waits until `fn()` is truthy (polling), or throws `what`. */
async function until(fn, what, ms = 15000) {
  const end = Date.now() + ms;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) throw new Error(what);
    await new Promise((r) => setTimeout(r, 150));
  }
}

/** No horizontal page scroll at the phone width. */
async function noOverflow(page) {
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (sw > WIDTH) throw new Error(`scrollWidth ${sw} > ${WIDTH}`);
}

const statusText = (page) => page.locator('[role=status]').first().textContent();
const running = (page) => until(async () => /Játékban/.test((await statusText(page)) ?? ''), 'run did not start');

/** Taps a cell-like element and waits until its aria-label no longer contains `before`. */
async function tapChanges(loc, before, what) {
  await loc.tap();
  await until(async () => !(await label(loc))?.includes(before), what, 5000);
}

/**
 * Per game: the first touch action of that game's touch task, and a cheap check that it did something.
 * `start: false` — the game has no start overlay (the run starts with the first move).
 */
const GAMES = {
  tetris: { act: async (p) => (await button(p, 'Balra').tap(), running(p)), what: 'pad ◀' },
  snake: { act: async (p) => (await swipe(p, board(p), 0, -120), running(p)), what: 'swipe up' },
  2048: {
    start: false,
    what: 'swipe',
    act: async (p) => {
      // A random opening can be stuck against one edge; the next direction then has to move.
      for (const [dx, dy] of [[-150, 0], [150, 0], [0, -150], [0, 150]]) {
        const before = await board(p).textContent();
        await swipe(p, board(p), dx, dy);
        const moved = await until(async () => (await board(p).textContent()) !== before, 'still', 1500).catch(() => false);
        if (moved) return;
      }
      throw new Error('no swipe moved the tiles');
    },
  },
  pacman: { act: async (p) => (await swipe(p, board(p), -120, 0), running(p)), what: 'swipe left' },
  gomoku: { act: (p) => tapChanges(cell(p, '8. sor, 8. oszlop'), 'üres', 'stone not placed'), what: 'tap cell' },
  tictactoe: { act: (p) => tapChanges(cell(p, '2. sor, 2. oszlop'), 'üres', 'mark not placed'), what: 'tap square' },
  breakout: { act: async (p) => (await board(p).tap(), running(p)), what: 'tap to launch' },
  invaders: { act: async (p) => (await button(p, 'Tűz').tap(), running(p)), what: 'tap Fire' },
  connect4: { act: (p) => tapChanges(cell(p, '4. oszlop'), 'üres', 'disc not dropped'), what: 'tap column' },
  nutsort: {
    what: 'tap bolt → bolt',
    act: async (p) => {
      await p.locator('[aria-label^="1. csavar"]').first().tap();
      await tapChanges(p.locator('[aria-label^="3. csavar"]').first(), 'üres', 'nut not moved');
    },
  },
  holdem: {
    what: 'tap call/check',
    act: async (p) => {
      const bar = p.getByRole('group', { name: 'A te lépésed' });
      const act = bar.getByRole('button', { name: /^(Megadás|Passz|Csekk|Tartás)/ }).first();
      await until(() => act.isEnabled(), 'no action offered to the player', 20000);
      await act.tap();
      await until(async () => !(await act.isEnabled().catch(() => false)), 'action not taken', 5000);
    },
  },
  minesweeper: {
    what: 'tap cell',
    act: (p) => tapChanges(cell(p, '5. sor, 5. oszlop:'), 'fedett', 'cell not opened'),
  },
  solitaire: {
    what: 'tap stock',
    act: async (p) => {
      await p.locator('[aria-label^="Pakli"]').first().tap();
      const waste = p.locator('[aria-label^="Dobott lapok"]').first();
      await until(async () => !(await label(waste))?.includes('üres'), 'no card dealt to the waste', 5000);
    },
  },
  ulti: {
    what: 'take talon / tap card',
    act: async (p) => {
      // The first bidder already holds 12 cards and discards; anyone else is offered the talon first.
      const take = button(p, 'Felveszem a talont');
      // The hand is an overlapping fan: only the last card is uncovered in the middle.
      const card = p.locator('.arc-board-tap button[aria-pressed="false"]:not([disabled])').last();
      await until(async () => (await take.isVisible()) || (await card.count()), 'no bid offered to the player', 20000);
      if (await take.isVisible()) await take.tap();
      await until(() => card.count(), 'hand did not open for the discard', 5000);
      await card.tap();
      await until(() => p.locator('.arc-board-tap button[aria-pressed="true"]').count(), 'card not picked for the discard', 5000);
    },
  },
  snapszer: {
    what: 'tap card',
    act: async (p) => {
      const card = p.locator('.arc-board-tap button[aria-pressed="false"]:not([disabled])').first();
      await until(() => card.count(), 'no playable card in the hand', 20000);
      await card.tap();
      await until(() => p.locator('.arc-board-tap button[aria-pressed="true"]').count(), 'card not raised', 5000);
    },
  },
};

async function smoke(browser, base, id, shots) {
  const spec = GAMES[id];
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: IPHONE_UA,
  });
  // iPhone Safari has no element Fullscreen API: the kit falls back to its CSS immersive mode.
  await context.addInitScript(() => {
    Object.defineProperty(Document.prototype, 'fullscreenEnabled', { configurable: true, get: () => false });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const step = async (name, fn) => {
    try {
      await fn();
    } catch (e) {
      throw new Error(`${name}: ${e.message.split('\n')[0]}`);
    }
    if (errors.length) throw new Error(`${name}: page error: ${errors[0]}`);
  };
  try {
    await step('open', async () => {
      await page.goto(`${base}/#/play/${id}?lang=hu`);
      await button(page, 'Szabályok').waitFor({ state: 'visible' });
      const anon = button(page, 'Játék név nélkül');
      if (await anon.isVisible()) await anon.tap();
    });
    await step('width', () => noOverflow(page));
    await step('start', async () => {
      if (spec.start === false) return;
      // The start button of the overlay card; on touch it carries no key hint, so its name is just the word.
      await page.locator('.arc-overlay__card').getByRole('button', { name: /^(Indítás|Osztás|Beszállok)(\s|$)/ }).first().tap();
    });
    await step(spec.what, () => spec.act(page));
    await step('width after play', () => noOverflow(page));
    if (shots) await page.screenshot({ path: `${shots}${id}.png` });
    await step('rules', async () => {
      await button(page, 'Szabályok').tap();
      const dialog = page.locator('.arc-rules[role=dialog]');
      await dialog.getByRole('heading', { name: 'Mobilon', exact: true }).waitFor({ timeout: 5000 });
      await dialog.getByRole('button', { name: 'Bezárás' }).tap();
      await dialog.waitFor({ state: 'detached', timeout: 5000 });
    });
    await step('full screen', async () => {
      await button(page, 'Teljes képernyő').tap();
      await page.locator('html[data-arcade-immersive]').waitFor({ state: 'attached', timeout: 5000 });
      await noOverflow(page);
    });
    await step('exit', async () => {
      await button(page, 'Kilépés').tap();
      await until(() => page.evaluate(() => !document.documentElement.hasAttribute('data-arcade-immersive')), 'still immersive', 5000);
    });
    return { ok: true, detail: `${spec.start === false ? 'no start overlay' : 'start tap'}, ${spec.what}, rules „Mobilon”, full screen on/off` };
  } catch (e) {
    return { ok: false, detail: e.message };
  } finally {
    await context.close();
  }
}

function serve() {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    const file = normalize(join(DIST, path === '/' ? 'index.html' : path));
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

const args = process.argv.slice(2);
const shots = args.find((a) => a.startsWith('--shots='))?.slice('--shots='.length);
const wanted = args.filter((a) => !a.startsWith('--'));
// Registry order (a plain object would list the numeric key '2048' first).
const ORDER = ['tetris', 'snake', '2048', 'pacman', 'gomoku', 'tictactoe', 'breakout', 'invaders', 'connect4', 'nutsort', 'holdem', 'minesweeper', 'solitaire', 'ulti', 'snapszer'];
const ids = wanted.length ? wanted : ORDER;
for (const id of ids) {
  if (!(id in GAMES)) {
    console.error(`Unknown game "${id}". Known: ${Object.keys(GAMES).join(', ')}`);
    process.exit(2);
  }
}
if (!process.env.CHROMIUM_PATH) {
  console.error('Set CHROMIUM_PATH to a Chromium / chrome-headless-shell binary.');
  process.exit(2);
}
try {
  await readFile(join(DIST, 'index.html'));
} catch {
  console.error('apps/portal/dist is missing — run `npm run build` first.');
  process.exit(2);
}

const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
let failed = 0;
for (const id of ids) {
  const r = await smoke(browser, base, id, shots);
  if (!r.ok) failed++;
  console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${id.padEnd(12)} ${r.detail}`);
}
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
