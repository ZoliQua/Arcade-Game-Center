import { gameName, translate, type Lang, type Messages, type MessageVars } from '@arcade/kit';
import type { Route } from '@arcade/ui';

/**
 * Every user-visible string of the portal pages, in English, Hungarian and
 * German. Sidebar and header strings live in `@arcade/ui` (`SHELL_MESSAGES`);
 * shared labels (Best, Plays, Language, Dental mode, …) in the kit.
 */
export type PortalMessageKey =
  // Page titles
  | 'brand'
  | 'titleLeaderboard'
  | 'titleSettings'
  // Landing
  | 'heroTitle'
  | 'heroBody'
  | 'gamesPlayed'
  | 'totalScore'
  | 'timePlayed'
  | 'continueHead'
  | 'savedRunsOne'
  | 'savedRunsMany'
  | 'savedLine'
  | 'continue'
  | 'gamesHead'
  | 'gamesCount'
  | 'playAria'
  | 'playAriaSaved'
  | 'savedBadge'
  | 'playCta'
  | 'continueCta'
  | 'tagArcade'
  | 'tagReflex'
  | 'tagPuzzle'
  | 'tagMaze'
  | 'tagStrategy'
  | 'tagDuel'
  | 'tagPaddle'
  | 'tagShooter'
  | 'tagSorting'
  | 'tagCards'
  // Leaderboard
  | 'lbTitle'
  | 'loading'
  | 'lbOk'
  | 'lbNotConfigured'
  | 'lbUnreachable'
  | 'entriesOne'
  | 'entriesMany'
  | 'unavailable'
  | 'noScores'
  | 'agoSeconds'
  | 'agoMinutes'
  | 'agoHours'
  | 'agoDays'
  // Settings
  | 'storedLocally'
  | 'nickname'
  | 'nicknameHint'
  | 'nicknamePlaceholder'
  | 'save'
  | 'saved'
  | 'theme'
  | 'themeHint'
  | 'dark'
  | 'light'
  | 'languageHint'
  | 'on'
  | 'off'
  | 'savedGames'
  | 'savedGamesHint'
  | 'deleteSaves'
  | 'deleteSavesConfirm'
  | 'statistics'
  | 'statisticsHint'
  | 'resetStats'
  | 'resetStatsConfirm'
  | 'done'
  | 'cancel'
  // Nickname prompt
  | 'nickTitle'
  | 'nickScoreTitle'
  | 'nickScoreBody'
  | 'notNow'
  | 'nickBody'
  | 'nickChars'
  | 'playAnonymously'
  // Shortcuts dialog
  | 'shortcutsTitle'
  | 'everywhere'
  | 'inEveryGame'
  | 'keySpace'
  | 'keyTheme'
  | 'keyHelp'
  | 'keyPause'
  | 'keyRestart'
  | 'keyStart'
  | 'gameKeysNote'
  | 'gameKeysGeneric'
  | 'close';

