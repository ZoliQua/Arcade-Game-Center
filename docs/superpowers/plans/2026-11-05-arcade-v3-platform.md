# Arcade v3 Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-date the project history into 2026-10-25…11-14, then ship portal v3.0.0 on dulzoltan.hu/arcade with en/hu/de, a shared dental mode in all 11 games, GTM, updated links and the dulzoltan.hu card page.

**Architecture:** Language and dental mode are two new shared preferences in `@arcade/kit` built exactly like the existing theme (`theme.ts`: localStorage key + window event + hook), vendored into every game by `npm run sync:kit`. Each game owns a typed `src/i18n.ts` dictionary and a dental rendering branch; the portal adds the header language button, Settings rows, URL hand-off and GTM. History is rewritten with a mapping script before any new commit.

**Tech Stack:** React 18.3, Vite 5.4, TypeScript 5.6, Vitest 2.1 + jsdom, npm workspaces, git, cPanel UAPI from a logged-in browser tab; dulzoltan.hu is Next.js (static export) in `/Users/Zoli/Sites/Personal-DulZoltan/site`.

**Spec:** `docs/superpowers/specs/2026-11-05-arcade-v3-platform-design.md`

## Global Constraints

- Commit only as `Zoltán Dul <zoltan.dul@gmail.com>`; never any AI attribution (Co-Authored-By, "Generated with…").
- Game repos and the portal: every commit dated inside **2026-10-25 … 2026-11-14**, author **and** committer date, `+0100`, 09:00–19:00, via `dated-commit.sh` (`bash …/scratchpad/dated-commit.sh <repo> "<YYYY-MM-DD HH:MM:SS>" "<msg>" <paths…>`; run with `bash`, it is not executable).
- This plan's commit dates: 11-05 … 11-09 only (11-10 … 11-14 belong to the new-games plan).
- The dulzoltan.hu repo commits with normal current dates.
- Languages: `en`, `hu`, `de`. Storage key `arcade.lang`; URL param `lang`.
- Dental: storage key `arcade.dental` (`'1'`/`'0'`), **default off**; URL param `dental=1|0`; label „Fogas mód” / "Dental mode" / „Zahnmodus”.
- Presentation only: no rule, score, stats-key or save-format change from language or dental mode; switching never resets a run.
- Colour-blind: dental elements differ in shape, never colour alone.
- Browser data is not migrated to the new domain; the server leaderboard is.
- Never overwrite or print the live `_config.php` secrets; never delete files on the server.
- Kit code is edited only in `packages/kit/src`, then `npm run sync:kit`; `npm run check` green in every touched repo before each commit.
- Answer the user in Hungarian; code, comments, docs in English.

## Review Focus

