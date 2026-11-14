# Arcade v3.2 — Rules, Finish, Mobile, Logo, Hungarian Deck, Snapszer, Trilingual READMEs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every one of the fourteen games gets a Rules dialog, a Finish-early button that ranks the current score
(even 0), full touch/tap play with full screen on phones; the portal gets a collapsible game list, a mobile drawer
layout and the new logo; the Hungarian deck (now shared in the kit) gets closer to the real one; a fifteenth
game, Snapszer, joins; every repo README exists in English, German and Hungarian.

**Architecture:** New shared pieces live in the kit (`packages/kit/src`, vendored as `src/arcade/` into every game
by `npm run sync:kit`): finish contract in `useArcadeRun`, `FinishButton`, `RulesButton`/`RulesDialog`, touch
helpers, immersive/full-screen mode. Each game then wires them in its own standalone repo; the controller mirrors
every game into the portal monorepo (AGC) with `sync:pull` in the integration task.

**Tech Stack:** React 18.3, Vite 5.4, TypeScript 5.6, Vitest 2.1 + jsdom + Testing Library; `playwright-core`
1.58.2 (dev only, local mobile smoke run).

**Spec:** `docs/superpowers/specs/2026-11-14-rules-finish-logo-design.md`

## Global Constraints

- Repos: AGC = `/Users/Zoli/Code/Games/Arcade-Games/Arcade-Game-Center`; games = sibling dirs
  `Tetris-Game, Snake-Game, 2048-Game, Pac-Man-Game, Gomoku-Game, Tic-Tac-Toe-Game, Breakout-Game,
  Space-Invaders-Game, Connect-Four-Game, Nut-Sort-Game, Texas-Holdem-Game, Minesweeper-Game, Solitaire-Game, Ulti-Game`.
- Commits only via `bash /private/tmp/claude-501/-Users-Zoli-Code-Games-Arcade-Games/ad98255b-6ba3-4cdc-b4cd-7685c7e34e2c/scratchpad/dated-commit.sh <repo> "<YYYY-MM-DD HH:MM:SS>" "<message>" <paths…>`,
  with the exact date/message each task gives. All dates are **2026-11-14 18:30:00–18:59:59** (+0100). Author =
  committer = Zoltán Dul <zoltan.dul@gmail.com>. Never Co-Authored-By or any AI attribution. Never push.
