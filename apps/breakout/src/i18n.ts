import type { Messages } from './arcade';
import type { PowerUpKind } from './logic/types';

/** Every visible Breakout string in English, Hungarian and German. */
export type BreakoutMessageKey =
  | 'sub' | 'lives' | 'launch'
  | 'idleBody' | 'welcomeBody' | 'livesOne' | 'livesMany' | 'continue' | 'pausedBody' | 'playAgain'
  | 'overBody' | 'overBodyNewBest'
  | 'panelGame' | 'panelPowerUps' | 'panelSettings' | 'panelKeys'
  | 'levelLine' | 'pointerNote'
  | 'sound' | 'on' | 'off' | 'dentalHint'
  | 'playfield' | 'launchHint'
  | 'bannerLevel' | 'bannerBallLost' | 'bannerLastBall' | 'bannerGameOver'
  | 'levelClassic' | 'levelPyramid' | 'levelCheckers' | 'levelFortress' | 'levelInvader' | 'levelBulwark'
  | 'puWide' | 'puMulti' | 'puSlow' | 'puCatch' | 'puLife'
  | 'kbdSpace'
  | 'keyMove' | 'keyLaunch' | 'keyPause' | 'keyRestart'
  | 'touchDrag' | 'touchDragAction' | 'touchTap' | 'touchTapAction' | 'rulesDiagramLabel' | 'rulesDiagramEdge' | 'rulesDiagramCentre' | 'rulesGoal' | 'rulesPlayKeys' | 'rulesPlayTouch' | 'rulesRulesLives' | 'rulesRulesBricks' | 'rulesRulesPowerUps' | 'rulesRulesPause' | 'rulesScoringText' | 'rulesDentalText' | 'rulesMobileDrag' | 'rulesMobileTap' | 'rulesMobileFs';

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
    dentalHint: 'Toothbrush paddle, toothpaste ball, tartar bricks',
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
    touchDrag: 'Drag on the board',
    touchDragAction: 'Move the paddle',
    touchTap: 'Tap the board',
    touchTapAction: 'Launch the ball',
    rulesDiagramLabel: 'Diagram: the ball always falls straight down onto the paddle. Hit near the centre and it goes straight up; hit near either edge and it bounces away at up to {angle}°.',
    rulesDiagramEdge: 'edge',
    rulesDiagramCentre: 'centre',
    rulesGoal: 'Keep the ball in play with the paddle and smash every brick. Clear the wall and the next one comes with a faster ball — the run only ends when you lose your last life.',
    rulesPlayKeys: 'Move the paddle with ← → or A D, or point at the board with the mouse. Space, Enter or a click launches the ball, P or Esc pauses and resumes, R restarts.',
    rulesPlayTouch: 'Drag a finger anywhere on the board and the paddle follows it. Tap the board to launch the ball. Where the ball meets the paddle sets its angle.',
    rulesRulesLives: 'You start with {lives} lives (at most {maxLives}). Losing the last ball in play costs one life.',
    rulesRulesBricks: 'Bricks take 1, 2 or 3 hits; steel bricks never break and do not count towards clearing the wall.',
    rulesRulesPowerUps: 'Catch falling capsules with the paddle: wide paddle, multiball, slow ball, catch and extra life.',
    rulesRulesPause: 'Your run is autosaved, so you can leave and continue later.',
    rulesScoringText: 'A brick is worth its row value ({rows}, top row first) × the hits it took × the level. Catching a capsule scores {pu} × level and clearing the wall {clear} × level. Finish early ranks the score you have.',
    rulesDentalText: 'Dental mode only changes the look: the paddle is a toothbrush, the ball a toothpaste ball and the bricks tartar. Rules and scoring stay the same.',
    rulesMobileDrag: 'Drag a finger anywhere on the board: the paddle follows it.',
    rulesMobileTap: 'Tap the board to launch the ball.',
    rulesMobileFs: 'The "Full screen" button hides the browser bars.',
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
    dentalHint: 'Fogkefe ütő, fogkrém labda, fogkő téglák',
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
    touchDrag: 'Húzás a pályán',
    touchDragAction: 'Az ütő mozgatása',
    touchTap: 'Koppintás a pályára',
    touchTapAction: 'Labda kilövése',
    rulesDiagramLabel: 'Ábra: a labda mindig egyenesen lefelé érkezik az ütőre. Ha az ütő közepével találod el, egyenesen felfelé megy; ha valamelyik széléhez közel, legfeljebb {angle}°-os szögben pattan el.',
    rulesDiagramEdge: 'szél',
    rulesDiagramCentre: 'közép',
    rulesGoal: 'Tartsd játékban a labdát az ütővel, és törd szét az összes téglát. Ha letisztítod a falat, jön a következő, gyorsabb labdával — a játék csak az utolsó élet elvesztésekor ér véget.',
    rulesPlayKeys: 'Az ütőt a ← → vagy az A D billentyűvel mozgathatod, vagy az egérrel a pálya fölött. Szóköz, Enter vagy kattintás kilövi a labdát, P vagy Esc szüneteltet és folytat, R újrakezd.',
    rulesPlayTouch: 'Húzd az ujjad a pálya bármely pontján, és az ütő követi. A pályára koppintva kilövöd a labdát. Az ütő és a labda találkozási pontja szabja meg a pattanás szögét.',
    rulesRulesLives: '{lives} élettel indulsz (legfeljebb {maxLives} lehet). Ha az utolsó játékban lévő labdát is elveszted, egy életet veszítesz.',
    rulesRulesBricks: 'A téglák 1, 2 vagy 3 ütést bírnak; az acéltéglák sosem törnek el, és nem számítanak bele a fal letisztításába.',
    rulesRulesPowerUps: 'Kapd el az ütővel a hulló kapszulákat: széles ütő, több labda, lassú labda, ragadós ütő és extra élet.',
    rulesRulesPause: 'A játékod automatikusan mentődik, így később folytathatod.',
    rulesScoringText: 'Egy tégla értéke a sora szerinti érték ({rows}, fentről lefelé) × a tégla ütésszáma × a szint. Egy kapszula elkapása {pu} × szint, a fal letisztítása {clear} × szint. Az idő előtti befejezés a most meglévő pontszámot rangsorolja.',
    rulesDentalText: 'A fogas mód csak a megjelenést változtatja: az ütő fogkefe, a labda fogkrém golyó, a téglák pedig fogkő. A szabályok és a pontozás ugyanazok maradnak.',
    rulesMobileDrag: 'Húzd az ujjad a pálya bármely pontján: az ütő követi.',
    rulesMobileTap: 'Koppints a pályára a labda kilövéséhez.',
    rulesMobileFs: 'A „Teljes képernyő” gomb eltünteti a böngészősávokat.',
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
    dentalHint: 'Zahnbürsten-Schläger, Zahnpasta-Ball, Zahnstein-Ziegel',
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
    touchDrag: 'Auf dem Spielfeld ziehen',
    touchDragAction: 'Schläger bewegen',
    touchTap: 'Spielfeld antippen',
    touchTapAction: 'Ball starten',
    rulesDiagramLabel: 'Diagramm: Der Ball fällt immer senkrecht auf den Schläger. Triffst du ihn mit der Mitte, fliegt er geradeaus nach oben; nahe am Rand prallt er in einem Winkel von bis zu {angle}° ab.',
    rulesDiagramEdge: 'Rand',
    rulesDiagramCentre: 'Mitte',
    rulesGoal: 'Halte den Ball mit dem Schläger im Spiel und zertrümmere jeden Stein. Ist die Wand geräumt, kommt die nächste mit schnellerem Ball — das Spiel endet erst, wenn dein letztes Leben weg ist.',
    rulesPlayKeys: 'Bewege den Schläger mit ← → oder A D, oder mit der Maus über dem Spielfeld. Leertaste, Enter oder ein Klick startet den Ball, P oder Esc pausiert und setzt fort, R startet neu.',
    rulesPlayTouch: 'Ziehe einen Finger irgendwo über das Spielfeld, der Schläger folgt ihm. Ein Tipp auf das Spielfeld startet den Ball. Wo der Ball den Schläger trifft, bestimmt den Abprallwinkel.',
    rulesRulesLives: 'Du startest mit {lives} Leben (höchstens {maxLives}). Verlierst du den letzten Ball im Spiel, kostet das ein Leben.',
    rulesRulesBricks: 'Steine halten 1, 2 oder 3 Treffer aus; Stahlsteine gehen nie kaputt und zählen nicht zum Räumen der Wand.',
    rulesRulesPowerUps: 'Fang die fallenden Kapseln mit dem Schläger: breiter Schläger, Multiball, langsamer Ball, Klebeschläger und Extraleben.',
    rulesRulesPause: 'Dein Spiel wird automatisch gespeichert, du kannst also später weitermachen.',
    rulesScoringText: 'Ein Stein bringt den Wert seiner Reihe ({rows}, oberste Reihe zuerst) × die Treffer, die er brauchte × das Level. Eine Kapsel zu fangen bringt {pu} × Level, die Wand zu räumen {clear} × Level. „Beenden“ wertet den aktuellen Punktestand.',
    rulesDentalText: 'Der Zahnmodus ändert nur das Aussehen: Der Schläger ist eine Zahnbürste, der Ball ein Zahnpasta-Ball und die Steine sind Zahnstein. Regeln und Punktewertung bleiben gleich.',
    rulesMobileDrag: 'Ziehe einen Finger irgendwo über das Spielfeld: Der Schläger folgt ihm.',
    rulesMobileTap: 'Tippe auf das Spielfeld, um den Ball zu starten.',
    rulesMobileFs: 'Der Knopf „Vollbild“ blendet die Browserleisten aus.',
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
