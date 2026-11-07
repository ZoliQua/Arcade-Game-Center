import type { Messages } from './arcade';
import type { PowerUpKind } from './logic/types';

/** Every visible Breakout string in English, Hungarian and German. */
export type BreakoutMessageKey =
  | 'sub' | 'lives' | 'launch'
  | 'idleBody' | 'welcomeBody' | 'livesOne' | 'livesMany' | 'continue' | 'pausedBody' | 'playAgain'
  | 'overBody' | 'overBodyNewBest'
  | 'panelGame' | 'panelPowerUps' | 'panelSettings' | 'panelKeys'
  | 'levelLine' | 'pointerNote'
  | 'sound' | 'on' | 'off'
  | 'playfield' | 'launchHint'
  | 'bannerLevel' | 'bannerBallLost' | 'bannerLastBall' | 'bannerGameOver'
  | 'levelClassic' | 'levelPyramid' | 'levelCheckers' | 'levelFortress' | 'levelInvader' | 'levelBulwark'
  | 'puWide' | 'puMulti' | 'puSlow' | 'puCatch' | 'puLife'
  | 'kbdSpace'
  | 'keyMove' | 'keyLaunch' | 'keyPause' | 'keyRestart';

export const MESSAGES: Messages<BreakoutMessageKey> = {
  en: {
    sub: 'Bounce the ball, smash every brick.',
    lives: 'Lives',
    launch: 'Launch!',
    idleBody:
      'Keep the ball in play and smash every brick. Steer with ← → or the mouse; hit near the paddle edge for a sharper angle. Catch the falling capsules for power-ups.',
    welcomeBody: 'Your saved run was restored — score {score}, level {level}, {lives} left, {time} played.',
    livesOne: '{n} life',
    livesMany: '{n} lives',
    continue: 'Continue',
    pausedBody: 'Your run is autosaved — you can close the tab and continue later.',
    playAgain: 'Play again',
    overBody: 'Score {score} · Level {level} · Best {best}',
    overBodyNewBest: 'Score {score} · Level {level} · Best {best} — new best!',
    panelGame: 'Game',
    panelPowerUps: 'Power-ups',
    panelSettings: 'Settings',
    panelKeys: 'Keys',
    levelLine: 'Level {level} ·',
    pointerNote: 'Mouse or touch: move over the board to steer, click or tap to launch.',
    sound: 'Sound effects',
    on: 'On',
    off: 'Off',
    playfield: 'Breakout playfield, level {level}, {bricks} bricks',
    launchHint: 'Space · click · tap to launch',
    bannerLevel: 'Level {level} · {name}',
    bannerBallLost: 'Ball lost',
    bannerLastBall: 'Last ball!',
    bannerGameOver: 'Game over',
    levelClassic: 'Classic',
    levelPyramid: 'Pyramid',
    levelCheckers: 'Checkers',
    levelFortress: 'Fortress',
    levelInvader: 'Invader',
    levelBulwark: 'Bulwark',
    puWide: 'Wide paddle',
    puMulti: 'Multiball',
    puSlow: 'Slow ball',
    puCatch: 'Catch',
    puLife: 'Extra life',
    kbdSpace: 'Space',
    keyMove: 'Move paddle (or A D)',
    keyLaunch: 'Start · launch ball',
    keyPause: 'Pause / resume',
    keyRestart: 'Restart',
  },
  hu: {
    sub: 'Pattintsd a labdát, törd szét az összes téglát.',
    lives: 'Életek',
    launch: 'Indítsd!',
    idleBody:
      'Tartsd játékban a labdát, és törd szét az összes téglát. Irányíts a ← → gombokkal vagy az egérrel; az ütő széléhez közel élesebb szögben pattan. Kapd el a hulló kapszulákat a bónuszokért.',
    welcomeBody: 'Visszatöltöttük a mentett játékodat — {score} pont, {level}. szint, {lives} maradt, {time} játékidő.',
    livesOne: '{n} életed',
    livesMany: '{n} életed',
    continue: 'Folytatás',
    pausedBody: 'A játékod automatikusan mentve — bezárhatod a lapot, és később folytathatod.',
    playAgain: 'Új játék',
    overBody: '{score} pont · {level}. szint · Rekord {best}',
    overBodyNewBest: '{score} pont · {level}. szint · Rekord {best} — új rekord!',
    panelGame: 'Játék',
    panelPowerUps: 'Bónuszok',
    panelSettings: 'Beállítások',
    panelKeys: 'Billentyűk',
    levelLine: '{level}. szint ·',
    pointerNote: 'Egér vagy érintés: mozogj a pálya fölött az irányításhoz, kattints vagy koppints az indításhoz.',
    sound: 'Hangeffektek',
    on: 'Be',
    off: 'Ki',
    playfield: 'Breakout pálya, {level}. szint, {bricks} tégla',
    launchHint: 'Szóköz · kattintás · koppintás az indításhoz',
    bannerLevel: '{level}. szint · {name}',
    bannerBallLost: 'Elveszett a labda',
    bannerLastBall: 'Utolsó labda!',
    bannerGameOver: 'Vége a játéknak',
    levelClassic: 'Klasszikus',
    levelPyramid: 'Piramis',
    levelCheckers: 'Sakktábla',
    levelFortress: 'Erőd',
    levelInvader: 'Űrlény',
    levelBulwark: 'Bástya',
    puWide: 'Széles ütő',
    puMulti: 'Több labda',
    puSlow: 'Lassú labda',
    puCatch: 'Ragadós ütő',
    puLife: 'Extra élet',
    kbdSpace: 'Szóköz',
    keyMove: 'Ütő mozgatása (vagy A D)',
    keyLaunch: 'Indítás · labda kilövése',
    keyPause: 'Szünet / folytatás',
    keyRestart: 'Újrakezdés',
  },
  de: {
    sub: 'Lass den Ball springen und zertrümmere jeden Stein.',
    lives: 'Leben',
    launch: 'Los!',
    idleBody:
      'Halte den Ball im Spiel und zertrümmere jeden Stein. Steuere mit ← → oder der Maus; triffst du nahe am Schlägerrand, prallt der Ball steiler ab. Fang die fallenden Kapseln für Power-ups.',
    welcomeBody: 'Dein gespeichertes Spiel wurde wiederhergestellt — {score} Punkte, Level {level}, noch {lives}, {time} gespielt.',
    livesOne: '{n} Leben',
    livesMany: '{n} Leben',
    continue: 'Weiter',
    pausedBody: 'Dein Spiel wird automatisch gespeichert — du kannst den Tab schließen und später weiterspielen.',
    playAgain: 'Nochmal spielen',
    overBody: '{score} Punkte · Level {level} · Bestwert {best}',
    overBodyNewBest: '{score} Punkte · Level {level} · Bestwert {best} — neuer Bestwert!',
    panelGame: 'Spiel',
    panelPowerUps: 'Power-ups',
    panelSettings: 'Einstellungen',
    panelKeys: 'Tasten',
    levelLine: 'Level {level} ·',
    pointerNote: 'Maus oder Touch: Über das Spielfeld fahren zum Steuern, klicken oder tippen zum Starten.',
    sound: 'Soundeffekte',
    on: 'An',
    off: 'Aus',
    playfield: 'Breakout-Spielfeld, Level {level}, {bricks} Steine',
    launchHint: 'Leertaste · Klick · Tippen zum Starten',
    bannerLevel: 'Level {level} · {name}',
    bannerBallLost: 'Ball verloren',
    bannerLastBall: 'Letzter Ball!',
    bannerGameOver: 'Spiel vorbei',
    levelClassic: 'Klassisch',
    levelPyramid: 'Pyramide',
    levelCheckers: 'Schachbrett',
    levelFortress: 'Festung',
    levelInvader: 'Invader',
    levelBulwark: 'Bollwerk',
    puWide: 'Breiter Schläger',
    puMulti: 'Multiball',
    puSlow: 'Langsamer Ball',
    puCatch: 'Klebeschläger',
    puLife: 'Extraleben',
    kbdSpace: 'Leertaste',
    keyMove: 'Schläger bewegen (oder A D)',
    keyLaunch: 'Start · Ball starten',
    keyPause: 'Pause / weiter',
    keyRestart: 'Neustart',
  },
};

