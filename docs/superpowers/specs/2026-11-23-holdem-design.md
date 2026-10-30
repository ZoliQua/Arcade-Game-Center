# Texas Hold'em — design

The eleventh arcade game: a No-Limit Texas Hold'em tournament against computer opponents. It ships as its own repo (`Texas-Holdem-Game`, id `holdem`) and is then integrated into the portal (`docs/ADDING-A-GAME.md`).

It is built **after** Nut Sort (`2026-11-16-nut-sort-design.md`).

## Why

Zoltán wants a longer, much more graphical game for the arcade. Every part should be designed, animated and good-looking, and easy to follow over a session of 20–60 minutes. He is **colour-blind**, so no information may be carried by colour alone (the same rule as Nut Sort).

## Goals

- A tournament ("sit & go") where the last player with chips wins. There are two formats:
  - **heads-up**: Zoltán plus 1 bot;
  - **6-max**: Zoltán plus 5 bots.
- Bots with **individual names, graphical characters, play styles and strengths**. Over a long game they can be recognised and read.
- The player chooses a **difficulty**, and the game seats matching bots.
- A **graphical, animated table**, readable at a glance, with a **text call-out of every action** and a **log of actions and previous hand results**.
- Arcade integration: shared shell, stats, autosave and leaderboard, a mini demo on the portal home page, and standalone use.

## Non-goals

- No real money, no purchases, no online multiplayer.
- No hand-strength meter or odds display for the player. It was offered and not chosen, and can be added later. The log does name the winning hand at showdown.
- No cash-game mode and no multi-table tournaments.

## Anti-goals (would count as failure even if it technically works)

- **Bots that cheat.** No bot decision may read another player's hole cards or the undealt deck. This is enforced by the type of the bot API (see *AI*) and by a test.
- State that can only be read through colour: suits, the active player, the dealer button, winners.
- Losing or creating chips. The total number of chips is constant through every hand, including side pots and split pots.
- A long game that is hard to follow: actions that happen too fast to see, or that are not written anywhere.
- Real people's likenesses or names for the characters.

## Rules (standard NLHE tournament)

- 52-card deck, shuffled by a seeded PRNG. The seed is stored, so saves and tests are reproducible.
- The button rotates clockwise. Small and big blinds are posted, with the standard **heads-up rule**: the button posts the small blind and acts first preflop, last postflop.
- **Betting rounds:** preflop, flop, turn and river.
- **Actions:** fold, check, call, bet/raise, all-in.
  - The minimum raise equals the size of the previous bet or raise.
  - An all-in that is less than a full raise does not reopen the betting for players who have already acted.
- **Side pots** are built correctly for multiple all-ins of different sizes.
- **Split pots:** an odd chip goes to the first winner left of the button.
- **Showdown:** the last aggressor shows first; others show or muck.
  - **My call:** the bots always show at showdown, so the log stays informative.
  - Zoltán's cards are always shown to himself.
- A player with 0 chips is eliminated.
  - Players eliminated in the same hand are ranked by their stack at the start of that hand; the larger stack gets the better place.
  - Equal stacks share the better place.
- **Starting stack:** 1 500 chips for everyone (my call).

## Formats, difficulty and length (decided)

- **Setup screen before each tournament:**
  - **format**: heads-up or 6-max;
  - **difficulty**: Easy, Medium or Hard;
  - **length**: 20, 30, **45 (default)** or 60 minutes.
- **The game seats the bots.** For each difficulty there is a pool of characters, and the game draws the required number from it (see *Characters*).
- **Length** works through blind levels that advance **by hand count, not wall-clock time**, so pausing or thinking does not speed up the blinds (my call).
  - **Blind ladder (my call):** 10/20, 15/30, 25/50, 50/100, 75/150, 100/200, 150/300, 200/400, 300/600, 400/800, 600/1 200, 800/1 600, 1 000/2 000, then ×1.5 rounded to a tidy chip value. No antes.
  - **Hands per level** depend on the format and the chosen length. The builder calibrates them by **simulation**, running bot-only tournaments with a per-hand time model. The aim is a median tournament length close to the chosen minutes at the "Normal" animation speed. The calibrated table is committed together with the simulation script.

