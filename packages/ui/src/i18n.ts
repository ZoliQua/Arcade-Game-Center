import type { Messages } from '@arcade/kit';

/**
 * Strings of the portal chrome (sidebar and header). They live here, not in
 * the portal app, because `@arcade/ui` cannot import from the app; shared
 * labels (theme, language, game status) come from the kit's `KIT_MESSAGES`.
 */
export type ShellMessageKey =
  | 'mainNav'
  | 'portalVersion'
  | 'browse'
  | 'home'
  | 'games'
  | 'more'
  | 'leaderboard'
  | 'settings'
  | 'expand'
  | 'collapse'
  | 'savedRun'
  | 'liveTitle'
  | 'points'
  | 'shortcuts'
  | 'shortcutsTitle'
  | 'menu'
  | 'closeMenu'
  | 'showGames'
  | 'hideGames';

export const SHELL_MESSAGES: Messages<ShellMessageKey> = {
  en: {
    mainNav: 'Main navigation',
    portalVersion: 'Portal · v{version}',
    browse: 'Browse',
    home: 'Home',
    games: 'Games',
    more: 'More',
    leaderboard: 'Leaderboard',
    settings: 'Settings',
    expand: 'Expand',
    collapse: 'Collapse',
    savedRun: 'Saved run — continue where you left off',
    liveTitle: 'Status · score · run time',
    points: '{n} pts',
    shortcuts: 'Keyboard shortcuts',
    shortcutsTitle: 'Keyboard shortcuts (?)',
    menu: 'Menu',
    closeMenu: 'Close menu',
    showGames: 'Show all games',
    hideGames: 'Hide the game list',
  },
  hu: {
    mainNav: 'Fő navigáció',
    portalVersion: 'Portál · v{version}',
    browse: 'Böngészés',
    home: 'Kezdőlap',
    games: 'Játékok',
    more: 'Továbbiak',
    leaderboard: 'Ranglista',
    settings: 'Beállítások',
    expand: 'Kinyitás',
    collapse: 'Összecsukás',
    savedRun: 'Mentett játszma – folytasd, ahol abbahagytad',
    liveTitle: 'Állapot · pontszám · játékidő',
    points: '{n} pont',
    shortcuts: 'Billentyűparancsok',
    shortcutsTitle: 'Billentyűparancsok (?)',
    menu: 'Menü',
    closeMenu: 'Menü bezárása',
    showGames: 'Az összes játék mutatása',
    hideGames: 'A játéklista elrejtése',
  },
  de: {
    mainNav: 'Hauptnavigation',
    portalVersion: 'Portal · v{version}',
    browse: 'Entdecken',
    home: 'Start',
    games: 'Spiele',
    more: 'Mehr',
    leaderboard: 'Bestenliste',
    settings: 'Einstellungen',
    expand: 'Ausklappen',
    collapse: 'Einklappen',
    savedRun: 'Gespeichertes Spiel – mach weiter, wo du aufgehört hast',
    liveTitle: 'Status · Punkte · Spielzeit',
    points: '{n} Pkt.',
    shortcuts: 'Tastenkürzel',
    shortcutsTitle: 'Tastenkürzel (?)',
    menu: 'Menü',
    closeMenu: 'Menü schließen',
    showGames: 'Alle Spiele zeigen',
    hideGames: 'Spieleliste ausblenden',
  },
};
