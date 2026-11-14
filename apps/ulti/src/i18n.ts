import type { Messages } from './arcade';

/**
 * Ulti strings. The contract names (Passz, Ulti, Betli, Durchmars, …, Kontra) are Hungarian in every language — they
 * are the game's own terms; English and German get a short explanation next to them (tooltips and the Contracts panel).
 */
export type MessageKey =
  | 'subtitle'
  | 'you'
  | 'setupBody'
  | 'difficulty'
  | 'diffEasy'
  | 'diffMedium'
  | 'diffHard'
  | 'startSession'
  | 'newSession'
  | 'abandonTitle'
  | 'abandonBody'
  | 'abandon'
  | 'keepPlaying'
  | 'welcomeBody'
  | 'pausedBody'
  | 'continue'
  | 'statDeal'
  | 'statDealValue'
  | 'statUnits'
  | 'yourTurn'
  | 'thinking'
  | 'dealOverStatus'
  | 'promptDiscard'
  | 'promptBid'
  | 'promptPickup'
  | 'promptKontra'
  | 'promptPlay'
  | 'promptWait'
  | 'discardBtn'
  | 'pickUp'
  | 'passBtn'
  | 'putBack'
  | 'kontraBtn'
  | 'noKontra'
  | 'nextDeal'
  | 'discardNeedTwo'
  | 'discardNoBid'
  | 'pickUpNoBid'
  | 'reasonMustFollow'
  | 'reasonMustBeat'
  | 'reasonMustTrump'
  | 'reasonMustOvertrump'
  | 'reasonKeepUltiSeven'
  | 'reasonNotYourTurn'
  | 'reasonNotPlayPhase'
  | 'reasonNotInHand'
  | 'dealer'
  | 'declarer'
  | 'defender'
  | 'onTurn'
  | 'cardsCount'
  | 'seatLabel'
  | 'talon'
  | 'talonPeek'
  | 'yourDiscards'
  | 'trickN'
  | 'takes'
  | 'lastTrick'
  | 'currentBid'
  | 'noBidYet'
  | 'trumpIs'
  | 'noTrump'
  | 'bidTitle'
  | 'bidHint'
  | 'bidFirstHint'
  | 'valueTitle'
  | 'yourHand'
  | 'suitPiros'
  | 'suitTok'
  | 'suitZold'
  | 'suitMakk'
  | 'infoPassz'
  | 'infoNegyvenszaz'
  | 'infoUlti'
  | 'infoBetli'
  | 'infoDurchmars'
  | 'infoHuszszaz'
  | 'infoSzintelenDurchmars'
  | 'infoPiros'
  | 'infoKontra'
  | 'logPickup'
  | 'logDiscard'
  | 'logBid'
  | 'logPass'
  | 'logDeclarer'
  | 'logKontra'
  | 'logNoKontra'
  | 'logAnnounce'
  | 'logTrick'
  | 'logTrickOpen'
  | 'logOver'
  | 'logEmpty'
  | 'logDealHead'
  | 'dealOverTitle'
  | 'contractWon'
  | 'contractLost'
  | 'kontraTag'
  | 'partiLine'
  | 'unitsLine'
  | 'wonTitle'
  | 'drawTitle'
  | 'lostTitle'
  | 'resultPoints'
  | 'resultNoPoints'
  | 'resultTail'
  | 'newBestSuffix'
  | 'panelLog'
  | 'panelSession'
  | 'panelSettings'
  | 'panelKeys'
  | 'panelDeals'
  | 'panelContracts'
  | 'colDeal'
  | 'colDeclarer'
  | 'colBid'
  | 'colResult'
  | 'colYou'
  | 'noDealsYet'
  | 'sessionNote'
  | 'setSpeed'
  | 'speedSlow'
  | 'speedNormal'
  | 'speedFast'
  | 'keyPause'
  | 'keyConfirm'
  | 'keyCards'
  | 'figurePlayer'
  | 'figureBandi'
  | 'figureTeri'
  | 'figureDentist'
  | 'figureAssistant'
  | 'figureHygienist';