- `lang`/`dental` given inside the hash route (`#/play/snake?lang=de&dental=1`) must work like the query string — test in Task 3.
- Unknown values (`?lang=fr`, `?dental=yes`) are ignored and resolution falls through — test in Task 3.
- localStorage blocked (throws) must not crash language/dental resolution; URL and browser language still apply — test in Task 3.
- Switching language or dental mode during a running game keeps the run (score, timer, board) intact — test in Task 5 (one game) and Task 6 (each game's dental test asserts the board survives the toggle).
- History rewrite must change only dates: identical commit count, messages and tree hashes per repo — check in Task 1.

## Date calendar for this plan

| Task | Repos | Date / times |
|---|---|---|
| 2 docs | AGC | 11-05 09:20, 09:50 |
| 3 kit | AGC + all game repos (sync) | 11-05 14:10 (AGC kit), 11-05 15:30 (each game sync) |
| 4 portal | AGC | 11-06 10:15, 16:40 |
| 5 game i18n | each game repo, then AGC mirror | 11-06 / 11-07, one commit per game between 09:30 and 18:30, AGC mirror 11-07 18:50 |
| 6 dental | each game repo, then AGC mirror | 11-08 / 11-09, one commit per game between 09:30 and 17:30, AGC mirror 11-09 17:45 |
| 7 release docs | all repos | 11-09 18:10 (games), 18:40 (AGC) |

---

### Task 1: Re-date history and force-push

**Files:**
- Create: `…/scratchpad/redate/calendar.mjs` (block mapping), `…/scratchpad/redate/redate.sh`
- Create: `…/scratchpad/redate/backups/<repo>.bundle`

**Interfaces:**
- Produces: every repo's commits dated 2026-10-24 or later remapped; `origin/main` force-updated.

- [ ] **Step 1: Back up.** For each repo in `Arcade-Game-Center Tetris-Game Snake-Game 2048-Game Pac-Man-Game Gomoku-Game Tic-Tac-Toe-Game Breakout-Game Space-Invaders-Game Connect-Four-Game Nut-Sort-Game Texas-Holdem-Game`: `git bundle create backups/<repo>.bundle --all`, then record `git rev-list --count HEAD`, `git log --format='%T %s'` into `backups/<repo>.before.txt`.
- [ ] **Step 2: Write `calendar.mjs`** exporting `mapDate(old: Date): Date`. Blocks (old range → new range, inclusive days): `[2026-10-24 → 10-25…10-26]`, `[2026-10-31…11-15 → 10-27…10-29]`, `[2026-11-16…11-22 → 10-30…11-01]`, `[2026-11-23…12-06 → 11-02…11-04]`. Inside a block, map the old timestamp linearly onto the new span's working time (09:00–19:00 each day), so order and relative spacing survive; a commit never moves before its parent (clamp to parent + 1 min).
- [ ] **Step 3: Rewrite.** Per repo: `git filter-branch -f --env-filter '<call node calendar.mjs on $GIT_AUTHOR_DATE / $GIT_COMMITTER_DATE when ≥ 2026-10-24>' -- --all` (or `git filter-repo --commit-callback` if installed). Older commits keep their dates and hashes.
- [ ] **Step 4: Verify.** For each repo: same commit count as `before.txt`; `git log --format='%T %s'` identical to `before.txt`; `git log --since=2026-10-24 --format='%ad %cd'` all inside 10-25…11-04; author/committer name+email all Zoltán Dul; `git log --format=%B | grep -iE 'co-authored|claude|generated with'` empty. Expected: all pass.
- [ ] **Step 5: Force-push** (approved by Zoltán): `git push --force-with-lease origin main` per repo; drop `refs/original` locally afterwards.
- [ ] **Step 6: CI.** Watch the latest run of every repo; expected all `success`.

### Task 2: Calendar in the docs

**Files:**
- Rename: `docs/superpowers/specs/2026-11-16-nut-sort-design.md` → `2026-10-30-nut-sort-design.md`; `plans/2026-11-16-nut-sort.md` → `2026-10-30-nut-sort.md`; `specs/2026-11-23-holdem-design.md` → `2026-11-02-holdem-design.md`; `plans/2026-11-23-holdem.md` → `2026-11-02-holdem.md`
- Modify: every `CHANGELOG.md` release date (12 repos) to the re-dated commit day of that release; dates and cross-links inside those spec/plan files; memory `arcade-games-layout.md`
- Add: the two v3 specs and this plan

- [ ] **Step 1:** Rename, fix cross-links (`grep -rn '2026-11-16\|2026-11-23\|2026-12-0' docs`) and set each CHANGELOG version date to `git log -1 --format=%ad --date=short` of its release commit.
- [ ] **Step 2:** `npm run check` in AGC (docs only, expected PASS).
- [ ] **Step 3: Commit** AGC 11-05 09:20 `docs: align plans, specs and changelog with the release calendar`; game repos 11-05 09:20 `docs: changelog dates`; AGC 11-05 09:50 `docs: v3 platform and new games designs` (two specs + this plan).

### Task 3: Kit — language, dental mode, tooth icons

**Files:**
- Create: `packages/kit/src/i18n.ts`, `packages/kit/src/dental.ts`, `packages/kit/src/prefs.ts`, `packages/kit/src/components/DentalIcons.tsx`
- Create tests: `packages/kit/src/i18n.test.ts`, `packages/kit/src/dental.test.ts`, `packages/kit/src/prefs.test.ts`
- Modify: `index.ts` (exports), `registry.ts` (`ARCADE_PORTAL_URL = 'https://dulzoltan.hu/arcade/'`, localized names), `hooks.ts` (`useLang`, `useDental`), `components/ArcadeUI.tsx` and `components/ArcadeShell.tsx` (translated chrome; shell gets a language button before the theme button and a dental toggle), `arcade.css` (lang menu, dental toggle)

**Interfaces:**
- Produces (exact names, used by every later task):
  - `type Lang = 'en' | 'hu' | 'de'`; `LANGS: readonly Lang[]`; `LANG_KEY = 'arcade.lang'`; `LANG_EVENT = 'arcade:lang'`
  - `readLang(): Lang` (saved → browser `navigator.languages` → `'en'`); `applyLang(lang: Lang): void` (persist, set `<html lang>`, emit event)
  - `DENTAL_KEY = 'arcade.dental'`; `DENTAL_EVENT = 'arcade:dental'`; `readDental(): boolean` (default `false`); `applyDental(on: boolean): void`
  - `readUrlPrefs(loc?: { search: string; hash: string }): { lang?: Lang; dental?: boolean }` — reads `?lang`/`?dental` from the query **and** from a query inside the hash
  - `applyUrlPrefs(loc?): void` — applies whatever `readUrlPrefs` returns (called once at boot by the portal and by `ArcadeShell`)
  - `type Messages<K extends string> = Record<Lang, Record<K, string>>`; `useMessages<K extends string>(dict: Messages<K>): (key: K, vars?: Record<string, string | number>) => string` (`{name}` placeholders)
  - `useLang(): [Lang, (l: Lang) => void]`; `useDental(): [boolean, (on: boolean) => void]`
  - `gameName(id: ArcadeGameId, lang: Lang): string`; `gameTagline(id: ArcadeGameId, lang: Lang): string` (registry entries gain `names: Partial<Record<Lang, string>>` and `taglines: Record<Lang, string>`; `name` stays the English name)
  - `formatNumber(n: number, lang: Lang): string` in `format.ts`
  - Dental icon components (SVG, `size`, `className`, optional `title`): `Tooth`, `Molar`, `SmileTooth`, `GoldCrown`, `Toothbrush`, `PasteDrop`, `Probe`, `Germ`, `DecayedTooth`
  - Localized names (only established ones): gomoku hu „Amőba”; connect4 hu „Négy a sorban”, de „Vier gewinnt”; every other game keeps its English name in all languages.

- [ ] **Step 1: Write failing tests** in `prefs.test.ts`:

```ts
it('reads lang and dental from the query', () => {
  expect(readUrlPrefs({ search: '?lang=de&dental=1', hash: '' })).toEqual({ lang: 'de', dental: true });
});
it('reads them from inside the hash route', () => {
  expect(readUrlPrefs({ search: '', hash: '#/play/snake?lang=hu&dental=0' })).toEqual({ lang: 'hu', dental: false });
});
it('ignores unknown values', () => {
  expect(readUrlPrefs({ search: '?lang=fr&dental=yes', hash: '' })).toEqual({});
});
```
  and in `i18n.test.ts`: `readLang()` returns the saved value; with nothing saved and `navigator.languages = ['de-AT']` returns `'de'`; returns `'en'` for `['fr']`; with `localStorage.getItem` throwing returns the browser language without throwing; `useMessages` picks the active language and fills `{name}`; `applyLang('hu')` sets `document.documentElement.lang === 'hu'`. In `dental.test.ts`: default `false`; `applyDental(true)` persists `'1'` and fires `arcade:dental`.
- [ ] **Step 2:** `npx vitest run packages/kit` → FAIL (missing exports).
- [ ] **Step 3:** Implement the interfaces above, mirroring `theme.ts`/`useArcadeTheme` (storage helpers from `storage.ts`, `subscribe` for cross-tab). Translate the kit chrome (StatPanel default labels, GameOverlay buttons, SaveBadge text, KeyHelp heading, ArcadeShell links and footer) through a kit `Messages` dictionary. `ArcadeShell` calls `applyUrlPrefs()` once on mount, shows a language button (globe + code, cycles/opens a 3-item menu) **before** the theme button, and a „Fogas mód” toggle in its menu.
- [ ] **Step 4:** `npx vitest run packages/kit` → PASS; `npm run typecheck` fails only where games/portal must follow (registry `names`/`taglines` filled for all 11 games now, so it should pass).
- [ ] **Step 5:** `npm run sync:kit`, `npm run check` in AGC and every game repo → PASS.
- [ ] **Step 6: Commit** AGC 11-05 14:10 `feat(kit): languages, shared dental mode and tooth icons`; each game 11-05 15:30 `chore(kit): sync vendored kit — languages and dental mode`.

### Task 4: Portal — switcher, settings, URL hand-off, GTM, new domain

**Files:**
- Create: `apps/portal/src/i18n.ts` (portal `Messages`), `apps/portal/src/analytics.ts`, `apps/portal/src/analytics.test.ts`
- Modify: `packages/ui/src/Shell.tsx` (header language button **immediately before** the Settings icon at `header__actions`; sidebar labels translated), `packages/ui/src/Icons.tsx` (`IconGlobe`), `apps/portal/src/Settings.tsx` (rows: Language segmented en/hu/de; Dental mode toggle with description), `Landing.tsx`, `Leaderboard.tsx`, `NicknamePrompt.tsx`, `ShortcutsDialog.tsx`, `App.tsx` (call `applyUrlPrefs()` before first render; `trackRoute(route)` on route change; document title per language), `apps/portal/index.html` (GTM head + noscript body snippet with `GTM-MTSQ5JGF`, copied from `Personal-DulZoltan/site/app/layout.tsx`), `apps/portal/.env.example` + local `.env` (`VITE_ARCADE_API_BASE=https://dulzoltan.hu/arcade/api`), `arcade-api/_config.example.php` (allowed origins: `https://dulzoltan.hu`)

**Interfaces:**
- Consumes: Task 3 exports.
- Produces: `trackRoute(route: Route, lang: Lang): void` pushing `{ event: 'arcade_page_view', page_path: '/arcade/' | '/arcade/play/<id>' | '/arcade/leaderboard' | '/arcade/settings', page_title, language }` to `window.dataLayer` (created if missing).

- [ ] **Step 1: Failing tests:** `analytics.test.ts` — `trackRoute({ view: 'play', id: 'snake' }, 'hu')` pushes `page_path: '/arcade/play/snake'` and `language: 'hu'`; works when `window.dataLayer` is undefined. Portal component test: rendering `Shell` shows a button with accessible name matching `/language/i` whose next sibling is the Settings button; clicking it and choosing `Deutsch` changes the Settings nav label to `Einstellungen`. Settings test: toggling „Dental mode” sets `localStorage['arcade.dental'] === '1'`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Every user-visible portal string goes through `apps/portal/src/i18n.ts` (natural hu/de wording; game names via `gameName`).
- [ ] **Step 4:** `npm run check` → PASS; `npm run dev`, browser: switch language from the header and from Settings, open `/?lang=de&dental=1#/play/snake` → German UI, dental on; no console errors.
- [ ] **Step 5: Commit** 11-06 10:15 `feat(portal): language switcher, dental mode setting and URL hand-off`; 11-06 16:40 `feat(portal): Google Tag Manager and dulzoltan.hu API base`.

### Task 5: Translate every game

**Files (per game, all 11):** Create `src/i18n.ts` (`export const MESSAGES: Messages<…>`), `src/i18n.test.ts`; modify every component with visible text (overlays, panels, settings rows, key help, aria-labels, demo captions, Hold'em log lines and character cards, Nut Sort level names).

**Interfaces:**
- Consumes: `useMessages`, `useLang`, `gameName`, `formatNumber`.

- [ ] **Step 1: Failing test per game** (`src/i18n.test.ts`): every key exists in all three languages and no value is empty; rendering `<XxxGame />` after `applyLang('de')` shows the German start overlay title/button text; switching `applyLang('hu')` while `status === 'running'` keeps the same score and board (the run is not reset).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Extract strings into `MESSAGES`; Hold'em log entries are stored as structured events already, so translate at render time (old saved logs keep working).
- [ ] **Step 4:** `npm run check` in the game repo → PASS; `npm run dev`, look at all three languages once.
- [ ] **Step 5:** `npm run sync:pull -- <id>` in AGC; after all 11, AGC `npm run check` → PASS.
- [ ] **Step 6: Commit** each game `feat(i18n): Hungarian and German` (11-06/11-07, times per calendar), AGC 11-07 18:50 `feat: mirror the translated games`.

### Task 6: Dental mode in every game

**Files (per game):** a `Dental…` rendering branch using the kit icons, driven by `useDental()`; game-specific files below. Test: `src/dental.test.tsx`.

| Game | Where | What |
|---|---|---|
| Tetris | `components/GameBoard.tsx` | filled cell renders `Tooth` tinted by piece; line clear adds a `brushed` class flash |
| Snake | `components/GameBoard.tsx` | head `SmileTooth` rotated by direction, body `Tooth`, food `PasteDrop` |
| 2048 | `components/Tile.tsx` | tile art by value: 2–4 `Tooth` (milk, small), 8–64 `Molar`, 128–1024 `SmileTooth`, 2048+ `GoldCrown`; number always shown |
| Pac-Man | `IconThemeToggle.tsx`, `logic/types.ts` (`IconTheme = 'normal' \| 'fog' \| 'dental'`), `Entities.tsx`, `Maze.tsx` | picker Normal / Fog / Dental bound to `arcade.dental` both ways; Pac-Man `SmileTooth`, dots `PasteDrop`, power pellet `Toothbrush`, ghosts `Germ` (frightened: hollow germ) |
| Breakout | `components/Playfield.tsx`, `palette.ts` | paddle `Toothbrush`, ball paste ball, bricks tartar colours with brush/paste/probe marks cycling by column |
| Space Invaders | `components/render.ts`, `SpriteIcon.tsx` | invaders `Germ` variants (3 shapes per row type), player toothbrush cannon, shots paste drops, bunkers tooth-shaped with caries-style erosion |
| Gomoku, Tic-Tac-Toe | `IconStyleToggle.tsx`, `hooks/useIconStyle.ts` | replace the per-game icon-style setting with the shared toggle (tooth = dental on), label „Fogas mód”; one-time migration: old `…iconStyle === 'tooth'` → `applyDental(true)` |
| Connect Four | `components/GameBoard.tsx` | player discs `Tooth` (incisor), opponent `Molar` (gold) |
| Nut Sort | `components/Nut.tsx`, `NutBoard.tsx` | bolt drawn as implant post; nut drawn as crown keeping width and notch geometry |
| Texas Hold'em | `ui/` table theme, `ui/Character*`, card back | while dental on: clinic table (mint/white) replaces table theme; characters wear dental outfits (dentist, assistant, hygienist, patient with braces, tooth fairy …) with tells intact; card back with `Tooth` logo |

- [ ] **Step 1: Failing test per game** (`src/dental.test.tsx`): with `applyDental(true)`, the board renders the dental element (query by `data-dental="true"` on the board root plus one game-specific `data-testid`, e.g. `snake-head-tooth`); toggling dental during `running` keeps score and board; with dental off the classic rendering is unchanged (existing tests still pass).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement per the table; every dental element differs in shape from its neighbours.
- [ ] **Step 4:** `npm run check` → PASS; browser look at dental on/off in dark and light theme.
- [ ] **Step 5:** `sync:pull` into AGC, AGC `npm run check` → PASS.
- [ ] **Step 6: Commit** each game `feat: dental mode` (11-08/11-09), AGC 11-09 17:45 `feat: mirror dental mode in every game`.

### Task 7: Links, versions, release docs

**Files:** every repo's `README.md`, `CLAUDE.md`, `package.json` description/homepage, `CHANGELOG.md`; AGC `docs/DEPLOY.md`, `README.md`.

- [ ] **Step 1:** Replace `drdul.hu/arcade` with `dulzoltan.hu/arcade` everywhere outside `node_modules`, `dist`, `docs/history/` (historical record stays) and the gitignored `_config.php`: `grep -rn 'drdul' --exclude-dir={node_modules,dist,.git} .` → only `docs/history` hits remain.
- [ ] **Step 2:** README "Features" gain a line on languages and dental mode; versions: each game minor bump, portal `3.0.0`, `APP_VERSION = '3.0'`; CHANGELOG entries; DEPLOY.md "Moving to dulzoltan.hu (v3)" section.
- [ ] **Step 3:** `npm run check` in all 12 repos → PASS.
- [ ] **Step 4: Commit** games 11-09 18:10 `docs: dulzoltan.hu links, languages and dental mode; release vX.Y.0`; AGC 11-09 18:40 `docs: v3.0.0 — dulzoltan.hu, languages, dental mode`. Push all; CI green.

### Task 8: Go live on dulzoltan.hu

- [ ] **Step 1:** Build portal (`npm run build`), confirm the bundle contains `https://dulzoltan.hu/arcade/api` and `GTM-MTSQ5JGF`; package `arcade-deploy/arcade-v3.0.0.zip` (no `api/`).
- [ ] **Step 2:** In the logged-in cPanel tab: find dulzoltan.hu's document root (`DomainInfo/domains_data`); create `<root>/arcade/`; copy `drdul.hu/arcade/api/` there server-side (`Fileman::fileop op=copy`, keeps the live `_config.php` without reading it); upload the portal files.
- [ ] **Step 3:** On drdul.hu: upload `arcade/.htaccess` with `RedirectMatch 301 ^/arcade/?(.*)$ https://dulzoltan.hu/arcade/$1` (portal files and old `api/` stay, not deleted).
- [ ] **Step 4: Verify live:** `https://dulzoltan.hu/arcade/` 200 with the new asset names; leaderboard GET 200 `ok:true` for all 11 ids; `api/_config.php` 403; `https://drdul.hu/arcade/` → 301 to dulzoltan.hu; browser: 11 cards, demos animate, a game plays, `?lang=de&dental=1` works, `window.dataLayer` has the GTM entries, no console errors.

### Task 9: dulzoltan.hu — card page, menu, open source

**Files (`/Users/Zoli/Sites/Personal-DulZoltan/site`):** `lib/content.ts` (new `SUBPAGES.dev` entry `arcade` with hu/en/de title, lead, and 11 game cards: name per language, one-line description, icon, link), the page renderer for that sub-page (follow the Praxistérkép sub-page pattern), `components/Header.tsx` (order so the Arcade sub-page sits directly above the DenCT item), the `open-source` content block (new row: Arcade-Game-Center + game repos, link to the card page and GitHub).

- [ ] **Step 1:** Card links are `https://dulzoltan.hu/arcade/?lang=<page locale>&dental=1#/play/<id>`; the page also has one "Open the Arcade" link with the same params.
- [ ] **Step 2:** Build the site (its own build command from `package.json`), check `/fejlesztes/arcade/` (and `/en/…`, `/de/…` per the site's routing) and the menu in a browser at desktop and phone width.
- [ ] **Step 3:** Commit in that repo (normal date) `Fejlesztés: Arcade — kártyás aloldal (hu/en/de), menüpont a DenCT fölött, open source sor`.
- [ ] **Step 4:** Deploy the site's static output to the dulzoltan.hu document root the way that repo's README "Deploy" section describes, without touching `/arcade/` and `/denct/`. Verify live: menu order, card page, a card click lands in the arcade in the page's language with dental mode on.
