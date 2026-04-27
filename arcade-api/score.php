<?php
declare(strict_types=1);

require __DIR__ . '/_security.php';
require __DIR__ . '/_db.php';

$cfg = require __DIR__ . '/_config.php';

if (!arcade_cors($cfg)) {
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    arcade_json(['error' => 'method_not_allowed'], 405);
}

arcade_require_api_key($cfg);

// Parse JSON body.
$raw = file_get_contents('php://input') ?: '';
$body = json_decode($raw, true);
if (!is_array($body)) {
    arcade_json(['error' => 'invalid_json'], 400);
}

$game  = (string) ($body['game']  ?? '');
$nick  = (string) ($body['name']  ?? '');
$score = $body['score'] ?? null;

if (!arcade_is_known_game($game, $cfg)) {
    arcade_json(['error' => 'unknown_game'], 400);
}

$cleanNick = arcade_clean_nick($nick, $cfg);
if ($cleanNick === null) {
    arcade_json(['error' => 'invalid_name'], 400);
}

if (!is_int($score) && !(is_string($score) && ctype_digit($score))) {
    arcade_json(['error' => 'invalid_score'], 400);
}
$scoreInt = (int) $score;

if (!arcade_is_score_sane($game, $scoreInt, $cfg)) {
    arcade_json(['error' => 'score_out_of_range'], 400);
}

$pdo = arcade_db($cfg);
$ipHash = arcade_ip_hash();

if (!arcade_check_rate_limit($pdo, $cfg, $ipHash)) {
    arcade_json(['error' => 'rate_limited'], 429);
}

$stmt = $pdo->prepare(
    'INSERT INTO `' . $cfg['table_scores'] . '`
     (game, player_name, score, ip_hash) VALUES (:game, :nick, :score, :ip)'
);
$stmt->execute([
    ':game'  => $game,
    ':nick'  => $cleanNick,
    ':score' => $scoreInt,
    ':ip'    => $ipHash,
]);

// Look up the player's rank for this game (1-based, ties broken by created_at).
$rankStmt = $pdo->prepare(
    'SELECT 1 + COUNT(*) AS rank FROM `' . $cfg['table_scores'] . '`
     WHERE game = :game AND score > :score'
);
$rankStmt->execute([':game' => $game, ':score' => $scoreInt]);
$rankRow = $rankStmt->fetch();

arcade_json([
    'ok'    => true,
    'id'    => (int) $pdo->lastInsertId(),
    'rank'  => (int) ($rankRow['rank'] ?? 0),
    'game'  => $game,
    'name'  => $cleanNick,
    'score' => $scoreInt,
], 201);
