# Migration notes — Arcade Portal monorepo

This repo is a **portal aggregator** for Zoltan's three classic games. Each game
has its own standalone GitHub repo that runs on its own; the portal pulls a
snapshot of each into `apps/` via `git subtree --squash` and wraps them in a
shared shell.

The three upstream repos are **independent and intact** — their `index.html`,
`main.tsx`, `vite.config.ts`, `package.json`, etc. are untouched. Only this
monorepo carries the portal-specific transformations (App.tsx renamed to
`<Game>Game.tsx`, CSS scoped under `.tetris-app` / `.g2048` / Snake's CSS
Modules, original chrome dropped, workspace-style `package.json`).

Upstream repos:
- https://github.com/ZoliQua/Tetris-Game
- https://github.com/ZoliQua/Snake-Game
- https://github.com/ZoliQua/2048-Game

Monorepo: https://github.com/ZoliQua/Arcade-Game-Center

## Layout

```
arcade-portal/
├── package.json          # workspaces root
├── tsconfig.base.json
├── scripts/
│   └── sync-to-upstream.sh  # push logic-only changes back to a game's own repo
├── apps/
│   ├── portal/           # @arcade/portal — Vite app, the user-facing portal
│   ├── tetris/           # @arcade/tetris — exports <TetrisGame />
│   ├── snake/            # @arcade/snake  — exports <SnakeGame />
│   └── 2048/             # @arcade/2048   — exports <Game2048 />
└── packages/
    └── ui/               # @arcade/ui     — Sidebar, Header, GAMES, fmtTime, icons, CSS
```

## Scripts

```
npm install         # one install for the whole repo
npm run dev         # starts the portal Vite dev server
npm run build       # type-checks + builds the portal into apps/portal/dist
npm run typecheck   # tsc --noEmit across every workspace
```

---

## Where development happens

**All day-to-day work happens in this monorepo.** The portal is the primary
build target; the standalone game repos are kept as-is so they remain shippable
on their own.

When you fix a bug in (e.g.) `apps/tetris/src/logic/game.ts`, that fix should
flow back to `Tetris-Game/main` so the standalone repo stays current.

---

## ⚠️ DO NOT use `git subtree push`

It looks like the natural inverse of `git subtree pull`, but it would push the
**current monorepo state** of `apps/tetris/` to the upstream — which would
*delete* the upstream's `index.html`, `main.tsx`, original `package.json`, etc.,
because those don't exist here anymore. The standalone repos would stop running.

Use `scripts/sync-to-upstream.sh` instead.

---

## Pushing changes back to a game's own repo

Use the helper script. It only syncs the parts that are byte-identical between
this monorepo and upstream (`src/logic`, `src/hooks`, `src/components`); it does
not touch the upstream's chrome (`App.tsx`, `main.tsx`, styles, configs).

```bash
# Dry run — copies, commits in a temp clone, shows diff, asks before exiting:
./scripts/sync-to-upstream.sh tetris

# Same, but also pushes upstream/main automatically when the diff looks right:
./scripts/sync-to-upstream.sh tetris --push
```

The script supports `tetris`, `snake`, `2048` out of the box. Adding a new
game means extending the `case` statement near the top of the script with the
new repo URL and its `src/` prefix (the Tetris repo has its sources nested under
`Tetris-Game/src`; most are flat at `src/`).

### When NOT to use the sync script

If your change touches:
- `App.tsx`, `<Game>Game.tsx` (the renamed root component)
- `styles/` (we scoped these under `.tetris-app` / `.g2048`; the upstream's
  styles use `.app` and `:root` globals)
- the workspace `package.json`, `tsconfig.json`

…then **don't sync**. Those files live different lives in the two worlds.
Apply the change to the upstream repo manually if it's relevant there.

The script only ever copies `logic/`, `hooks/`, `components/`, on the
assumption that those three folders are pure (no portal-specific imports, no
`@arcade/ui` references, no rename-driven changes). If you ever add a
portal-only import inside one of them, make sure to gate it (e.g., behind a
prop) before next sync.

---

## Pulling changes from a game's own repo

If somebody (or a future you) commits directly to a standalone game repo,
bring those changes into the monorepo with:

```bash
git subtree pull --prefix=apps/tetris https://github.com/ZoliQua/Tetris-Game main --squash
git subtree pull --prefix=apps/snake  https://github.com/ZoliQua/Snake-Game  main --squash
git subtree pull --prefix=apps/2048   https://github.com/ZoliQua/2048-Game   main --squash
```

