#!/usr/bin/env node
/**
 * Keep Arcade-Game-Center and the standalone game repos in lock-step.
 *
 *   node scripts/sync-games.mjs kit            packages/kit/src → every game's src/arcade/
 *   node scripts/sync-games.mjs pull [id|all]  standalone repo → apps/<id>/
 *   node scripts/sync-games.mjs push [id|all]  apps/<id>/ → standalone repo working tree
 *   node scripts/sync-games.mjs check          exit 1 if anything drifted
 *
 * Standalone repos are expected as siblings of this repo (…/Arcade-Games/Snake-Game)
 * or under $ARCADE_GAMES_ROOT. `push` only writes files; review and commit in the
 * game repo yourself (author: Zoltán Dul, no co-authors).
 *
 * Synced per game: src/ (incl. vendored src/arcade), index.html, public/, vite.config.ts.
 * Never synced: package.json, tsconfig*.json, docs — those differ by design
 * (workspace package here, standalone app there).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GAMES_ROOT = resolve(process.env.ARCADE_GAMES_ROOT ?? join(ROOT, '..'));
const KIT_SRC = join(ROOT, 'packages/kit/src');

export const GAMES = {
  tetris: 'Tetris-Game',
  snake: 'Snake-Game',
  2048: '2048-Game',
  pacman: 'Pac-Man-Game',
  gomoku: 'Gomoku-Game',
  tictactoe: 'Tic-Tac-Toe-Game',
  breakout: 'Breakout-Game',
  invaders: 'Space-Invaders-Game',
  connect4: 'Connect-Four-Game',
  nutsort: 'Nut-Sort-Game',
  holdem: 'Texas-Holdem-Game',
  minesweeper: 'Minesweeper-Game',
  solitaire: 'Solitaire-Game',
  ulti: 'Ulti-Game',
};

/**
 * Registered in the kit before their repo exists: skipped with a note.
 * An id leaves PENDING as soon as its repo exists. Any other missing repo is an error.
 */
const PENDING = new Set(['minesweeper', 'solitaire', 'ulti']);

const SYNCED = ['src', 'index.html', 'public', 'vite.config.ts'];
const IGNORED = new Set(['.DS_Store', 'node_modules', 'dist']);
const KIT_NOTE = `# Vendored: Zoltan's Arcade kit

This folder is a byte-for-byte copy of
[Arcade-Game-Center/packages/kit/src](https://github.com/ZoliQua/Arcade-Game-Center/tree/main/packages/kit/src).
Do **not** edit it here — change the kit in Arcade-Game-Center and run
\`node scripts/sync-games.mjs kit\`, then commit the copy in every game repo.
`;

const repoDir = (id) => join(GAMES_ROOT, GAMES[id]);
const appDir = (id) => join(ROOT, 'apps', id);

function ids(arg) {
  if (!arg || arg === 'all') return Object.keys(GAMES);
  if (!(arg in GAMES)) {
    console.error(`Unknown game "${arg}". Known: ${Object.keys(GAMES).join(', ')}`);
    process.exit(2);
  }
  return [arg];
}

/** Games registered before their repo exists are skipped (with a note), not failed. */
function repoExists(id, verb) {
  if (existsSync(repoDir(id))) return true;
  if (!PENDING.has(id)) {
    console.error(`[${id}] standalone repo not found at ${repoDir(id)}`);
    process.exit(1);
  }
  console.log(`note: [${id}] standalone repo not found at ${repoDir(id)} (skipped ${verb})`);
  return false;
}

function listFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  if (statSync(dir).isFile()) return [relative(base, dir) || '.'];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (IGNORED.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listFiles(p, base));
    else out.push(relative(base, p));
  }
  return out.sort();
}

/** Mirror `from` onto `to` (files or directories), deleting extras in `to`. */
function mirror(from, to) {
  if (!existsSync(from)) return;
  rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true, filter: (src) => !IGNORED.has(src.split('/').pop()) });
}

/** Returns a list of human-readable differences between two trees. */
function diffTrees(a, b) {
  const fa = listFiles(a);
  const fb = listFiles(b);
  const sb = new Set(fb);
  const sa = new Set(fa);
  const out = [];
  for (const f of fa) {
    if (!sb.has(f)) out.push(`only in ${relative(GAMES_ROOT, a)}: ${f}`);
    else {
      const pa = f === '.' ? a : join(a, f);
      const pb = f === '.' ? b : join(b, f);
      if (!readFileSync(pa).equals(readFileSync(pb))) out.push(`differs: ${relative(GAMES_ROOT, pa)}`);
    }
  }
  for (const f of fb) if (!sa.has(f)) out.push(`only in ${relative(GAMES_ROOT, b)}: ${f}`);
  return out;
}

function syncKit() {
  const targets = [];
  for (const id of Object.keys(GAMES)) {
    targets.push(join(appDir(id), 'src/arcade'));
    if (existsSync(repoDir(id))) targets.push(join(repoDir(id), 'src/arcade'));
  }
  for (const t of targets) {
    if (!existsSync(dirname(t))) continue;
    mirror(KIT_SRC, t);
    writeFileSync(join(t, 'README.md'), KIT_NOTE);
    console.log(`kit → ${relative(GAMES_ROOT, t)}`);
  }
}

function copyGame(id, fromRoot, toRoot) {
  for (const entry of SYNCED) mirror(join(fromRoot, entry), join(toRoot, entry));
  console.log(`${relative(GAMES_ROOT, fromRoot)} → ${relative(GAMES_ROOT, toRoot)}`);
}

function check() {
  const problems = [];
  const kitFiles = listFiles(KIT_SRC);
  for (const id of Object.keys(GAMES)) {
    const roots = [appDir(id), repoDir(id)].filter(existsSync);
    for (const r of roots) {
      const vendored = join(r, 'src/arcade');
      for (const p of diffTrees(KIT_SRC, vendored)) if (!p.endsWith('README.md')) problems.push(`[kit] ${p}`);
      if (!existsSync(join(vendored, 'README.md'))) problems.push(`[kit] missing ${relative(GAMES_ROOT, vendored)}/README.md`);
    }
    if (existsSync(repoDir(id))) {
      for (const entry of SYNCED) {
        for (const p of diffTrees(join(appDir(id), entry), join(repoDir(id), entry))) problems.push(`[${id}] ${p}`);
      }
    } else {
      if (PENDING.has(id)) console.log(`note: [${id}] standalone repo not found at ${repoDir(id)} (skipped)`);
      else problems.push(`[${id}] standalone repo not found at ${repoDir(id)}`);
    }
  }
  if (kitFiles.length === 0) problems.push('[kit] packages/kit/src is empty');
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log('✓ kit and all games are in sync');
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const [cmd, arg] = isMain ? process.argv.slice(2) : ['__import__'];
switch (cmd) {
  case '__import__':
    break;
  case 'kit':
    syncKit();
    break;
  case 'pull':
    for (const id of ids(arg)) if (repoExists(id, 'pull')) copyGame(id, repoDir(id), appDir(id));
    break;
  case 'push':
    for (const id of ids(arg)) if (repoExists(id, 'push')) copyGame(id, appDir(id), repoDir(id));
    break;
  case 'check':
    check();
    break;
  default:
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(2, 16).join('\n'));
    process.exit(cmd ? 2 : 0);
}
