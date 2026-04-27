<?php
declare(strict_types=1);

/**
 * PDO singleton + first-run table migration.
 * Returns a connected, exception-throwing PDO ready to use.
 */
function arcade_db(array $cfg): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $cfg['db_host'],
        $cfg['db_name'],
        $cfg['db_charset']
    );

    $pdo = new PDO(
        $dsn,
        $cfg['db_user'],
        $cfg['db_pass'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    arcade_migrate($pdo, $cfg);
    return $pdo;
}

/**
 * Idempotent: runs CREATE TABLE IF NOT EXISTS on every request, but it's fast
 * because MySQL short-circuits when the table already exists.
 *
 * If you change the schema, bump the migration here — but for now we're
 * append-only.
 */
function arcade_migrate(PDO $pdo, array $cfg): void
{
    $table = $cfg['table_scores'];
    // Whitelist the table name since we can't bind it as a parameter.
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
        throw new RuntimeException('Invalid table name in config.');
    }

    $sql = "CREATE TABLE IF NOT EXISTS `{$table}` (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        game VARCHAR(32) NOT NULL,
        player_name VARCHAR(64) NOT NULL,
        score INT UNSIGNED NOT NULL,
        ip_hash CHAR(64) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_game_score (game, score DESC),
        INDEX idx_ip_created (ip_hash, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql);
}
