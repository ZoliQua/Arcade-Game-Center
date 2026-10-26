# Adding a game

A new game starts life as its **own repository** (Vite + React 18 + TypeScript) and is then mirrored into `apps/<id>/`.
Use [Snake-Game](https://github.com/ZoliQua/Snake-Game) as the template — it is the reference implementation of the contract.

## 1. Kit & registry

1. `packages/kit/src/types.ts` — add the id to `ArcadeGameId`.
2. `packages/kit/src/registry.ts` — add name, repo, tag, tagline and `colorVar`.
3. `packages/kit/src/arcade.css` — add `--game-<id>` for dark and (if needed) light theme.
4. `npm run sync:kit` — vendors the kit into every game, including the new one.

## 2. The game repo

- `src/arcade/` — vendored kit (never edit).
- `src/<Name>Game.tsx` — accepts `ArcadeGameProps`; uses `useArcadeRun` (scoring), `useRestoredSession` +
  `useSessionAutosave` (saves), `useRunTimer`, `StatPanel`, `GameOverlay`, `SaveBadge`, `KeyHelp`; hides its title when `embedded`.
- `src/demo/<Name>Demo.tsx` — attract mode: the real engine + an autopilot, no side effects, freezes when `active` is false.
- `src/App.tsx` — `<ArcadeShell gameId="<id>"><NameGame /></ArcadeShell>`; `src/main.tsx` imports `./arcade/arcade.css`.
- `src/index.ts` — exports `<Name>Game`, `<Name>Demo`, default.
- Tests (Vitest + Testing Library), `npm run check` green.
- Community files: `node ../Arcade-Game-Center/scripts/repo-docs.mjs <id>` (after adding it to `REPOS` there).

## 3. Into the portal

1. `scripts/sync-games.mjs` — add `<id>: '<Repo-Dir>'` to `GAMES`; also add it to `scripts/repo-docs.mjs`.
2. `npm run sync:pull -- <id>` and `node scripts/write-app-manifests.mjs`.
3. `apps/portal/package.json` — add `"@arcade/<id>": "*"`; `npm install`.
4. `apps/portal/src/games.ts` — add `{ Game, Demo }`.
5. `packages/ui/src/Icons.tsx` + `GAME_ICONS` in `Shell.tsx` — an icon.
6. `arcade-api/_config.example.php` (and the live `_config.php`) — a `max_score` cap.
7. README tables (here and in every game repo's family table).
8. `npm run check`.
