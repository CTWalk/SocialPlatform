#!/usr/bin/env bash
set -euo pipefail

BUNDLE_DIR="${1:-dist/company-social-platform}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4173}"

if [ ! -d "$BUNDLE_DIR" ]; then
  echo "Release bundle directory not found: $BUNDLE_DIR" >&2
  exit 1
fi

required_files=(
  "index.html"
  "main.js"
  "runtime.js"
  "styles.css"
  "manifest.webmanifest"
  "ngsw.json"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$BUNDLE_DIR/$file" ]; then
    echo "Missing release bundle file: $BUNDLE_DIR/$file" >&2
    exit 1
  fi
done

server_log="$(mktemp)"
index_response="$(mktemp)"

cleanup() {
  if [ -n "${server_pid:-}" ]; then
    kill "$server_pid" >/dev/null 2>&1 || true
    wait "$server_pid" 2>/dev/null || true
  fi
  rm -f "$server_log" "$index_response"
}

trap cleanup EXIT

python3 -m http.server "$PORT" --bind "$HOST" --directory "$BUNDLE_DIR" >"$server_log" 2>&1 &
server_pid=$!

for _ in $(seq 1 30); do
  if curl -fsS "http://$HOST:$PORT/" >"$index_response"; then
    break
  fi
  sleep 1
done

if [ ! -s "$index_response" ]; then
  echo "Release bundle failed to start on http://$HOST:$PORT/" >&2
  cat "$server_log" >&2
  exit 1
fi

grep -q "<title>Company Social Platform</title>" "$index_response"
grep -q "<app-root" "$index_response"
curl -fsS "http://$HOST:$PORT/manifest.webmanifest" >/dev/null
curl -fsS "http://$HOST:$PORT/ngsw.json" >/dev/null

echo "Verified release bundle at $BUNDLE_DIR"
