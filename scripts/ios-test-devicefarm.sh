#!/usr/bin/env bash
set -euo pipefail

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required for AWS Device Farm uploads." >&2
  exit 1
fi

: "${AWS_DEVICE_FARM_PROJECT_ARN:?Set AWS_DEVICE_FARM_PROJECT_ARN}"
: "${AWS_DEVICE_FARM_DEVICE_POOL_ARN:?Set AWS_DEVICE_FARM_DEVICE_POOL_ARN}"
: "${AWS_DEVICE_FARM_APP_FILE:?Set AWS_DEVICE_FARM_APP_FILE to the .ipa path}"
: "${AWS_DEVICE_FARM_IOS_TEST_FILE:?Set AWS_DEVICE_FARM_IOS_TEST_FILE to the XCTest UI package}"

AWS_REGION="${AWS_REGION:-us-west-2}"

wait_for_upload() {
  local upload_arn="$1"
  for _ in $(seq 1 40); do
    local status
    status=$(aws devicefarm get-upload --region "$AWS_REGION" --arn "$upload_arn" --query 'upload.status' --output text)
    if [ "$status" = "SUCCEEDED" ]; then
      return 0
    fi
    if [ "$status" = "FAILED" ]; then
      echo "Upload failed for $upload_arn" >&2
      return 1
    fi
    sleep 5
  done
  echo "Timed out waiting for upload $upload_arn" >&2
  return 1
}

read -r APP_UPLOAD_ARN APP_UPLOAD_URL <<< "$(aws devicefarm create-upload \
  --region "$AWS_REGION" \
  --project-arn "$AWS_DEVICE_FARM_PROJECT_ARN" \
  --name "$(basename "$AWS_DEVICE_FARM_APP_FILE")" \
  --type IOS_APP \
  --query 'upload.[arn,url]' \
  --output text)"

read -r TEST_UPLOAD_ARN TEST_UPLOAD_URL <<< "$(aws devicefarm create-upload \
  --region "$AWS_REGION" \
  --project-arn "$AWS_DEVICE_FARM_PROJECT_ARN" \
  --name "$(basename "$AWS_DEVICE_FARM_IOS_TEST_FILE")" \
  --type XCTEST_UI_TEST_PACKAGE \
  --query 'upload.[arn,url]' \
  --output text)"

curl -T "$AWS_DEVICE_FARM_APP_FILE" "$APP_UPLOAD_URL"
curl -T "$AWS_DEVICE_FARM_IOS_TEST_FILE" "$TEST_UPLOAD_URL"

wait_for_upload "$APP_UPLOAD_ARN"
wait_for_upload "$TEST_UPLOAD_ARN"

RUN_ARN=$(aws devicefarm schedule-run \
  --region "$AWS_REGION" \
  --project-arn "$AWS_DEVICE_FARM_PROJECT_ARN" \
  --app-arn "$APP_UPLOAD_ARN" \
  --device-pool-arn "$AWS_DEVICE_FARM_DEVICE_POOL_ARN" \
  --name "company-social-ios-xcui" \
  --test type=XCTEST_UI,testPackageArn="$TEST_UPLOAD_ARN" \
  --query 'run.arn' \
  --output text)

echo "Scheduled iOS Device Farm run:"
echo "RUN_ARN=$RUN_ARN"
