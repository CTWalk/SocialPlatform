#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="${1:-$PWD/.ci-runtime}"
mkdir -p "$RUNTIME_DIR"

PORT="${PORT:-3001}"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:$PORT}"
CORS_ORIGIN="${CORS_ORIGIN:-http://127.0.0.1:4201}"
DB_FILE="${DB_FILE:-$RUNTIME_DIR/social-platform-ci.db}"
NPM_BIN="${NPM_BIN:-npm}"

PORT="$PORT" \
DB_FILE="$DB_FILE" \
CORS_ORIGIN="$CORS_ORIGIN" \
"$NPM_BIN" run start:server > "$RUNTIME_DIR/server.log" 2>&1 &

echo $! > "$RUNTIME_DIR/server.pid"

for _ in $(seq 1 30); do
  if curl -sf "$API_BASE_URL/health" >/dev/null; then
    exit 0
  fi
  sleep 2
done

echo "Backend failed to start" >&2
cat "$RUNTIME_DIR/server.log" >&2
exit 1
