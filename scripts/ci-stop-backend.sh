#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="${1:-$PWD/.ci-runtime}"
PID_FILE="$RUNTIME_DIR/server.pid"

if [ -f "$PID_FILE" ]; then
  kill "$(cat "$PID_FILE")" || true
fi
