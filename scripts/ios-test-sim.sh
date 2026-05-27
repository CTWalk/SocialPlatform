#!/usr/bin/env bash
set -euo pipefail

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild is required to run iOS simulator tests." >&2
  exit 1
fi

ruby ./scripts/configure-ios-tests.rb

DERIVED_DATA="${DERIVED_DATA:-$PWD/build/ios/DerivedData}"
CLONED_PACKAGES_DIR="${CLONED_PACKAGES_DIR:-$PWD/build/ios/SourcePackages}"
SCHEME="${IOS_SCHEME:-App}"
PROJECT="${IOS_PROJECT_PATH:-ios/App/App.xcodeproj}"
DESTINATION="${IOS_SIM_DESTINATION:-platform=iOS Simulator,name=iPhone 16}"

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "$DESTINATION" \
  -derivedDataPath "$DERIVED_DATA" \
  -clonedSourcePackagesDirPath "$CLONED_PACKAGES_DIR" \
  test
