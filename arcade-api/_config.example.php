<?php
// Copy this file to _config.php on the production server and fill in real values.
// _config.php is gitignored so secrets never enter the repo.

return [
    // ─── Database ─────────────────────────────────────────────────────────
    // The cPanel-prefixed MySQL DB name and user (the prefix is fixed by the host).
    'db_host'     => 'localhost',
    'db_name'     => 'fogorvosa_arcade',
    'db_user'     => 'fogorvosa_arcade',
    'db_pass'     => 'CHANGE_ME',
    'db_charset'  => 'utf8mb4',

    // Table name. Must keep the fogorvosa_ prefix per host policy.
    'table_scores' => 'fogorvosa_arcade_scores',

    // ─── Security ─────────────────────────────────────────────────────────
    // Shared secret the frontend sends in the X-API-Key header on POST.
    // Generate with: php -r "echo bin2hex(random_bytes(24));"
    'api_key' => 'CHANGE_ME_TO_A_LONG_RANDOM_STRING',

    // CORS — list every origin that should be able to POST/GET.
    // Add http://localhost:5173 only while testing locally.
    'allowed_origins' => [
        'https://drdul.hu',
        'https://www.drdul.hu',
    ],

    // ─── Anti-spam ────────────────────────────────────────────────────────
    // Max submissions per IP per hour. Naive bots get bounced; humans never hit it.
    'rate_limit_per_hour' => 30,

    // Per-game maximum reasonable score. Anything above is rejected as spam.
    // Tune these if a real player ever gets close.
    'max_score' => [
        'tetris' => 9999999,
        'snake'  => 10000,
        '2048'   => 9999999,
        'pacman' => 10000,
    ],

    // Nickname constraints.
    'nick_min' => 1,
    'nick_max' => 32,

    // ─── Misc ─────────────────────────────────────────────────────────────
    // Top-N for leaderboard endpoint.
    'leaderboard_limit' => 10,
];