- Kit code is edited only in `AGC/packages/kit/src`; never edit a vendored `src/arcade/`.
- en/hu/de for every visible string; natural wording, hu tegező, de du-form. Button words: hu „Szabályok” /
  en "Rules" / de „Regeln”; hu „Befejezés” / en "Finish" / de „Beenden”; confirm hu „Befejezed a játékot?
  {score} pont kerül a ranglistára.” with „Befejezem” / „Mégse” (en "Finish the game? {score} points go on the
  leaderboard." "Finish" / "Cancel"; de „Spiel beenden? {score} Punkte kommen in die Bestenliste.” „Beenden” / „Abbrechen”).
  Mobile section title: hu „Mobilon” / en "On mobile" / de „Auf dem Handy”.
- Never colour-only meaning (Zoltán is colour-blind): shapes, labels, ✓/✗ marks.
- Every repo README exists in three languages: `README.md` (English base) + `README.de.md` + `README.hu.md`, full
  translations, language line `**English** · [Deutsch](README.de.md) · [Magyar](README.hu.md)` under the title.
- Every number shown goes through `formatNumber(n, lang)`.
- Touch targets ≥ 44 px (pad buttons ≥ 48 px); no page scroll or zoom while a finger is on a board; inputs ≥ 16 px.
- Mobile reference sizes: 360–430 px wide portrait; landscape must not break.
- `npm run check` green in every touched repo before each commit; TDD (failing test first).
- No browser `alert/confirm/prompt`; confirms are in-page.

## Before Task 1 (controller)

Commit the spec and this plan in AGC at `"2026-11-14 18:30:00"`, message `"docs: v3.2 rules, finish, mobile and logo design and plan"`.

## Review Focus

1. Finish pressed while paused, twice in a row, or while the portal's pending-nickname prompt is open → exactly
   one leaderboard submission, the shown score. (Task 1 test `finish is recorded once`; Task 4 test
   `a finished 0-point run asks for a nickname once`.)
2. Language or dental switch while the Rules dialog is open → dialog re-renders in the new language, run state
   unchanged, still paused. (Each game task, `rules.test.tsx` "language switch inside rules keeps the run".)
3. Immersive mode then rotate/resize, then exit → no horizontal page scroll, page scroll position and the
   portal chrome restored. (Task 2 test `exit restores scroll and chrome`.)
4. A swipe that starts on a button inside the board area → the button still works, the swipe does not fire twice.
   (Task 2 `useSwipe` test `ignores gestures that start on interactive elements`.)
5. Typing R or Escape in the nickname field → no Rules dialog, no pause. (Task 1 test using `shouldIgnoreKey`.)

---

### Task 1: Kit — finish contract, Finish button, Rules dialog

**Files:**
- Modify: `AGC/packages/kit/src/types.ts`, `hooks.ts`, `i18n.ts` (kit messages), `arcade.css`, `index.ts`
- Create: `AGC/packages/kit/src/components/Finish.tsx`, `components/Rules.tsx`
- Test: `AGC/packages/kit/test/finish.test.tsx`, `test/rules.test.tsx`

**Interfaces:**
- Produces:
  - `RunOutcome = 'win' | 'loss' | 'draw' | 'over' | 'finished'` (`'finished'` never counts as a win in stats).
  - `ArcadeGameProps.onGameOver?: (score: number, info?: { finished?: boolean }) => void`.
  - `useArcadeRun`: when the outcome is `'finished'` and the run is ranked, calls `onGameOver(score, { finished: true })`
    for `score >= 0`; otherwise unchanged (`score > 0`, no info argument).
  - `FinishButton(props: { score: number; visible: boolean; onFinish: () => void; onOpenChange?: (open: boolean) => void })`
    — renders nothing when `!visible`; click opens an in-page confirm (role `alertdialog`) showing the formatted score;
    confirm calls `onFinish` once; `onOpenChange` lets the game pause its timer while the confirm is open.
  - `type RulesSectionId = 'goal' | 'play' | 'rules' | 'scoring' | 'dental' | 'mobile'`;
    `type RulesSection = { id: RulesSectionId; body: ReactNode }` (the kit supplies the localized heading per id).
  - `RulesButton(props: { sections: RulesSection[]; onOpenChange?: (open: boolean) => void; hotkey?: boolean })` —
    visible icon + word; `hotkey` (default true) binds R via `shouldIgnoreKey`; dialog role `dialog`, Escape/Close
    closes, focus trapped and returned; the `mobile` section is rendered only when `useIsTouch()` is true (Task 2
    provides `useIsTouch`; in this task add it as a minimal `matchMedia('(pointer: coarse)')` hook in `touch.ts`,
    Task 2 extends that file).
- Kit messages (en/hu/de): `rulesButton`, `rulesTitle` ("{game} — rules"), headings `rulesGoal`, `rulesPlay`,
  `rulesRules`, `rulesScoring`, `rulesDental`, `rulesMobile`, `rulesClose`, `finishButton`, `finishConfirm`,
  `finishYes`, `finishNo`, `finishedEarly` (game-over line: hu „Idő előtt befejezve”, en "Finished early",
  de „Vorzeitig beendet”).

- [ ] **Step 1: Write failing tests** — `finish.test.tsx`: (a) `finished outcome reports 0 with info`: a harness
  using `useArcadeRun` with `outcome: 'finished'`, score 0 → `onGameOver` called with `(0, { finished: true })`;
  (b) `over outcome with 0 reports nothing` (unchanged rule); (c) `finish is recorded once`: toggling status
  gameOver→gameOver with the same runKey → one call; (d) stats: a finished run increments `plays`, not `wins`;
  (e) `FinishButton` hidden when `visible=false`; click → alertdialog text contains `formatNumber(1234,'hu')` under
  `applyLang('hu')`; „Mégse” closes without `onFinish`; „Befejezem” calls `onFinish` exactly once.
  `rules.test.tsx`: button labelled „Szabályok” in hu; R opens, Escape closes and focus returns; R typed in an
  `<input>` does nothing; sections render kit headings in order given; `mobile` section absent with fine pointer,
  present with `matchMedia` mocked to coarse; `onOpenChange(true/false)` fires.
- [ ] **Step 2:** `npm test -w @arcade/kit` → FAIL (missing exports).
- [ ] **Step 3: Implement** the interfaces above; CSS in `arcade.css` (`.arc-rules*`, `.arc-finish*`), dialog
  scrolls inside on small screens (max-height 85dvh).
- [ ] **Step 4:** `npm run check` in AGC → the kit tests PASS (AGC typecheck may stay red only if a game's
  `onGameOver` usage breaks — it must not, the argument is optional).
- [ ] **Step 5: Commit** AGC `"2026-11-14 18:30:30"` `"feat(kit): finish early, rules dialog"` (kit files + tests).

### Task 2: Kit — touch helpers, immersive/full screen, compact layout

**Files:**
- Modify/Create: `AGC/packages/kit/src/touch.ts`, `components/TouchPad.tsx`, `components/Fullscreen.tsx`,
  `components/ArcadeUI.tsx` (KeyHelp/TouchHelp), `components/ArcadeShell.tsx`, `arcade.css`, `index.ts`, kit i18n
- Test: `AGC/packages/kit/test/touch.test.tsx`, `test/fullscreen.test.tsx`

**Interfaces:**
- Produces:
  - `useIsTouch(): boolean` (live `(pointer: coarse)`).
  - `type SwipeDir = 'up' | 'down' | 'left' | 'right'`;
    `useSwipe(ref: RefObject<HTMLElement>, onSwipe: (dir: SwipeDir, info: { dx: number; dy: number; ms: number }) => void, opts?: { threshold?: number /* px, default 24 */ ; onTap?: (e: PointerEvent) => void }): void`
    — Pointer Events; ignores gestures starting on `button, a, input, select, textarea, [data-no-swipe]`.
  - `useLongPress(onLongPress: (e: PointerEvent) => void, opts?: { ms?: number /* 400 */ }): { onPointerDown; onPointerUp; onPointerLeave; onPointerCancel }`
    — calls `navigator.vibrate?.(15)`; a long press suppresses the following click.
  - `TouchPad(props: { buttons: { id: string; label: string; icon: ReactNode; onPress: () => void; repeat?: boolean }[]; layout: 'dpad' | 'row' })`
    — renders only when `useIsTouch()`; `repeat` = auto-repeat while held (150 ms).
  - `useImmersive(target: RefObject<HTMLElement>): { active: boolean; native: boolean; toggle: () => void; exit: () => void }`
    — Fullscreen API on `target` when `document.fullscreenEnabled`, else CSS immersive:
    `document.documentElement.dataset.arcadeImmersive = '1'`, target gets class `arc-immersive`
    (`position: fixed; inset: 0; height: 100dvh; padding: env(safe-area-inset-*)`), body scroll locked, previous
    scroll position restored on exit; Escape exits.
  - `FullscreenButton(props: { immersive: ReturnType<typeof useImmersive> })` — icon + label hu „Teljes képernyő” /
    en "Full screen" / de „Vollbild” (exit: „Kilépés” / "Exit full screen" / „Vollbild beenden”).
  - `KeyHelp` renders nothing when `useIsTouch()`; new `TouchHelp({ rows }: { rows: [gesture: string, action: string][] })`
    renders only on touch.
  - kit CSS: `.arc-board-touch { touch-action: none; overscroll-behavior: contain; -webkit-user-select: none }`,
    `.arc-board-tap { touch-action: manipulation }`; compact layout below 640 px for `ArcadeShell`
    (header wraps, stats as a compact strip above the board); kit message `iosHomeScreenTip`
    (hu „Böngészősáv nélkül: Megosztás → Főképernyőhöz adás.”, en "No browser bars: Share → Add to Home Screen.",
    de „Ohne Browserleisten: Teilen → Zum Home-Bildschirm.”).

- [ ] **Step 1: Failing tests** — `touch.test.tsx`: swipe left of 40 px → `onSwipe('left')`; 10 px → `onTap` not swipe;
  `ignores gestures that start on interactive elements`; long press 400 ms → callback + following click suppressed;
  short press → no callback; `TouchPad` absent with fine pointer, present with coarse, `repeat` fires ≥ 2 times
  over 400 ms (fake timers). `fullscreen.test.tsx`: without `fullscreenEnabled` toggle sets
  `html[data-arcade-immersive]` and class; `exit restores scroll and chrome` (`window.scrollTo` called with the
  saved Y, attribute removed); Escape exits; with `fullscreenEnabled` mocked, `requestFullscreen` is called on the target;
  `KeyHelp` hidden and `TouchHelp` shown under coarse pointer.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** implement.
- [ ] **Step 4:** `npm run check` in AGC → PASS.
- [ ] **Step 5: Commit** AGC `"2026-11-14 18:31:00"` `"feat(kit): touch helpers, full screen, compact layout"`.

### Task 3: Kit — shared Hungarian deck (moved from Ulti, closer to the real deck), Snapszer id, kit sync

**Files:**
- Move: `Ulti-Game/src/deck/{HungarianCard.tsx,cards.ts,art/*}` → `AGC/packages/kit/src/hungarian/` (git history
  stays in Ulti; the kit gets new files); tests → `AGC/packages/kit/test/hungarian.test.tsx`
- Modify: `AGC/packages/kit/src/index.ts`, `registry.ts`, `i18n.ts`, `arcade.css` (token `--game-snapszer`
  #b0703a / dark #8a5428), `AGC/scripts/sync-games.mjs` (`PENDING` = `snapszer`), `AGC/scripts/repo-docs.mjs`
  (snapszer entry, `logicDir 'src/engine'`)
- Ulti: `src/deck/Gallery.tsx` stays and imports from `../arcade`; all Ulti imports of the deck switch to `./arcade`

**Interfaces:**
- Produces (kit exports): `HungarianCard` (props unchanged: `card, faceDown, dental, size, selected, className, lang, title`),
  `type HSuit = 'piros' | 'tok' | 'zold' | 'makk'`, `type HRank = 'VII' | 'VIII' | 'IX' | 'X' | 'also' | 'felso' | 'kiraly' | 'asz'`
  (keep Ulti's existing names exactly — read `cards.ts` first and keep them), `HCard`, `hCardLabel`, `hCardBackLabel`,
  `HUNGARIAN_DECK`; viewBox `0 0 100 160`; accessible labels unchanged.
- Registry: id `snapszer`, names hu „Snapszer” / en "Snapszer" / de „Schnapsen”, tag `Cards`, tagline en
  "The Hungarian two- and three-player trick game, with the Hungarian deck." / hu „A magyar ütésvivő kártyajáték
  két vagy három játékossal, magyar kártyával.” / de „Das ungarische Stichspiel zu zweit oder zu dritt, mit
  ungarischem Blatt.”

- [ ] **Step 1: Research** (read-only): Hungarian Wikipedia „Magyar kártya” for the Tell figure on each Alsó and Felső
  per suit and the four season aces; tomasdrus/hungarian-playing-cards preview only as a layout reference.
  **Never download, trace or copy an image from that repo** (no licence). Put the figure list in the report.
- [ ] **Step 2: Failing tests** (`hungarian.test.tsx`, Ulti's old deck tests moved and extended): court cards and
  aces have `[data-half="top"]` and a mirrored `[data-half="bottom"]` (`rotate(180 50 80)`); the four Alsó
  `data-figure` values are pairwise different, same for Felső; every Király has `[data-mount="horse"]`; VII–X have
  `[data-vignette]` and four corner numerals; aces keep NYÁR/ŐSZ/TAVASZ/TÉL; labels unchanged (old assertions kept).
  Registry test: `GAMES` has 15 entries and `gameName('snapszer','de') === 'Schnapsen'`.
- [ ] **Step 3:** FAIL. **Step 4: Draw** in the existing style (cream face, outlined suit signs, old look): mirrored
  halves, 8 distinct court figures, mounted kings, full season scenes on aces, small landscape/ornament vignette on
  VII–X, pips in traditional columns. Ulti gallery captions add the figure name.
- [ ] **Step 5:** `npm test -w @arcade/kit` PASS (AGC typecheck is red only for the missing `snapszer` portal module
  until Task 24 — accepted, report the exact error). Commit AGC `"2026-11-14 18:31:30"`
  `"feat(kit): shared Hungarian deck with double-headed Tell figures; snapszer id"`.
- [ ] **Step 6: Sync the kit** `npm run sync:kit` (writes `src/arcade/` into `apps/*` and all fourteen existing game repos; Snapszer is PENDING);
  run `npm run check` in each game repo (all must stay green — the new API is additive); commit each game repo
  `"2026-11-14 18:32:00"` `"chore: update vendored arcade kit"` (`src/arcade`), and AGC `"2026-11-14 18:32:00"`
  `"chore: sync kit into apps"` (`apps/*/src/arcade`).

- [ ] **Step 7: Ulti** — remove the moved deck files, switch imports to `./arcade`, keep the gallery; `npm run check`
  PASS; commit Ulti `"2026-11-14 18:32:30"` `"refactor: use the kit's shared Hungarian deck"`. The controller shows the
  `?gallery=1` screenshot to Zoltán (gate for the Ulti push/deploy only).

### Task 4: Portal — finished scores, collapsible game list, mobile drawer, immersive chrome

**Files:**
- Modify: `AGC/apps/portal/src/hooks/useScoreSubmitter.ts`, `App.tsx`, `i18n.ts`, `main.css`;
  `AGC/packages/ui/src/Shell.tsx`, `packages/ui/src/i18n.ts`, `packages/ui/src/portal.css`
- Test: `AGC/apps/portal/src/PendingScore.test.tsx` (extend), `apps/portal/src/Shell.test.tsx` (extend)

**Interfaces:**
- Consumes: `onGameOver(score, { finished })` (Task 1); `html[data-arcade-immersive]` (Task 2).
- Produces: `submitScore(game, score, nick?, finished?: boolean): Promise<SubmitOutcome>` — 0 allowed only when
  `finished`; `Sidebar` prop `gamesCollapsed: boolean` + `onToggleGames: () => void`; localStorage key
  `arcade.sidebarGamesCollapsed`; `Header` gets a menu button (`aria-label` hu „Menü” / en "Menu" / de „Menü”)
  visible below 900 px that opens the sidebar as a drawer (`aria-modal`, Escape and backdrop close, closes on navigate).

- [ ] **Step 1: Failing tests** — PendingScore: `a finished 0-point run is submitted` (nickname set →
  `submitScore('2048','Zoli',0)`); `a finished 0-point run asks for a nickname once`; `a natural 0-point game over
  is not submitted`. Shell: games toggle hides all games except the active one, `aria-expanded` false, state
  survives remount via localStorage; no active game + collapsed → no game items; drawer opens from the menu button
  at 390 px (`window.innerWidth` + matchMedia mock), closes on Escape and after navigating.
- [ ] **Step 2:** run → FAIL. **Step 3:** implement; CSS: below 900 px sidebar off-canvas, game page full width,
  stats strip compact; `html[data-arcade-immersive] .sidebar, … .header { display: none }`.
- [ ] **Step 4:** `npm run check` → PASS.
- [ ] **Step 5: Commit** AGC `"2026-11-14 18:33:00"` `"feat(portal): rank finished runs, collapsible game list, mobile drawer"`.

### Task 5: Portal — logo package

**Files:**
- Create: `AGC/apps/portal/public/favicon.svg` (copy of `docs/arcade-logo/arcade-mark.svg`), `favicon-32.png`,
  `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `social-card.png` (copy of `social-card-1200.png`),
  `manifest.webmanifest`
- Modify: `AGC/apps/portal/index.html`, `AGC/packages/ui/src/Shell.tsx` (brand), `AGC/README.md`
- Commit also: `AGC/docs/arcade-logo/*` (currently untracked)
- Test: `AGC/apps/portal/src/Shell.test.tsx` (brand image)

**Interfaces:** sidebar brand renders `<img className="sidebar__logo-img" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />`
in place of `<IconLogo />`, text "Zoltan's Arcade" unchanged; manifest: `name` "Zoltan's Arcade", `short_name` "Arcade",
`start_url` "./", `scope` "./", `display` "standalone", `background_color` "#11152D", `theme_color` "#11152D", icons 192/512
(`purpose` "any maskable" only if the mark has safe padding — check; else "any").

- [ ] **Step 1: Failing test** — Shell brand contains an `img` whose `src` ends with `favicon.svg`.
- [ ] **Step 2:** FAIL. **Step 3:** generate PNGs with `sips -z <n> <n> docs/arcade-logo/arcade-mark-1024.png --out …`;
  `index.html`: `<link rel="icon" type="image/svg+xml" href="./favicon.svg">`, `<link rel="icon" type="image/png"
  sizes="32x32" href="./favicon-32.png">`, `<link rel="apple-touch-icon" href="./apple-touch-icon.png">`,
  `<link rel="manifest" href="./manifest.webmanifest">`, `<meta name="theme-color" content="#11152D">`,
  `og:title` "Zoltan's Arcade", `og:description` = portal en tagline, `og:image` and `twitter:image`
  `https://dulzoltan.hu/arcade/social-card.png`, `twitter:card` "summary". README: `<picture>` with
  `docs/arcade-logo/arcade-wordmark-light.svg` for `prefers-color-scheme: dark`, `-dark.svg` default, width 420.
- [ ] **Step 4:** `npm run check` → PASS; `npm run build` output contains all icon files.
- [ ] **Step 5: Commit** AGC `"2026-11-14 18:34:00"` `"feat(portal): new Zoltan's Arcade logo, icons and web manifest"`.

---

## Per-game common steps (Tasks 6–19 and 23)

Each game task is done in the standalone repo only (the controller mirrors into AGC in Task 24). The table in each
task gives the game-specific values. Steps:

- [ ] **Step 1: Failing tests** in the game repo:
  - `src/rules.test.tsx`: Rules button visible (hu „Szabályok”); opening during a running game pauses it (status
    `paused`), closing leaves it paused; headings in order goal, play, rules, scoring, dental; `mobile` appears only
    with coarse pointer and contains the game's touch rows; the scoring section shows every number from the game's
    scoring constants (import the constants and assert their `formatNumber(…,'hu')` text is present);
    "language switch inside rules keeps the run": `applyLang('de')` while open → German heading „Regeln…”, same
    score/board.
  - `src/finish.test.tsx`: Finish hidden before the run starts; after the first move it is visible; confirm text shows
    the Score-panel value; confirm → `onGameOver(<that value>, { finished: true })` once and the game-over card says
    „Idő előtt befejezve”; autosave removed; Cancel changes nothing. The task's "finish score" row says what the value is.
  - `src/touch.test.tsx`: the task's touch scheme, one test per gesture/button listed (pointer events with
    `pointerType: 'touch'`, matchMedia coarse); full-screen button toggles `html[data-arcade-immersive]`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Implement**
  - `src/rules.tsx` exporting `useRulesSections(): RulesSection[]` (body JSX from the game's `MESSAGES`, new keys
    prefixed `rules…`, numbers interpolated from the scoring constants) and the diagram component(s) named in the
    table (inline SVG, follows `useDental()`, `role="img"` with an `aria-label`, no colour-only meaning). The
    `play` section shows keyboard/mouse on fine pointer and touch on coarse pointer; `mobile` lists the touch rows,
    the full-screen button and, on iOS (`/iP(hone|od)/` in `navigator.userAgent`), `iosHomeScreenTip`.
  - Control strip: `RulesButton` (hotkey per table), `FinishButton` (visible = the run has started and is not over;
    pause the run timer while the confirm is open), `FullscreenButton` (target = the game's root element).
  - Finish: sets the game's own state to game over with a `finishedEarly` flag; `useArcadeRun` `outcome` returns
    `'finished'` when the flag is set; game-over card shows kit `finishedEarly`.
  - Touch scheme from the table; board gets `.arc-board-touch` (gestures) or `.arc-board-tap` (tap only);
    `TouchHelp` rows next to the existing `KeyHelp`; layout fits 360 px portrait without horizontal scroll.
  - README in three languages: `README.md` (English, the base), `README.de.md`, `README.hu.md` — a complete,
    natural translation of the whole README (not a summary); each file starts right under the title with the
    language line `**English** · [Deutsch](README.de.md) · [Magyar](README.hu.md)` (the current language bold, the
    others linked, same order in every file); links to the other repos and to the Arcade stay valid in all
    three; the family table lists all fifteen games including Snapszer (`https://github.com/ZoliQua/Snapszer-Game`).
  - Bump `package.json` version as the table says; `CHANGELOG.md` entry (Added: rules, finish early, touch controls,
    full screen); README "How to play" gets a short "On a phone" paragraph.
- [ ] **Step 4:** `npm run check` → PASS (report counts).
- [ ] **Step 5: Commit** at the table's two times: feature commit (all src + tests) with message
  `"feat: rules dialog, finish early, touch controls and full screen"`, then release commit (`package.json`,
  `package-lock.json`, `CHANGELOG.md`, `README.md`, `README.de.md`, `README.hu.md`) `"chore: release v<version>"`.

### Task 6: Tetris (`Tetris-Game`)
- **Touch:** `TouchPad` row ◀ ▶ ⟳ ▼ ⤓ (◀ ▶ ▼ repeat); board gestures: tap = rotate, horizontal drag = move one cell per 24 px, swipe down = soft drop, flick down (< 200 ms, > 80 px) = hard drop
- **Diagram:** `LineClearDiagram`: a full row flashing out, ✓ mark
- **Finish score:** current score
- **Hotkey R:** free → R
- **Version / times:** 1.3.0 · 18:35:00 / 18:35:30

### Task 7: Snake (`Snake-Game`)
- **Touch:** swipe on board + `TouchPad` dpad; turns queued like keys; tap on board when idle = start
- **Diagram:** `GrowDiagram`: head reaching food, body +1
- **Finish score:** current score
- **Hotkey R:** free → R
- **Version / times:** 2.3.0 · 18:36:00 / 18:36:30

### Task 8: 2048 (`2048-Game`)
- **Touch:** existing swipe moved onto kit `useSwipe`; board `.arc-board-touch` (no scroll / pull-to-refresh)
- **Diagram:** `MergeDiagram`: 8 + 8 → 16 with arrow
- **Finish score:** current score
- **Hotkey R:** free → R
- **Version / times:** 1.3.0 · 18:37:00 / 18:37:30

### Task 9: Pac-Man (`Pac-Man-Game`)
- **Touch:** swipe on board + `TouchPad` dpad, turn queued until possible
- **Diagram:** `PowerDiagram`: power pellet → frightened ghost (shape change + label)
- **Finish score:** current score
- **Hotkey R:** free → R
- **Version / times:** 1.3.0 · 18:38:00 / 18:38:30

### Task 10: Gomoku (`Gomoku-Game`)
- **Touch:** tap; cells ≥ 24 px at 360 px; last move ring marker
- **Diagram:** `FiveDiagram`: five in a row with ✓
- **Finish score:** current round score (0 mid-round)
- **Hotkey R:** free → R
- **Version / times:** 2.3.0 · 18:39:00 / 18:39:30

### Task 11: Tic-Tac-Toe (`Tic-Tac-Toe-Game`)
- **Touch:** tap (already); `.arc-board-tap`
- **Diagram:** `ThreeDiagram`: three in a row with ✓
- **Finish score:** current round score
- **Hotkey R:** free → R
- **Version / times:** 2.3.0 · 18:40:00 / 18:40:30

### Task 12: Breakout (`Breakout-Game`)
- **Touch:** drag anywhere below the bricks moves the paddle (absolute follow); tap = launch
- **Diagram:** `BounceDiagram`: angle depends on where the ball hits the paddle
- **Finish score:** current score
- **Hotkey R:** free → R
- **Version / times:** 1.2.0 · 18:41:00 / 18:41:30

### Task 13: Space Invaders (`Space-Invaders-Game`)
- **Touch:** drag to move; `TouchPad` row with Fire (hold = auto-fire at the normal fire rate)
- **Diagram:** `WaveDiagram`: points per invader row (shape + number)
- **Finish score:** current score
- **Hotkey R:** free → R
- **Version / times:** 1.2.0 · 18:42:00 / 18:42:30

### Task 14: Connect Four (`Connect-Four-Game`)
- **Touch:** tap anywhere in a column drops there
- **Diagram:** `FourDiagram`: four in a line, diagonal, ✓
- **Finish score:** current round score
- **Hotkey R:** free → R
- **Version / times:** 1.2.0 · 18:43:00 / 18:43:30

### Task 15: Nut Sort (`Nut-Sort-Game`)
- **Touch:** tap source bolt, tap target bolt; hit areas ≥ 44 px wide
- **Diagram:** `MoveDiagram`: legal move ✓ (same type on top / empty bolt), illegal ✗
- **Finish score:** displayed score (levels solved so far)
- **Hotkey R:** **taken (restart)** → button only
- **Version / times:** 1.2.0 · 18:44:00 / 18:44:30

### Task 16: Texas Hold'em (`Texas-Holdem-Game`)
- **Touch:** action buttons in a bottom bar (thumb reach); raise slider ≥ 44 px
- **Diagram:** `HandLadderDiagram`: hand rankings high → low with card shapes
- **Finish score:** existing tournament formula with the player's current place among the remaining seats
- **Hotkey R:** **taken** → button only
- **Version / times:** 1.2.0 · 18:45:00 / 18:45:30

### Task 17: Minesweeper (`Minesweeper-Game`)
- **Touch:** tap = open; `useLongPress` 400 ms = flag; visible „Zászló” mode toggle (hu „Zászló”, en "Flag", de „Fahne”); wide boards pan inside their frame (`overflow: auto`), not the page
- **Diagram:** `NumberDiagram`: a "2" with its two neighbouring mines marked
- **Finish score:** classic 0; time attack points so far
- **Hotkey R:** free → R
- **Version / times:** 1.1.0 · 18:46:00 / 18:46:30

### Task 18: Solitaire (`Solitaire-Game`)
- **Touch:** tap card = select, tap destination = move; double-tap = to foundation; columns fit 360 px (tighter overlap below 430 px)
- **Diagram:** `RunDiagram`: alternating red ♥♦ / black ♠♣ run with suit symbols (reuse rule text)
- **Finish score:** 0 (only wins score)
- **Hotkey R:** free → R
- **Version / times:** 1.1.0 · 18:47:00 / 18:47:30

### Task 19: Ulti — rules, finish, touch (`Ulti-Game`)
- **Touch:** action buttons in a bottom bar; 12-card hand as an overlapping fan that keeps every card's corner (rank + suit) visible at 360 px; tap = select, tap again = play
- **Diagram:** `RankDiagram`: card order in trump and no-trump games + the bid value table (reuse the bid list)
- **Finish score:** session score over the deals played
- **Hotkey R:** free → R
- **Version / times:** 1.1.0 · 18:48:00 / 18:48:30 (the new deck already arrived through the kit in Task 3; the Ulti push/deploy waits for Zoltán's approval of the `?gallery=1` deck)

### Task 20: Snapszer — scaffold and two-player engine (`Snapszer-Game`, new repo)

**Files:** scaffold per the previous new-game pattern (copy config from `Connect-Four-Game`; kit: copy
`AGC/packages/kit/src` → `src/arcade/` plus the vendored `src/arcade/README.md` as the other games have it
(`snapszer` is in `PENDING`, so `sync-games` skips it until Task 24); community files via
`node ../Arcade-Game-Center/scripts/repo-docs.mjs snapszer`; `CLAUDE.md` with the commit rules); engine in
`src/engine/{deck.ts,deal.ts,play.ts,scoring.ts,types.ts}`; tests next to them.

**Interfaces (produces):**
- `type SnapszerMode = 'two' | 'three'`; `type Options = { mode: SnapszerMode; withNines: boolean }`.
- `createDeck(opts: Options): HCard[]` — two-player 20 cards (A, X, K, F, Alsó × 4), 24 with `withNines`;
  three-player always 24. `cardPoints(card): number` — A 11, X 10, K 4, F 3, Alsó 2, IX 0.
- `deal2(seed: number, opts): Deal2State` (3 + turn-up trump + 2, talon on the trump), `legalPlays(state, seat): HCard[]`,
  `applyAction(state, action): Deal2State` with `action` one of `{ type: 'play', card }`, `{ type: 'exchange' }`,
  `{ type: 'close' }`, `{ type: 'marriage', suit }`, `{ type: 'declare' }` (Elég/Kész), `{ type: 'snapszer' }`,
  `{ type: 'kontra' }`; `canExchange/canClose(state, seat): boolean` (own turn, ≥ 3 talon cards above the trump,
  not closed); `dealResult(state): { winner: Seat; units: number; reason: 'declared' | 'lastTrick' | 'closeFailed' | 'snapszer' | 'snapszerFailed' }`.
- Rules exactly as spec §7 (marriage counts only after a won trick; one marriage per turn and K or F must follow;
  open talon: free play; closed/empty: follow, beat, else trump, else any; units 1 / 2 under 33 / 3 no trick;
  snapszer 6; kontra ×2). Where Hungarian Wikipedia is silent, decide and list the rulings in the report.

- [ ] **Step 1: Failing tests** for every bullet above: deck sizes 20/24, points table, sum of points = 120
  (+0 for nines), exchange allowed/forbidden cases, closing then must-follow-and-beat, marriage 20 vs 40 not
  counted before the first won trick, declare at ≥ 66, wrong declare (< 66) → opponent wins the deal with 2 units
  (record as ruling if the wiki says otherwise), last-trick winner when nobody declares, units 1/2/3, snapszer
  success 6 / failure 6 to the opponent, kontra doubling, close failed.
- [ ] **Step 2:** FAIL. **Step 3:** implement (pure, seeded, no React). **Step 4:** `npm run check` PASS.
- [ ] **Step 5: Commits** `"2026-11-14 18:50:00"` `"chore: scaffold Snapszer"` (scaffold, kit, community files);
  `"2026-11-14 18:50:30"` `"feat(engine): two-player snapszer rules"`.

### Task 21: Snapszer — three-player mode

**Files:** `src/engine/three.ts` + test.

**Interfaces:** `deal3(seed, opts, dealer: Seat): Deal3State` (24 cards, 4 + 4 each, caller = seat after the dealer),
`chooseTrump(state, card)` from the caller's first four, `fold(state)` (before the first lead; opponents get 2 units, 4 if
the caller holds an ace), `applyAction3`, `legalPlays3` (must follow and beat; else trump; else any), only the caller
may announce snapszer, `dealResult3(state): { units: Record<Seat, number>; reason }`; caller rotates each deal.

- [ ] **Step 1: Failing tests:** 8 cards each, trump from the first four, fold 2 / 4, follow-and-beat, caller-only
  snapszer, caller needs 66 against the pair's pooled points, units go to each defender. **Steps 2–4** as usual.
- [ ] **Step 5: Commit** `"2026-11-14 18:51:00"` `"feat(engine): three-player snapszer"`.

### Task 22: Snapszer — bots, match and score, saves

**Files:** `src/bots/{easy,medium,hard}.ts`, `src/game/{match.ts,score.ts,save.ts}` + tests.

**Interfaces:** `chooseAction(state, seat, level: 'easy' | 'medium' | 'hard', rng): Action` (hard samples unseen cards within
150 ms per decision, like Ulti's hard bot; bots declare Elég/Kész as soon as they can, exchange when allowed and
useful); `Match = { mode; units: Record<Seat, number>; deals: DealSummary[]; level }` to 7 units („rádli”);
`matchScore(match, won: boolean): number` = `round((max(0, you − bestOpponent) × 100 + (won ? 500 : 0)) × {1, 1.5, 2})`,
clamped 0…5000 (`MAX_SCORE = 5000`); save schema 1 with a guard.

- [ ] **Step 1: Failing tests:** score formula examples (7–3 medium won → 1350; finished early 2–4 hard → 0;
  clamp at 5000), match ends at ≥ 7 units, bots only play legal actions over 200 seeded deals, strength gates
  (hard beats easy ≥ 75 % and medium beats easy ≥ 60 % over 200 duplicate-seeded two-player matches), hard
  decision < 150 ms, save round-trip and rejection of a corrupt save. **Steps 2–4** as usual.
- [ ] **Step 5: Commit** `"2026-11-14 18:52:00"` `"feat: snapszer bots, match scoring and saves"`.

### Task 23: Snapszer — UI, rules, finish, touch, docs, v1.0.0

Follow **Per-game common steps** plus:
- Table for two (you bottom, opponent top) and three (two opponents top-left/top-right); kit `HungarianCard`;
  turned-up trump under the talon; talon count; won-trick piles; announced marriages shown as small K+F pairs with
  20/40 labels; your points so far shown, opponent's hidden (as in the real game, points are counted mentally —
  setting „Pontok mutatása” off by default shows your own only).
- Bottom action bar: „Elég!” (enabled at ≥ 66), Csere (exchange), Betakarás (close), 20/40, Snapszer, Kontra; illegal
  cards hatched (shape cue, not colour); mode switch two/three and the nines setting in settings with an in-page
  confirm (abandons the match, unranked); difficulty easy/medium/hard; opponents with names and portraits; dental
  mode changes only the card back and the portraits.
- Rules sections with `CardValueDiagram` (A 11 … Alsó 2, nine 0) and `DealPointsDiagram` (1 / 2 / 3 units); finish
  score = `matchScore(match, false)`; touch: tap select, tap again play; demo for the portal card (bots playing).
- en/hu/de; README in three languages (as the common steps), CHANGELOG, version 1.0.0.
- **Commits** `"2026-11-14 18:53:00"` `"feat: snapszer table, rules, touch and dental mode"`;
  `"2026-11-14 18:53:30"` `"chore: release v1.0.0"`.

### Task 24: Integration, versions, mobile smoke run

**Files:** AGC `apps/*` (via `npm run sync:pull -- <id>` for all 15, `apps/snapszer` new; manifests via
`scripts/write-app-manifests.mjs`), `apps/portal/src/games.ts` + `packages/ui/src/Icons.tsx` (`IconSnapszer`), portal
i18n tagline „Tizenöt klasszikus egy helyen.” / "Fifteen classics, one home." / „Fünfzehn Klassiker unter einem Dach.”,
`scripts/sync-games.mjs` (`PENDING` empty), `arcade-api/_config.example.php` (`'snapszer' => 5000`), `README.md` +
`README.de.md` + `README.hu.md` (three languages, language line, fifteen games), `package.json` (+ `playwright-core` 1.58.2
devDependency), `scripts/mobile-smoke.mjs`, `packages/ui/src/i18n.ts` (`APP_VERSION` '3.2'), root `package.json`
version 3.2.0, `CHANGELOG.md`, `README.md`, `docs/DEPLOY.md`.

- [ ] **Step 1:** `npm run sync:pull -- <id>` for each game (Snapszer included); `npm run sync:check` → OK; `npm run check` → PASS.
- [ ] **Step 2:** `scripts/mobile-smoke.mjs`: builds nothing, serves `apps/portal/dist` on 127.0.0.1, launches Chromium
  from env `CHROMIUM_PATH` with iPhone 13 emulation (390 × 844, `isMobile`, `hasTouch`, DPR 3); per game: open
  `#/play/<id>`, assert `document.documentElement.scrollWidth <= 390`, start the run with a tap, perform the task's
  first touch action, open Rules (assert section „Mobilon” present), toggle full screen (assert
  `html[data-arcade-immersive]`), exit; prints one line per game and exits non-zero on any failure. Not in CI.
- [ ] **Step 3:** `npm run build && CHROMIUM_PATH=… node scripts/mobile-smoke.mjs` → 15 × OK (paste output).
- [ ] **Step 4: Commits** AGC `"2026-11-14 18:55:00"` `"feat: v3.2.0 — rules, finish early, touch and full screen in every game"`
  (apps, ui, package files, script); `"2026-11-14 18:58:00"` `"docs: changelog, readme and deploy notes for v3.2.0"`.
- After the task (controller): create `ZoliQua/Snapszer-Game` on GitHub (public, description, topics), final review, push all 15 repos, CI, Zoltán's iPhone check, then deploy to
  `dulzoltan.hu/arcade` (portal files + new icons), add `'snapszer' => 5000` to the live `_config.php` (ask Zoltán
  first), dulzoltan.hu Arcade card + thumbnail for Snapszer and „tizenöt” wording (site repo, normal date).
