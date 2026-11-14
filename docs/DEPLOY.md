# Deploy

One static build plus a small PHP API. Production target: **https://dulzoltan.hu/arcade/**
(cPanel + LFTP, no SSH).

| Piece | Source | Destination |
| --- | --- | --- |
| Portal (static) | `apps/portal/dist/` | `<document root>/arcade/` |
| Leaderboard API | `arcade-api/` | `<document root>/arcade/api/` |

The portal builds with relative asset paths and hash routing (`#/play/snake`), so it works from any sub-folder without
server rewrites.

## One-time server setup

1. In cPanel create the MySQL database `fogorvosa_arcade` and a user with full privileges on it
   (the `fogorvosa_` prefix is enforced by the host).
2. Generate a shared key: `php -r "echo bin2hex(random_bytes(24));"`
3. Copy `arcade-api/_config.example.php` → `arcade-api/_config.php` (gitignored), fill in the DB credentials and the key.
   Keep `trust_proxy` **false** unless the API is behind a proxy/CDN that sets `X-Forwarded-For`.
4. Copy `apps/portal/.env.example` → `apps/portal/.env` (gitignored): `VITE_ARCADE_API_BASE=/arcade/api` (same-origin,
   relative) and the same key in `VITE_ARCADE_API_KEY`. The key ships in the JS bundle — it only stops naive bots; rate limit and
   score caps do the rest.
5. Upload `_config.php` once to `<document root>/arcade/api/_config.php`.

The first request creates the table automatically.

### Upgrading to v3.2 (fifteen games)

Add Snapszer to the live `_config.php` `max_score` map, otherwise its scores are rejected with `unknown_game`
(match score: unit lead × 100 plus 500 for the win, times the difficulty factor, capped at 5,000):

```php
'snapszer'    => 5000,
```

Upload the whole `apps/portal/dist/` (new game chunk, new icons `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`,
`icon-192.png`, `icon-512.png`, `social-card.png` and `manifest.webmanifest`). Before uploading, the headless iPhone smoke run
checks every game in the build:

```bash
npm run build
CHROMIUM_PATH=/path/to/chrome-headless-shell node scripts/mobile-smoke.mjs   # 15 lines, all OK
```

### Upgrading to v3.1 (fourteen games)

Add Minesweeper, Solitaire and Ulti to the live `_config.php` `max_score` map, otherwise their scores are rejected with
`unknown_game` (Minesweeper: classic max 6000 for Expert cleared on par, time attack capped at 12000; Solitaire: Spider four suits won on par without undo; Ulti: the
ten-deal session cap):

```php
'minesweeper' => 12000,
'solitaire'   => 4000,
'ulti'        => 30000,
```

### Upgrading an existing server to v2.3 (eleven games)

Add Texas Hold'em to the live `_config.php` `max_score` map (hard-table base 5,000 × first-place share 1.0):

```php
'holdem'    => 5000,
```

### Upgrading an existing server to v2.2 (ten games)

Add Nut Sort to the live `_config.php` `max_score` map (20 levels × 100 × nut types, solved at par):

```php
'nutsort'   => 10800,
```

### Upgrading an existing server to v2.1 (nine games)

The live `_config.php` is not in git — add the new games to its `max_score` map, otherwise their scores are rejected
with `unknown_game`, and raise the Pac-Man cap:

```php
'pacman'    => 999999,
'breakout'  => 999999,
'invaders'  => 999999,
'gomoku'    => 1000,
'tictactoe' => 1000,
'connect4'  => 1000,
```

Optionally add `'trust_proxy' => false,`.

## Every deploy

```bash
npm ci
npm run check        # lint, typecheck, tests, sync check, build

lftp -e "
  set ssl:verify-certificate no
  set ftp:ssl-allow yes
  open -u USER,PASS <your FTP host>
  mirror -R --delete --exclude '\\.well-known/' apps/portal/dist <document root>/arcade
  mirror -R --exclude '_config\\.php\$' --exclude 'tests/' arcade-api <document root>/arcade/api
  bye
"
```

- `--delete` is safe for the frontend because `dist/` is rebuilt from scratch. `dist/.htaccess` (from
  `apps/portal/public/`) keeps browsers from caching a stale `index.html` after a deploy.
- The API mirror never uses `--delete` and excludes `_config.php`, so the live secrets survive.

## Local smoke test

```bash
npm run build && npm run preview     # http://localhost:4173
```

Without `.env` the leaderboard shows "server not configured" — expected. With the relative base the local dev/preview
server has no `/arcade/api/`, so the leaderboard shows its error state unless you proxy that path to a PHP server. To test the API locally, run PHP's built-in
server in `arcade-api/` against a local MySQL and add `http://localhost:5173` to `allowed_origins`.

## API smoke test

`arcade-api/tests/smoke.sh <base-url> <api-key>` checks the happy path and every rejection (bad key, unknown game,
cap, nickname, method). It inserts rows — run it only against a scratch database, never production.

## Moving to dulzoltan.hu (v3)

v3 moves the arcade from the old domain to `https://dulzoltan.hu/arcade/`. The same cPanel account hosts both, and the
document root is not necessarily `public_html` — look it up first (cPanel `DomainInfo/domains_data`). Use the cPanel
account's own FTP host (`<your FTP host>` in the commands above); the same account serves both domains, so the database and
credentials stay the same once `api/` (with `_config.php`) is copied server-side.

1. Build with the same-origin API base `VITE_ARCADE_API_BASE=/arcade/api` in `apps/portal/.env`, then
   `npm run check`. The base is relative on purpose: the bundle calls the API on whatever host served the page, so it
   works on `https://dulzoltan.hu` and `https://www.dulzoltan.hu` alike (no hard-coded host, no cross-origin call).
2. Copy the portal **and** `api/` to `<dulzoltan.hu document root>/arcade/`. Keep the live `_config.php` by copying it
   **server-side** from the old `arcade/api/` (cPanel File Manager or a server-side `cp`); never download it, never
   overwrite it from the repo. The API mirror still excludes `_config.php`.
3. Make sure `allowed_origins` in the live `_config.php` lists `https://dulzoltan.hu` and `https://www.dulzoltan.hu`
   (keep both, even though same-origin requests and the redirect below make the apex the only host in practice).
   The portal's `/arcade/.htaccess` (shipped from `apps/portal/public/.htaccess`) 301-redirects
   `www.dulzoltan.hu/arcade/…` to `https://dulzoltan.hu/arcade/…` (path and query kept), so local stats, autosaves and
   settings — stored per origin — never split between the two hosts.
4. On the old domain, put an `arcade/.htaccess` with a path-preserving 301:
   `RedirectMatch 301 ^/arcade/?(.*)$ https://dulzoltan.hu/arcade/$1`. The `#/play/<id>` hash survives the redirect in
   browsers. Leave the old `api/` in place; removing it is a manual decision.
5. Browser data (local stats, autosaves, nickname, settings) is **not** migrated — it is stored per origin, so
   players start fresh on the new domain. The server-side leaderboard is kept (same database, same credentials).
6. Verify live: the landing page lists all fifteen games and the demos animate, a game plays, a leaderboard GET
   answers for every game id, `api/_config.php` returns 403, Google Tag Manager loads, no console errors.
