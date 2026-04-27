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
    $games = array_keys($cfg['max_score']);
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
    $stmt = $pdo->prepare(
        'SELECT player_name AS name, MAX(score) AS score, MAX(created_at) AS at
         FROM `' . $cfg['table_scores'] . '`
         WHERE game = :game
         GROUP BY player_name
         ORDER BY score DESC, at ASC
         LIMIT ' . $limit
    );
    $stmt->execute([':game' => $game]);
    $rows = $stmt->fetchAll();
    // Cast types since MySQL returns everything as string.
    return array_map(static fn(array $r) => [
        'name'  => (string) $r['name'],
        'score' => (int)    $r['score'],
        'at'    => (string) $r['at'],
    ], $rows);
}
