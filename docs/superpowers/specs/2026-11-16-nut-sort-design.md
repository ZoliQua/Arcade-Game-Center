# Nut Sort — design

The tenth arcade game: sort coloured nuts onto bolts. It ships as its own repo (`Nut-Sort-Game`, id `nutsort`) and is
then integrated into the portal like every other game (`docs/ADDING-A-GAME.md`).

## Why

Zoltán saw a "nut sort" puzzle in a Facebook ad (glossy translucent nuts on threaded bolts, wooden table) and wants
his own version in the arcade. **He is colour-blind**, so every nut must be identifiable without colour. That rule
drives the visual design and outranks looking like the ad.

## Goals

- A calm, thinking puzzle that fits beside the other nine games: same shell, stats, autosave, leaderboard and
  mini demo on the portal home page, and it also works standalone.
- **Every nut type is readable without colour**, through width **and** notches (see *Telling nuts apart*).
- A fixed run of **20 levels, the same for every player**, so leaderboard scores are comparable.
- Scoring by **move count** against each level's proven minimum.

## Non-goals

- No hint button (not requested).
- No endless or random mode yet: 20 levels is the current limit and may be extended later.
- No monetisation, rewards, lives or timers that pressure the player. Time is shown but not scored.

## Anti-goals (would count as failure even if it technically works)

- Any two nut types that can only be told apart by colour.
- A level that is unsolvable or has a wrong "minimum" (par). Every shipped level must come with a verified solution.
- Copying the ad's assets, characters (the Einstein avatar, the brain) or its name ("Nuts Factory").

## Rules

- There are N bolts and each holds up to **4 nuts**. Each nut type has exactly 4 nuts.
- A move takes the **top** nut of one bolt and puts it on another bolt whose top nut is the **same type**, or on an
  **empty** bolt, as long as the target has room.
- **A move always takes exactly one nut.** This is a simplification: some commercial versions move a whole run of
  same-type nuts at once. A single-nut move keeps scoring and par unambiguous.
- A level is solved when every non-empty bolt holds 4 nuts of one type.

## Levels (decided: 20 fixed, identical for everyone)

Proposed difficulty curve. The builder may shift levels by ±1 as long as the curve keeps rising:

| Levels | Types (colours) | Bolts | Empty bolts at start |
|--------|-----------------|-------|----------------------|
| 1–2    | 2 | 3  | 1 |
| 3–4    | 3 | 5  | 2 |
| 5–7    | 4 | 6  | 2 |
| 8–10   | 5 | 7  | 2 |
| 11–13  | 6 | 8  | 2 |
| 14–16  | 7 | 9  | 2 |
| 17–20  | 8 | 10 | 2 |

Level 1 echoes the ad, where three bolts carry red and green nuts.

