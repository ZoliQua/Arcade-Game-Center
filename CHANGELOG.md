# Changelog

All notable changes to Arcade-Game-Center. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [SemVer](https://semver.org/).

## [3.2.0] — 2026-11-14

### Added
- **Snapszer** („Snapszer”, "Snapszer", „Schnapsen”) joins the arcade (fifteen games), from its own standalone repo
  [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) (v1.0.0) mirrored into `apps/snapszer`: the Hungarian race to 66
  for two players against Gazsi or three players against Gazsi and Rozi, on the shared Hungarian (Tell) deck, with the
  turned-up trump, exchange and closing, 20 / 40, „Elég!”, snapszer and kontra, and a seven-unit match („rádli”).
  It replaces the temporary "coming soon" placeholder.
- **Rules in every game**: a „Szabályok” / "Rules" / „Regeln” button opens an in-page dialog with the goal, how to play,
  the rules, the scoring (numbers computed from each game's own constants), dental mode and, on touch screens, „Mobilon” /
  "On mobile" / „Auf dem Handy”.
- **Finish early in every game**: „Befejezés” / "Finish" / „Beenden” with an in-page confirmation ranks the score reached so
  far, even 0 (the portal now submits finished 0-point runs). Ulti and Snapszer allow it between deals only; Hold'em and Ulti need a
  minimum number of completed hands / deals for a non-zero score.
- **Touch and full screen in every game**: swipes, taps, long presses and on-screen pads from the kit (`useSwipe`,
  `useLongPress`, `TouchPad`, `TouchHelp`), no page scroll while a finger is on a board, thumb-sized targets, and a
  full-screen button (`useImmersive`): the element Fullscreen API where it exists, a safe-area-aware CSS immersive mode on
  iPhone, during which the portal hides its sidebar and header.
- **Shared Hungarian deck** in the kit (moved from Ulti, closer to the real Tell deck, double-headed figures), used by Ulti and Snapszer.
- **Portal**: collapsible game list in the sidebar, a mobile drawer (menu button below 900 px), the new Zoltan's Arcade logo,
  favicons, home-screen icons and a web app manifest.
- `scripts/mobile-smoke.mjs`: a headless iPhone 13 smoke run (390 × 844, touch, DPR 3, no element Fullscreen API) of every
  game in the built portal — start, first touch action, Rules („Mobilon”), full screen on and off, no horizontal page scroll;
  one line per game, not part of CI. `playwright-core` 1.58.2 is a dev dependency for it.
- `arcade-api`: `max_score` cap for `snapszer` (5,000: unit lead × 100 plus 500 for the win, times the difficulty factor, capped).
- `README.de.md` and `README.hu.md`: the README in German and Hungarian, with a language line under the title.

### Changed
- Landing headline „Tizenöt klasszikus egy helyen.” / "Fifteen classics, one home." / „Fünfzehn Klassiker unter einem Dach.”;
  package and page descriptions list all fifteen games. Portal version 3.2.
- All fourteen existing games mirrored at their new releases: Tetris 1.3.0, Snake 2.3.0, 2048 1.3.0, Pac-Man 1.3.0,
  Gomoku 2.3.0, Tic-Tac-Toe 2.3.0, Breakout 1.2.0, Space Invaders 1.2.0, Connect Four 1.2.0, Nut Sort 1.2.0,
  Texas Hold'em 1.2.0, Minesweeper 1.1.0, Solitaire 1.1.0, Ulti 1.1.0.
- `scripts/sync-games.mjs`: no game is pending any more; every registered game needs its sibling repo.
- Monorepo test setup: the `PointerEvent` polyfill carries `pointerType` (as the game repos' own polyfills do, so touch
  taps are not read as mouse clicks), `window.scrollTo` is stubbed for jsdom, and each `apps/<id>` test file runs with
  that app folder as the working directory, like `npm test` in the standalone repo.

### Removed
- The temporary Snapszer placeholder (`SnapszerPlaceholder.tsx`, its "coming soon" strings and styles).

## [3.1.0] — 2026-11-14

### Added
- **Minesweeper**, **Solitaire** and **Ulti** join the arcade (fourteen games), each from its own standalone repo
  ([Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game), [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game),
  [Ulti-Game](https://github.com/ZoliQua/Ulti-Game)) mirrored into `apps/minesweeper`, `apps/solitaire` and `apps/ulti`:
  - Minesweeper („Aknakereső”): classic, hexagonal and time-attack boards, a safe first click, numbers drawn as digits (colour only a bonus).
  - Solitaire („Pasziánsz”, „Solitär”): Klondike (draw 1 / 3), Spider (1 / 2 / 4 suits) and FreeCell with hints, undo,
    safe auto-moves and auto-complete.
  - Ulti: the Hungarian three-player card game against two bots, with bidding, the talon, the classic contracts, Kontra
    and Hungarian scoring, on our own vector redraw of the 1835 Schneider Tell deck.
- Kit registry entries, `--game-*` accent tokens and a shared playing-card component; sidebar / card icons.
- `arcade-api`: `max_score` caps for `minesweeper` (12,000: classic tops out at 6,000, time attack is capped at 12,000), `solitaire` (4,000) and `ulti` (30,000).

### Changed
- Landing headline „Fourteen classics, one home.” (hu / de alike); package and page descriptions list all fourteen games.
- The monorepo test setup polyfills `PointerEvent` for jsdom, as the Solitaire repo does, so drag tests run here too.
- `scripts/sync-games.mjs`: the three new ids are no longer pending; every registered game needs its sibling repo.

## [3.0.0] — 2026-11-09

### Added
- **Dental mode** in the portal and all eleven games: a shared `arcade.dental` preference („Fogas mód” / "Dental mode" /
  „Zahnmodus”), off by default, switched in the portal settings or any game's settings, or by `?dental=1|0`. Presentation
  only; shapes differ, never colour alone.
- **Languages**: English, Hungarian and German in the portal and all eleven games (shared `arcade.lang`, top-bar switch),
  `<html lang>` and document titles follow the language, numbers use the locale's grouping.
- **URL hand-off**: `?lang=en|hu|de&dental=1|0` (also inside the hash route) sets and saves the language and dental
  mode, so links from dulzoltan.hu arrive in the visitor's language.
- **Google Tag Manager** (container `GTM-MTSQ5JGF`, shared with dulzoltan.hu) and `arcade_page_view` virtual page views
  on every route change.

### Changed
- **Domain move**: the arcade lives at `https://dulzoltan.hu/arcade/`; every README, package description and doc link
  in all repositories was updated. See `docs/DEPLOY.md`, "Moving to dulzoltan.hu (v3)". Browser data is not migrated; the
  server-side leaderboard is kept.
- All eleven games translated and released as minor versions with the new kit.

## [2.3.0] — 2026-11-04

### Added
- **Texas Hold'em** joins the arcade (eleven games), from its own standalone repo
  ([Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game)) mirrored into `apps/holdem`: no-limit sit & go
  heads-up or 6-max, 20/30/45/60-minute blind structures calibrated by simulation, three difficulty pools of five
  characters each with their own style, figure and readable tells, scoring by table difficulty × finishing place,
  neon / classic / luxe tables, a four-colour or grey deck, a hand log, a bots-only demo table, autosave & resume.
- Kit registry entry and `--game-holdem` accent token (dark & light); sidebar / card icon.
- `arcade-api`: `max_score` cap for `holdem` (5,000).
- `scripts/repo-docs.mjs`: per-repo `logicDir` for the CONTRIBUTING guide (Hold'em keeps its rules in `src/engine/`).

## [2.2.0] — 2026-11-01

### Added
- **Nut Sort** joins the arcade (ten games), from its own standalone repo
  ([Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game)) mirrored into `apps/nutsort`: 20 fixed levels with a
  proven minimum number of moves, scoring by moves against par, undo and restart that cost points, neon and glass looks,
  colour-blind shape coding (every nut type has its own width and notch count), a live demo replaying optimal solutions,
  autosave & resume and the shared stats.
- Kit registry entry and `--game-nutsort` accent token (dark & light); sidebar / card icon.
- `arcade-api`: `max_score` cap for `nutsort` (10,800).
- Design specs and implementation plans under `docs/superpowers/` (Nut Sort, and the upcoming Texas Hold'em).

## [2.1.1] — 2026-10-29

### Fixed
- Leaderboard showed "No scores yet — be the first." when the API failed; `fetchLeaderboard` /
  `fetchAllLeaderboards` now throw on HTTP or payload errors and the page shows "Could not reach leaderboard
  server" / "Unavailable." instead.

### Added
- `apps/portal/public/.htaccess`: `index.html` is always revalidated so a new deploy shows up immediately; hashed
  `assets/` are cached for a year (immutable).

## [2.1.0] — 2026-10-29

### Added
- **Breakout**, **Space Invaders** and **Connect Four** join the arcade (nine games), each from its own standalone repo
  ([Breakout-Game](https://github.com/ZoliQua/Breakout-Game), [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game),
  [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game)) mirrored into `apps/breakout`, `apps/invaders`,
  `apps/connect4` — with live landing-page demos, autosave & resume and the shared stats.
- Kit registry entries and `--game-breakout` / `--game-invaders` / `--game-connect4` accent tokens (dark & light);
  Connect Four scores rounds with `duelRoundScore`.
- Sidebar / card icons for the three games.
- `arcade-api`: `max_score` caps for `breakout`, `invaders` (999,999) and `connect4` (1,000).

### Changed
- Landing hero, settings copy and page description no longer hard-code the number of games.
- `scripts/sync-games.mjs` and `scripts/repo-docs.mjs` know the new repos; all game repos list the nine games.

## [2.0.0] — 2026-10-26

### Added
- **Gomoku** and **Tic-Tac-Toe** join the arcade (six games).
- `@arcade/kit`: one shared runtime for all games — unified stats & scoring (`useArcadeRun`), autosave & resume
  (`useSessionAutosave` / `useRestoredSession`), theme, run timer, `StatPanel`, `GameOverlay`, `SaveBadge`, `KeyHelp`,
  `ArcadeShell` for standalone pages and the design tokens (`arcade.css`). Vendored into each game as `src/arcade/`.
- Landing page: live attract-mode demos running each real engine; *Continue where you left off*; real totals
  (plays, total score, play time) instead of placeholder numbers; saved-run markers on cards and in the sidebar.
- Hash routing (`#/play/<id>`, `#/leaderboard`, `#/settings`), persisted sidebar state, keyboard-shortcuts dialog (`?`).
- Header status chip driven by the mounted game (status · score · run time).
- Settings: delete all saves, reset all stats (two-step confirm), shared theme.
- `scripts/sync-games.mjs` (kit vendoring, pull/push/check), `scripts/write-app-manifests.mjs`, `scripts/repo-docs.mjs`.
- Every game can run standalone from the monorepo: `npm run dev:game @arcade/<id>`.
- Vitest test suite for kit, games and portal; ESLint; `npm run check`; GitHub Actions CI.
- README, docs (deploy, adding a game), Code of Conduct, Contributing, Contributors, Security, issue/PR templates.

### Changed
- Games are mirrored 1:1 from their standalone repos (`src/`, `index.html`, `public/`, `vite.config.ts`) instead of
  hand-adapted copies; the portal's vite plugin deduplicates the vendored kit.
- Portal UI uses the shared `arc-*` components; old duplicate `.btn`/`.panel` styles and mock mini-boards removed.
- `@arcade/ui` reads game metadata from the kit registry; tokens moved to `@arcade/kit/arcade.css`.

### Fixed
- Header status chip and the `P` key were not connected to the game (showed a fake state).
- Best scores on the sidebar/landing and the "Games played / Total score" hero were hard-coded.
- Settings → Reset did not reset Pac-Man; nickname/theme inputs and hotkeys interfered (games reacted while typing).
- Score submission dropped a run that ended with the same score as the previous one, and aborted the previous request
  when two rounds ended quickly.
- API (verified against MySQL 9.3 with `arcade-api/tests/smoke.sh`):
  - the all-games leaderboard always failed with a TypeError — PHP turns the `'2048'` key into an int under
    `strict_types`, so the portal's Leaderboard page could never load;
  - `rank` is a reserved word in MySQL ≥ 8.0.2, so every score submission ended in a SQL error (after the insert);
  - the returned `id` was always 0; rank now counts players (as the leaderboard does), not rows;
  - leaderboard timestamps show when the best score was set, not the player's latest submission;
  - `X-Forwarded-For` is no longer trusted by default (anyone could bypass the rate limit);
  - uncaught errors returned PHP stack traces; they are now logged and answered with `{"error":"server_error"}`;
  - Pac-Man cap raised from 10,000 (real multi-level scores were rejected).

### Removed
- `scripts/sync-to-upstream.sh` (replaced by `sync-games.mjs`); old migration notes moved to `docs/history/`.

## [1.1.0] — 2026-05-31
- Pac-Man integrated as the fourth game.

## [1.0.0] — 2026-04-27
- Monorepo with Tetris, Snake and 2048; portal shell; server-side leaderboard (PHP + MySQL).