A pull will produce merge conflicts on every file that diverges (i.e.,
everything outside `logic/hooks/components`). Resolve by **keeping the
monorepo's version of the chrome** and accepting upstream changes only in the
three pure folders. After resolving, run `npm run typecheck && npm run build`
to make sure nothing broke.

Tetris specifically: the upstream has the project nested in `Tetris-Game/`. The
first `subtree add` produced `apps/tetris/Tetris-Game/...` and we flattened it
manually. Future `subtree pull`s will re-introduce the nested folder; flatten
again with `mv apps/tetris/Tetris-Game/* apps/tetris/ && rmdir apps/tetris/Tetris-Game`.

---

## Adding a 4th (or 5th, …) game

The new game must already exist as its own GitHub repo, structured the same way
as the three current ones (Vite + React + TS, with `src/logic`, `src/hooks`,
`src/components`).

1. **Subtree add**:
   ```bash
   git subtree add --prefix=apps/<id> https://github.com/<user>/<Repo> main --squash
   ```

2. **Strip portal-irrelevant chrome** (we keep the originals upstream, only
   delete locally so the portal builds cleanly):
   ```bash
   cd apps/<id>
   rm -f index.html main.tsx vite.config.ts \
         tsconfig.app.json tsconfig.node.json eslint.config.js \
         package-lock.json README.md LICENSE CLAUDE.md *.md
   rm -f src/main.tsx src/App.css src/index.css src/vite-env.d.ts
   ```

3. **Rename and adapt the root component** so it can be embedded in the portal:
   - `mv src/App.tsx src/<Game>Game.tsx` (e.g., `PongGame.tsx`)
   - Inside, drop any standalone `<header>` / `<footer>` blocks that duplicate
     the portal shell. Keep only the playfield + game-specific side panels.
   - Wrap the root JSX in `<div className="<id>-app">` (or similar unique name)
     so its CSS can be scoped without colliding with the other games.
   - `export function <Game>Game()` and a default export.

4. **Scope the CSS** so it cannot leak into the portal shell or other games.
   Every selector should start with `.<id>-app` (e.g., `.pong-app`). Move any
   `:root { --token: ... }` declarations onto `.<id>-app { --token: ... }` so
   they apply only inside the game.

5. **Create `src/index.ts`** as the library entry:
   ```ts
   export { <Game>Game } from './<Game>Game';
   export { default } from './<Game>Game';
   ```

6. **Replace `apps/<id>/package.json`** with a workspace package:
   ```json
   {
     "name": "@arcade/<id>",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "exports": { ".": "./src/index.ts" },
     "peerDependencies": { "react": "^18", "react-dom": "^18" },
     "scripts": { "typecheck": "tsc --noEmit" },
     "devDependencies": {
       "@types/react": "^18.3.12",
       "@types/react-dom": "^18.3.1",
       "typescript": "^5.6.3"
     }
   }
   ```

7. **Replace `apps/<id>/tsconfig.json`**:
   ```json
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": { "noEmit": true, "rootDir": "src" },
     "include": ["src"]
   }
   ```

8. **If the game uses CSS Modules**, add `apps/<id>/src/css-modules.d.ts`:
   ```ts
   declare module '*.module.css' {
     const classes: { readonly [key: string]: string };
     export default classes;
   }
   ```

9. **Register in the portal**:
   - `packages/ui/src/Shell.tsx` — extend the `GameId` type and add an entry
     to `GAMES` (`{ id, name, Icon, color, best }`). Add an icon to
     `packages/ui/src/Icons.tsx` if needed.
   - `apps/portal/package.json` — add `"@arcade/<id>": "*"` to `dependencies`.
   - `apps/portal/src/App.tsx` — import `<GameComponent>` from `@arcade/<id>`,
     add a `route.gameId === '<id>'` branch in the play route.
   - `apps/portal/src/Landing.tsx` — add a preview component (`<id>Mini`) and
     a `META[<id>]` entry; the game card will render automatically once it's
     in `GAMES`.

10. **Extend the sync script** (`scripts/sync-to-upstream.sh`) — add a `case`
    arm for the new game with its upstream URL and `src/` prefix.

11. **Install + verify**:
    ```bash
    npm install
    npm run typecheck
    npm run build
    npm run dev   # smoke-test the new game card on the home page
    ```

---

## High-score keys

LocalStorage keys are preserved across the standalone and embedded modes:
- `tetris.highScore`
- `snake.highScore`
- `2048.highScore`

If a new game lands a high score in `localStorage`, use the same convention:
`<id>.highScore`.

---

## Deploy

One app, one build. Vercel / Netlify / Pages: build command `npm run build`,
output directory `apps/portal/dist`. Workspaces are picked up automatically.
