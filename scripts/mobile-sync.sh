#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-production}"
TARGET_PLATFORM="${2:-both}"

case "$TARGET_ENV" in
  sit) BUILD_SCRIPT="build:sit" ;;
  uat) BUILD_SCRIPT="build:uat" ;;
  preprod) BUILD_SCRIPT="build:preprod" ;;
  production|prod) BUILD_SCRIPT="build:prod" ;;
  *)
    echo "Unsupported environment: $TARGET_ENV" >&2
    exit 1
    ;;
esac

npm run "$BUILD_SCRIPT"

case "$TARGET_PLATFORM" in
  ios) npx cap sync ios ;;
  android) npx cap sync android ;;
  both) npx cap sync ;;
  *)
    echo "Unsupported platform: $TARGET_PLATFORM" >&2
    exit 1
    ;;
esac
