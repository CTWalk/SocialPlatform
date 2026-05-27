#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-production}"
./scripts/mobile-sync.sh "$TARGET_ENV" android

if [ ! -x "./android/gradlew" ]; then
  echo "android/gradlew is missing. Ensure the Android platform has been added." >&2
  exit 1
fi

(cd android && ./gradlew assembleDebug assembleDebugAndroidTest)
