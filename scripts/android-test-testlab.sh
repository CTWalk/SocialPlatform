#!/usr/bin/env bash
set -euo pipefail

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is required for Firebase Test Lab runs." >&2
  exit 1
fi

: "${FIREBASE_TESTLAB_APP_APK:?Set FIREBASE_TESTLAB_APP_APK}"
: "${FIREBASE_TESTLAB_TEST_APK:?Set FIREBASE_TESTLAB_TEST_APK}"

gcloud firebase test android run \
  --type instrumentation \
  --app "$FIREBASE_TESTLAB_APP_APK" \
  --test "$FIREBASE_TESTLAB_TEST_APK"
