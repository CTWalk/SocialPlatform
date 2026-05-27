#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-production}"
./scripts/mobile-sync.sh "$TARGET_ENV" ios
ruby ./scripts/configure-ios-tests.rb

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild is required to package iOS artifacts." >&2
  exit 1
fi

DERIVED_DATA="${DERIVED_DATA:-$PWD/build/ios/devicefarm/DerivedData}"
CLONED_PACKAGES_DIR="${CLONED_PACKAGES_DIR:-$PWD/build/ios/devicefarm/SourcePackages}"
ARTIFACT_DIR="${IOS_DEVICEFARM_ARTIFACT_DIR:-$PWD/build/ios/devicefarm/artifacts}"
SCHEME="${IOS_SCHEME:-App}"
PROJECT="${IOS_PROJECT_PATH:-ios/App/App.xcodeproj}"
mkdir -p "$DERIVED_DATA" "$CLONED_PACKAGES_DIR" "$ARTIFACT_DIR"

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "generic/platform=iOS" \
  -derivedDataPath "$DERIVED_DATA" \
  -clonedSourcePackagesDirPath "$CLONED_PACKAGES_DIR" \
  build-for-testing

APP_BUNDLE=$(find "$DERIVED_DATA/Build/Products" -path "*iphoneos/App.app" | head -n 1)
UI_RUNNER_BUNDLE=$(find "$DERIVED_DATA/Build/Products" -path "*iphoneos/AppUITests-Runner.app" | head -n 1)

if [ -z "$APP_BUNDLE" ] || [ -z "$UI_RUNNER_BUNDLE" ]; then
  echo "Unable to locate built iOS app or UI test runner artifacts." >&2
  exit 1
fi

PAYLOAD_DIR="$ARTIFACT_DIR/Payload"
TEST_PAYLOAD_DIR="$ARTIFACT_DIR/TestPayload"
rm -rf "$PAYLOAD_DIR" "$TEST_PAYLOAD_DIR"
mkdir -p "$PAYLOAD_DIR" "$TEST_PAYLOAD_DIR"
cp -R "$APP_BUNDLE" "$PAYLOAD_DIR/App.app"
cp -R "$UI_RUNNER_BUNDLE" "$TEST_PAYLOAD_DIR/AppUITests-Runner.app"

(cd "$ARTIFACT_DIR" && zip -qry "CompanySocialPlatform.ipa" Payload)
(cd "$ARTIFACT_DIR" && zip -qry "CompanySocialPlatformUITests.zip" TestPayload)

echo "IOS_DEVICEFARM_APP_FILE=$ARTIFACT_DIR/CompanySocialPlatform.ipa"
echo "IOS_DEVICEFARM_TEST_FILE=$ARTIFACT_DIR/CompanySocialPlatformUITests.zip"