## Scoring (decided: difficulty and placement count, speed does not)

```
base       = { easy: 1000, medium: 2500, hard: 5000 }[difficulty]
placeShare = 6-max:    [1.00, 0.60, 0.40, 0.25, 0.10, 0.00][place − 1]
             heads-up: win 0.40, loss 0.00
score      = round(base × placeShare)
```

- The run ends **when Zoltán busts or wins**. A bust records his place right away; the bots do not have to finish the tournament.
- The outcome is `'win'` for first place, otherwise `'loss'`. Every tournament is ranked.
- A tournament abandoned through "New tournament" is **not** recorded (consistent with Nut Sort). The autosave lets it continue later.
- The maximum score is **5 000**. That is the `max_score` for `holdem` in `_config.example.php` and the live `_config.php`.
- **Shares and bases are my proposal.** A heads-up win is worth 40 % of a 6-max win because it beats only one opponent. The numbers live in one constants block.
- **Length does not change the score** (decided: speed does not count).

## Characters (decided: each bot is different: name, figure, style, strength)

- **Roster (my call):** 15 original cartoon characters, 5 per difficulty pool. Each has:
  - a **name** (English, playful, not a real person);
  - a **figure**: an illustrated character, for example animals or stylised people in the arcade art style;
  - a **style**: a parameter set for tightness (how many hands it plays), aggression (bet/raise versus call), bluff frequency, and a sizing habit;
  - a **strength**: how good its decisions are (see *AI*).
- The **5 styles** recur in every pool at that pool's strength: a tight-passive "rock", a loose-passive "calling station", a tight-aggressive, a loose-aggressive and a "maniac" bluffer. This way each table has variety, and the harder pools play the same styles better.
- **Seating:**
  - Easy and Hard tables draw only from their own pool.
  - A Medium table draws 4 Medium bots and 1 random bot from Easy or Hard.
  - Heads-up draws 1 bot from the chosen pool.
  - The seat order is shuffled.
- **Figures are drawn as SVG** (the tell cues are in *Tells*) with a small set of **expressions/poses** rendered from shared parts (my call: one parametric character rig with per-character species, colours and accessories, rather than 15 hand-drawn sets):
  - idle;
  - thinking, while it is the bot's turn;
  - fold;
  - bet/raise;
  - all-in;
  - win the pot;
  - busted, greyed out with an "OUT" tag.

## Tells (decided: the figures show visible tells)

Each character has **1–2 personal tells**. These are visible behaviours driven by the strength of **its own hand**, so the bot only reveals its own information and this is not cheating.

- **Examples:**
  - an ear twitch or a nervous glance with a strong hand;
  - a snap-call (a much shorter thinking delay) on a draw;
  - a long stare, then a bet, as a bluff;
  - leaning back with a weak hand.
- **Reliability scales with difficulty (my call):**
  - Easy characters tell honestly about 80 % of the time.
  - Medium characters tell honestly about 60 % of the time.
  - Hard characters show tells rarely and sometimes **reverse** them, to mislead.
- **Readability:**
  - The cues are animations of the character rig plus thinking-time changes, never colour alone.
  - Each cue lasts long enough to notice at Normal speed.
- **Character card:** the player can open a card per character, from the seat or the log, with name, style and personal notes. **My call:** the game does not reveal the tells. Learning them is part of the fun.
  - Simple stats are tracked during the tournament: VPIP, aggression and showdowns.
- **Implementation:**
  - A separate `tells` module turns `(profile, own hand strength, rng)` into a cue: pose, timing and duration.
  - It runs after `decide` and never feeds back into it.
  - A test asserts that it receives only the bot's own `BotView`.

## AI

- **Bot interface:**

  ```ts
  decide(view: BotView, profile: BotProfile, rng): Action
  ```

  `BotView` contains only public information plus that bot's own hole cards: stacks, pot(s), board, the action history of the current hand, position and blinds. Because no other cards are reachable through this type, a bot cannot cheat. A test asserts that decisions do not change when the other players' hidden cards are permuted.
