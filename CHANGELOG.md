# Changelog

All notable changes to Arcade-Game-Center. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [SemVer](https://semver.org/).

## [2.0.0] — 2026-10-24

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