/** Dictionary key of each capsule's name. */
export const POWERUP_KEY: Record<PowerUpKind, BreakoutMessageKey> = {
  wide: 'puWide',
  multi: 'puMulti',
  slow: 'puSlow',
  catch: 'puCatch',
  life: 'puLife',
};

/** Level layouts are named in English in `logic/levels.ts`; this maps them to their keys. */
const LEVEL_NAME_KEY: Record<string, BreakoutMessageKey> = {
  Classic: 'levelClassic',
  Pyramid: 'levelPyramid',
  Checkers: 'levelCheckers',
  Fortress: 'levelFortress',
  Invader: 'levelInvader',
  Bulwark: 'levelBulwark',
};

type T = (key: BreakoutMessageKey, vars?: Record<string, string | number>) => string;

export function levelName(name: string, t: T): string {
  const k = LEVEL_NAME_KEY[name];
  return k ? t(k) : name;
}

/**
 * The engine stores its banner as English text (it is part of the saved
 * state), so it is translated here at render time; unknown text is shown as is.
 */
export function bannerText(banner: string, t: T): string {
  const level = /^Level (\d+) · (.+)$/.exec(banner);
  if (level) return t('bannerLevel', { level: level[1], name: levelName(level[2], t) });
  if (banner === 'Ball lost') return t('bannerBallLost');
  if (banner === 'Last ball!') return t('bannerLastBall');
  if (banner === 'Game over') return t('bannerGameOver');
  return banner;
}