- **Preflop:** hand-group tables, adjusted by position, by tightness, and by stack depth in big blinds (a push/fold region at a short stack).
- **Postflop:** a Monte Carlo equity estimate against the opponents' estimated ranges, compared with pot odds. Aggression, bluffs and sizing come from the style.
- **Strength scales** the number of equity samples, how accurately ranges are read (weak bots assume random hands), positional awareness, and a mistake rate. Mistakes include calling too wide and missing value bets.
- **Acceptance criterion for strength (my call).** There are no human win-rate targets. Instead, run bot-only simulations of 500+ heads-up matches per pool pair. A Hard pool must beat Medium in at least 60 % of matches, and Medium must beat Easy at the same rate. Zoltán's own playtest is the final judge.
- **Thinking time:** a visible 0.6–2 s delay that scales with decision difficulty and animation speed. The computation must not block the UI.
  - **Builder's call:** cap the sample count, or move the equity work into a Web Worker if needed.

## Look (decided)

- **Table** (setting `holdem.table`):
  - **B Arcade neon, the default**: dark felt with a glowing blue rim, in the arcade palette;
  - **A Classic casino**: green felt with a wooden rail and gold trim;
  - **C Elegant dark**: deep blue felt, black leather rail and gold details.

  The approved mockups are at `/Users/Zoli/Code/Games/Arcade-Games/.superpowers/brainstorm/16929-1792874550/content/poker-table.html`.
- **Deck** (setting `holdem.deck`):
  - **four-colour, the default**: ♠ black, ♥ red, ♦ blue, ♣ green;
  - **grey**: suits are told apart only by their shapes.

  In both, suit symbols are **large**, with a big centre pip and the corner index visible on overlapped cards.
- **Animation speed** (setting `holdem.speed`): Slow, Normal (default) or Fast. `prefers-reduced-motion` shortens the animations but never skips the call-outs or the log.
- **Animations:**
  - dealing cards from the dealer position to each seat;
  - flipping the flop, turn and river;
  - chips sliding from the seat to the bet line and then into the pot;
  - the pot sliding to the winner (split visibly between winners for side pots);
  - the dealer button moving;
  - a turn-timer ring that counts down only for bots, never for Zoltán;
  - the characters' poses.
- **Non-colour cues:**
  - the active seat has a dashed animated outline and a "Thinking…" or "Your turn" label;
  - folded seats dim and show "FOLD";
  - the winning five cards are raised and outlined;
  - all-in seats show an "ALL-IN" tag.

## Following the game (decided: call-outs and a log)

- **Call-out:** each action appears as a short bubble at the seat ("Raises to 120", "Calls 60", "All-in 845") and in the log.
- **Log panel:**
  - a scrollable list grouped by hand (`Hand #23 · Blinds 50/100`) and by street;
  - every action with its amount;
  - the board cards;
  - the showdown result per pot ("Bruno wins 1 240 with a flush, K-high");
  - eliminations ("Pixel is out in 4th").
- **Log placement:**
  - On desktop it sits beside the table.
  - On a phone it is a collapsible drawer with a badge for new entries.
  - The log of the current tournament is part of the saved session (my call: capped at the last 200 hands).
- **Blind info:** the current blinds, the next level and "hands until next level" are always visible.

## Player controls (my call)

- **Action bar:**
  - Fold;
  - Check, or Call *amount*;
  - Bet/Raise with a slider and preset buttons: min, ½ pot, ¾ pot, pot, all-in;
  - a confirm button showing the amount.
- **Keyboard** (all keys go through `shouldIgnoreKey` and are listed in `KeyHelp`):
  - `F` fold;
  - `C` check/call;
  - `R` focuses the raise slider;
  - `←`/`→` change the amount;
  - `A` all-in;
  - `Enter` confirms;
  - `P`/`Esc` pause.