export const MESSAGES: Messages<MessageKey> = {
  en: {
    subtitle: 'The Hungarian card classic — you against Bandi and Teri, ten deals, the old Tell deck.',
    you: 'You',
    setupBody: 'Ten deals against two bots. Bid for the talon, play your contract or beat theirs together. Your net result is your score.',
    difficulty: 'Opponents',
    diffEasy: 'Easy',
    diffMedium: 'Medium',
    diffHard: 'Hard',
    startSession: 'Deal the cards',
    newSession: 'New session',
    abandonTitle: 'Give up this session?',
    abandonBody: 'The deals so far are lost and nothing is recorded.',
    abandon: 'Give up',
    keepPlaying: 'Keep playing',
    welcomeBody: 'Deal {deal} of {total} is waiting where you left it. Your balance: {units}.',
    pausedBody: 'The cards are face down until you come back.',
    continue: 'Continue',
    statDeal: 'Deal',
    statDealValue: '{n} / {total}',
    statUnits: 'Balance',
    yourTurn: 'Your turn',
    thinking: '{name} is thinking…',
    dealOverStatus: 'Deal over',
    promptDiscard: 'You hold 12 cards: pick two to lay down as the talon, then bid.',
    promptBid: 'Choose your bid. Only bids higher than the current one are offered.',
    promptPickup: '{name} bid {bid}. Pick up the talon to bid higher, or pass.',
    promptKontra: '{name} plays {bid}. Double it with Kontra?',
    promptPlay: 'Your card. Cards you may not play are dimmed.',
    promptWait: 'Waiting for {name}.',
    discardBtn: 'Lay down 2 cards',
    pickUp: 'Pick up the talon',
    passBtn: 'Pass',
    putBack: 'Put it back and pass',
    kontraBtn: 'Kontra',
    noKontra: 'No kontra',
    nextDeal: 'Next deal',
    discardNeedTwo: 'Pick exactly two cards to lay down.',
    discardNoBid: 'With these two down you could not bid higher than {bid}. Lay down two other cards.',
    pickUpNoBid: 'You looked at the talon: even with these two cards there is no bid higher than {bid}. Put them back and pass.',
    reasonMustFollow: 'You must follow suit: {suit} was led.',
    reasonMustBeat: 'You must beat the best card of the trick when you can.',
    reasonMustTrump: 'You have no {led}: you must play a trump ({suit}).',
    reasonMustOvertrump: 'You must play a higher trump when you can.',
    reasonKeepUltiSeven: 'Keep the trump VII for the last trick — that is your Ulti.',
    reasonNotYourTurn: 'Wait for your turn.',
    reasonNotPlayPhase: 'Cards are played after the bidding.',
    reasonNotInHand: 'That card is not in your hand.',
    dealer: 'Dealer',
    declarer: 'Declarer',
    defender: 'Defender',
    onTurn: 'On turn',
    cardsCount: '{n} cards',
    seatLabel: '{name}, balance {units}',
    talon: 'Talon',
    talonPeek: 'The talon you looked at',
    yourDiscards: 'Your talon',
    trickN: 'Trick {n}',
    takes: '{name} takes it',
    lastTrick: 'Last trick',
    currentBid: 'Bid',
    noBidYet: 'No bid yet',
    trumpIs: 'Trump: {suit}',
    noTrump: 'No trump',
    bidTitle: 'Your bid',
    bidHint: 'Higher than {bid}:',
    bidFirstHint: 'Every bid your cards can make:',
    valueTitle: 'Value per opponent',
    yourHand: 'Your hand',
    suitPiros: 'Piros',
    suitTok: 'Tök',
    suitZold: 'Zöld',
    suitMakk: 'Makk',
    infoPassz: 'Passz — the simple game: take more card points (aces and tens, last trick, 20/40) than the two defenders.',
    infoNegyvenszaz: 'Negyvenszáz — announce the trump king + over (40) and reach 100 points.',
    infoUlti: 'Ulti — win the last trick with the trump VII.',
    infoBetli: 'Betli — take no trick at all; no trumps, the ten ranks below the under.',
    infoDurchmars: 'Durchmars — take all ten tricks.',
    infoHuszszaz: 'Húszszáz — announce a king + over of another suit (20) and reach 100 points.',
    infoSzintelenDurchmars: 'Színtelen durchmars — take all ten tricks without trumps.',
    infoPiros: 'Piros — hearts are trump and the bid counts double.',
    infoKontra: 'Kontra — a defender doubles the stakes.',
    logPickup: '{name} picks up the talon',
    logDiscard: '{name} lays two cards down',
    logBid: '{name} bids {bid}',
    logPass: '{name} passes',
    logDeclarer: '{name} plays {bid}',
    logKontra: '{name}: Kontra!',
    logNoKontra: '{name}: no kontra',
    logAnnounce: '{name} announces {points} ({suit})',
    logTrick: '{n}. {cards} — {name} takes it',
    logTrickOpen: '{n}. {cards} …',
    logOver: 'The deal is over',
    logEmpty: 'Bids and tricks appear here.',
    logDealHead: 'Deal {n}',
    dealOverTitle: 'Deal {n} is over',
    contractWon: '{bid}: made',
    contractLost: '{bid}: failed',
    kontraTag: 'with Kontra',
    partiLine: 'Card points: declarer {declarer}, defenders {defenders}',
    unitsLine: '{name}: {units}',
    wonTitle: 'You won the session!',
    drawTitle: 'Level at the top',
    lostTitle: 'The session is over',
    resultPoints: 'You scored {points} points. ',
    resultNoPoints: 'No points this time. ',
    resultTail: '{deals} deals · {time} · Best {best}.',
    newBestSuffix: ' New best!',
    panelLog: 'Log',
    panelSession: 'Session',
    panelSettings: 'Settings',
    panelKeys: 'Keys',
    panelDeals: 'Deals',
    panelContracts: 'Contracts',
    colDeal: '#',
    colDeclarer: 'Declarer',
    colBid: 'Bid',
    colResult: 'Result',
    colYou: 'You',
    noDealsYet: 'No deal finished yet.',
    sessionNote: '{difficulty} opponents · deal {deal} of {total}',
    setSpeed: 'Bot speed',
    speedSlow: 'Slow',
    speedNormal: 'Normal',
    speedFast: 'Fast',
    keyPause: 'Pause / resume',
    keyConfirm: 'Start · next deal · continue',
    keyCards: 'Move between cards and buttons',
    figurePlayer: 'You, in a feathered hat',
    figureBandi: 'Bandi, with his moustache and pipe',
    figureTeri: 'Teri, with a flower in her braid',
    figureDentist: 'You as the dentist, with a head mirror and a mouth mirror',
    figureAssistant: 'Teri as the dental assistant, in a cap',
    figureHygienist: 'Bandi as the hygienist, with a mask and a probe',
  },
  hu: {
    subtitle: 'A magyar kártyaklasszikus — te Bandi és Teri ellen, tíz osztás, a régi Tell-kártyával.',
    you: 'Te',
    setupBody: 'Tíz osztás két gépi ellenfél ellen. Licitálj a talonért, vidd végig a bemondásod, vagy közösen buktasd az övékét. A végső egyenleged adja a pontszámot.',
    difficulty: 'Ellenfelek',
    diffEasy: 'Könnyű',
    diffMedium: 'Közepes',
    diffHard: 'Nehéz',
    startSession: 'Osztás',
    newSession: 'Új játszma',
    abandonTitle: 'Feladod ezt a játszmát?',
    abandonBody: 'Az eddigi osztások elvesznek, és semmi sem kerül a statisztikába.',
    abandon: 'Feladom',
    keepPlaying: 'Játszom tovább',
    welcomeBody: 'A(z) {deal}. osztás a {total}-ből ott vár, ahol abbahagytad. Egyenleged: {units}.',
    pausedBody: 'A lapok le vannak fordítva, amíg vissza nem jössz.',
    continue: 'Folytatás',
    statDeal: 'Osztás',
    statDealValue: '{n} / {total}',
    statUnits: 'Egyenleg',
    yourTurn: 'Te jössz',
    thinking: '{name} gondolkodik…',
    dealOverStatus: 'Vége az osztásnak',
    promptDiscard: '12 lap van nálad: válassz ki kettőt, azt lerakod talonnak, aztán licitálsz.',
    promptBid: 'Válaszd ki a bemondásod. Csak a mostaninál magasabb licitek közül választhatsz.',
    promptPickup: '{name} licitje: {bid}. Vedd fel a talont, ha magasabbat mondanál, vagy passzolj.',
    promptKontra: '{name} játssza: {bid}. Megkontrázod?',
    promptPlay: 'Te hívsz vagy te teszel. Amit nem tehetsz, az halványabb.',
    promptWait: '{name} következik.',
    discardBtn: 'Lerakom a 2 lapot',
    pickUp: 'Felveszem a talont',
    passBtn: 'Passzolok',
    putBack: 'Visszarakom, passz',
    kontraBtn: 'Kontra',
    noKontra: 'Nem kontrázok',
    nextDeal: 'Következő osztás',
    discardNeedTwo: 'Pontosan két lapot válassz ki a lerakáshoz.',
    discardNoBid: 'Ha ezt a kettőt rakod le, nem tudnál {bid} fölé licitálni. Rakj le két másik lapot.',
    pickUpNoBid: 'Megnézted a talont: ezzel a két lappal sincs {bid} fölötti licited. Rakd vissza, és passzolj.',
    reasonMustFollow: 'Színre színt kell tenni: {suit} a hívás.',
    reasonMustBeat: 'Ha tudod, felül kell ütnöd az ütés legjobb lapját.',
    reasonMustTrump: 'Nincs {led} színed: adut ({suit}) kell tenned.',
    reasonMustOvertrump: 'Ha tudsz, nagyobb aduval kell felülütnöd.',
    reasonKeepUltiSeven: 'Az adu hetest az utolsó ütésre tartogasd — ez az ultid.',
    reasonNotYourTurn: 'Várd ki a sorod.',
    reasonNotPlayPhase: 'A lapokat a licit után játsszátok ki.',
    reasonNotInHand: 'Ez a lap nincs a kezedben.',
    dealer: 'Osztó',
    declarer: 'Felvevő',
    defender: 'Ellenjátékos',
    onTurn: 'Soron',
    cardsCount: '{n} lap',
    seatLabel: '{name}, egyenleg: {units}',
    talon: 'Talon',
    talonPeek: 'A megnézett talon',
    yourDiscards: 'A te talonod',
    trickN: '{n}. ütés',
    takes: '{name} viszi',
    lastTrick: 'Előző ütés',
    currentBid: 'Licit',
    noBidYet: 'Még nincs licit',
    trumpIs: 'Adu: {suit}',
    noTrump: 'Nincs adu',
    bidTitle: 'A licited',
    bidHint: '{bid} fölött:',
    bidFirstHint: 'Minden bemondás, amit a lapjaid engednek:',
    valueTitle: 'Érték ellenfelenként',
    yourHand: 'A lapjaid',
    suitPiros: 'Piros',
    suitTok: 'Tök',
    suitZold: 'Zöld',
    suitMakk: 'Makk',
    infoPassz: 'Passz — az alapjáték: több pontot (ász, tízes, utolsó ütés, 20/40) kell vinned, mint a két ellenjátékosnak együtt.',
    infoNegyvenszaz: 'Negyvenszáz — bemondod az adu király + felsőt (40), és legalább 100 pontot viszel.',
    infoUlti: 'Ulti — az utolsó ütést az adu hetessel viszed el.',
    infoBetli: 'Betli — egyetlen ütést sem viszel; nincs adu, a tízes az alsó alatt áll.',
    infoDurchmars: 'Durchmars — mind a tíz ütést elviszed.',
    infoHuszszaz: 'Húszszáz — bemondasz egy másik színű király + felsőt (20), és legalább 100 pontot viszel.',
    infoSzintelenDurchmars: 'Színtelen durchmars — mind a tíz ütést elviszed, adu nélkül.',
    infoPiros: 'Piros — a piros az adu, és a bemondás duplán számít.',
    infoKontra: 'Kontra — az ellenjátékos megduplázza a tétet.',
    logPickup: '{name} felveszi a talont',
    logDiscard: '{name} lerak két lapot',
    logBid: '{name} licitje: {bid}',
    logPass: '{name} passzol',
    logDeclarer: '{name} játssza: {bid}',
    logKontra: '{name}: Kontra!',
    logNoKontra: '{name}: nincs kontra',
    logAnnounce: '{name} bemond {points}-et ({suit})',
    logTrick: '{n}. {cards} — {name} viszi',
    logTrickOpen: '{n}. {cards} …',
    logOver: 'Vége az osztásnak',
    logEmpty: 'Itt jelennek meg a licitek és az ütések.',
    logDealHead: '{n}. osztás',
    dealOverTitle: 'Vége a(z) {n}. osztásnak',
    contractWon: '{bid}: teljesítve',
    contractLost: '{bid}: bukott',
    kontraTag: 'kontrával',
    partiLine: 'Pontok: felvevő {declarer}, ellenjátékosok {defenders}',
    unitsLine: '{name}: {units}',
    wonTitle: 'Megnyerted a játszmát!',
    drawTitle: 'Holtversenyben az élen',
    lostTitle: 'Vége a játszmának',
    resultPoints: '{points} pontot szereztél. ',
    resultNoPoints: 'Most nem szereztél pontot. ',
    resultTail: '{deals} osztás · {time} · Rekord {best}.',
    newBestSuffix: ' Új rekord!',
    panelLog: 'Napló',
    panelSession: 'Játszma',
    panelSettings: 'Beállítások',
    panelKeys: 'Billentyűk',
    panelDeals: 'Osztások',
    panelContracts: 'Bemondások',
    colDeal: '#',
    colDeclarer: 'Felvevő',
    colBid: 'Bemondás',
    colResult: 'Eredmény',
    colYou: 'Te',
    noDealsYet: 'Még nincs befejezett osztás.',
    sessionNote: '{difficulty} ellenfelek · {deal}. osztás a {total}-ből',
    setSpeed: 'Gépi játékosok tempója',
    speedSlow: 'Lassú',
    speedNormal: 'Normál',
    speedFast: 'Gyors',
    keyPause: 'Szünet / folytatás',
    keyConfirm: 'Indítás · következő osztás · folytatás',
    keyCards: 'Lépés a lapok és a gombok között',
    figurePlayer: 'Te, tollas kalapban',
    figureBandi: 'Bandi, bajusszal és pipával',
    figureTeri: 'Teri, virággal a copfjában',
    figureDentist: 'Te mint fogorvos, homloktükörrel és szájtükörrel',
    figureAssistant: 'Teri mint asszisztens, sapkában',
    figureHygienist: 'Bandi mint dentálhigiénikus, maszkkal és szondával',
  },
  de: {
    subtitle: 'Der ungarische Kartenklassiker — du gegen Bandi und Teri, zehn Runden, mit dem alten Tell-Blatt.',
    you: 'Du',
    setupBody: 'Zehn Runden gegen zwei Bots. Biete um den Talon, erfülle dein Spiel oder bringt gemeinsam das der anderen zu Fall. Dein Endstand ist deine Punktzahl.',
    difficulty: 'Gegner',
    diffEasy: 'Leicht',
    diffMedium: 'Mittel',
    diffHard: 'Schwer',
    startSession: 'Karten geben',
    newSession: 'Neue Partie',
    abandonTitle: 'Diese Partie aufgeben?',
    abandonBody: 'Die bisherigen Runden gehen verloren, und nichts wird gewertet.',
    abandon: 'Aufgeben',
    keepPlaying: 'Weiterspielen',
    welcomeBody: 'Runde {deal} von {total} wartet, wo du aufgehört hast. Dein Stand: {units}.',
    pausedBody: 'Die Karten liegen verdeckt, bis du zurückkommst.',
    continue: 'Weiter',
    statDeal: 'Runde',
    statDealValue: '{n} / {total}',
    statUnits: 'Stand',
    yourTurn: 'Du bist dran',
    thinking: '{name} überlegt…',
    dealOverStatus: 'Runde vorbei',
    promptDiscard: 'Du hast 12 Karten: Wähle zwei, die du als Talon ablegst, dann biete.',
    promptBid: 'Wähle dein Gebot. Es werden nur Gebote über dem aktuellen angeboten.',
    promptPickup: '{name} bietet {bid}. Nimm den Talon auf, um höher zu bieten, oder passe.',
    promptKontra: '{name} spielt {bid}. Mit Kontra verdoppeln?',
    promptPlay: 'Deine Karte. Was du nicht spielen darfst, ist abgeblendet.',
    promptWait: 'Warte auf {name}.',
    discardBtn: '2 Karten ablegen',
    pickUp: 'Talon aufnehmen',
    passBtn: 'Passe',
    putBack: 'Zurücklegen und passen',
    kontraBtn: 'Kontra',
    noKontra: 'Kein Kontra',
    nextDeal: 'Nächste Runde',
    discardNeedTwo: 'Wähle genau zwei Karten zum Ablegen.',
    discardNoBid: 'Mit diesen zwei abgelegt könntest du nicht über {bid} bieten. Lege zwei andere Karten ab.',
    pickUpNoBid: 'Du hast den Talon angesehen: Auch mit diesen zwei Karten gibt es kein Gebot über {bid}. Leg sie zurück und passe.',
    reasonMustFollow: 'Du musst Farbe bekennen: {suit} wurde ausgespielt.',
    reasonMustBeat: 'Du musst die beste Karte des Stichs überbieten, wenn du kannst.',
    reasonMustTrump: 'Du hast kein {led}: Du musst Trumpf ({suit}) spielen.',
    reasonMustOvertrump: 'Du musst höher trumpfen, wenn du kannst.',
    reasonKeepUltiSeven: 'Heb die Trumpf-Sieben für den letzten Stich auf — das ist dein Ulti.',
    reasonNotYourTurn: 'Warte, bis du dran bist.',
    reasonNotPlayPhase: 'Karten werden nach dem Bieten gespielt.',
    reasonNotInHand: 'Diese Karte hast du nicht auf der Hand.',
    dealer: 'Geber',
    declarer: 'Alleinspieler',
    defender: 'Gegenspieler',
    onTurn: 'Am Zug',
    cardsCount: '{n} Karten',
    seatLabel: '{name}, Stand {units}',
    talon: 'Talon',
    talonPeek: 'Der angesehene Talon',
    yourDiscards: 'Dein Talon',
    trickN: 'Stich {n}',
    takes: '{name} sticht',
    lastTrick: 'Letzter Stich',
    currentBid: 'Gebot',
    noBidYet: 'Noch kein Gebot',
    trumpIs: 'Trumpf: {suit}',
    noTrump: 'Kein Trumpf',
    bidTitle: 'Dein Gebot',
    bidHint: 'Höher als {bid}:',
    bidFirstHint: 'Alle Gebote, die deine Karten erlauben:',
    valueTitle: 'Wert pro Gegner',
    yourHand: 'Deine Karten',
    suitPiros: 'Rot',
    suitTok: 'Schellen',
    suitZold: 'Grün',
    suitMakk: 'Eichel',
    infoPassz: 'Passz — das einfache Spiel: mehr Kartenpunkte (Asse und Zehner, letzter Stich, 20/40) als die beiden Gegenspieler.',
    infoNegyvenszaz: 'Negyvenszáz — König + Ober in Trumpf (40) ansagen und 100 Punkte erreichen.',
    infoUlti: 'Ulti — den letzten Stich mit der Trumpf-Sieben machen.',
    infoBetli: 'Betli — keinen einzigen Stich machen; ohne Trumpf, die Zehn steht unter dem Unter.',
    infoDurchmars: 'Durchmars — alle zehn Stiche machen.',
    infoHuszszaz: 'Húszszáz — König + Ober einer anderen Farbe (20) ansagen und 100 Punkte erreichen.',
    infoSzintelenDurchmars: 'Színtelen durchmars — alle zehn Stiche ohne Trumpf machen.',
    infoPiros: 'Piros — Rot ist Trumpf, und das Gebot zählt doppelt.',
    infoKontra: 'Kontra — ein Gegenspieler verdoppelt den Einsatz.',
    logPickup: '{name} nimmt den Talon auf',
    logDiscard: '{name} legt zwei Karten ab',
    logBid: '{name} bietet {bid}',
    logPass: '{name} passt',
    logDeclarer: '{name} spielt {bid}',
    logKontra: '{name}: Kontra!',
    logNoKontra: '{name}: kein Kontra',
    logAnnounce: '{name} meldet {points} ({suit})',
    logTrick: '{n}. {cards} — {name} sticht',
    logTrickOpen: '{n}. {cards} …',
    logOver: 'Die Runde ist vorbei',
    logEmpty: 'Hier erscheinen Gebote und Stiche.',
    logDealHead: 'Runde {n}',
    dealOverTitle: 'Runde {n} ist vorbei',
    contractWon: '{bid}: erfüllt',
    contractLost: '{bid}: verloren',
    kontraTag: 'mit Kontra',
    partiLine: 'Kartenpunkte: Alleinspieler {declarer}, Gegenspieler {defenders}',
    unitsLine: '{name}: {units}',
    wonTitle: 'Du hast die Partie gewonnen!',
    drawTitle: 'Gleichstand an der Spitze',
    lostTitle: 'Die Partie ist vorbei',
    resultPoints: 'Du hast {points} Punkte erzielt. ',
    resultNoPoints: 'Diesmal keine Punkte. ',
    resultTail: '{deals} Runden · {time} · Bestwert {best}.',
    newBestSuffix: ' Neuer Bestwert!',
    panelLog: 'Protokoll',
    panelSession: 'Partie',
    panelSettings: 'Einstellungen',
    panelKeys: 'Tasten',
    panelDeals: 'Runden',
    panelContracts: 'Ansagen',
    colDeal: '#',
    colDeclarer: 'Alleinspieler',
    colBid: 'Gebot',
    colResult: 'Ergebnis',
    colYou: 'Du',
    noDealsYet: 'Noch keine Runde beendet.',
    sessionNote: 'Gegner: {difficulty} · Runde {deal} von {total}',
    setSpeed: 'Tempo der Bots',
    speedSlow: 'Langsam',
    speedNormal: 'Normal',
    speedFast: 'Schnell',
    keyPause: 'Pause / weiter',
    keyConfirm: 'Start · nächste Runde · weiter',
    keyCards: 'Zwischen Karten und Knöpfen wechseln',
    figurePlayer: 'Du, mit Federhut',
    figureBandi: 'Bandi, mit Schnurrbart und Pfeife',
    figureTeri: 'Teri, mit einer Blume im Zopf',
    figureDentist: 'Du als Zahnarzt, mit Stirnspiegel und Mundspiegel',
    figureAssistant: 'Teri als Zahnarzthelferin, mit Haube',
    figureHygienist: 'Bandi als Dentalhygieniker, mit Maske und Sonde',
  },
};
