# Deploy

One static build plus a small PHP API. Production target: **https://drdul.hu/arcade/**
(cPanel + LFTP, no SSH).

| Piece | Source | Destination |
| --- | --- | --- |
| Portal (static) | `apps/portal/dist/` | `public_html/arcade/` |
| Leaderboard API | `arcade-api/` | `public_html/arcade/api/` |

The portal builds with relative asset paths and hash routing (`#/play/snake`), so it works from any sub-folder without
server rewrites.

## One-time server setup

1. In cPanel create the MySQL database `fogorvosa_arcade` and a user with full privileges on it
   (the `fogorvosa_` prefix is enforced by the host).
2. Generate a shared key: `php -r "echo bin2hex(random_bytes(24));"`
3. Copy `arcade-api/_config.example.php` → `arcade-api/_config.php` (gitignored), fill in the DB credentials and the key.
   Keep `trust_proxy` **false** unless the API is behind a proxy/CDN that sets `X-Forwarded-For`.
4. Copy `apps/portal/.env.example` → `apps/portal/.env` (gitignored): `VITE_ARCADE_API_BASE=https://drdul.hu/arcade/api`
   and the same key in `VITE_ARCADE_API_KEY`. The key ships in the JS bundle — it only stops naive bots; rate limit and
   score caps do the rest.
5. Upload `_config.php` once to `public_html/arcade/api/_config.php`.

The first request creates the table automatically.

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
  open -u USER,PASS ftp.drdul.hu
  mirror -R --delete --exclude '\\.well-known/' apps/portal/dist public_html/arcade
  mirror -R --exclude '_config\\.php\$' --exclude 'tests/' arcade-api public_html/arcade/api
  bye
"
```

- `--delete` is safe for the frontend because `dist/` is rebuilt from scratch.
- The API mirror never uses `--delete` and excludes `_config.php`, so the live secrets survive.

## Local smoke test

```bash
npm run build && npm run preview     # http://localhost:4173
```

Without `.env` the leaderboard shows "server not configured" — expected. To test the API locally, run PHP's built-in
server in `arcade-api/` against a local MySQL and add `http://localhost:5173` to `allowed_origins`.

## API smoke test

`arcade-api/tests/smoke.sh <base-url> <api-key>` checks the happy path and every rejection (bad key, unknown game,
cap, nickname, method). It inserts rows — run it only against a scratch database, never production.
