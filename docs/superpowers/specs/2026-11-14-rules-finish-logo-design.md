# Arcade v3.2 — rules, finish early, mobile, logo, Hungarian deck, Snapszer

Status: draft for Zoltán's review. Git dates: every commit 2026-11-14 18:30–19:00 (+0100), inside the
existing 10-25…11-14 window (Zoltán's choice). Live portal today: v3.1.0.

## Why

Zoltán's wishes after v3.1 went live:

1. Every game gets a visible **Rules** button (hu „Szabályok”, en "Rules", de „Regeln”) that explains in
   detail, with pictures where they help, how the game works and what the player must follow.
2. Every game can be **finished early**; the score at that moment goes on the leaderboard, even 0.
   Nut Sort was the trigger, but it applies to all fourteen.
3. In the portal's left sidebar the **game list is collapsible**.
4. The new **logo package** (`docs/arcade-logo/`) is used everywhere in the portal, starting with the favicon.
5. **Mobile:** Zoltán tests on an iPhone and most games are unusable on touch screens today. Every game
   must be playable by touch/tap alone, fit the phone screen, and be expandable to full screen. The Rules
   dialog explains the touch controls, on touch devices only.
6. The Ulti deck takes **tomasdrus/hungarian-playing-cards as a visual reference only**. That repo has no
   licence and its images are scans of a printed deck, so nothing from it is copied, traced or bundled.
   Our own SVG deck gets closer to a real Hungarian deck instead.
7. A new game, **Snapszer**, with the same Hungarian deck as Ulti and its own rules (§7).

Anti-goals: a game that needs a keyboard on a phone; page scrolling or zooming while playing; rules text that is a wall of words nobody reads; a finish button that is easy to hit by
accident; any information carried by colour alone (Zoltán is colour-blind); losing a running game when the
rules are opened.

## 1. Rules dialog (kit)

- Kit component `RulesButton` + `RulesDialog` in `packages/kit/src/components/Rules.tsx`, vendored into
  every game as usual. The button carries a book/question icon plus the visible word („Szabályok” / "Rules" /
  „Regeln”), sits in the game's control strip next to the existing buttons, standalone and inside the
  portal alike, and has the hotkey **R** (H is already help in some games — check per game; if R is taken,
  the button alone is enough).
- Opening the dialog pauses a running game (same mechanism as the existing pause) and closing does not
  auto-resume; Escape and a Close button close it; focus is trapped and returns to the button.
- Content is per game, in `src/rules.tsx` of each game: an array of sections, each with a heading and
  short paragraphs or bullet lists, in en/hu/de through the game's own `Messages` (so the existing
  "all keys non-empty in three languages" test covers it). Fixed section order:
  1. **Goal** — one or two sentences.
  2. **How to play** — controls for keyboard, mouse and touch.
  3. **Rules** — what is allowed and what is not (the "what you must follow" part).
  4. **Scoring** — exactly how points are counted, with the real numbers from the game's scoring code
     (par times, multipliers, caps). Ends with one line on finishing early (section 2 below).
  5. **Dental mode** — what each piece becomes.
