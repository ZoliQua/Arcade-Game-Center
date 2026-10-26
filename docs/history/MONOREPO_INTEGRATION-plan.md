# Arcade Portal — Monorepo Integration Guide

A cél: a 3 különálló GitHub repót (`Tetris-Game`, `Snake-Game`, `2048-Game`) egy
**npm workspaces** alapú monorepóba szervezni, közös design-rendszerrel és
közös portál shell-lel. Egyetlen `npm install`, egyetlen build, közös tokenek
és komponensek.

A 3 eredeti repó history-ját megtartjuk `git subtree`-vel, így nem vész el
semmi.

---

## 1. Cél-struktúra

```
arcade-portal/
├── package.json                # workspace root
├── tsconfig.base.json
├── apps/
│   ├── portal/                 # sidebar + header + landing + router
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── routes/
│   │   │   │   ├── PlayTetris.tsx
│   │   │   │   ├── PlaySnake.tsx
│   │   │   │   └── Play2048.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── tetris/                 # ide kerül a Tetris-Game tartalma
│   │   └── src/                # logic/, hooks/, components/ (a régi App.tsx-et NEM hozzuk át)
│   ├── snake/                  # ide kerül a Snake-Game tartalma
│   └── 2048/                   # ide kerül a 2048-Game tartalma
└── packages/
    └── ui/                     # közös design rendszer
        ├── src/
        │   ├── tokens.css      # CSS változók (dark + light)
        │   ├── portal.css      # sidebar + header + shell stílusok
        │   ├── games.css       # közös panel + score-card + kbd stílusok
        │   ├── Icons.tsx
        │   ├── Shell.tsx       # Sidebar + Header
        │   └── index.ts        # re-export
        ├── package.json
        └── tsconfig.json
```

A 3 játékot **mint komponens-csomagot** importálja a portal — nem külön app-okként
buildelődnek, hanem a portal Vite-jébe kerül be a forrásuk.

---

## 2. Repó-egyesítés `git subtree`-vel

Új mappában:

```bash
mkdir arcade-portal && cd arcade-portal
git init -b main
echo "node_modules\ndist\n.DS_Store" > .gitignore
git add . && git commit -m "chore: init monorepo"

# Tetris
git subtree add --prefix=apps/tetris https://github.com/ZoliQua/Tetris-Game main --squash
# Snake
git subtree add --prefix=apps/snake  https://github.com/ZoliQua/Snake-Game  main --squash
# 2048
git subtree add --prefix=apps/2048   https://github.com/ZoliQua/2048-Game   main --squash
```

`--squash` = nem hozza át az összes commit-et, csak egyet referenciaként
(átláthatóbb history). Ha a teljes history kell, hagyd el.

Később, ha valamelyik repó frissül upstream és vissza akarod hozni:

```bash
git subtree pull --prefix=apps/tetris https://github.com/ZoliQua/Tetris-Game main --squash
```

---

## 3. Workspace setup

**`package.json` (root):**

```json
{
  "name": "arcade-portal",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev -w @arcade/portal",
    "build": "npm run build -w @arcade/portal",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  },
  "engines": { "node": ">=20" }
}
```

**`packages/ui/package.json`:**

```json
{
  "name": "@arcade/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": { "react": "^18", "react-dom": "^18" },
  "exports": {
    ".": "./src/index.ts",
    "./tokens.css": "./src/tokens.css",
    "./portal.css": "./src/portal.css",
    "./games.css":  "./src/games.css"
  }
}
```

**`apps/tetris/package.json` (és ugyanígy snake, 2048):**

```json
{
  "name": "@arcade/tetris",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": { "react": "^18", "react-dom": "^18" },
  "dependencies": { "@arcade/ui": "*" }
}
```

> Fontos: a régi Tetris/Snake/2048 `package.json`-okat **töröld** (`apps/tetris/package.json` újra létrehozva), mert nincs többé külön build / dev — csak a portal van. A régi `vite.config.ts`, `index.html`, `main.tsx` is mehet.

