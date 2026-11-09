# Changelog

All notable changes to Arcade-Game-Center. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [SemVer](https://semver.org/).

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