export const PORTAL_MESSAGES: Messages<PortalMessageKey> = {
  en: {
    brand: "Zoltan's Arcade",
    titleLeaderboard: 'Leaderboard',
    titleSettings: 'Settings',

    heroTitle: 'Eleven classics, one home.',
    heroBody:
      'Pick a game — every card below is the real game playing itself. Runs autosave, so you can leave mid-game and continue later; best scores and play time follow you across sessions.',
    gamesPlayed: 'Games played',
    totalScore: 'Total score',
    timePlayed: 'Time played',
    continueHead: 'Continue where you left off',
    savedRunsOne: '{n} saved run',
    savedRunsMany: '{n} saved runs',
    savedLine: '{score} pts · {time} · {ago}',
    continue: 'Continue',
    gamesHead: 'Games',
    gamesCount: '{n} available · keyboard-first',
    playAria: 'Play {name}',
    playAriaSaved: 'Play {name} — continue saved run',
    savedBadge: 'Saved run',
    playCta: 'Play →',
    continueCta: 'Continue →',
    tagArcade: 'Arcade',
    tagReflex: 'Reflex',
    tagPuzzle: 'Puzzle',
    tagMaze: 'Maze',
    tagStrategy: 'Strategy',
    tagDuel: 'Duel',
    tagPaddle: 'Paddle',
    tagShooter: 'Shooter',
    tagSorting: 'Sorting',
    tagCards: 'Cards',

    lbTitle: 'Best runs',
    loading: 'Loading…',
    lbOk: 'Top 10 per game · global',
    lbNotConfigured: 'Leaderboard server not configured',
    lbUnreachable: 'Could not reach leaderboard server',
    entriesOne: '{n} entry',
    entriesMany: '{n} entries',
    unavailable: 'Unavailable.',
    noScores: 'No scores yet — be the first.',
    agoSeconds: '{n}s ago',
    agoMinutes: '{n}m ago',
    agoHours: '{n}h ago',
    agoDays: '{n}d ago',

    storedLocally: 'Stored in this browser only',
    nickname: 'Nickname',
    nicknameHint: 'Shown on the leaderboard. {min}–{max} characters.',
    nicknamePlaceholder: 'Your name',
    save: 'Save',
    saved: 'Saved',
    theme: 'Theme',
    themeHint: 'Shared by the portal and every standalone game. Press T anywhere.',
    dark: 'Dark',
    light: 'Light',
    languageHint: 'Used by the portal and every game.',
    on: 'On',
    off: 'Off',
    savedGames: 'Saved games',
    savedGamesHint: 'Throw away every autosaved run in progress.',
    deleteSaves: 'Delete saves',
    deleteSavesConfirm: 'Delete all saves?',
    statistics: 'Statistics',
    statisticsHint: 'Reset best scores, plays and play time for every game.',
    resetStats: 'Reset stats',
    resetStatsConfirm: 'Reset all stats?',
    done: 'Done.',
    cancel: 'Cancel',

    nickTitle: 'Pick a nickname',
    nickScoreTitle: 'Put {score} points on the leaderboard?',
    nickScoreBody: 'Scores are saved to the global leaderboard under a nickname. Pick one and this run counts too.',
    notNow: 'Not now',
    nickBody: 'Shown on the global leaderboard. You can change it later in Settings.',
    nickChars: '{min}–{max} characters',
    playAnonymously: 'Play anonymously',

    shortcutsTitle: 'Keyboard shortcuts',
    everywhere: 'Everywhere',
    inEveryGame: 'In every game',
    keySpace: 'Space',
    keyTheme: 'Toggle dark / light theme',
    keyHelp: 'Show / hide this help',
    keyPause: 'Pause / resume',
    keyRestart: 'Restart / new round',
    keyStart: 'Start · primary action',
    gameKeysNote: "{name}'s own controls are listed next to the board.",
    gameKeysGeneric: 'Each game lists its own controls next to the board.',
    close: 'Close',
  },
  hu: {
    brand: "Zoltan's Arcade",
    titleLeaderboard: 'Ranglista',
    titleSettings: 'Beállítások',

    heroTitle: 'Tizenegy klasszikus egy helyen.',
    heroBody:
      'Válassz egy játékot – minden kártyán maga a valódi játék fut. A játszmák automatikusan mentődnek, így bármikor abbahagyhatod és később folytathatod; a rekordjaid és a játékidőd is megmaradnak.',
    gamesPlayed: 'Lejátszott játszmák',
    totalScore: 'Összpontszám',
    timePlayed: 'Játékidő',
    continueHead: 'Folytasd, ahol abbahagytad',
    savedRunsOne: '{n} mentett játszma',
    savedRunsMany: '{n} mentett játszma',
    savedLine: '{score} pont · {time} · {ago}',
    continue: 'Folytatás',
    gamesHead: 'Játékok',
    gamesCount: '{n} játék · billentyűzetre tervezve',
    playAria: '{name} indítása',
    playAriaSaved: '{name} – a mentett játszma folytatása',
    savedBadge: 'Mentett játszma',
    playCta: 'Játék →',
    continueCta: 'Folytatás →',
    tagArcade: 'Arcade',
    tagReflex: 'Reflex',
    tagPuzzle: 'Logikai',
    tagMaze: 'Labirintus',
    tagStrategy: 'Stratégia',
    tagDuel: 'Párbaj',
    tagPaddle: 'Ütős',
    tagShooter: 'Lövöldözős',
    tagSorting: 'Válogatós',
    tagCards: 'Kártya',

    lbTitle: 'Legjobb eredmények',
    loading: 'Betöltés…',
    lbOk: 'Játékonként a legjobb 10 · világszerte',
    lbNotConfigured: 'A ranglista-szerver nincs beállítva',
    lbUnreachable: 'Nem érhető el a ranglista-szerver',
    entriesOne: '{n} bejegyzés',
    entriesMany: '{n} bejegyzés',
    unavailable: 'Nem elérhető.',
    noScores: 'Még nincs eredmény – legyél te az első!',
    agoSeconds: '{n} másodperce',
    agoMinutes: '{n} perce',
    agoHours: '{n} órája',
    agoDays: '{n} napja',

    storedLocally: 'Csak ebben a böngészőben tárolva',
    nickname: 'Becenév',
    nicknameHint: 'A ranglistán jelenik meg. {min}–{max} karakter.',
    nicknamePlaceholder: 'A neved',
    save: 'Mentés',
    saved: 'Elmentve',
    theme: 'Téma',
    themeHint: 'A portál és minden önálló játék közösen használja. Bárhol válthatsz a T billentyűvel.',
    dark: 'Sötét',
    light: 'Világos',
    languageHint: 'A portál és minden játék ezen a nyelven szól.',
    on: 'Be',
    off: 'Ki',
    savedGames: 'Mentett játszmák',
    savedGamesHint: 'Az összes automatikusan mentett, félbehagyott játszma törlése.',
    deleteSaves: 'Mentések törlése',
    deleteSavesConfirm: 'Biztosan törlöd az összeset?',
    statistics: 'Statisztika',
    statisticsHint: 'Minden játék rekordjainak, játszmaszámának és játékidejének nullázása.',
    resetStats: 'Statisztika nullázása',
    resetStatsConfirm: 'Biztosan nullázod?',
    done: 'Kész.',
    cancel: 'Mégse',

    nickTitle: 'Válassz becenevet',
    nickScoreTitle: 'Felkerüljön a {score} pont a ranglistára?',
    nickScoreBody: 'A pontok becenévvel kerülnek a globális ranglistára. Válassz egyet, és ez a játék is beszámít.',
    notNow: 'Most nem',
    nickBody: 'A globális ranglistán jelenik meg. Később a Beállításokban módosíthatod.',
    nickChars: '{min}–{max} karakter',
    playAnonymously: 'Játék név nélkül',

    shortcutsTitle: 'Billentyűparancsok',
    everywhere: 'Mindenhol',
    inEveryGame: 'Minden játékban',
    keySpace: 'Szóköz',
    keyTheme: 'Sötét / világos téma váltása',
    keyHelp: 'Ez a súgó be / ki',
    keyPause: 'Szünet / folytatás',
    keyRestart: 'Újrakezdés / új kör',
    keyStart: 'Indítás · fő művelet',
    gameKeysNote: '{name}: a játék saját irányítása a pálya mellett látható.',
    gameKeysGeneric: 'Minden játék a pálya mellett mutatja a saját irányítását.',
    close: 'Bezárás',
  },
  de: {
    brand: "Zoltan's Arcade",
    titleLeaderboard: 'Bestenliste',
    titleSettings: 'Einstellungen',

    heroTitle: 'Elf Klassiker unter einem Dach.',
    heroBody:
      'Such dir ein Spiel aus – auf jeder Karte unten spielt sich das echte Spiel selbst. Alles wird automatisch gespeichert: Hör mittendrin auf und mach später weiter. Bestwerte und Spielzeit bleiben dir erhalten.',
    gamesPlayed: 'Gespielte Runden',
    totalScore: 'Gesamtpunkte',
    timePlayed: 'Spielzeit',
    continueHead: 'Mach weiter, wo du aufgehört hast',
    savedRunsOne: '{n} gespeichertes Spiel',
    savedRunsMany: '{n} gespeicherte Spiele',
    savedLine: '{score} Pkt. · {time} · {ago}',
    continue: 'Weiter',
    gamesHead: 'Spiele',
    gamesCount: '{n} verfügbar · für die Tastatur gemacht',
    playAria: '{name} spielen',
    playAriaSaved: '{name} spielen – gespeichertes Spiel fortsetzen',
    savedBadge: 'Gespeichert',
    playCta: 'Spielen →',
    continueCta: 'Weiter →',
    tagArcade: 'Arcade',
    tagReflex: 'Reaktion',
    tagPuzzle: 'Puzzle',
    tagMaze: 'Labyrinth',
    tagStrategy: 'Strategie',
    tagDuel: 'Duell',
    tagPaddle: 'Schläger',
    tagShooter: 'Shooter',
    tagSorting: 'Sortieren',
    tagCards: 'Karten',

    lbTitle: 'Bestleistungen',
    loading: 'Wird geladen…',
    lbOk: 'Top 10 pro Spiel · weltweit',
    lbNotConfigured: 'Bestenlisten-Server nicht eingerichtet',
    lbUnreachable: 'Bestenlisten-Server nicht erreichbar',
    entriesOne: '{n} Eintrag',
    entriesMany: '{n} Einträge',
    unavailable: 'Nicht verfügbar.',
    noScores: 'Noch keine Einträge – mach den Anfang!',
    agoSeconds: 'vor {n} s',
    agoMinutes: 'vor {n} Min.',
    agoHours: 'vor {n} Std.',
    agoDays: 'vor {n} Tg.',

    storedLocally: 'Nur in diesem Browser gespeichert',
    nickname: 'Spitzname',
    nicknameHint: 'Erscheint in der Bestenliste. {min}–{max} Zeichen.',
    nicknamePlaceholder: 'Dein Name',
    save: 'Speichern',
    saved: 'Gespeichert',
    theme: 'Design',
    themeHint: 'Gilt für das Portal und jedes eigenständige Spiel. Überall mit T umschalten.',
    dark: 'Dunkel',
    light: 'Hell',
    languageHint: 'Gilt für das Portal und alle Spiele.',
    on: 'An',
    off: 'Aus',
    savedGames: 'Gespeicherte Spiele',
    savedGamesHint: 'Alle automatisch gespeicherten, laufenden Spiele verwerfen.',
    deleteSaves: 'Spielstände löschen',
    deleteSavesConfirm: 'Wirklich alle löschen?',
    statistics: 'Statistik',
    statisticsHint: 'Bestwerte, Spielanzahl und Spielzeit aller Spiele zurücksetzen.',
    resetStats: 'Statistik zurücksetzen',
    resetStatsConfirm: 'Wirklich alles zurücksetzen?',
    done: 'Erledigt.',
    cancel: 'Abbrechen',

    nickTitle: 'Wähl einen Spitznamen',
    nickScoreTitle: '{score} Punkte in die Bestenliste eintragen?',
    nickScoreBody: 'Punkte landen mit einem Spitznamen in der weltweiten Bestenliste. Wähl einen, dann zählt auch diese Runde.',
    notNow: 'Jetzt nicht',
    nickBody: 'Erscheint in der weltweiten Bestenliste. Du kannst ihn später in den Einstellungen ändern.',
    nickChars: '{min}–{max} Zeichen',
    playAnonymously: 'Anonym spielen',

    shortcutsTitle: 'Tastenkürzel',
    everywhere: 'Überall',
    inEveryGame: 'In jedem Spiel',
    keySpace: 'Leertaste',
    keyTheme: 'Dunkles / helles Design umschalten',
    keyHelp: 'Diese Hilfe ein- / ausblenden',
    keyPause: 'Pause / weiter',
    keyRestart: 'Neustart / neue Runde',
    keyStart: 'Start · Hauptaktion',
    gameKeysNote: 'Die Steuerung von {name} steht direkt neben dem Spielfeld.',
    gameKeysGeneric: 'Jedes Spiel zeigt seine Steuerung direkt neben dem Spielfeld.',
    close: 'Schließen',
  },
};

