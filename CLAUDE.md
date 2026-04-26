# Snake Game — CLAUDE.md

## Project Facts

- **Repository**: https://github.com/ZoliQua/Snake-Game
- **Stack**: React 18+, Vite, TypeScript, plain CSS or CSS Modules
- **Package manager**: npm
- **Node**: >=20
- **Scripts**:
  - `npm run dev` — local dev server
  - `npm run build` — production build
  - `npm run preview` — preview production build
  - `npm run typecheck` — `tsc --noEmit`
  - `npm run lint` — ESLint
  - `npm run test` — Vitest (only if a test setup actually exists)
- **Grid**: 20 × 20
- **Tick**: derived from speed (1–10 scale; default level 6 = 150 ms). See `src/logic/constants.ts` `SPEED_TICK_MS`.
- **Controls**: arrow keys + WASD, keyboard only for v1
- **Rendering**: grid-based DOM (no canvas unless explicitly requested)
- **Target platform**: desktop browser; mobile/touch is out of scope for v1
- **Communication**: respond to the user in **Hungarian** in chat, even though this file and the codebase are in English

If any fact above disagrees with the real repository, verify first and flag the divergence to the user before editing code.

---

## Primary Goal

A correct, minimal, type-safe Snake game that is easy to review, debug, and extend. Treat this as a maintainable project, not a one-shot script.

**Priority order**: correctness → truthfulness → verification → small diffs → maintainability → polish.

---

## Architecture

Logic lives outside presentation. Do not bury game rules inside JSX.

```
src/
  logic/
    constants.ts   # grid size, speed table (1–10), initial state
    types.ts       # shared types
    snake.ts       # next head, movement, growth helpers
    food.ts        # random spawn, excludes every snake cell
    collision.ts   # wall + self collision
    game.ts        # advanceGame(state) — tick progression, scoring, transitions
  hooks/
    useGameLoop.ts           # interval runs only while status === 'running'; no stale closures
    useKeyboardDirection.ts  # arrows + WASD; blocks 180° reversal; single listener; preventDefault on arrows
    useHighScore.ts          # localStorage-backed best score; recordScore only writes when higher
  components/
    GameBoard.tsx     # grid + snake + food
    ScoreBoard.tsx    # score + best + status
    GameControls.tsx  # start / pause / restart
    SpeedControl.tsx  # 1–10 range slider
    WrapToggle.tsx    # wrap-walls on/off
    Overlay.tsx       # idle / paused / gameOver
  styles/
  App.tsx
  main.tsx
```

Use this layout only after confirming what is already on disk. If the repo diverges, follow the existing convention and flag the divergence — do not silently restructure.

A central pure function — `advanceGame(state): GameState` — is the preferred shape for tick progression.

---

## Type Model

```ts
type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameStatus = 'idle' | 'running' | 'paused' | 'gameOver';

type GameState = {
  snake: Position[];         // head at index 0
  food: Position;
  direction: Direction;      // applied on the last tick
  nextDirection: Direction;  // queued input; prevents immediate reversal
  status: GameStatus;
  score: number;
  gridSize: number;
  wrapWalls: boolean;        // true: head wraps on torus; false: wall kills
};
```

Deviate only if the repo already uses a cleaner model.

---

## Functional Requirements

State machine: `idle → running → paused ↔ running → gameOver → (restart) → idle/running`.

Required behavior: fixed grid, snake as coordinate array, random food that never spawns on a snake cell, keyboard input with no instant reverse, auto-tick movement, eating grows the snake and increments score, wall and self collisions end the game, full restart resets snake + food + direction + nextDirection + score + status.

Shipped beyond the original v1 scope: user-controlled speed (1–10 slider, no in-game ramp), localStorage-backed high score, and a wrap-walls toggle (default on — head wraps on the torus instead of dying at the edge). Still out of scope unless asked: level progression, automatic speed ramp, sound, skins, mobile/touch controls.

---

## Working Rules

**Verify before and after every non-trivial change.** Before: read the target file and its neighbours, understand data flow and state shape. After: re-check imports, signatures, call sites, state transitions, and that no stale code remains.

**No hallucination.** Do not invent files, hooks, scripts, dependencies, or prior decisions. If something is not verified, say so — "I have not confirmed X", "I do not see evidence of Y". Never claim a build, lint, or test passed without running it.

**Small, local, reversible changes.** One fix or one feature at a time. Do not bundle refactor + feature + style. If the scope feels large, decompose and ask before proceeding.

**Preserve architecture.** Do not change Vite config, `tsconfig`, folder layout, styling approach, or rendering strategy without a stated reason and user approval.

**Explicitness over cleverness.** Small pure functions, explicit types, direct state transitions. Avoid clever one-liners and hidden side effects.

**No new dependencies** without justification. Default: React + Vite + TS only. No Zustand, no game engines, no lodash.

---

## Snake-Specific Bug Checklist

Before concluding any Snake task, confirm each item was checked — or explicitly state it was not:

- Immediate 180° reversal is blocked (compare `nextDirection` against `direction`, not only against the last input).
- Food never spawns on a snake cell, including the tail on an eating tick.
- On eat: add new head **without** removing the tail. On non-eat: add new head **and** remove the tail. Order matters.
- Self-collision is checked against the correct snake snapshot (document whether you check after head move and before tail shift, or vice versa).
- Wall collision uses strict `x < 0 || x >= gridSize || y < 0 || y >= gridSize` — no off-by-one.
- `setInterval` does not capture stale state. Use a ref to the latest state, or functional `setState`, or the `useGameLoop` pattern with a latest-state ref.
- Keyboard listener is attached once per mount and cleaned up on unmount; no duplicates accumulate across renders.
- Game loop stops on `paused` and `gameOver`; no ticks fire in those states.
- Restart fully resets: snake, food, direction, nextDirection, score, status.
- Arrow keys call `event.preventDefault()` so the page does not scroll during play.

---

## Implementation Protocol (short)

For every non-trivial task:

1. **Current state** — only what you verified from the repo.
2. **Goal** — the exact requested change.
3. **Plan** — the smallest safe path and which files you will touch.
4. **Edit** — only the scoped change.
5. **Verify** — run `npm run typecheck` and `npm run build` when available; note any checks you skipped.
6. **Report** — see below.

---

## End-of-Task Report

End every meaningful change with:

- **Changed files** — each file with a one-line reason.
- **Verified** — which checks actually ran (typecheck, build, lint, tests, manual inspection).
- **Not verified** — explicit gaps.
- **Risks / follow-ups** — only real concerns, no filler.

---

**Guiding principle**: correctness over speed, verification over confidence, truth over fluency, small safe diffs over large rewrites. When in doubt — inspect more, assume less, change less, state uncertainty clearly.
