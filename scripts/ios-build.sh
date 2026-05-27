#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-production}"
./scripts/mobile-sync.sh "$TARGET_ENV" ios
ruby ./scripts/configure-ios-tests.rb

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild is required to build the iOS target." >&2
  exit 1
fi

DERIVED_DATA="${DERIVED_DATA:-$PWD/build/ios/DerivedData}"
CLONED_PACKAGES_DIR="${CLONED_PACKAGES_DIR:-$PWD/build/ios/SourcePackages}"
mkdir -p "$DERIVED_DATA"
mkdir -p "$CLONED_PACKAGES_DIR"

SCHEME="${IOS_SCHEME:-App}"
PROJECT="${IOS_PROJECT_PATH:-ios/App/App.xcodeproj}"
DESTINATION="${IOS_DESTINATION:-generic/platform=iOS Simulator}"

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "$DESTINATION" \
  -derivedDataPath "$DERIVED_DATA" \
  -clonedSourcePackagesDirPath "$CLONED_PACKAGES_DIR" \
  build-for-testing
