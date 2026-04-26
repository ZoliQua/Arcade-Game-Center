# 🐍 Snake

A minimal, type-safe Snake game built with **React 18**, **Vite**, and **TypeScript**. Keyboard-first, grid-based, no canvas, no external game engine.

![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Table of contents

- [Features](#-features)
- [How it works](#-how-it-works)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [Controls](#-controls)
- [Scoring](#-scoring)
- [Wall wrap](#-wall-wrap)
- [Scripts](#-scripts)
- [Architecture](#-architecture)
- [License](#-license)

## ✨ Features

- 🎮 **Classic Snake** on a fixed 20×20 grid
- ⚡ **Adjustable speed** — 1–10 slider, from leisurely to frantic
- 🎯 **Speed-scaled scoring** — 1 pellet is worth N points at speed N
- 🏆 **Persistent high score** kept in `localStorage` across refreshes
- ⏱️ **Real-time elapsed timer** (`mm:ss`) that pauses with the game
- 🧱 **Wall wrap toggle** — play classic mode or torus mode
- ⌨️ **Keyboard-first** — arrows + WASD, Space/P to pause, R to restart
- 🧼 **Pure game logic** separated from UI; presentation is dumb on purpose
- 🎨 **CSS Modules** — no runtime CSS-in-JS, no layout jitter
- 🔒 **Type-safe** — strict TypeScript with no `any` escape hatches in game code

## 🧠 How it works

The game is a simple state machine:

```
idle → running ↔ paused → gameOver → (restart) → running
```

A single pure function, `advanceGame(state): GameState`, owns one tick of progression:

1. Resolve the queued direction (blocks 180° reversal against the **last applied** direction, not the last input).
2. Compute the next head position.
3. Wrap the head across the board **or** trigger `gameOver` on wall contact, depending on the Wrap walls setting.
4. Detect food, then self-collision against the correct post-move body snapshot.
5. Either grow the snake and respawn food, or shift the tail.
6. Award `state.speed` points if the pellet was eaten.

The render loop is a React hook (`useGameLoop`) that runs a fresh `setInterval` only while `status === 'running'`. A ref to the latest callback prevents the classic stale-closure bug. Input is captured by a single `keydown` listener (`useKeyboardDirection`) that calls `preventDefault()` on arrows so the page never scrolls mid-play.

## 📦 Requirements

- 🟢 **Node ≥ 20**
- 📦 **npm** (the lockfile is committed as `package-lock.json`)

## 🚀 Installation

```bash
git clone https://github.com/ZoliQua/Snake-Game.git
cd Snake-Game
npm install
```

## 🕹️ Usage

Start the dev server:

```bash
npm run dev
```

Then open `http://localhost:5173` in a modern desktop browser.

For a production build:

```bash
npm run build
npm run preview
```

## ⌨️ Controls

| Key                     | Action            |
| ----------------------- | ----------------- |
| ⬆️ / ⬇️ / ⬅️ / ➡️       | Move              |
| **W** / **A** / **S** / **D** | Move (alternate) |
| **Space** / **P**       | Pause / Resume    |
| **R**                   | Restart           |

## 🎯 Scoring

Each pellet awards **N points at speed level N**. Speed changes apply from the next pellet onwards — past pellets keep the points they were worth when eaten.

| Speed | Tick     | Points per pellet |
| ----: | -------: | ----------------: |
| 1     | 300 ms   | 1                 |
| 2     | 260 ms   | 2                 |
| 3     | 225 ms   | 3                 |
| 4     | 195 ms   | 4                 |
| 5     | 170 ms   | 5                 |
| **6** (default) | **150 ms** | **6**   |
| 7     | 130 ms   | 7                 |
| 8     | 110 ms   | 8                 |
| 9     | 90 ms    | 9                 |
| 10    | 70 ms    | 10                |

The **best score** is persisted to `localStorage` under the key `snake.highScore`. Clear your site data to reset it.

## 🧱 Wall wrap

- **On** (default): the head wraps around the board torus-style — exit right, enter left.
- **Off**: touching a wall ends the game.

Either way, self-collision is always fatal — wrapping into your own tail will still kill you.

## 🧪 Scripts

| Script                | Purpose                            |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start the local dev server (Vite)  |
| `npm run build`       | Type-check and produce a prod bundle |
| `npm run preview`     | Preview the production build       |
| `npm run typecheck`   | Run `tsc --noEmit`                 |
| `npm run lint`        | Run ESLint across the project      |

## 🏗️ Architecture

Logic lives outside presentation. Game rules never leak into JSX.

```
src/
  logic/        pure game rules
    types.ts      shared types (Position, Direction, GameState, ...)
    constants.ts  grid size, speed table, initial state
    snake.ts      next head, direction helpers, move
    food.ts       spawn excluding snake cells
    collision.ts  wall, self, wrap
    game.ts       advanceGame(state) tick + createInitialState(overrides)
  hooks/
    useGameLoop.ts          interval bound to `running`; no stale closures
    useKeyboardDirection.ts arrows + WASD + space/P + R
    useHighScore.ts         localStorage-backed best score
    useElapsedSeconds.ts    real-time mm:ss elapsed counter
  components/
    GameBoard.tsx      grid + snake + food
    ScoreBoard.tsx     time + score + best + status
    GameControls.tsx   start / pause / restart
    SpeedControl.tsx   1–10 range slider
    WrapToggle.tsx     wrap walls on/off
    Overlay.tsx        idle / paused / gameOver
  styles/
  App.tsx             state machine + wiring
  main.tsx            React entry
```

## ⚖️ License

Released under the [MIT License](./LICENSE). © 2026 Zoltan Dul.

---

<p align="center">Made with ❤️ by Zoltan Dul</p>
