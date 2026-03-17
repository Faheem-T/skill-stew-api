#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMON_DIR="$ROOT_DIR/common"
COMMON_PACKAGE_NAME="@skillstew/common"
POLL_INTERVAL_SECONDS=5
POLL_TIMEOUT_SECONDS=300
UPDATE_RETRY_ATTEMPTS=6
UPDATE_RETRY_DELAY_SECONDS=5

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

# Wait until the exact published version and its tarball are both available.
wait_for_published_version() {
  local expected_version="$1"
  local waited=0

  echo "Waiting for $COMMON_PACKAGE_NAME@$expected_version to propagate on npm..."
  while (( waited < POLL_TIMEOUT_SECONDS )); do
    local visible_version
    local tarball_url
    visible_version="$(npm view "$COMMON_PACKAGE_NAME@$expected_version" version 2>/dev/null || true)"
    tarball_url="$(npm view "$COMMON_PACKAGE_NAME@$expected_version" dist.tarball 2>/dev/null || true)"

    if [[ "$visible_version" == "$expected_version" && -n "$tarball_url" ]]; then
      echo "Confirmed on npm: $COMMON_PACKAGE_NAME@$expected_version"
      return 0
    fi

    echo "Not fully propagated yet (version: ${visible_version:-none}, tarball: ${tarball_url:-none}). Retrying in ${POLL_INTERVAL_SECONDS}s..."
    sleep "$POLL_INTERVAL_SECONDS"
    waited=$((waited + POLL_INTERVAL_SECONDS))
  done

  echo "Timed out after ${POLL_TIMEOUT_SECONDS}s waiting for $COMMON_PACKAGE_NAME@$expected_version to propagate on npm."
  return 1
}

is_registry_propagation_error() {
  local output="$1"
  grep -Eiq "ERR_PNPM_NO_MATCHING_VERSION|No matching version found|not found in registry|is not in the npm registry|isn't in the npm registry|ETARGET|GET 404|404 Not Found|package not found|No version matching" <<<"$output"
}

retry_dependency_update() {
  local service_name="$1"
  local service_dir="$2"
  shift 2

  local attempt=1
  local delay="$UPDATE_RETRY_DELAY_SECONDS"

  while (( attempt <= UPDATE_RETRY_ATTEMPTS )); do
    local output
    local exit_code

    echo "Updating $service_name (attempt $attempt/$UPDATE_RETRY_ATTEMPTS)..."
    set +e
    output="$(run_in_dir "$service_dir" "$@" 2>&1)"
    exit_code=$?
    set -e

    if [[ $exit_code -eq 0 ]]; then
      echo "$output"
      return 0
    fi

    echo "$output"
    if ! is_registry_propagation_error "$output"; then
      echo "Updating $service_name failed with a non-propagation error."
      return "$exit_code"
    fi

    if (( attempt == UPDATE_RETRY_ATTEMPTS )); then
      echo "Updating $service_name failed after $UPDATE_RETRY_ATTEMPTS attempts because the new version never became installable."
      return "$exit_code"
    fi

    echo "Registry still appears to be propagating for $service_name. Retrying in ${delay}s..."
    sleep "$delay"
    delay=$((delay + UPDATE_RETRY_DELAY_SECONDS))
    attempt=$((attempt + 1))
  done
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

prompt_common_change_note() {
  local note
  read -r -p "Enter commit message for common changes (optional): " note
  echo "$note"
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
COMMON_COMMIT_MESSAGE=""

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
  wait_for_published_version "$TARGET_VERSION"
  CHANGE_NOTE="$(prompt_common_change_note)"
  COMMON_COMMIT_MESSAGE="chore(common): publish $TARGET_VERSION"
  if [[ -n "$CHANGE_NOTE" ]]; then
    COMMON_COMMIT_MESSAGE="$CHANGE_NOTE"
  fi

  # Persist the published common changes before any downstream sync attempts.
  git -C "$ROOT_DIR" add common
  if ! git -C "$ROOT_DIR" diff --cached --quiet -- common; then
    git -C "$ROOT_DIR" commit -m "$COMMON_COMMIT_MESSAGE" -- common
    echo "Created common commit: $COMMON_COMMIT_MESSAGE"
  else
    echo "No common changes to commit."
  fi
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
retry_dependency_update "user" "$ROOT_DIR/user" pnpm add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
retry_dependency_update "es-proxy" "$ROOT_DIR/es-proxy" pnpm add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
retry_dependency_update "payments" "$ROOT_DIR/payments" pnpm add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"

# bun consumers
retry_dependency_update "skill" "$ROOT_DIR/skill" bun add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
retry_dependency_update "notification-service" "$ROOT_DIR/notification-service" bun add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"
retry_dependency_update "user-outbox-worker" "$ROOT_DIR/outbox-workers/user-outbox-worker" bun add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"

CONSUMER_PATHS=(
  user/package.json
  user/pnpm-lock.yaml
  es-proxy/package.json
  es-proxy/pnpm-lock.yaml
  payments/package.json
  payments/pnpm-lock.yaml
  skill/package.json
  skill/bun.lock
  notification-service/package.json
  notification-service/bun.lock
  outbox-workers/user-outbox-worker/package.json
  outbox-workers/user-outbox-worker/bun.lock
)

# Second commit: dependency sync across consumer services.
git -C "$ROOT_DIR" add "${CONSUMER_PATHS[@]}"
if git -C "$ROOT_DIR" diff --cached --quiet -- "${CONSUMER_PATHS[@]}"; then
  echo "No consumer dependency changes to commit."
  exit 0
fi

CONSUMER_COMMIT_MESSAGE="chore(common): sync consumers to $TARGET_VERSION"
git -C "$ROOT_DIR" commit -m "$CONSUMER_COMMIT_MESSAGE" -- "${CONSUMER_PATHS[@]}"
echo "Created consumer commit: $CONSUMER_COMMIT_MESSAGE"
echo "Done. No push performed."