- **Pictures:** each game has at least one small inline SVG diagram drawn with the game's own pieces
  (e.g. Tetris: a full line clearing; 2048: two 8s merging; Connect Four/Gomoku/TTT: a winning line;
  Minesweeper: a "2" with its two neighbouring mines; Klondike: alternating red/black run with the suit
  symbols; Ulti: card ranking strip and the bid value table; Nut Sort: a legal and an illegal move with
  ✓/✗ marks; Hold'em: hand ranking ladder). Diagrams follow dental mode and never rely on colour alone.
- Existing rule fragments (Solitaire's `rulesKlondike…`, Ulti's bid list panel) are reused, not duplicated.

## 2. Finish early

- Kit `useArcadeRun` gains `finish()`: moves a running or paused run to `gameOver` with outcome
  `'finished'`, `ranked: true`. A finished run reports its score even when it is **0**
  (`onGameOver(score)` is called for `score >= 0` on finished runs; natural game overs keep the
  current `> 0` rule so a crash in the first second does not fill the board with zeros — my call).
- The portal's `useScoreSubmitter` accepts 0 for finished runs; the server already accepts 0
  (`arcade_is_score_sane`: `0 ≤ score ≤ max`). The pending-nickname prompt works the same way.
- UI: a visible **„Befejezés” / "Finish" / „Beenden”** button in each game while a run is active, with an
  in-page confirm (no browser dialog): „Befejezed a játékot? {score} pont kerül a ranglistára.” with
  „Befejezem” / „Mégse”. The game-over card then says the run was finished early.
- Score submitted = the score the game shows in its Score panel at that moment. Per game this means:
  arcade games (Tetris, Snake, 2048, Pac-Man, Breakout, Invaders) their running score; Nut Sort points of
  the levels solved so far; Minesweeper classic 0 (only a cleared board scores), time attack the points so
  far; Solitaire 0 (only wins score); Hold'em the tournament score for the current standing; Ulti the
  session score of the deals played so far; Gomoku/TTT/Connect Four the current round score (0 mid-round).
  Each game's Scoring section states its own case.
- Finishing removes the autosave like any game over. The existing "abandon on mode switch" stays unranked.

## 3. Collapsible game list (portal sidebar)

- The "Games" section label becomes a toggle button with a chevron and `aria-expanded`; the state is kept
  in `arcade.sidebarGamesCollapsed` (localStorage, per viewer).
- Collapsed: only the game currently being played stays visible under the label (my call, so the active
  page never disappears from the nav). Expanded: all fourteen as now.
- In the narrow icon-rail mode the toggle shows as a chevron icon with a tooltip.

## 4. Logo package (portal only)

- Source files stay in `docs/arcade-logo/` (committed). Portal uses them:
  - `favicon.svg` = `arcade-mark.svg`; PNG fallbacks 32/180 (apple-touch-icon) and 192/512 for
    `manifest.webmanifest`, generated from `arcade-mark-1024.png`.
  - Sidebar brand: the mark replaces `IconLogo`; the text "Zoltan's Arcade" stays as live text.
  - `og:image` / `twitter:image` = `social-card-1200.png`, with `og:title`/`og:description`.
  - AGC README header uses the wordmark (`arcade-wordmark-dark.svg` on light, `-light` on dark via
    `<picture>` with `prefers-color-scheme`).
- Standalone game repos keep their own icons (Zoltán's choice).

## 5. Hungarian deck, closer to the real thing (shared by Ulti and Snapszer)

The deck moves from `Ulti-Game/src/deck` into the kit (`packages/kit/src/hungarian/`: `HungarianCard`, art,
`hCardLabel`), so Ulti and Snapszer draw exactly the same cards. Tree-shaking keeps it out of the other
games' bundles. Ulti keeps its dev gallery (`?gallery=1`), now importing from `./arcade`.

Reference: the layout of a real Hungarian / Tell deck as seen in tomasdrus/hungarian-playing-cards and
public descriptions (Hungarian Wikipedia „Magyar kártya”). Our own vector drawing, no copying. Changes:

- **Double-headed court cards and aces**: upper half mirrored to the lower half, like the real deck.
- **Four different figures per court rank** (Alsó, Felső) following the traditional Tell characters
  (names per the Hungarian Wikipedia table), not one figure recoloured per suit. Each card keeps its
  name in the accessible label.
- **Mounted kings** (király on horseback), as on the real deck.
- **Aces as full season scenes** (Nyár, Ősz, Tavasz, Tél) with the season banner, double-headed.
- **Number cards**: pips in the traditional columns with mirrored corner numerals (VII…X) and a small
  landscape/ornament vignette in the middle on VII–X.
- Keeps: the old-fashioned cream look, suit shapes that differ in outline (not colour only), the dental
  back, and the 100 × 160 viewBox so nothing else in Ulti changes. Bundle impact stays small (SVG).
- The dev gallery (`?gallery=1`) is the review surface; Zoltán approves it before the Ulti release.

## 6. Mobile and touch (all games + portal)

Today (code survey): Tetris, Snake and Pac-Man have no touch input at all; 2048 has swipe; Breakout,
Invaders, Minesweeper and Solitaire have some pointer handling; the board and card games rely on clicks;
no game has full screen.

**Kit**
- `useIsTouch()` = `matchMedia('(pointer: coarse)')` (live, also true for touch laptops in tablet mode).
- `useSwipe(ref, onSwipe, { threshold })` and `TouchPad` (on-screen D-pad / action buttons, ≥ 48 px
  targets, shapes + labels, never colour only), shared by the action games.
- `FullscreenButton` + `useImmersive()`: uses the Fullscreen API where it exists (Android, iPad, desktop);
  where it does not (iPhone Safari) it switches to an **immersive mode**: the game fills the viewport
  (`position: fixed; inset: 0; height: 100dvh`, safe-area insets), portal sidebar/header and page chrome
  hidden, page scroll locked. Exit button always visible. On iPhone the Rules → Mobile section adds one line:
  for no browser bars at all, use Share → „Add to Home Screen” (the portal ships a web manifest with
  `display: standalone` and the new logo icons, see §4).
- Board areas get `touch-action: none` (or `manipulation` for tap-only boards) so swipes do not scroll the
  page and double-tap does not zoom; no 300 ms delay; text never under 16 px in inputs (no iOS auto-zoom).
- `KeyHelp` (keyboard hints) is hidden on touch devices; a touch hint line takes its place in the idle overlay.

**Per game (touch scheme)**
- Tetris: on-screen pad ◀ ▶ ⟳ ▼ ⤓, plus gestures on the board: tap = rotate, horizontal drag = move by
  cells, swipe down = soft drop, quick flick down = hard drop.
- Snake, Pac-Man: swipe on the board + on-screen D-pad (turns are queued as with keys).
- 2048: existing swipe, verified on iOS (no page scroll, no pull-to-refresh).
- Breakout: drag anywhere below the bricks to move the paddle, tap to launch.
- Space Invaders: drag to move, fire button (hold = auto-fire at the normal rate).
- Gomoku, Tic-Tac-Toe, Connect Four: tap; Connect Four tap anywhere in a column. Gomoku: cells ≥ 24 px at
  360 px width, last move clearly marked.
- Nut Sort: tap source, tap target (already click based) — targets enlarged to ≥ 44 px.
- Minesweeper: tap = open, long-press (400 ms, with a short vibration where supported) = flag, plus a
  visible „Zászló” mode toggle; boards wider than the screen scroll inside their frame (pan), not the page.
- Solitaire: tap a card to select, tap a destination to move; double-tap sends to foundation; Spider and
  FreeCell columns fit 360 px (overlap tightened on narrow screens).
- Hold'em, Ulti: action buttons in a thumb-reachable bottom bar; Ulti's 12-card hand as an overlapping fan
  that still shows every card's rank and suit; tap to select, tap again to play.

**Layout**
- Portal: below 900 px the sidebar becomes a slide-in drawer (hamburger in the header); the game page uses
  the full width; stats panel moves below or collapses into a compact strip.
- Standalone games: same compact layout rules from the kit CSS.
- Portrait first (360–430 px wide); landscape works too.

**Rules dialog on touch devices**: an extra section „Mobilon” / "On mobile" / „Auf dem Handy” with the
game's touch controls (short list + a small gesture diagram) and the full-screen tip. Not rendered on
desktop (fine pointer); the „How to play” section shows keyboard/mouse on desktop and touch on mobile.

**Testing**: unit tests for `useSwipe`, long-press and immersive mode; a Playwright (Chromium, iPhone 13
emulation: 390 × 844, `hasTouch`, `isMobile`) smoke run per game: open, start, play a few touch moves,
open Rules, enter/exit full screen, no horizontal page scroll. Real-device check on Zoltán's iPhone before
release (I cannot run real iOS Safari).

## 7. Snapszer (new game, id `snapszer`)

Zoltán's choices: two-player **and** three-player mode (modes inside one game, like Solitaire), the **full
Hungarian rules**, and the **nine** as an optional extra trump (setting, off by default). Rules source:
Hungarian Wikipedia „Snapszer” (read by the builder; where it is silent the builder decides and records it).

- Names: hu „Snapszer”, en "Snapszer", de „Schnapsen”; tag Cards; new repo `ZoliQua/Snapszer-Game`
  (public, MIT, community files from `repo-docs.mjs`), mirrored as `apps/snapszer`.
- **Two-player (you vs one computer opponent):** 20 cards (A, X, K, F, Alsó per suit; with the nine setting 24,
  the nine worth 0). Card values A 11, X 10, K 4, F 3, Alsó 2. Deal 3 + turn-up trump + 2; talon face down on
  the trump. Marriages 20 / 40 (trump), counted only once the announcer has won a trick; one marriage per
  turn, then the K or F must be played. Trump exchange with the trump Alsó and closing (betakarás) only on
  your turn and only while ≥ 3 cards lie on the talon above the trump. Open talon: following and
  overtrumping optional; closed or empty talon: must follow suit, must beat, else must trump, else any card.
  Reaching 66 → „Elég!” / „Kész!” button (the bot declares as soon as it can); if nobody declares, the last
  trick wins. Deal points: 1 unit; 2 if the loser has under 33 („maccs”); 3 if the loser took no trick
  („csendes snapszer”); closer fails to reach 66 → the opponent scores as the wiki says. Snapszer
  announcement (right after the deal, first round, both players may): 6 units to the winner, or to the
  opponent if it fails. Kontra doubles the deal or the snapszer. Match („rádli”) to 7 units.
- **Three-player (you and two computer opponents; the caller plays alone against the other two):** 24 cards (nines in), 8 each in 4 + 4, the caller names
  trump from the first four, may fold before the first lead (opponents get 2, or 4 if the caller holds an
  ace), only the caller may announce snapszer, must follow and beat; caller rotates. Match to 7 units.
- **Opponents:** easy / medium / hard bots like Ulti (hard = sampling of unseen cards within a time budget),
  names and portraits of their own; dental mode changes only the card back and the players (same rule as
  Ulti, Zoltán's earlier choice).
- **Score** (leaderboard): at match end `round((max(0, yourUnits − bestOpponentUnits) × 100 + (won ? 500 : 0)) × level)`,
  level easy 1 / medium 1.5 / hard 2, clamped to 0…5000 game-side; `max_score` 5000. Finish early uses the
  same formula with `won = false`.
- Everything else as every game: autosave, Rules dialog (incl. a card-value and deal-points diagram),
  Finish, touch (tap to select, tap again to play; Elég/Kész, exchange, close, 20/40, kontra as bottom-bar
  buttons), full screen, en/hu/de, demo for the portal card, portal + dulzoltan.hu card („Tizenöt
  klasszikus…”), live `_config.php` entry.

## 8. Three-language READMEs (all sixteen repos: AGC + fifteen games)

`README.md` stays English and is the base; `README.de.md` and `README.hu.md` are complete translations of the
whole README (Zoltán's wish: the full repo description, not a summary). Right under the title every file has the
same language line, current language bold: `**English** · [Deutsch](README.de.md) · [Magyar](README.hu.md)`.
Links to the other repos and to the Arcade work in all three. Community files (Code of Conduct, Contributing,
Security, License) stay English.

## Versions and release

Portal v3.2.0; each game a minor release (x.y+1.0) for rules + finish; Ulti also gets the deck.
Everything mirrored into AGC, all fifteen repos pushed, CI green, then deployed live the same way as v3.1.

## Decisions settled after the builder check (my calls, for Zoltán to check)

- **Zero scores:** `onGameOver(score, { finished: true })` — an optional second argument, so the 14 games
  and the standalone contract stay compatible. The portal submits 0 only when `finished` is set. The
  leaderboard already shows each player's best (`MAX(score)` per name), so a 0 never replaces or hides a
  real score; the server (`leaderboard.php`, `score.php`, rate limit per hour) needs no change.
- **No free entries:** Finish is shown only after the run has really started (first move/tick), so
  start-and-finish spam is pointless; the existing hourly rate limit still applies.
- **Finish ends the whole run** (match, tournament, session), never just a round. Outcome `'finished'`
  counts as a play in stats, never as a win. Turn-based games and timers: finishing and the Rules dialog
  both use the game's pause path; games without a pause stop their timer while the dialog is open.
  Hold'em: score = the existing tournament formula with the player's current place among remaining seats.
  Ulti: the existing session score over the deals played. Nut Sort: the displayed score. Each game gets a
  test that `finish()` submits exactly the Score-panel value.
- **Rules numbers:** each game's Scoring section reads its numbers from the same constants the scoring code
  uses (interpolated into the message), so they cannot drift. Every game has a dental mode, so every game
  has the Dental section. Zoltán reads the hu text in the browser before release.
- **Hotkey:** R where free; where R is taken (e.g. restart), the button alone. On narrow widths the button
  keeps its icon and the word stays as `aria-label` + tooltip.
- **Sidebar:** collapsed with no active game shows no games; the toggle is a real button (Enter/Space),
  tooltip in rail mode.
- **Logo:** PNGs generated once with `sips` from `arcade-mark-1024.png` and committed; one favicon (the mark
  works on light and dark); og:title "Zoltan's Arcade", og:description = the portal tagline per language
  default (en). Standalone READMEs unchanged.
- **Ulti deck:** the other thirteen games ship without waiting; the Ulti release waits for Zoltán's
  approval of the gallery. Figure names per suit taken from Hungarian Wikipedia „Magyar kártya” and listed
  in the gallery captions for his check. Mirrored corner numerals fit inside the existing 100 × 160 viewBox;
  existing HungarianCard tests are updated where they pin the old layout.
- **Dates:** one or two commits per repo, spread 18:30–18:59 on 11-14, each repo's commits in order.

## Left to the builder

Exact wording of the rules (natural hu/de, tegező/du form), diagram drawing details, icon for the rules
button, whether a game needs extra hotkey changes.
