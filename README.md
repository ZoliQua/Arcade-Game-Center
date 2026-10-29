# 🕹️ Zoltan's Arcade — Arcade-Game-Center

One portal for nine classic browser games — **Tetris, Snake, 2048, Pac-Man, Gomoku, Tic-Tac-Toe, Breakout, Space Invaders
and Connect Four** — with one design
system, one scoring model, autosave & resume, live attract-mode demos on the home page and a global leaderboard.
Every game is also its **own repository** that builds and runs standalone.

[![CI](https://github.com/ZoliQua/Arcade-Game-Center/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Arcade-Game-Center/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

Live: **https://drdul.hu/arcade/**

---

## 📑 Table of contents

- [The games](#-the-games)
- [Features](#-features)
- [Quick start](#-quick-start)
- [Repository layout](#%EF%B8%8F-repository-layout)
- [The shared kit](#-the-shared-kit-arcadekit)
- [Scoring, stats & saves](#-scoring-stats--saves)
- [Keeping the standalone repos in sync](#-keeping-the-standalone-repos-in-sync)
- [Leaderboard API](#-leaderboard-api)
- [Scripts](#-scripts)
- [Deploy](#-deploy)
- [Contributing](#-contributing)
- [License](#%EF%B8%8F-license)

## 🎮 The games

| Game | Standalone repo | Genre | In the portal |
| --- | --- | --- | --- |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade — SRS rotation, 7-bag, hold, ghost, lock delay | `apps/tetris` |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex — speed 1–10, wall wrap | `apps/snake` |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle — swipe, undo, animations | `apps/2048` |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Maze — four ghost AIs, power pellets, levels | `apps/pacman` |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategy — 15×15, α-β minimax AI | `apps/gomoku` |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duel — tooth or X/O marks, unbeatable AI | `apps/tictactoe` |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Paddle — swept-collision ball, power-ups, multiball, level loop | `apps/breakout` |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter — marching waves, eroding bunkers, mystery UFO | `apps/invaders` |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duel — 7×6, bitboard negamax AI | `apps/connect4` |

## ✨ Features

- 🏠 **Landing page with working miniatures** — every card runs the real game engine with an autopilot / AI (attract mode); demos pause off-screen and honour *reduced motion*
- 💾 **Autosave & resume** — leave any game mid-run, reload, switch games: the run is restored paused (*Welcome back*); a *Continue where you left off* strip lists saved runs
- 🏆 **One scoring model** — every finished run is recorded once with the same rules (best, plays, wins, total score, play time); duel games share one round-score formula
- 🧭 **Hash routing** — `#/play/snake`, `#/leaderboard`, `#/settings`: reloads, bookmarks and the back button just work
- 🌗 **One design system** — tokens and `arc-*` components shared by the portal and every game, dark & light theme (**T**), synced across tabs
- 📊 **Live header** — status, score and run time come straight from the mounted game
- 🌍 **Global leaderboard** — small PHP + MySQL API with rate limiting and sanity caps
- ⌨️ **Keyboard-first, same keys everywhere** — **P/Esc** pause, **R** restart, **T** theme, **?** help
- 🧪 **Tested** — kit, games and portal under one Vitest run; CI on Node 20 & 22

## 🚀 Quick start

```bash
git clone https://github.com/ZoliQua/Arcade-Game-Center.git
cd Arcade-Game-Center
npm install
npm run dev                       # portal on http://localhost:5173
npm run dev:game @arcade/gomoku   # any game on its own, straight from apps/
```

## 🗂️ Repository layout

```
apps/
  portal/        @arcade/portal    the user-facing Vite app (landing, play, leaderboard, settings)
  tetris/ snake/ 2048/ pacman/ gomoku/ tictactoe/ breakout/ invaders/ connect4/
                 @arcade/<id>      mirror of each standalone repo: src/, index.html, public/, vite.config.ts
packages/
  kit/           @arcade/kit       shared runtime: stats, sessions, theme, hooks, StatPanel, GameOverlay, ArcadeShell, arcade.css
  ui/            @arcade/ui        portal-only shell: Sidebar, Header, icons, portal/landing CSS
arcade-api/                        PHP leaderboard API (score.php, leaderboard.php)
scripts/
  sync-games.mjs                   kit → games, game repo ⇄ apps/<id>, drift check
  write-app-manifests.mjs          generates apps/<id>/package.json + tsconfig.json
  repo-docs.mjs                    writes the shared community files into every repo
docs/                              DEPLOY.md, ADDING-A-GAME.md, history/
```

Each game exports the same contract: `<XxxGame embedded onGameOver onRunEnd onStatusChange />` and `<XxxDemo active />`
(`ArcadeGameProps` / `ArcadeDemoProps` in [`packages/kit/src/types.ts`](./packages/kit/src/types.ts)).

## 🧰 The shared kit (`@arcade/kit`)

[`packages/kit/src`](./packages/kit/src) is the single source of truth for everything the games have in common. Because
each game must also build on its own, the kit is **vendored** into every game as `src/arcade/` — byte-for-byte, never
edited there. Inside the portal a small Vite plugin points all copies back at `packages/kit`, so the bundle contains it once.

| Module | What it does |
| --- | --- |
| `stats.ts` | `recordRun`, `readStats`, `summarize`, `resetStats` — the one scoring model, migrates legacy `<id>.highScore` keys |
| `session.ts` | `saveSession`, `loadSession` (schema-versioned, validated, 30-day expiry), `peekSession`, `clearSession` |
| `hooks.ts` | `useArcadeRun`, `useSessionAutosave`, `useRestoredSession`, `useRunTimer`, `useGameStats`, `useArcadeTheme`, `useInView` |
| `scoring.ts` | `duelRoundScore` for Gomoku, Tic-Tac-Toe & Connect Four |
| `components/` | `StatPanel`, `GameOverlay`, `SaveBadge`, `KeyHelp`, `StatusPill`, `ArcadeShell` (standalone page chrome) |
| `arcade.css` | design tokens (dark/light), `arc-*` components, standalone page layout |
| `registry.ts` | names, repos, tags, accent colours of all games |

## 📊 Scoring, stats & saves

- A run ends when the game reaches `gameOver` (a round, for duel games). `useArcadeRun` records it **exactly once** per run.
- `localStorage` keys: `arcade.stats.<id>` (stats), `arcade.session.<id>` (autosave), `arcade.theme`, `arcade.nickname`,
  `arcade.sidebarCollapsed`. The standalone games and the portal use the same keys, so on the same origin they share data.
- Ranked runs update **Best** and **Total score** and are submitted to the leaderboard if a nickname is set.
  Local two-player rounds are unranked (they count plays and time only).
- **Duel round score** = `base × (1 + empty-board share)` for a win, `base / 4` for a draw, 0 for a loss;
  base = 100 / 250 / 500 for easy / medium / hard.

## 🔄 Keeping the standalone repos in sync

The standalone repos are expected as siblings of this repo (`../Snake-Game`, …) or under `$ARCADE_GAMES_ROOT`.

```bash
npm run sync:kit              # packages/kit/src → src/arcade/ in every game (here and in the standalone repos)
npm run sync:pull -- snake    # standalone repo → apps/snake/
npm run sync:push -- snake    # apps/snake/ → standalone repo (then review & commit there)
npm run sync:check            # fails if the kit or any game drifted
```

Synced per game: `src/`, `index.html`, `public/`, `vite.config.ts`. Never synced: `package.json`, `tsconfig*.json`
(generated here by `scripts/write-app-manifests.mjs`) and docs.

## 🌍 Leaderboard API

`arcade-api/` — PHP 8 + PDO + MySQL, deployed next to the portal.

- `POST score.php` `{ game, name, score }` with `X-API-Key` → `{ ok, id, rank }`
- `GET leaderboard.php[?game=<id>&limit=N]` → top N per game, one row per player (best score)
- Anti-spam: shared key, per-IP rate limit, per-game `max_score` caps, nickname sanitising; forwarded-for headers are only
  trusted when `trust_proxy` is enabled. The table is created automatically on first request.

Configuration: copy `arcade-api/_config.example.php` → `_config.php` and `apps/portal/.env.example` → `.env`. See [docs/DEPLOY.md](./docs/DEPLOY.md).

## 🧪 Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Portal dev server |
| `npm run dev:game @arcade/<id>` | One game standalone, from `apps/<id>` |
| `npm run build` | Type-check and build the portal into `apps/portal/dist` |
| `npm run preview` | Serve the built portal |
| `npm run lint` | ESLint over the whole repo |
| `npm run typecheck` | `tsc` in every workspace |
| `npm test` | Vitest: kit, games and portal |
| `npm run check` | lint → typecheck → test → sync:check → build (what CI runs) |

## 🚢 Deploy

One static build (`apps/portal/dist`, relative asset paths) plus the PHP API. Step-by-step: [docs/DEPLOY.md](./docs/DEPLOY.md).
Adding a tenth game: [docs/ADDING-A-GAME.md](./docs/ADDING-A-GAME.md).

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md), the [Code of Conduct](./CODE_OF_CONDUCT.md) and [SECURITY.md](./SECURITY.md).
Contributors: [CONTRIBUTORS.md](./CONTRIBUTORS.md) · Changes: [CHANGELOG.md](./CHANGELOG.md).

## ⚖️ License

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Made with ❤️ by Zoltán Dul</p>
