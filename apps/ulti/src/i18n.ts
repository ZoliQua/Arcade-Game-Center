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
  | 'figureHygienist'
  | 'rulesGoalText'
  | 'rulesPlayKeys'
  | 'rulesPlayTouch'
  | 'rulesRuleDeal'
  | 'rulesRuleBid'
  | 'rulesRuleKontra'
  | 'rulesRulePlay'
  | 'rulesRulePoints'
  | 'rulesOrderIntro'
  | 'rulesDiagramLabel'
  | 'rulesDiagramTrump'
  | 'rulesDiagramColourless'
  | 'rulesDiagramLow'
  | 'rulesDiagramHigh'
  | 'rulesTableIntro'
  | 'rulesTableContract'
  | 'rulesTableValue'
  | 'rulesTablePiros'
  | 'rulesTableNoPiros'
  | 'rulesScoringDeal'
  | 'rulesScoringExample'
  | 'rulesScoringFormula'
  | 'rulesScoringScoreExample'
  | 'rulesScoringOutcome'
  | 'rulesScoringFinish'
  | 'rulesDentalText'
  | 'rulesMobileTap'
  | 'rulesMobileFan'
  | 'rulesMobileBar'
  | 'rulesMobileFs'
  | 'touchTap'
  | 'touchTapAction'
  | 'touchBar'
  | 'touchBarAction'
  | 'playBtn'
  | 'finishNoteDeal'
  | 'finishNoteMin'
  | 'logPickupYou'
  | 'logDiscardYou'
  | 'logBidYou'
  | 'logPassYou'
  | 'logDeclarerYou'
  | 'logAnnounceYou'
  | 'logTrickYou'
  | 'takesYou';

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
    promptDiscard: 'You hold {cards} cards: pick {talon} to lay down as the talon, then bid.',
    promptBid: 'Choose your bid. Only bids higher than the current one are offered.',
    promptPickup: '{name} bid {bid}. Pick up the talon to bid higher, or pass.',
    promptKontra: '{name} plays {bid}. Double it with Kontra?',
    promptPlay: 'Your card. Cards you may not play are dimmed.',
    promptWait: 'Waiting for {name}.',
    discardBtn: 'Lay down {n} cards',
    pickUp: 'Pick up the talon',
    passBtn: 'Pass',
    putBack: 'Put it back and pass',
    kontraBtn: 'Kontra',
    noKontra: 'No kontra',
    nextDeal: 'Next deal',
    discardNeedTwo: 'Pick exactly {n} cards to lay down.',
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
    infoPassz: 'Passz — the simple game: take more card points (aces and tens, last trick, {twenty}/{forty}) than the two defenders.',
    infoNegyvenszaz: 'Negyvenszáz — announce the trump king + over ({forty}) and reach {target} points.',
    infoUlti: 'Ulti — win the last trick with the trump VII.',
    infoBetli: 'Betli — take no trick at all; no trumps, the ten ranks below the under.',
    infoDurchmars: 'Durchmars — take all ten tricks.',
    infoHuszszaz: 'Húszszáz — announce a king + over of another suit ({twenty}) and reach {target} points.',
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
    rulesGoalText: 'Play {deals} deals against Bandi and Teri and finish with the best balance. In each deal one player, the declarer, plays a contract alone; the other two defend together.',
    rulesPlayKeys: 'Click a card to play it; if a dimmed card is not allowed, the game tells you which rule stops it. While discarding, click two cards, then the lay-down button. Bid with the buttons of the bid list. Enter starts, deals the next hand and continues; P or Esc pauses; R opens these rules.',
    rulesPlayTouch: 'Tap a card to raise it, then tap it again (or the Play button) to play it. While discarding, tap two cards, then the lay-down button. Bids, Pass and Kontra sit in the bar at the bottom.',
    rulesRuleDeal: 'Everyone gets {hand} cards and {talon} go to the talon. The forehand takes the talon, so holds {twelve} cards, lays {talon} down and must bid.',
    rulesRuleBid: 'In turn, each player either picks up the talon and bids higher, or passes. Two passes in a row end the bidding; the last bidder becomes the declarer.',
    rulesRuleKontra: 'Before the first card, each defender may double the game once with Kontra.',
    rulesRulePlay: 'The declarer leads. Follow suit and beat the best card if you can; without the led suit you must trump, and over-trump if you can. In an Ulti the trump VII is kept for the last trick.',
    rulesRulePoints: 'Card points: every ace and ten is worth {ten}, the last trick {last}; announced pairs add {twenty} (king + over of another suit) or {forty} (trump king + over). The aces and tens in the talon go to the defenders.',
    rulesOrderIntro: 'Card order from low to high:',
    rulesDiagramLabel: 'Card order from low to high. Trump games: {trump}. Betli and Színtelen durchmars: {colourless}.',
    rulesDiagramTrump: 'Trump games',
    rulesDiagramColourless: 'Betli, Színtelen durchmars',
    rulesDiagramLow: 'low',
    rulesDiagramHigh: 'high',
    rulesTableIntro: 'What each contract is worth per opponent; piros (hearts trump) doubles the trump contracts:',
    rulesTableContract: 'Contract',
    rulesTableValue: 'Value',
    rulesTablePiros: 'Piros',
    rulesTableNoPiros: 'no trump, so no piros',
    rulesScoringDeal: 'Every deal is zero-sum: the declarer collects the value from each defender, or pays it to each. With Kontra the value counts ×{kontra}, and a failed Ulti pays ×{ulti}.',
    rulesScoringExample: 'Example: a made {bid} is worth {value} units per opponent, so the declarer gets {declarer} and each defender {defender}.',
    rulesScoringFormula: 'Your score after {deals} deals: your net units × {ppu} × the difficulty factor ({easy} ×{fe}, {medium} ×{fm}, {hard} ×{fh}), never below {zero} and at most {max} points.',
    rulesScoringScoreExample: 'For example, +{units} units on {level} give {points} points.',
    rulesScoringOutcome: 'You win the session when you finish strictly on top; level with the better bot is a draw.',
    rulesScoringFinish: 'Finish is offered between deals and ends the session early. After at least {min} of the {deals} deals your score so far goes on the leaderboard; before that, {zero} points.',
    rulesDentalText: 'Dental mode dresses the three portraits as dentist, hygienist and assistant and puts a tooth on the card backs. The card faces and the rules stay the same.',
    rulesMobileTap: 'Tap a card to raise it; tap it again to play it.',
    rulesMobileFan: 'Your hand overlaps like a fan; the corner of every card shows its rank and suit.',
    rulesMobileBar: 'Laying down, bidding, Pass, Kontra and Play are in the bar at the bottom.',
    rulesMobileFs: 'The "{fs}" button above the table gives it the whole screen.',
    touchTap: 'Tap',
    touchTapAction: 'Raise a card · tap again: play it',
    touchBar: 'Bottom bar',
    touchBarAction: 'Lay down, bid, pass, kontra, play',
    playBtn: 'Play {card}',
    finishNoteDeal: 'Finish is possible between two deals.',
    finishNoteMin: 'Before {min} played deals, Finish ranks {zero} points.',
    logPickupYou: 'You pick up the talon',
    logDiscardYou: 'You lay two cards down',
    logBidYou: 'You bid {bid}',
    logPassYou: 'You pass',
    logDeclarerYou: 'You play {bid}',
    logAnnounceYou: 'You announce {points} ({suit})',
    logTrickYou: '{n}. {cards} — you take it',
    takesYou: 'you take it',
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
    welcomeBody: '{deal}. osztás (összesen {total}): ott vár, ahol abbahagytad. Egyenleged: {units}.',
    pausedBody: 'A lapok le vannak fordítva, amíg vissza nem jössz.',
    continue: 'Folytatás',
    statDeal: 'Osztás',
    statDealValue: '{n} / {total}',
    statUnits: 'Egyenleg',
    yourTurn: 'Te jössz',
    thinking: '{name} gondolkodik…',
    dealOverStatus: 'Vége az osztásnak',
    promptDiscard: '{cards} lap van nálad: válassz ki {talon} lapot, azt lerakod talonnak, aztán licitálsz.',
    promptBid: 'Válaszd ki a bemondásod. Csak a mostaninál magasabb licitek közül választhatsz.',
    promptPickup: '{name} licitje: {bid}. Vedd fel a talont, ha magasabbat mondanál, vagy passzolj.',
    promptKontra: '{name} játssza: {bid}. Megkontrázod?',
    promptPlay: 'Te hívsz vagy te teszel. Amit nem tehetsz, az halványabb.',
    promptWait: '{name} következik.',
    discardBtn: 'Lerakom a {n} lapot',
    pickUp: 'Felveszem a talont',
    passBtn: 'Passzolok',
    putBack: 'Visszarakom, passz',
    kontraBtn: 'Kontra',
    noKontra: 'Nem kontrázok',
    nextDeal: 'Következő osztás',
    discardNeedTwo: 'Pontosan {n} lapot válassz ki a lerakáshoz.',
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
    infoPassz: 'Passz — az alapjáték: több pontot (ász, tízes, utolsó ütés, {twenty}/{forty}) kell vinned, mint a két ellenjátékosnak együtt.',
    infoNegyvenszaz: 'Negyvenszáz — bemondod az adu király + felsőt ({forty}), és legalább {target} pontot viszel.',
    infoUlti: 'Ulti — az utolsó ütést az adu hetessel viszed el.',
    infoBetli: 'Betli — egyetlen ütést sem viszel; nincs adu, a tízes az alsó alatt áll.',
    infoDurchmars: 'Durchmars — mind a tíz ütést elviszed.',
    infoHuszszaz: 'Húszszáz — bemondasz egy másik színű király + felsőt ({twenty}), és legalább {target} pontot viszel.',
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
    logAnnounce: '{name} bemondja: {points} ({suit})',
    logTrick: '{n}. {cards} — {name} viszi',
    logTrickOpen: '{n}. {cards} …',
    logOver: 'Vége az osztásnak',
    logEmpty: 'Itt jelennek meg a licitek és az ütések.',
    logDealHead: '{n}. osztás',
    dealOverTitle: '{n}. osztás vége',
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
    rulesGoalText: '{deals} osztást játszol Bandi és Teri ellen, és a legjobb egyenleggel kell végezned. Minden osztásban egy játékos, a felvevő egyedül vállal egy bemondást, a másik kettő közösen játszik ellene.',
    rulesPlayKeys: 'Kattints egy lapra, és kijátszod; ha egy halvány lapot nem tehetsz, a játék megmondja, melyik szabály tiltja. Lerakáskor kattints két lapra, aztán a lerakás gombra. Licitálni a licitlista gombjaival tudsz. Az Enter indít, új osztást kér és folytat; a P vagy az Esc szünetet tart; az R megnyitja ezt a szabálylapot.',
    rulesPlayTouch: 'Koppints egy lapra, és kiemelkedik; koppints rá újra (vagy a Kijátszom gombra), és kijátszod. Lerakáskor koppints két lapra, aztán a lerakás gombra. A licitek, a Passz és a Kontra lent, az alsó sávban vannak.',
    rulesRuleDeal: 'Mindenki {hand} lapot kap, {talon} lap a talonba kerül. Az előkéz felveszi a talont, így {twelve} lap van nála; ebből {talon} lapot lerak, és licitálnia kell.',
    rulesRuleBid: 'Sorban mindenki vagy felveszi a talont és magasabbat mond, vagy passzol. Két passz egymás után lezárja a licitet; az utolsó licitáló lesz a felvevő.',
    rulesRuleKontra: 'Az első lap előtt mindkét ellenjátékos egyszer megkontrázhatja a játékot.',
    rulesRulePlay: 'A felvevő hív először. Színre színt kell tenni, és ha tudod, felül kell ütnöd a legjobb lapot; ha nincs a hívott színből, adut kell tenned, és ha tudsz, felül kell aduznod. Ultiban az adu hetest az utolsó ütésre kell tartogatni.',
    rulesRulePoints: 'Pontok: minden ász és tízes {ten}, az utolsó ütés {last}; a bemondott pár {twenty} (másik szín király + felső) vagy {forty} (adu király + felső). A talonban maradt ászok és tízesek az ellenjátékosoké.',
    rulesOrderIntro: 'A lapok sorrendje a legkisebbtől a legnagyobbig:',
    rulesDiagramLabel: 'A lapok sorrendje a legkisebbtől a legnagyobbig. Adus játékok: {trump}. Betli és színtelen durchmars: {colourless}.',
    rulesDiagramTrump: 'Adus játékok',
    rulesDiagramColourless: 'Betli, színtelen durchmars',
    rulesDiagramLow: 'kicsi',
    rulesDiagramHigh: 'nagy',
    rulesTableIntro: 'Mennyit ér egy-egy bemondás ellenfelenként; piros adu esetén az adus bemondások duplán számítanak:',
    rulesTableContract: 'Bemondás',
    rulesTableValue: 'Érték',
    rulesTablePiros: 'Piros',
    rulesTableNoPiros: 'nincs adu, így piros sincs',
    rulesScoringDeal: 'Minden osztás nullaösszegű: a felvevő mindkét ellenjátékostól megkapja az értéket, vagy mindkettőnek kifizeti. Kontrával ×{kontra} az érték, a bukott ulti pedig ×{ulti} értéket fizet.',
    rulesScoringExample: 'Példa: a teljesített {bid} ellenfelenként {value} egységet ér, így a felvevő {declarer}, mindkét ellenjátékos {defender} egységet kap.',
    rulesScoringFormula: 'A pontszámod {deals} osztás után: nettó egységeid × {ppu} × a nehézségi szorzó ({easy} ×{fe}, {medium} ×{fm}, {hard} ×{fh}), legalább {zero}, legfeljebb {max} pont.',
    rulesScoringScoreExample: 'Például {level} szinten +{units} egység {points} pontot ér.',
    rulesScoringOutcome: 'Akkor nyered meg a játszmát, ha egyedül végzel az élen; ha a jobbik géppel holtversenyben vagy, az döntetlen.',
    rulesScoringFinish: 'A Befejezés két osztás között lezárja a játszmát. Ha már legalább {min} osztást lejátszottál a {deals}-ből, az eddigi pontszámod kerül a ranglistára, előtte {zero} pont.',
    rulesDentalText: 'Fogas módban a három portré fogorvosnak, dentálhigiénikusnak és asszisztensnek öltözik, a lapok hátára pedig fog kerül. A lapok képe és a szabályok nem változnak.',
    rulesMobileTap: 'Koppints egy lapra: kiemelkedik; koppints rá újra: kijátszod.',
    rulesMobileFan: 'A lapjaid legyezőben fedik egymást; minden lap sarkában ott a rangja és a színe.',
    rulesMobileBar: 'A lerakás, a licit, a Passz, a Kontra és a kijátszás gombja az alsó sávban van.',
    rulesMobileFs: 'Az asztal fölötti „{fs}” gomb az egész képernyőt az asztalnak adja.',
    touchTap: 'Koppintás',
    touchTapAction: 'Lap kiemelése · újra: kijátszás',
    touchBar: 'Alsó sáv',
    touchBarAction: 'Lerakás, licit, passz, kontra, kijátszás',
    playBtn: 'Kijátszom: {card}',
    finishNoteDeal: 'Befejezni két osztás között lehet.',
    finishNoteMin: '{min} lejátszott osztás előtt a Befejezés {zero} pontot ér.',
    logPickupYou: 'Felveszed a talont',
    logDiscardYou: 'Leraksz két lapot',
    logBidYou: 'A licited: {bid}',
    logPassYou: 'Passzolsz',
    logDeclarerYou: 'Te játszod: {bid}',
    logAnnounceYou: 'Bemondod: {points} ({suit})',
    logTrickYou: '{n}. {cards} — te viszed',
    takesYou: 'te viszed',
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
    promptDiscard: 'Du hast {cards} Karten: Wähle {talon}, die du als Talon ablegst, dann biete.',
    promptBid: 'Wähle dein Gebot. Es werden nur Gebote über dem aktuellen angeboten.',
    promptPickup: '{name} bietet {bid}. Nimm den Talon auf, um höher zu bieten, oder passe.',
    promptKontra: '{name} spielt {bid}. Mit Kontra verdoppeln?',
    promptPlay: 'Deine Karte. Was du nicht spielen darfst, ist abgeblendet.',
    promptWait: 'Warte auf {name}.',
    discardBtn: '{n} Karten ablegen',
    pickUp: 'Talon aufnehmen',
    passBtn: 'Passen',
    putBack: 'Zurücklegen und passen',
    kontraBtn: 'Kontra',
    noKontra: 'Kein Kontra',
    nextDeal: 'Nächste Runde',
    discardNeedTwo: 'Wähle genau {n} Karten zum Ablegen.',
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
    takes: '{name} macht den Stich',
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
    infoPassz: 'Passz — das einfache Spiel: mehr Kartenpunkte (Asse und Zehner, letzter Stich, {twenty}/{forty}) als die beiden Gegenspieler.',
    infoNegyvenszaz: 'Negyvenszáz — König + Ober in Trumpf ({forty}) ansagen und {target} Punkte erreichen.',
    infoUlti: 'Ulti — den letzten Stich mit der Trumpf-Sieben machen.',
    infoBetli: 'Betli — keinen einzigen Stich machen; ohne Trumpf, die Zehn steht unter dem Unter.',
    infoDurchmars: 'Durchmars — alle zehn Stiche machen.',
    infoHuszszaz: 'Húszszáz — König + Ober einer anderen Farbe ({twenty}) ansagen und {target} Punkte erreichen.',
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
    logTrick: '{n}. {cards} — {name} macht den Stich',
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
    rulesGoalText: 'Du spielst {deals} Runden gegen Bandi und Teri und willst am Ende den besten Stand haben. In jeder Runde spielt einer, der Alleinspieler, eine Ansage allein; die anderen beiden spielen gemeinsam dagegen.',
    rulesPlayKeys: 'Klick auf eine Karte, um sie zu spielen; ist eine abgeblendete Karte nicht erlaubt, sagt dir das Spiel, welche Regel es verbietet. Beim Ablegen klickst du zwei Karten an und dann den Ablege-Knopf. Geboten wird mit den Knöpfen der Gebotsliste. Enter startet, gibt die nächste Runde und macht weiter; P oder Esc pausiert; R öffnet diese Regeln.',
    rulesPlayTouch: 'Tippe auf eine Karte, sie hebt sich; tippe noch einmal (oder auf den Ausspiel-Knopf), und du spielst sie. Beim Ablegen tippst du zwei Karten an und dann den Ablege-Knopf. Gebote, Passen und Kontra liegen in der Leiste unten.',
    rulesRuleDeal: 'Jeder bekommt {hand} Karten, {talon} kommen in den Talon. Die Vorhand nimmt den Talon auf, hat also {twelve} Karten, legt {talon} ab und muss bieten.',
    rulesRuleBid: 'Reihum nimmt jeder entweder den Talon auf und bietet höher oder passt. Zweimal Passen hintereinander beendet das Bieten; wer zuletzt geboten hat, wird Alleinspieler.',
    rulesRuleKontra: 'Vor der ersten Karte darf jeder Gegenspieler das Spiel einmal mit Kontra verdoppeln.',
    rulesRulePlay: 'Der Alleinspieler spielt aus. Du musst Farbe bekennen und die beste Karte überbieten, wenn du kannst; ohne die ausgespielte Farbe musst du trumpfen und, wenn möglich, übertrumpfen. Beim Ulti bleibt die Trumpf-Sieben für den letzten Stich.',
    rulesRulePoints: 'Kartenpunkte: Jedes Ass und jede Zehn zählt {ten}, der letzte Stich {last}; gemeldete Paare bringen {twenty} (König + Ober einer anderen Farbe) oder {forty} (König + Ober in Trumpf). Asse und Zehner im Talon gehören den Gegenspielern.',
    rulesOrderIntro: 'Die Kartenfolge von niedrig nach hoch:',
    rulesDiagramLabel: 'Kartenfolge von niedrig nach hoch. Trumpfspiele: {trump}. Betli und Színtelen durchmars: {colourless}.',
    rulesDiagramTrump: 'Trumpfspiele',
    rulesDiagramColourless: 'Betli, Színtelen durchmars',
    rulesDiagramLow: 'niedrig',
    rulesDiagramHigh: 'hoch',
    rulesTableIntro: 'Was jede Ansage pro Gegner wert ist; Piros (Rot ist Trumpf) zählt bei den Trumpfspielen doppelt:',
    rulesTableContract: 'Ansage',
    rulesTableValue: 'Wert',
    rulesTablePiros: 'Piros',
    rulesTableNoPiros: 'ohne Trumpf, also kein Piros',
    rulesScoringDeal: 'Jede Runde ist ein Nullsummenspiel: Der Alleinspieler bekommt den Wert von jedem Gegenspieler oder zahlt ihn jedem. Mit Kontra zählt der Wert ×{kontra}, ein verlorenes Ulti kostet ×{ulti}.',
    rulesScoringExample: 'Beispiel: Ein erfülltes {bid} ist {value} Einheiten pro Gegner wert, der Alleinspieler bekommt also {declarer} und jeder Gegenspieler {defender}.',
    rulesScoringFormula: 'Deine Punktzahl nach {deals} Runden: deine Netto-Einheiten × {ppu} × der Schwierigkeitsfaktor ({easy} ×{fe}, {medium} ×{fm}, {hard} ×{fh}), mindestens {zero} und höchstens {max} Punkte.',
    rulesScoringScoreExample: 'Zum Beispiel bringen +{units} Einheiten auf der Stufe {level} {points} Punkte.',
    rulesScoringOutcome: 'Du gewinnst die Partie, wenn du allein vorn liegst; Gleichstand mit dem besseren Bot ist ein Unentschieden.',
    rulesScoringFinish: '„Beenden” gibt es zwischen den Runden und schließt die Partie vorzeitig ab. Nach mindestens {min} der {deals} Runden kommt deine bisherige Punktzahl in die Bestenliste, davor {zero} Punkte.',
    rulesDentalText: 'Im Zahnmodus werden die drei Porträts zu Zahnarzt, Dentalhygieniker und Zahnarzthelferin, und auf den Kartenrücken ist ein Zahn. Die Kartenbilder und die Regeln bleiben gleich.',
    rulesMobileTap: 'Tippe auf eine Karte, sie hebt sich; tippe noch einmal, und du spielst sie.',
    rulesMobileFan: 'Deine Karten liegen überlappend wie ein Fächer; in jeder Ecke stehen Rang und Farbe.',
    rulesMobileBar: 'Ablegen, Bieten, Passen, Kontra und Ausspielen findest du in der Leiste unten.',
    rulesMobileFs: 'Der Knopf „{fs}” über dem Tisch gibt ihm den ganzen Bildschirm.',
    touchTap: 'Tippen',
    touchTapAction: 'Karte anheben · noch einmal: ausspielen',
    touchBar: 'Leiste unten',
    touchBarAction: 'Ablegen, bieten, passen, Kontra, ausspielen',
    playBtn: '{card} ausspielen',
    finishNoteDeal: 'Beenden geht zwischen zwei Runden.',
    finishNoteMin: 'Vor {min} gespielten Runden bringt „Beenden” {zero} Punkte.',
    logPickupYou: 'Du nimmst den Talon auf',
    logDiscardYou: 'Du legst zwei Karten ab',
    logBidYou: 'Du bietest {bid}',
    logPassYou: 'Du passt',
    logDeclarerYou: 'Du spielst {bid}',
    logAnnounceYou: 'Du meldest {points} ({suit})',
    logTrickYou: '{n}. {cards} — du machst den Stich',
    takesYou: 'du machst den Stich',
  },
};
