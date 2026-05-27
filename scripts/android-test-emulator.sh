#!/usr/bin/env bash
set -euo pipefail

if ! command -v adb >/dev/null 2>&1; then
  echo "adb is required to run Android emulator tests." >&2
  exit 1
fi

if [ ! -x "./android/gradlew" ]; then
  echo "android/gradlew is missing. Ensure the Android platform has been added." >&2
  exit 1
fi

(cd android && ./gradlew connectedDebugAndroidTest)
