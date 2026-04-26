#!/usr/bin/env bash
#
# Sync game logic from this monorepo back to its standalone GitHub repo.
#
# Usage:
#   scripts/sync-to-upstream.sh <game> [--push]
#
# What it does:
#   1. Clones the upstream repo into /tmp.
#   2. Copies src/logic, src/hooks, src/components from apps/<game> over the
#      upstream's matching folders (rsync --delete, so removed files are also
#      removed upstream).
#   3. Shows the diff and stages a commit. Pushes only if --push is given.
#
# What it does NOT touch upstream:
#   - index.html, main.tsx, App.tsx, vite.config.ts
#   - package.json, tsconfig*.json, eslint.config.js
#   - styles/ (we rewrote those for portal scoping; upstream keeps its own)
#   - README, LICENSE, CLAUDE.md, etc.
#
# Add a new game by extending the case statement in CONFIG below.

set -euo pipefail

# ─── CONFIG ────────────────────────────────────────────────────────────────
config_for() {
  case "$1" in
    tetris)
      UPSTREAM_URL="https://github.com/ZoliQua/Tetris-Game"
      # Tetris upstream has a nested Tetris-Game/ folder, then src/.
      UPSTREAM_SRC="Tetris-Game/src"
      ;;
    snake)
      UPSTREAM_URL="https://github.com/ZoliQua/Snake-Game"
      UPSTREAM_SRC="src"
      ;;
    2048)
      UPSTREAM_URL="https://github.com/ZoliQua/2048-Game"
      UPSTREAM_SRC="src"
      ;;
    # Add more games here, e.g.:
    # newgame)
    #   UPSTREAM_URL="https://github.com/ZoliQua/NewGame"
    #   UPSTREAM_SRC="src"
    #   ;;
    *)
      echo "Unknown game: $1" >&2
      echo "Supported: tetris, snake, 2048" >&2
      exit 1
      ;;
  esac
}

# ─── ARGS ──────────────────────────────────────────────────────────────────
GAME="${1:-}"
PUSH="${2:-}"

if [ -z "$GAME" ] || [ "$GAME" = "-h" ] || [ "$GAME" = "--help" ]; then
  sed -n '3,18p' "$0" | sed 's/^# *//'
  exit 0
fi

config_for "$GAME"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_SRC="$REPO_ROOT/apps/$GAME/src"

if [ ! -d "$LOCAL_SRC" ]; then
  echo "✗ $LOCAL_SRC does not exist" >&2
  exit 1
fi

# ─── CLONE UPSTREAM INTO /tmp ──────────────────────────────────────────────
TMP="$(mktemp -d -t arcade-sync.XXXX)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Cloning $UPSTREAM_URL into $TMP/repo"
git clone --quiet "$UPSTREAM_URL" "$TMP/repo"

# ─── COPY LOGIC / HOOKS / COMPONENTS ──────────────────────────────────────
SUBDIRS=(logic hooks components)
COPIED=()

for d in "${SUBDIRS[@]}"; do
  SRC="$LOCAL_SRC/$d"
  DST="$TMP/repo/$UPSTREAM_SRC/$d"
  if [ ! -d "$SRC" ]; then
    echo "  · skip $d (not present in monorepo)"
    continue
  fi
  mkdir -p "$DST"
  rsync -a --delete "$SRC/" "$DST/"
  COPIED+=("$d")
done

if [ "${#COPIED[@]}" -eq 0 ]; then
  echo "✗ Nothing to copy."
  exit 1
fi

echo "→ Copied: ${COPIED[*]}"

# ─── DIFF + COMMIT ─────────────────────────────────────────────────────────
cd "$TMP/repo"

if git diff --quiet && git diff --cached --quiet; then
  echo ""
  echo "✓ Upstream is already in sync. Nothing to commit."
  exit 0
fi

echo ""
echo "─── DIFF (against upstream main) ─────────────────────────────────────"
git --no-pager diff --stat
echo "──────────────────────────────────────────────────────────────────────"
echo ""

# Build a commit message that lists the changed top-level dirs.
CHANGED_DIRS=$(git diff --name-only \
  | sed "s|^${UPSTREAM_SRC}/||" \
  | awk -F/ '{print $1}' \
  | sort -u \
  | paste -sd ', ' -)

git add -A
git -c user.email=ssdbtc@gmail.com -c user.name=ZoliQua \
  commit -m "sync(${GAME}): pull ${CHANGED_DIRS} from arcade monorepo"

echo "✓ Committed in $TMP/repo"
echo ""

# ─── PUSH (only with --push) ───────────────────────────────────────────────
if [ "$PUSH" = "--push" ]; then
  echo "→ Pushing to origin/main..."
  git push origin main
  echo "✓ Pushed."
else
  echo "Review the commit, then push manually:"
  echo "  cd $TMP/repo && git log -1 && git push origin main"
  echo ""
  echo "Or re-run with --push to push automatically next time."
  echo ""
  echo "(The temp clone at $TMP/repo will be removed when this script exits."
  echo " Copy the path above NOW if you want to inspect it.)"
  read -r -p "Press ENTER to exit and clean up, or Ctrl-C to keep the clone. "
fi