**`apps/tetris/src/index.ts`:**

```ts
export { TetrisGame } from './TetrisGame';
```

A régi `App.tsx`-et átnevezed `TetrisGame.tsx`-re, és **kiveszed belőle a fejléc + footer részt** — csak a board + side-panelek maradjanak. A header / sidebar a portal feladata.

---

## 4. Portal app

**`apps/portal/package.json`:**

```json
{
  "name": "@arcade/portal",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@arcade/ui": "*",
    "@arcade/tetris": "*",
    "@arcade/snake": "*",
    "@arcade/2048": "*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "vite": "^5"
  }
}
```

**`apps/portal/src/App.tsx`:**

```tsx
import { useState } from 'react';
import { Sidebar, Header } from '@arcade/ui';
import { TetrisGame } from '@arcade/tetris';
import { SnakeGame  } from '@arcade/snake';
import { Game2048   } from '@arcade/2048';
import { Landing }  from './Landing';

import '@arcade/ui/tokens.css';
import '@arcade/ui/portal.css';
import '@arcade/ui/games.css';

export default function App() {
  const [route, setRoute]   = useState({ view: 'home' as const });
  const [theme, setTheme]   = useState<'dark'|'light'>('dark');
  // ... a jelenlegi Arcade Portal.html App() body-ja
}
```

A `play` route-ban már nem mock-okat hív, hanem a tényleges játékokat:

```tsx
{route.view === 'play' && route.gameId === 'tetris' && <TetrisGame />}
{route.view === 'play' && route.gameId === 'snake'  && <SnakeGame  />}
{route.view === 'play' && route.gameId === '2048'   && <Game2048   />}
```

---

## 5. Mit csinálj kézzel, mit a Claude Code-dal