/** Non-React lookup (document title, analytics). Components use `useMessages(PORTAL_MESSAGES)`. */
export function pt(lang: Lang, key: PortalMessageKey, vars?: MessageVars): string {
  return translate(PORTAL_MESSAGES, lang, key, vars);
}

const TAG_KEYS: Record<string, PortalMessageKey> = {
  Arcade: 'tagArcade',
  Reflex: 'tagReflex',
  Puzzle: 'tagPuzzle',
  Maze: 'tagMaze',
  Strategy: 'tagStrategy',
  Duel: 'tagDuel',
  Paddle: 'tagPaddle',
  Shooter: 'tagShooter',
  Sorting: 'tagSorting',
  Cards: 'tagCards',
};

/** The registry's English genre tag in `lang` (unknown tags are shown as they are). */
export function tagLabel(tag: string, lang: Lang): string {
  const key = TAG_KEYS[tag];
  return key ? pt(lang, key) : tag;
}

/** Document title for a route in `lang`, e.g. "Snake · Zoltan's Arcade". */
export function routeTitle(route: Route, lang: Lang): string {
  const brand = pt(lang, 'brand');
  switch (route.view) {
    case 'play':
      return `${gameName(route.gameId, lang)} · ${brand}`;
    case 'leaderboard':
      return `${pt(lang, 'titleLeaderboard')} · ${brand}`;
    case 'settings':
      return `${pt(lang, 'titleSettings')} · ${brand}`;
    default:
      return brand;
  }
}
