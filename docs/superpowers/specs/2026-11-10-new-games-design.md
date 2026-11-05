# Three new games: Minesweeper, Solitaire, Ulti — design

Status: approved in conversation (Zoltán Dul, 2026-10-25). Choices marked *(builder's call)* were not asked.
Every game follows the arcade contract (standalone repo + `apps/<id>` mirror, vendored kit, `useArcadeRun`,
autosave/resume, live demo, StatPanel), ships **en/hu/de** and **dental mode** from day one (see
`2026-11-05-arcade-v3-platform-design.md`), and is colour-blind safe (never colour alone).
Dates: Minesweeper 11-10 – 11-11, Solitaire 11-11 – 11-12, Ulti 11-13 – 11-14, portal integration on 11-14.

**Prerequisites:** this work starts only after the platform design is fully done (history re-dated and force-pushed,
kit i18n, the shared `arcade.dental` setting and the kit tooth icon set released in portal v3.0.0), so the new games
build against those kit APIs. Commits carry author **and** committer dates inside their window, made with the dated
commit helper, as Zoltán Dul only.

## Minesweeper (`minesweeper`, repo `Minesweeper-Game`)

**Modes (Zoltán's):**
- Classic sizes — Beginner 9×9 / 10 mines, Intermediate 16×16 / 40, Expert 30×16 / 99 (rotated to 16×30 on a
  portrait phone *(builder's call)*).
- **Hexagonal** mode: hex cells, 6 neighbours, with its own Beginner / Intermediate / Expert sizes and densities
  close to the classic ones *(builder's call)*.
- **Time attack** ("időre"): a countdown; solve as many boards as possible.

**Rules / my calls:** first click is never a mine (and opens an area); flag with right-click / long-press / F;
chord on a satisfied number; numbers drawn as digits (colour is extra only). Time attack: 3 minutes of Beginner-size
boards; each solved board scores, a mine loses that board with a time penalty and a fresh board follows. Classic
score from size and time; time attack score from boards solved. Seeded boards for tests. Demo: an autopilot solving
by logic.

**Dental mode:** mines are decayed teeth / bacteria, the flag a toothbrush, numbers unchanged.

## Solitaire (`solitaire`, repo `Solitaire-Game`)

**One game, three modes (Zoltán's):** Klondike, Spider, FreeCell.

**My calls:** Klondike draw-1 / draw-3; Spider 1 / 2 / 4 suits; FreeCell classic (4 cells, 4 foundations). Drag and
drop plus click-to-move, keyboard play, undo, auto-complete when only foundation moves remain, hint. Seeded deals;
FreeCell deal numbers. Score per mode from moves and time (no Vegas money). Deck: the Hold'em four-colour deck with
big pips by default, grey option — shared art, so the arcade's cards look like one family. Demo: autoplay of a
solvable deal.

**Dental mode:** tooth logo on the card backs (faces unchanged).

## Ulti (`ulti`, repo `Ulti-Game`)

**Table (Zoltán's):** the player and **2 bot opponents**, Hungarian 32-card deck.

**Bids (Zoltán's: the basic ones as Wikipedia describes them, no excess):** Passz (parti), Negyvenszáz, Húszszáz,
Ulti, Betli, Durchmars, colourless Betli and Durchmars, the **piros** (hearts trump) doubling, and **kontra**.
Combinations limited to the common ones (e.g. Ulti + Passz/Negyvenszáz) *(builder's call)*; no rekontra chains
beyond one level *(builder's call)*.

Precise reading *(builder's call)*: the source is the **Hungarian** Wikipedia "Ulti" article and its value table.
"Colourless" means the no-trump bids: Betli (always without trumps) and Színtelen durchmars. The open ("terített")
variants are out. The piros doubling applies to the trump bids (Passz, Negyvenszáz, Húszszáz, Ulti, Durchmars), not
to Betli or Színtelen durchmars.

**My calls:** standard bidding order with talon pick-up, bid values from the Wikipedia table, a session = a fixed
number of deals or a chip/point target; bots with the arcade's adjustable difficulty; a readable log of bids and
tricks. Score into the arcade from the player's net result. Demo: three bots playing.

**Card design (Zoltán's): the traditional Tell figures and the season aces, old-style look.** The artwork is our own
vector redraw of the public-domain 1835 Schneider József design (figures, layout and season scenes as in the
original); no scans of modern commercial decks. Suits — piros, tök, zöld, makk — are distinct shapes, so the deck
is colour-blind readable.

**Dental mode:** only the card backs and the players' figures change; the faces stay traditional.

**Players' figures** *(builder's call)*: Ulti gets its own three seat figures (the player and two named opponents)
drawn in the same old-style look as the deck, shown at the seats with name and score; in dental mode they wear
dental outfits (dentist, assistant, hygienist), as in the Hold'em dental figures.

## Left to the builder

Board generator details, solver/bot strategies, exact score formulas and `max_score` caps (to be added to
`_config.example.php` and handed to Zoltán for the live config), artwork details within the constraints above.