**How the levels are made (builder's approach, my call):**

- An **offline** script (`scripts/generate-levels.ts`) builds the levels from a seeded random generator.
- It solves each level with an exact shortest-path search, BFS or A\* with an admissible heuristic. The search treats bolts as interchangeable, so bolt-order permutations count as the same state.
- Within each band, it keeps seeds whose par rises across the band.
- It writes `src/logic/levels.json`. Each level stores its layout, `par` (the proven minimum number of moves) and one optimal `solution` (a list of `[from, to]` moves).
- The JSON is committed. The game never generates or solves levels at runtime.

**Test guarantee:** for every level, replaying `solution` must solve it in exactly `par` moves. A second, independent check re-solves the level and asserts the same par.

**If exact solving is slow (my call):**

- **Proving par for the hard levels.** Use a strong exact solver: A\*/IDA\* with an admissible heuristic, with bolt-order symmetry removed.
  - Seeds that the solver cannot prove within a fixed budget are skipped, and the next seed is tried. A mild bias towards "provable" levels is acceptable.
  - The band makeup (8 types on 10 bolts at the top) stays as it is.
  - A par that is only an upper bound is never shipped.
- **Where the checks run.**
  - The default test run (`npm run check` and CI) only replays the stored solutions and checks them. This is fast.
  - The independent re-solve is an opt-in script, `npm run verify:levels`. It runs offline after every regeneration of `levels.json`, and its result is recorded in the commit message.

## Scoring (decided: move-based, undo and restart cost points)

Per level:

```
base        = 100 × types
efficiency  = min(1, par / moves)              // moves = the level's move counter at completion
restartCap  = max(0.2, 1 − 0.2 × restarts)     // 1st restart → 80 %, 2nd → 60 % … floor 20 %
levelScore  = round(base × efficiency × restartCap)
```

- **Undo (decided: yes, costs points):** reverts the last move but adds **+1** to the move counter instead of
  subtracting. A wrong move that is undone therefore costs 2 moves. Undo is unlimited and works back to the
  level's start.
- **Restart (decided: yes, costs points):** resets the layout and the move counter, and lowers `restartCap` as shown above.
- **Run score** is the sum of the 20 level scores. The theoretical maximum is 100 × Σtypes = **10 800**. This is the value for `max_score` in `arcade-api/_config.example.php` and in the live `_config.php`.
- The exact numbers (100, 20 %, the 20 % floor, the +1) are my proposal, not Zoltán's. They live in one constants block so they are easy to tune.
- **End of run:** after level 20 the run ends with outcome `'win'` and is recorded through `useArcadeRun`.
  - A run abandoned through "New game" is **not** recorded. **My call:** a partial score on a fixed level set says little.
  - Autosave lets a half-finished run continue later.

## Telling nuts apart (decided: width + notches, colour is a bonus)

Each type has a fixed colour, width and number of notches cut into the nut's top edge:

| Type | Colour (Okabe–Ito based) | Width (relative to widest) | Notches |
|------|--------------------------|----------------------------|---------|
| 1 | orange `#e69f00`     | 60 / 116  | 1 |
| 2 | blue `#0072b2`       | 68 / 116  | 3 |
| 3 | bluish green `#009e73` | 76 / 116 | 2 |
| 4 | reddish purple `#cc79a7` | 84 / 116 | 4 |
| 5 | white `#e8eaf2`      | 92 / 116  | 1 |
| 6 | yellow `#f0e442`     | 100 / 116 | 3 |
| 7 | vermillion `#d55e00` | 108 / 116 | 2 |
| 8 | sky blue `#56b4e9`   | 116 / 116 | 4 |

Two properties hold:

- Nuts next to each other in width always have a different notch count.
- Nuts with the same notch count differ by at least 32/116 in width.

A level with *k* types uses types 1…k. **Builder's call:** another assignment is fine if both properties still hold.

Zoltán saw a mockup of this table (colour and greyscale, 8 colours on 8 bolts) and approved width plus notches. Notches must stay visible at the smallest nut size used on 10 bolts on a phone. If they don't, enlarge the notches, not the colours.

## Look (decided: neon by default, glass as an option)

- **B — Arcade neon (default):** dark panel from the kit tokens. Nuts have a translucent fill, a glowing outline in
  their colour and a lighter centre face. The bolt is a simple dark threaded rod on a base plate.
- **A — Glass (option):** glossy, translucent, glittery nuts on a metallic threaded bolt with washer, dark wall and
  wooden table, in the spirit of the ad.
- The look is a per-game toggle stored in localStorage (`nutsort.look`, values `neon` / `glass`). It follows the
  Tic-Tac-Toe `useIconStyle` + `IconStyleToggle` precedent.
- Width, notches and rules are identical in both looks. The demo uses neon.
- The mockups from the brainstorm (SVG, in `.superpowers/brainstorm/…/content/look-v2.html` and
  `notches.html`) are the visual reference.
- **Builder's call:** rendering is SVG, which keeps the shapes crisp at any size and allows CSS transitions. It also has to look right under the kit's light theme.

## Interaction

- **Click/tap a bolt** to lift its top nut, which rises above the bolt. Then **click/tap the target bolt**.
  - An illegal target gives a short shake and leaves the nut lifted.
  - Clicking the same bolt again drops the nut back.
- **Keyboard:**
  - `1`–`9` and `0` select bolts 1–10;
  - `U` / `Ctrl+Z` undo;
  - `R` restart the level (with a confirmation, because it costs points);
  - `Esc` drops a lifted nut.
  - All keys are listed in `KeyHelp`.
- **Animation:** the nut lifts, travels and drops in about 250 ms. Input is ignored while it moves.
- **HUD, through `StatPanel`:** level *n*/20, moves / par, run score, time, and buttons for undo and restart.
- **Level complete:** a short overlay shows the level score with its breakdown (par, moves, restarts). The next
  level follows on click or Enter. After level 20 the kit `GameOverlay` shows the final score.

## Arcade contract

These follow the existing games exactly. Snake-Game is the reference.

- `src/NutSortGame.tsx` accepts `ArcadeGameProps` (`embedded`, `onGameOver`, `onRunEnd`, `onStatusChange`). It uses `useArcadeRun`, `useRunTimer`, `useRestoredSession` + `useSessionAutosave`, `SaveBadge` and `KeyHelp`, and hides its title when `embedded`.
- **Session payload:**
  - current level index, current layout, undo history and move counter;
  - restarts for this level, the level scores so far and the elapsed seconds.
- `src/demo/NutSortDemo.tsx` replays stored optimal solutions of a few levels (`active` freezes it). It has no side effects, which makes it the "real logic" demo for the portal home page.
- Registry entry:
  - id `nutsort`, name "Nut Sort", tag "Sorting";
  - tagline "Sort the nuts onto bolts in as few moves as you can — shaped for colour-blind players.";
  - `--game-nutsort` accent `#9fd356`.
- Portal integration covers icon, `games.ts`, `_config` cap, README family tables in all ten repos, the landing copy "Ten classics", and portal **v2.2.0**.

## Repo and process

- New public GitHub repo `ZoliQua/Nut-Sort-Game` with the community files and README pointing to the portal and siblings, set up the same way as the other nine repos.
- All commits are by **Zoltán Dul <zoltan.dul@gmail.com>**, with no co-author or AI attribution.
- **My call:** they continue the dated timeline after 2026-11-14, spread over 2026-11-16 … 2026-11-22, with the portal integration on the last day.
- After integration, a new deploy package `arcade-v2.2.0.zip` (portal only). Zoltán must also add `"nutsort" => 10800` to the live `_config.php` (or I do it through cPanel if asked).

## Tests (minimum)

- Rules: move legality, capacity, win detection.
- Undo/restart counters and the scoring formula, including the restart floor.
- Every level in `levels.json` is solvable in exactly `par` moves (replay check plus an independent solve).
- Shape-coding table: the two distinguishing properties above hold.
- Component tests: lift/drop, an illegal-move shake, level-complete flow, session restore.

## Left to the builder

These are free choices as long as the decisions above hold:

- the exact SVG drawing;
- animation easing;
- the generator's seeds and heuristic;
- level-complete overlay copy;
- the icon design (a hex nut on a bolt).
