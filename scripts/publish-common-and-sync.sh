#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMON_DIR="$ROOT_DIR/common"
COMMON_PACKAGE_NAME="@skillstew/common"

# Optional version bump level for publish path.
BUMP_LEVEL="${1:-patch}"
if [[ "$BUMP_LEVEL" != "patch" && "$BUMP_LEVEL" != "minor" && "$BUMP_LEVEL" != "major" ]]; then
  echo "Invalid bump level: $BUMP_LEVEL"
  echo "Usage: $0 [patch|minor|major]"
  exit 1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

run_in_dir() {
  local dir="$1"
  shift
  (
    cd "$dir"
    "$@"
  )
}

# Ensure npm auth is available before attempting publish.
ensure_npm_auth() {
  if run_in_dir "$COMMON_DIR" npm whoami >/dev/null 2>&1; then
    return 0
  fi

  echo "You are not logged into npm. Starting npm login..."
  run_in_dir "$COMMON_DIR" npm login

  if ! run_in_dir "$COMMON_DIR" npm whoami >/dev/null 2>&1; then
    echo "npm login did not complete successfully."
    exit 1
  fi
}

# Publish once, and if failure is auth-related, re-authenticate and retry once.
publish_with_auth_retry() {
  ensure_npm_auth

  local publish_output
  if publish_output="$(run_in_dir "$COMMON_DIR" npm publish 2>&1)"; then
    echo "$publish_output"
    return 0
  fi

  echo "$publish_output"
  if grep -Eiq "ENEEDAUTH|not logged in|requires.*auth|authenticate|npm login" <<<"$publish_output"; then
    echo "Publish failed due to npm auth. Please login and retrying once..."
    run_in_dir "$COMMON_DIR" npm login
    run_in_dir "$COMMON_DIR" npm publish
    return 0
  fi

  echo "Publish failed due to a non-auth error."
  return 1
}

# Detect local changes in common/ (both staged and unstaged).
has_common_changes() {
  if ! git -C "$ROOT_DIR" diff --quiet -- common; then
    return 0
  fi

  if ! git -C "$ROOT_DIR" diff --cached --quiet -- common; then
    return 0
  fi

  return 1
}

require_cmd git
require_cmd npm
require_cmd pnpm
require_cmd bun

if [[ ! -d "$COMMON_DIR" ]]; then
  echo "common directory not found at $COMMON_DIR"
  exit 1
fi

PUBLISH_MODE="sync-only"
TARGET_VERSION=""

# Choose mode:
# - publish-and-sync when common/ changed locally
# - sync-only when common/ has no local changes
if has_common_changes; then
  PUBLISH_MODE="publish-and-sync"
  echo "Detected local changes in common/. Running publish flow..."
  run_in_dir "$COMMON_DIR" npm version "$BUMP_LEVEL"
  run_in_dir "$COMMON_DIR" npm run build
  publish_with_auth_retry
  TARGET_VERSION="$(node -p "require('$COMMON_DIR/package.json').version")"
else
  echo "No local changes in common/. Running sync-only flow..."
  TARGET_VERSION="$(npm view "$COMMON_PACKAGE_NAME" version)"
fi

if [[ -z "$TARGET_VERSION" ]]; then
  echo "Failed to resolve target version for $COMMON_PACKAGE_NAME"
  exit 1
fi

echo "Syncing consumers to $COMMON_PACKAGE_NAME@$TARGET_VERSION"

# pnpm consumers
run_in_dir "$ROOT_DIR/user" pnpm add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
run_in_dir "$ROOT_DIR/es-proxy" pnpm add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
run_in_dir "$ROOT_DIR/payments" pnpm add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"

# bun consumers
run_in_dir "$ROOT_DIR/skill" bun add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
run_in_dir "$ROOT_DIR/notification-service" bun add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
run_in_dir "$ROOT_DIR/outbox-workers/user-outbox-worker" bun add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"

# Stage only files that this workflow is expected to touch.
git -C "$ROOT_DIR" add \
  common/package.json \
  common/package-lock.json \
  user/package.json \
  user/pnpm-lock.yaml \
  es-proxy/package.json \
  es-proxy/pnpm-lock.yaml \
  payments/package.json \
  payments/pnpm-lock.yaml \
  skill/package.json \
  skill/bun.lock \
  notification-service/package.json \
  notification-service/bun.lock \
  outbox-workers/user-outbox-worker/package.json \
  outbox-workers/user-outbox-worker/bun.lock

if git -C "$ROOT_DIR" diff --cached --quiet; then
  echo "No changes to commit after sync."
  exit 0
fi

# Commit message differs by selected mode for clearer history.
if [[ "$PUBLISH_MODE" == "publish-and-sync" ]]; then
  COMMIT_MESSAGE="chore(common): publish $TARGET_VERSION and sync consumers"
else
  COMMIT_MESSAGE="chore(common): sync consumers to $TARGET_VERSION"
fi

git -C "$ROOT_DIR" commit -m "$COMMIT_MESSAGE"
echo "Created local commit: $COMMIT_MESSAGE"
echo "Done. No push performed."
