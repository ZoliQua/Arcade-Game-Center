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

    // Set to true ONLY if the API runs behind a reverse proxy/CDN that sets
    // X-Forwarded-For. Otherwise the header is ignored (it can be spoofed).
    'trust_proxy' => false,

    // Per-game maximum reasonable score. Anything above is rejected as spam.
    // Tune these if a real player ever gets close.
    'max_score' => [
        'tetris' => 9999999,
        'snake'  => 10000,
        '2048'   => 9999999,
        'pacman' => 999999, // several levels × ~2,600 dots + ghost chains easily exceed 10k
        'breakout' => 999999, // endless level loop with a growing multiplier
        'invaders' => 999999, // endless waves; the 1978 cabinet rolled over at 9,999
        'nutsort'  => 10800,  // 20 fixed levels, 100 × nut types each, solved at par
        // Duel games score one round with duelRoundScore(): max 2 × 500.
        'gomoku'    => 1000,
        'tictactoe' => 1000,
        'connect4'  => 1000,
    ],

    // Nickname constraints.
    'nick_min' => 1,
    'nick_max' => 32,

    // ─── Misc ─────────────────────────────────────────────────────────────
    // Top-N for leaderboard endpoint.
    'leaderboard_limit' => 10,
];
