<?php
declare(strict_types=1);

require __DIR__ . '/_security.php';
require __DIR__ . '/_db.php';

$cfg = require __DIR__ . '/_config.php';

if (!arcade_cors($cfg)) {
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    arcade_json(['error' => 'method_not_allowed'], 405);
}

$game = (string) ($_GET['game'] ?? '');

$pdo = arcade_db($cfg);
$limit = max(1, min(100, (int) ($_GET['limit'] ?? $cfg['leaderboard_limit'])));

if ($game === '') {
    // Aggregate: top N across every known game, one entry per game per player
    // (highest of each player+game pair).
    // PHP turns numeric-string keys such as '2048' into ints; cast them back,
    // otherwise strict_types rejects them and the whole endpoint fails.
    $games = array_map('strval', array_keys($cfg['max_score']));
    $results = [];
    foreach ($games as $g) {
        $results[$g] = arcade_top_for_game($pdo, $cfg, $g, $limit);
    }
    arcade_json(['ok' => true, 'leaderboards' => $results]);
}

if (!arcade_is_known_game($game, $cfg)) {
    arcade_json(['error' => 'unknown_game'], 400);
}

arcade_json([
    'ok'    => true,
    'game'  => $game,
    'top'   => arcade_top_for_game($pdo, $cfg, $game, $limit),
]);

/**
 * Top N for a single game. Each player appears once with their best score.
 */
function arcade_top_for_game(PDO $pdo, array $cfg, string $game, int $limit): array
{
    $t = '`' . $cfg['table_scores'] . '`';
    // Each player once, with their best score and the time they first set it.
    $stmt = $pdo->prepare(
        "SELECT s.player_name AS name, s.score AS score, UNIX_TIMESTAMP(MIN(s.created_at)) AS at_ts
         FROM {$t} s
         JOIN (SELECT player_name, MAX(score) AS best FROM {$t}
               WHERE game = :game_inner GROUP BY player_name) b
           ON b.player_name = s.player_name AND b.best = s.score
         WHERE s.game = :game
         GROUP BY s.player_name, s.score
         ORDER BY s.score DESC, at_ts ASC
         LIMIT " . $limit
    );
    $stmt->execute([':game' => $game, ':game_inner' => $game]);
    $rows = $stmt->fetchAll();
    // Cast types since MySQL returns everything as string.
    return array_map(static fn(array $r) => [
        'name'  => (string) $r['name'],
        'score' => (int)    $r['score'],
        // UTC ISO-8601, independent of the MySQL server's time zone.
        'at'    => gmdate('Y-m-d\\TH:i:s\\Z', (int) $r['at_ts']),
    ], $rows);
}
