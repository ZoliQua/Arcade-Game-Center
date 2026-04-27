<?php
declare(strict_types=1);

/**
 * CORS handling: respond to preflight, set headers on real requests.
 * Returns true if the request should continue, false if we already responded
 * (the caller should exit() in that case).
 */
function arcade_cors(array $cfg): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = in_array($origin, $cfg['allowed_origins'], true);

    if ($allowed) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-API-Key');
        header('Access-Control-Max-Age: 86400');
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        // Even non-allowed origins get a 204 — the absent CORS headers will
        // make the browser refuse the real request.
        http_response_code(204);
        return false;
    }

    return true;
}

/**
 * JSON response helper. Always sets Content-Type and exits.
 */
function arcade_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Verify the X-API-Key header matches the configured secret.
 * Returns void on success, sends 401 + exits on failure.
 */
function arcade_require_api_key(array $cfg): void
{
    $sent = $_SERVER['HTTP_X_API_KEY'] ?? '';
    if (!hash_equals((string) $cfg['api_key'], (string) $sent)) {
        arcade_json(['error' => 'unauthorized'], 401);
    }
}

/**
 * SHA-256 of the client IP. Stored as a hash so we can rate-limit without
 * keeping raw IPs around.
 */
function arcade_ip_hash(): string
{
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['HTTP_X_REAL_IP']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '0.0.0.0';
    // X-Forwarded-For may be a comma-separated list; take the first.
    $ip = trim(explode(',', $ip)[0]);
    return hash('sha256', $ip);
}

/**
 * Returns true if the IP has submitted fewer than rate_limit_per_hour scores
 * in the last hour.
 */
function arcade_check_rate_limit(PDO $pdo, array $cfg, string $ipHash): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) AS c FROM `' . $cfg['table_scores'] . '`
         WHERE ip_hash = :ip AND created_at > (NOW() - INTERVAL 1 HOUR)'
    );
    $stmt->execute([':ip' => $ipHash]);
    $row = $stmt->fetch();
    return ((int) $row['c']) < (int) $cfg['rate_limit_per_hour'];
}

/**
 * Validates and returns a clean nickname, or null if invalid.
 * Strips control chars; keeps unicode letters, numbers, basic punctuation.
 */
function arcade_clean_nick(string $nick, array $cfg): ?string
{
    $nick = trim($nick);
    // Strip control characters but keep unicode (mb_*).
    $nick = preg_replace('/[\x00-\x1F\x7F]/u', '', $nick) ?? '';
    $len = mb_strlen($nick, 'UTF-8');
    if ($len < (int) $cfg['nick_min'] || $len > (int) $cfg['nick_max']) {
        return null;
    }
    return $nick;
}

/**
 * Validates the game id against the configured max_score map.
 */
function arcade_is_known_game(string $game, array $cfg): bool
{
    return array_key_exists($game, $cfg['max_score']);
}

/**
 * Validates score against configured per-game max.
 */
function arcade_is_score_sane(string $game, int $score, array $cfg): bool
{
    $max = (int) ($cfg['max_score'][$game] ?? 0);
    return $score >= 0 && $score <= $max;
}
