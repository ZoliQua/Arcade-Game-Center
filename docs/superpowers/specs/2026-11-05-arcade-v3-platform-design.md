# Arcade v3 platform: dulzoltan.hu, languages, dental mode, history — design

Status: approved in conversation (Zoltán Dul, 2026-10-25). Choices marked *(builder's call)* were not asked; the rest
are Zoltán's.

## Why

Zoltán is a dentist. The arcade moves to his personal site (dulzoltan.hu), which is trilingual (hu/en/de), so the
games must speak Hungarian and German too, and every game gets a **dental mode** — "the little extra novelty" of his
arcade. The work history is compressed into one date window so the whole family reads as one autumn project.

## Goals

1. **Domain move**: the portal and its PHP API move from `drdul.hu/arcade` to `dulzoltan.hu/arcade`, verified live.
2. **Links**: every README / package description / docs mention of `drdul.hu/arcade` in all repos points to
   `https://dulzoltan.hu/arcade/` (including `#/play/<id>` deep links).
3. **dulzoltan.hu** (repo `/Users/Zoli/Sites/Personal-DulZoltan`, Next.js static export):
   - add the arcade to the existing `open-source` content (`https://dulzoltan.hu/fejlesztes/open-source/`);
   - a card page of its own (one small card per game, each linking to `dulzoltan.hu/arcade/#/play/<id>`), in hu/en/de
     like the site's other sub-pages;
   - a menu item under **Fejlesztés**, placed directly **above DenCT**. *(builder's call)* There is exactly one arcade
     entry in the menu: the card page itself (a normal `SUBPAGES.dev` page), ordered so it sits directly above the
     hand-added DenCT item; the card page then links into the portal. No second, external portal link in the menu.
4. **Analytics**: the portal dist loads the site's Google Tag Manager container `GTM-MTSQ5JGF` (same snippet as
   `site/app/layout.tsx`), so arcade traffic lands in the same property. *(builder's call)* On every hash-route change
   the portal pushes a `dataLayer` virtual page view (`event: 'arcade_page_view'`, `page_path: '/arcade/play/<id>'`,
   `page_title`), so per-game traffic is visible once the GTM container has a matching trigger (container
   configuration is Zoltán's, outside the repos).
5. **Languages**: English, Hungarian, German in **every** game, standalone and in the portal.
6. **Dental mode** in **every** game (spec below).
7. **History**: every commit made in this project on 2026-10-24 and later is re-dated into **2026-10-25 … 2026-11-14**,
   order preserved, in all game repos and the portal — and all future work (this design and the three new games)
   must also land inside that window.

## Non-goals / anti-goals

- No rule or scoring change from dental mode or language — they are presentation only (stats, saves, leaderboard
  unaffected; a run started in one language/mode continues in another).
- Dental mode never relies on colour alone (Zoltán is colour-blind): every themed element differs in shape too.
- No server-side language detection; no new backend.
- The Strategy-Game repo is untouched.
- The live `_config.php` secrets are never overwritten; the DB is not migrated (same DB, same credentials).

## 1. Domain move (live)

- cPanel account `fogorvosa`; dulzoltan.hu's document root is looked up via `DomainInfo/domains_data` (drdul.hu's was
  `/home/fogorvosa/drdul.hu`, not `public_html`).
- Copy `drdul.hu/arcade/` (portal **and** `api/`, including the live `_config.php`) to `<dulzoltan root>/arcade/`.
  The API base baked into the bundle becomes `https://dulzoltan.hu/arcade/api` (the portal `.env` / build config).
- Browser data (local stats, autosaves, nickname, settings) is **not** migrated: players start fresh on dulzoltan.hu
  (Zoltán's decision); the server-side leaderboard is kept.
- Old URL: `drdul.hu/arcade/` gets a 301 to `https://dulzoltan.hu/arcade/` (path-preserving; the `#/play/…` hash
  survives the redirect in browsers). The old `api/` stays in place (untouched) until Zoltán decides to remove it
  *(builder's call: no deletion — deletions are Zoltán's to make)*.
- Verify live: landing shows all games, demos animate, a game plays, leaderboard GETs answer for every game id,
  `_config.php` returns 403, GTM loads, no console errors.

## 2. Languages

- **Kit-level i18n** in `packages/kit/src` (vendored as `src/arcade/` everywhere): a tiny typed dictionary helper,
  no i18n library *(builder's call)*. Each game owns its strings (`src/i18n.ts`: `en`, `hu`, `de`, same keys, typed so
  a missing key fails `typecheck`); shared UI (StatPanel, GameOverlay, KeyHelp, SaveBadge, portal chrome) lives in the
  kit/portal dictionaries.
- **Resolution order** *(builder's call)*: `?lang=hu|en|de` in the URL (also inside the hash route) → saved choice
  (`arcade.lang`, shared by all games on the same origin) → browser language → English. A `?lang=` is saved, so the
  choice sticks after the first click from dulzoltan.hu.
- **Switcher**: an icon button (language code/globe) in the portal top bar **directly before the Settings icon**,
  and a language row in Settings; each standalone game has the same icon in its header and the row in its settings
  panel.
- **dulzoltan.hu hand-off**: every arcade link on the site carries the page's locale and dental mode
  (`?lang=hu|en|de&dental=1`).
- Game names follow established local names where they exist *(builder's call)*: e.g. Gomoku → „Amőba” (hu),
  Minesweeper → „Aknakereső” / „Minesweeper”, Connect Four → „Négy a sorban” / „Vier gewinnt”; others stay.
- `<html lang>` and document titles follow the language; numbers use the locale's grouping.

## 3. Dental mode

- **Default off** (Zoltán's decision). Links from dulzoltan.hu add `&dental=1` (next to `?lang=`), which turns it on
  and is saved; the visitor can turn it off any time. `?dental=0` turns it off.
- One **shared** preference `arcade.dental` (boolean) in the kit *(builder's call)*: toggled in the portal Settings
  **and** in every game's own settings panel; standalone games honour it too. Works on top of every theme (dark/light,
  neon/glass, table themes).
- Settings label: „Fogas mód” / "Dental mode" / „Zahnmodus”, with a one-line description.
- Visual vocabulary: teeth (incl. smiling teeth), toothbrush, toothpaste, probe, bacteria/caries, crowns, implants —
  matching each game's own style, nothing far-fetched. One shared tooth SVG family in the kit (incisor, molar,
  smiling tooth, crown, brush, paste, probe, germ), so the games look related.

| Game | Dental mode (approved) |
|---|---|
| Tetris | every cell is a small tooth in the piece's colour; a cleared line flashes "brushed clean" |
| Snake | head is a smiling tooth, body a row of teeth, food a toothpaste drop |
| 2048 | numbers stay; tile art grows: milk tooth → permanent → shiny … → 2048 golden crown |
| Pac-Man | **new** dental theme next to the existing `fog` (= mist) theme, which stays: Pac-Man a smiling tooth, dots toothpaste, power pellet a toothbrush, ghosts bacteria. *(builder's call)* The picker shows Normal / Fog / Dental; choosing Dental turns `arcade.dental` on, choosing another turns it off, and turning `arcade.dental` on elsewhere selects Dental here |
| Breakout | paddle a toothbrush, ball a toothpaste ball, bricks tartar/plaque with brush / paste / probe marks (distinct shapes) |
| Space Invaders | invaders bacteria, player a toothbrush cannon shooting toothpaste, bunkers teeth that erode like caries |
| Gomoku, Tic-Tac-Toe | existing tooth pieces stay; only the settings control is reworded to the shared "Dental mode" toggle |
| Connect Four | discs are teeth: incisor vs molar silhouettes (shape, not just colour) |
| Nut Sort | bolts are implant posts, nuts are crowns; width + notch coding unchanged |
| Texas Hold'em | *(builder's call: while dental mode is on, the clinic style replaces the chosen table theme; off restores it)* mint/white "clinic" table style; characters re-skinned as dental figures (dentist, assistant, hygienist, patient with braces, tooth fairy …) keeping their tells; tooth logo on card backs |

New games get dental mode from day one (see the new-games design).

## 4. History re-dating

- Scope: in each repo, the commits authored 2026-10-24 or later (this project's commits). Older history is untouched.
- Mapping *(builder's call)*: one global calendar so cross-repo order still makes sense —

| Work | Old dates | New window |
|---|---|---|
| v2 unification (kit, sync, docs) | 2026-10-24 | 10-25 – 10-26 |
| v2.1: Breakout, Space Invaders, Connect Four, portal 2.1.0, 2.1.1 | 10-31 – 11-15 | 10-27 – 10-29 |
| Nut Sort + portal 2.2.0 | 11-16 – 11-22 | 10-30 – 11-01 |
| Texas Hold'em + portal 2.3.0 | 11-23 – 12-06 | 11-02 – 11-04 |
| this design: move, links, site, GTM, languages, dental | — | 11-05 – 11-09 |
| Minesweeper, Solitaire, Ulti | — | 11-10 – 11-14 |

- Within a block, commits keep their order and relative spacing (squeezed linearly), working hours 09:00–19:00,
  author and committer `Zoltán Dul <zoltan.dul@gmail.com>`, both dates set, no AI attribution (unchanged rule).
- CHANGELOG dates, plan/spec filenames and dates inside docs are updated to the new calendar in a follow-up commit.
- Pushing requires `--force-with-lease` on every affected repo — **asked explicitly before running**. A local
  backup bundle of every repo is made first.
- Repos where *all* commits are ours (Breakout, Space Invaders, Connect Four, Nut Sort, Texas Hold'em) are re-dated
  completely.

## 5. Order of work

1. Backup bundles → history re-dating → confirm → force-push → CI green.
2. Domain move + links + GTM (portal v3.0.0 start), dulzoltan.hu content + menu (site repo, normal current dates —
   that repo is not a game repo *(builder's call)*).
3. Languages (kit first, then games).
4. Dental mode (kit icons first, then games).
5. Release portal **v3.0.0**, every game a minor version bump, deploy, live check.
6. New games (separate design).

## Left to the builder

Exact dictionary structure, icon artwork details, the date-squeezing script, translation wording (natural, not
literal), where in each game's settings panel the toggles sit.