- **Pause** stops the bots and the animations. Leaving the tab pauses automatically, as in the other games.
- **Mobile:** the table scales to portrait phone widths, with seats arranged around an upright oval. The action bar is fixed at the bottom with touch-sized buttons.

## Arcade contract

These follow the existing games exactly.

- `src/HoldemGame.tsx` accepts `ArcadeGameProps` (`embedded`, `onGameOver`, `onRunEnd`, `onStatusChange`). It uses:
  - `useArcadeRun`, with the score computed at the end of the run;
  - `useRunTimer`;
  - `useRestoredSession` and `useSessionAutosave`;
  - `SaveBadge`, `KeyHelp`, `StatPanel` and `GameOverlay`.
- **Session:** saved after every action, including the setup, seed, deck position, full table state and log. Restore resumes at the exact decision point.
  - A guard validates the structure and **chip conservation** (stacks + all pots = players × 1 500).
  - It also rejects impossible states.
- `src/demo/HoldemDemo.tsx`: a bots-only 6-max table playing fast hands with the real engine and AI, with no side effects. `active` freezes it.
- **Registry:**
  - id `holdem`, name "Texas Hold'em", tag "Cards";
  - tagline "No-limit hold'em tournaments against bots with their own faces, styles and tells.";
  - accent `--game-holdem: #38bdf8`.
- **Portal integration:**
  - an icon (a card fan with a chip), `games.ts`, the `_config` cap of 5 000;
  - README family tables in all eleven repos;
  - landing copy "Eleven classics";
  - portal **v2.3.0**.

## Tests (minimum)

- **Hand evaluator:**
  - all 2 598 960 five-card hands produce the textbook category counts;
  - a 7-card best-hand test table;
  - tie-breaks and kickers.
- **Betting engine:**
  - heads-up blind and order rules;
  - minimum raise;
  - a short all-in does not reopen the betting;
  - side pots with 3–4 different all-ins;
  - an odd chip in a split pot;
  - eliminations on the same hand, ranked by starting stack.
- **Property test:** 1 000+ seeded bot-only hands. Chips are conserved, every hand ends, and a tournament always produces exactly one winner.
- **AI:** no reads of hidden cards (permutation test). The styles differ measurably (VPIP and aggression stats over simulated hands).
- **Scoring formula and run recording:**
  - a bust records once with the right place;
  - a win records the full share;
  - an abandoned tournament records nothing.
- **Session guard:** accepts its own snapshots and rejects tampered chips or cards.
- **Component tests:** setup screen, action bar with slider and presets, log entries, pause, restore.
- **Calibration script output** is checked into the repo. A test asserts that the table exists for every format/length pair.

## Repo and process

- **Starting point:** this game is built only after Nut Sort has shipped as portal v2.2.0, so the plan assumes ten games are already in place. If Nut Sort is dropped, the numbering changes to "tenth game" and v2.2.0.
- **GitHub and server steps:**
  - The builder creates the repo, pushes, updates the README tables and builds the deploy package. Zoltán previously authorised push and GitHub descriptions for this project.
  - The builder does **not** change the live `_config.php` without asking. The plan ends with a handoff line asking Zoltán to add `"holdem" => 5000`, and offers to do it through cPanel.

- New public GitHub repo `ZoliQua/Texas-Holdem-Game` with the community files, a README pointing to the portal and the sibling repos, and topics. Set up the same way as the other repos.
- All commits are by **Zoltán Dul <zoltan.dul@gmail.com>**, with no co-author or AI attribution.
- **My call:** they continue the dated timeline after Nut Sort, spread over 2026-11-23 … 2026-12-06, with the portal integration on the last day.
- After integration, a new deploy package `arcade-v2.3.0.zip` (portal only). The live `_config.php` needs `"holdem" => 5000`.

## Left to the builder

These are free choices as long as the decisions above hold:

- the internal module split;
- the character names and art;
- the preflop table contents;
- the animation timings within the speed settings;
- the copy of the call-outs;
- whether the equity work runs in a Web Worker;
- the exact phone layout.