**Te kézzel (5 perc):**
1. `git subtree add` parancsok futtatása (#2-es lépés)
2. Mappák létrehozása: `apps/portal/src`, `packages/ui/src`
3. A jelenlegi `Arcade Portal.html` projektből másold:
   - `src/tokens.css`, `src/portal.css`, `src/games.css` → `packages/ui/src/`
   - `src/Icons.jsx`, `src/Shell.jsx` → `packages/ui/src/` (TSX konverzió jön)
   - `src/Landing.jsx`, `src/App.jsx` → `apps/portal/src/`

**Claude Code prompt** (a `arcade-portal/` gyökerében futtasd):

> Set up this directory as an npm workspaces monorepo for an arcade portal that wraps three existing games.
>
> Existing layout (already in place):
> - `apps/tetris/`, `apps/snake/`, `apps/2048/` — three React+Vite+TS games imported via `git subtree`. Each has its own `package.json`, `vite.config.ts`, `index.html` from the original repo.
> - `packages/ui/src/` — shared design system: `tokens.css`, `portal.css`, `games.css`, plus JSX sources for `Icons` and `Shell` that need TSX conversion.
> - `apps/portal/src/` — JSX sources for `App` and `Landing` that wrap the three games.
>
> Tasks (do them in this order, run typecheck + build after each phase):
>
> **Phase 1 — workspace skeleton**
> - Root `package.json` with `workspaces: ["apps/*", "packages/*"]`, scripts `dev`, `build`, `typecheck`, `lint`.
> - Root `tsconfig.base.json` shared by every workspace package.
> - `.gitignore` covering `node_modules/`, `dist/`, `.DS_Store`.
>
> **Phase 2 — shared UI package (`@arcade/ui`)**
> - Add `package.json` (private, peerDeps react+react-dom, exports map for the 3 CSS files and the TS index).
> - Convert `Icons.jsx` and `Shell.jsx` to TSX with proper types. Export `Sidebar`, `Header`, `GAMES`, `fmtTime`, every icon, and the type for the route object. Keep the same component API.
> - Add `src/index.ts` re-exporting everything.
>
> **Phase 3 — game packages (`@arcade/tetris`, `@arcade/snake`, `@arcade/2048`)**
> - For each game's existing app: delete the old top-level chrome (`main.tsx`, `index.html`, `vite.config.ts`, `App.css`, original `App.tsx`'s header/footer/aside for hold/next/score IF they are duplicated by the portal; keep them if they are game-specific).
> - The Tetris `App.tsx` should be renamed `TetrisGame.tsx` and stripped down to only the playfield + game-specific side panels (Hold, Next, ScoreBoard, GameControls). Drop the `<header>` and `<footer>` blocks — those belong to the portal.
> - Replace each game's `package.json` with a workspace package: `name: "@arcade/tetris"` etc., `main` and `types` pointing to `src/index.ts`, peerDeps react+react-dom, dep on `@arcade/ui` for shared styling.
> - `src/index.ts` exports `TetrisGame` / `SnakeGame` / `Game2048`.
>
> **Phase 4 — portal app (`@arcade/portal`)**
> - Vite + React + TS app. `package.json` deps: `@arcade/ui`, `@arcade/tetris`, `@arcade/snake`, `@arcade/2048`, react, react-dom. devDeps: vite, @vitejs/plugin-react, typescript.
> - Convert `App.jsx` and `Landing.jsx` to TSX.
> - In `App.tsx`'s `play` route, replace the mock game components with the real packages.
> - Vite config: standard react plugin, no aliases needed (workspaces handle resolution).
> - `index.html` mounts `#root`, loads `src/main.tsx`.
>
> **Phase 5 — verify**
> - `npm install` from root.
> - `npm run typecheck` — every workspace passes.
> - `npm run build` — portal builds cleanly, includes all 3 games in one bundle.
> - `npm run dev` — manual smoke test: home → click each game card → game plays inside portal shell with sidebar + header visible.
>
> Constraints:
> - No new dependencies beyond what's listed.
> - Preserve every game's existing logic (`logic/`, `hooks/`) byte-for-byte. Only the chrome (header/footer/main wrappers) changes.
> - Plain CSS only, no CSS-in-JS, no Tailwind.
> - Per-game high scores remain in `localStorage` under `tetris.highScore`, `snake.highScore`, `2048.highScore`.
>
> When done, write `MIGRATION.md` at the root summarising what changed and how to add a 4th game later.

---

## 6. Deploy

Egy app, egy build, egy deploy.

- **Vercel:** root `package.json`, build command `npm run build`, output directory `apps/portal/dist`. Automatikusan látja a workspaces-t.
- **GitHub Pages / Netlify:** ugyanez, csak a publish dir-t mutasd `apps/portal/dist`-re.

---

## 7. Új játék hozzáadása később

1. `git subtree add --prefix=apps/UJ-JATEK <repo-url> main --squash`
2. `apps/UJ-JATEK/package.json` → `name: "@arcade/uj-jatek"`, peerDeps react, dep `@arcade/ui`
3. `apps/UJ-JATEK/src/index.ts` → exportál egy `UjJatekGame` komponenst
4. `packages/ui/src/Shell.tsx` → `GAMES` tömbbe felveszed (név, ikon, szín, best)
5. `apps/portal/src/App.tsx` → `play` route-ba egy új ág
6. `apps/portal/package.json` → `dependencies` közé `"@arcade/uj-jatek": "*"`
7. `npm install` a gyökérben

---

## 8. Mit ne csinálj

- Ne másold össze fizikailag a 3 repó `src/`-jét egy mappába. Tartsd külön, mint workspace package — különben az import-paths és a kód-tulajdonjog elvész.
- Ne tegyél a `packages/ui`-ba játék-specifikus dolgot (pl. tetromino color táblát). Az a `apps/tetris` része. A `ui` csak a shell + tokenek.
- Ne futtass külön `npm install`-t minden `apps/*`-ben. **Csak a gyökérből.** A workspaces ezt a célt szolgálja.
