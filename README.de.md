<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/arcade-logo/arcade-wordmark-light.svg">
    <img src="docs/arcade-logo/arcade-wordmark-dark.svg" alt="Zoltan's Arcade" width="420">
  </picture>
</p>

# 🕹️ Zoltan's Arcade — Arcade-Game-Center

[English](README.md) · **Deutsch** · [Magyar](README.hu.md)

Ein Portal für fünfzehn Browserspiele — **Tetris, Snake, 2048, Pac-Man, Gomoku, Tic-Tac-Toe, Breakout, Space Invaders,
Vier gewinnt (Connect Four), Nut Sort, Texas Hold'em, Minesweeper, Solitaire, Ulti und Snapszer (Schnapsen)** — mit einem
Designsystem, einem Punktemodell, Autospeichern & Fortsetzen, laufenden Attract-Mode-Demos auf der Startseite und einer
globalen Bestenliste. In jedem Spiel sind die Regeln nur einen Tipp entfernt, du kannst jede Runde vorzeitig beenden und
trotzdem in die Bestenliste kommen, und auf dem Handy spielt sich alles per Touch und im Vollbild. Jedes Spiel ist
außerdem ein **eigenes Repository**, das eigenständig baut und läuft.

[![CI](https://github.com/ZoliQua/Arcade-Game-Center/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Arcade-Game-Center/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

Live: **https://dulzoltan.hu/arcade/**

---

## 📑 Inhaltsverzeichnis

- [Die Spiele](#-die-spiele)
- [Funktionen](#-funktionen)
- [Schnellstart](#-schnellstart)
- [Aufbau des Repositorys](#%EF%B8%8F-aufbau-des-repositorys)
- [Das gemeinsame Kit](#-das-gemeinsame-kit-arcadekit)
- [Punkte, Statistik & Spielstände](#-punkte-statistik--spielstände)
- [Die eigenständigen Repos synchron halten](#-die-eigenständigen-repos-synchron-halten)
- [Bestenlisten-API](#-bestenlisten-api)
- [Skripte](#-skripte)
- [Deployment](#-deployment)
- [Mitwirken](#-mitwirken)
- [Lizenz](#%EF%B8%8F-lizenz)

## 🎮 Die Spiele

| Spiel | Eigenständiges Repo | Genre | Im Portal |
| --- | --- | --- | --- |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade — SRS-Rotation, 7er-Beutel, Halten, Geisterstein, Lock-Delay | `apps/tetris` |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reaktion — Tempo 1–10, Durchgang durch die Wand | `apps/snake` |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle — Wischen, Rückgängig, Animationen | `apps/2048` |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Labyrinth — vier Geister-KIs, Kraftpillen, Level | `apps/pacman` |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategie — 15×15, α-β-Minimax-KI | `apps/gomoku` |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duell — Zahn- oder X/O-Zeichen, unschlagbare KI | `apps/tictactoe` |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Schläger — Ball mit Swept-Kollision, Power-ups, Multiball, Level-Schleife | `apps/breakout` |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter — marschierende Wellen, bröckelnde Bunker, Mystery-UFO | `apps/invaders` |
| 🔴 Vier gewinnt | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duell — 7×6, Bitboard-Negamax-KI | `apps/connect4` |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Sortieren — 20 feste Level mit bewiesenem Par, Formen-Codierung für Farbenblinde | `apps/nutsort` |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Karten — No-Limit-Sit-&-Go gegen 15 Charaktere mit Spielstil und Tells | `apps/holdem` |
| 💣 Minesweeper | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logik — klassische, sechseckige und Zeitangriff-Felder, sicherer erster Klick | `apps/minesweeper` |
| ♠️ Solitaire | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Karten — Klondike, Spider und FreeCell mit Tipps, Rückgängig und Auto-Abschluss | `apps/solitaire` |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Karten — der ungarische Klassiker zu dritt gegen zwei Bots, Tell-Blatt nach 1835 neu gezeichnet | `apps/ulti` |
| 🂡 Snapszer | [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) | Karten — das ungarische Rennen auf 66 zu zweit oder zu dritt, Ansagen, Zudrehen, Kontra | `apps/snapszer` |

## ✨ Funktionen

- 🏠 **Startseite mit echten Miniaturen** — jede Karte lässt die echte Spiel-Engine mit Autopilot / KI laufen (Attract-Mode); Demos pausieren außerhalb des Bildschirms und beachten *reduzierte Bewegung*
- 📖 **Regeln in jedem Spiel** — ein „Szabályok“ / "Rules" / „Regeln“-Knopf zeigt Ziel, Spielweise, Regeln, Punkte (Zahlen aus den Konstanten des Spiels berechnet), den Zahnmodus und auf Touch-Geräten den Abschnitt „Auf dem Handy“
- 🏁 **Vorzeitig beenden** — „Befejezés“ / "Finish" / „Beenden“ beendet eine Runde nach einer Bestätigung auf der Seite und wertet den bis dahin erreichten Punktestand (Ulti und Snapszer zwischen zwei Spielen)
- 📱 **Touch und Vollbild** — Wischen, Tippen, langes Drücken und Bildschirm-Tasten in jedem Spiel, daumengroße Ziele, kein Seiten-Scrollen, solange ein Finger auf dem Spielfeld liegt; der Vollbild-Knopf nutzt die echte Fullscreen-API, wo es sie gibt, und auf dem iPhone einen Immersiv-Modus, der die Safe Area beachtet
- 💾 **Autospeichern & Fortsetzen** — verlass ein Spiel mitten in der Runde, lade neu, wechsle das Spiel: die Runde wird pausiert wiederhergestellt (*Willkommen zurück*); eine Leiste *Weiterspielen* listet die gespeicherten Runden
- 🏆 **Ein Punktemodell** — jede beendete Runde wird genau einmal nach denselben Regeln erfasst (Bestwert, Spiele, Siege, Gesamtpunkte, Spielzeit); Duellspiele teilen sich eine Formel für Rundenpunkte
- 🧭 **Hash-Routing** — `#/play/snake`, `#/leaderboard`, `#/settings`: Neuladen, Lesezeichen und der Zurück-Knopf funktionieren einfach
- 🌍 **Drei Sprachen** — Englisch, Ungarisch und Deutsch in jedem Spiel und im Portal, über die obere Leiste oder die Einstellungen; `?lang=en|hu|de` übergibt die Sprache per Link, und Zahlen folgen der Gruppierung der Sprache
- 🦷 **Zahnmodus** — ein Schalter „Fogas mód“ / "Dental mode" / „Zahnmodus“, standardmäßig aus (oder `?dental=1`), gemeinsam für das Portal und alle fünfzehn Spiele, jedes neu eingekleidet mit Zähnen, Zahnbürsten und Zahnpasta; nur Darstellung
- 🌗 **Ein Designsystem** — Tokens und `arc-*`-Komponenten, gemeinsam für Portal und alle Spiele, dunkles & helles Theme (**T**), über Tabs hinweg synchron
- 📊 **Live-Kopfzeile** — Status, Punkte und Spielzeit kommen direkt aus dem laufenden Spiel
- 🌍 **Globale Bestenliste** — kleine PHP- + MySQL-API mit Rate-Limit und Plausibilitätsgrenzen
- ⌨️ **Tastatur zuerst, überall dieselben Tasten** — **P/Esc** Pause, **R** Neustart, **T** Theme, **?** Hilfe
- 🧪 **Getestet** — Kit, Spiele und Portal in einem Vitest-Lauf; CI auf Node 20 & 22

## 🚀 Schnellstart

```bash
git clone https://github.com/ZoliQua/Arcade-Game-Center.git
cd Arcade-Game-Center
npm install
npm run dev                       # Portal unter http://localhost:5173
npm run dev:game @arcade/gomoku   # jedes Spiel für sich, direkt aus apps/
```

## 🗂️ Aufbau des Repositorys

```
apps/
  portal/        @arcade/portal    die Vite-App für die Spieler (Startseite, Spielen, Bestenliste, Einstellungen)
  tetris/ snake/ 2048/ pacman/ gomoku/ tictactoe/ breakout/ invaders/ connect4/ nutsort/ holdem/
  minesweeper/ solitaire/ ulti/ snapszer/
                 @arcade/<id>      Spiegel jedes eigenständigen Repos: src/, index.html, public/, vite.config.ts
packages/
  kit/           @arcade/kit       gemeinsame Laufzeit: Statistik, Spielstände, Theme, Hooks, Touch, Vollbild, Regeln, Beenden, ungarisches Blatt, arcade.css
  ui/            @arcade/ui        nur fürs Portal: Seitenleiste, Kopfzeile, Icons, Portal-/Startseiten-CSS
arcade-api/                        PHP-Bestenlisten-API (score.php, leaderboard.php)
scripts/
  sync-games.mjs                   Kit → Spiele, Spiel-Repo ⇄ apps/<id>, Abweichungsprüfung
  write-app-manifests.mjs          erzeugt apps/<id>/package.json + tsconfig.json
  repo-docs.mjs                    schreibt die gemeinsamen Community-Dateien in jedes Repo
  mobile-smoke.mjs                 Headless-iPhone-Smoke-Test jedes Spiels im gebauten Portal (nicht in der CI)
docs/                              DEPLOY.md, ADDING-A-GAME.md, history/
```

Jedes Spiel exportiert denselben Vertrag: `<XxxGame embedded onGameOver onRunEnd onStatusChange />` und `<XxxDemo active />`
(`ArcadeGameProps` / `ArcadeDemoProps` in [`packages/kit/src/types.ts`](./packages/kit/src/types.ts)).

## 🧰 Das gemeinsame Kit (`@arcade/kit`)

[`packages/kit/src`](./packages/kit/src) ist die einzige Quelle für alles, was die Spiele gemeinsam haben. Weil jedes
Spiel auch allein bauen muss, wird das Kit in jedes Spiel als `src/arcade/` **vendored** — Byte für Byte, dort nie
bearbeitet. Im Portal leitet ein kleines Vite-Plugin alle Kopien zurück auf `packages/kit`, damit das Bundle es nur einmal enthält.

| Modul | Was es tut |
| --- | --- |
| `stats.ts` | `recordRun`, `readStats`, `summarize`, `resetStats` — das eine Punktemodell, migriert alte `<id>.highScore`-Schlüssel |
| `session.ts` | `saveSession`, `loadSession` (Schema-versioniert, validiert, 30 Tage gültig), `peekSession`, `clearSession` |
| `hooks.ts` | `useArcadeRun`, `useSessionAutosave`, `useRestoredSession`, `useRunTimer`, `useGameStats`, `useArcadeTheme`, `useInView` |
| `scoring.ts` | `duelRoundScore` für Gomoku, Tic-Tac-Toe & Vier gewinnt |
| `touch.ts` | `useIsTouch`, `useSwipe`, `useLongPress` — Gesten für Spielfelder mit `.arc-board-touch` / `.arc-board-tap` |
| `immersive.ts` | `useImmersive` — natives Vollbild oder auf dem iPhone der CSS-Immersiv-Modus (`html[data-arcade-immersive]`) |
| `components/` | `StatPanel`, `GameOverlay`, `SaveBadge`, `KeyHelp`, `StatusPill`, `ArcadeShell` (Seitenrahmen im Einzelbetrieb), `RulesButton`, `FinishButton`, `FullscreenButton`, `TouchPad`, `TouchHelp`, `PlayingCard` |
| `hungarian/` | das ungarische (Tell-)Blatt für Ulti und Snapszer |
| `arcade.css` | Design-Tokens (dunkel/hell), `arc-*`-Komponenten, Seitenlayout im Einzelbetrieb |
| `registry.ts` | Namen, Repos, Tags und Akzentfarben aller Spiele |

## 📊 Punkte, Statistik & Spielstände

- Eine Runde endet, wenn das Spiel `gameOver` erreicht (bei Duellspielen eine Partie). `useArcadeRun` erfasst sie **genau einmal** pro Runde.
- `localStorage`-Schlüssel: `arcade.stats.<id>` (Statistik), `arcade.session.<id>` (Autospeichern), `arcade.theme`, `arcade.nickname`,
  `arcade.sidebarCollapsed`. Die eigenständigen Spiele und das Portal nutzen dieselben Schlüssel und teilen sich auf demselben Origin die Daten.
- Gewertete Runden aktualisieren **Bestwert** und **Gesamtpunkte** und gehen an die Bestenliste, wenn ein Spitzname gesetzt ist.
  Lokale Zwei-Spieler-Partien sind ungewertet (sie zählen nur Spiele und Zeit).
- **Duell-Rundenpunkte** = `Basis × (1 + Anteil leerer Felder)` bei einem Sieg, `Basis / 4` bei einem Unentschieden, 0 bei einer Niederlage;
  Basis = 100 / 250 / 500 für leicht / mittel / schwer.

## 🔄 Die eigenständigen Repos synchron halten

Die eigenständigen Repos werden als Geschwister dieses Repos erwartet (`../Snake-Game`, …) oder unter `$ARCADE_GAMES_ROOT`.

```bash
npm run sync:kit              # packages/kit/src → src/arcade/ in jedem Spiel (hier und in den eigenständigen Repos)
npm run sync:pull -- snake    # eigenständiges Repo → apps/snake/
npm run sync:push -- snake    # apps/snake/ → eigenständiges Repo (dann dort prüfen & committen)
npm run sync:check            # schlägt fehl, wenn das Kit oder ein Spiel abweicht
```

Pro Spiel synchronisiert: `src/`, `index.html`, `public/`, `vite.config.ts`. Nie synchronisiert: `package.json`, `tsconfig*.json`
(hier von `scripts/write-app-manifests.mjs` erzeugt) und die Dokumentation.

## 🌍 Bestenlisten-API

`arcade-api/` — PHP 8 + PDO + MySQL, neben dem Portal deployt.

- `POST score.php` `{ game, name, score }` mit `X-API-Key` → `{ ok, id, rank }`
- `GET leaderboard.php[?game=<id>&limit=N]` → Top N pro Spiel, eine Zeile pro Spieler (bester Wert)
- Spam-Schutz: gemeinsamer Schlüssel, Rate-Limit pro IP, `max_score`-Grenzen pro Spiel, bereinigte Spitznamen; Forwarded-For-Header
  zählen nur, wenn `trust_proxy` aktiv ist. Die Tabelle wird bei der ersten Anfrage automatisch angelegt.

Konfiguration: kopiere `arcade-api/_config.example.php` → `_config.php` und `apps/portal/.env.example` → `.env`. Siehe [docs/DEPLOY.md](./docs/DEPLOY.md).

## 🧪 Skripte

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Portal-Entwicklungsserver |
| `npm run dev:game @arcade/<id>` | Ein Spiel für sich, aus `apps/<id>` |
| `npm run build` | Typprüfung und Build des Portals nach `apps/portal/dist` |
| `npm run preview` | Das gebaute Portal ausliefern |
| `npm run lint` | ESLint über das ganze Repo |
| `npm run typecheck` | `tsc` in jedem Workspace |
| `npm test` | Vitest: Kit, Spiele und Portal |
| `npm run check` | lint → typecheck → test → sync:check → build (das, was die CI ausführt) |
| `CHROMIUM_PATH=… node scripts/mobile-smoke.mjs` | Nach `npm run build`: jedes Spiel auf einem emulierten iPhone 13 — Start, erste Touch-Aktion, Regeln, Vollbild; eine Zeile pro Spiel |

## 🚢 Deployment

Ein statischer Build (`apps/portal/dist`, relative Asset-Pfade) plus die PHP-API. Schritt für Schritt: [docs/DEPLOY.md](./docs/DEPLOY.md).
Ein weiteres Spiel hinzufügen: [docs/ADDING-A-GAME.md](./docs/ADDING-A-GAME.md).

## 🤝 Mitwirken

Siehe [CONTRIBUTING.md](./CONTRIBUTING.md), den [Verhaltenskodex](./CODE_OF_CONDUCT.md) und [SECURITY.md](./SECURITY.md).
Mitwirkende: [CONTRIBUTORS.md](./CONTRIBUTORS.md) · Änderungen: [CHANGELOG.md](./CHANGELOG.md).

## ⚖️ Lizenz

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Mit ❤️ gemacht von Zoltán Dul</p>
