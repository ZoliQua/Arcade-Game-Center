#!/usr/bin/env bash
# Smoke test for the leaderboard API against a running server and a scratch database.
#   arcade-api/tests/smoke.sh http://127.0.0.1:8802 testkey
# Never point this at production: it inserts rows.
set -euo pipefail
BASE="${1:?base url}"; KEY="${2:?api key}"
fail=0
out=$(mktemp)
trap 'rm -f "$out"' EXIT
expect() { # name expected-http-code curl-args...
  local name="$1" want="$2"; shift 2
  local got; got=$(curl -s -o "$out" -w '%{http_code}' "$@")
  if [ "$got" = "$want" ]; then echo "✓ $name"; else echo "✗ $name (HTTP $got, want $want): $(cat "$out")"; fail=1; fi
}
post() { curl_args=(-X POST -H "X-API-Key: $KEY" -H 'Content-Type: application/json' -d "$1" "$BASE/score.php"); }
post '{"game":"snake","name":"Smoke","score":42}';      expect "valid score accepted" 201 "${curl_args[@]}"
post '{"game":"2048","name":"Smoke","score":2048}';     expect "numeric game id accepted" 201 "${curl_args[@]}"
post '{"game":"gomoku","name":"Smoke","score":1001}';   expect "score above cap rejected" 400 "${curl_args[@]}"
post '{"game":"nope","name":"Smoke","score":1}';        expect "unknown game rejected" 400 "${curl_args[@]}"
post '{"game":"snake","name":"","score":1}';            expect "empty nickname rejected" 400 "${curl_args[@]}"
expect "missing key rejected" 401 -X POST -H 'Content-Type: application/json' -d '{"game":"snake","name":"x","score":1}' "$BASE/score.php"
expect "GET on score.php rejected" 405 "$BASE/score.php"
expect "single leaderboard" 200 "$BASE/leaderboard.php?game=snake"
expect "aggregate leaderboard" 200 "$BASE/leaderboard.php"
exit $fail
