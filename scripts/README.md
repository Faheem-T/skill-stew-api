# Scripts

This directory contains repository-level automation scripts.

## `publish-common-and-sync.sh`

Automates publishing `@skillstew/common` and syncing all consumer services.

### What it does

1. Detects whether there are local changes in `common/`.
2. If changes exist:
   - bumps version (`patch` by default),
   - builds the package,
   - ensures npm authentication,
   - publishes to npm.
3. If no changes exist:
   - skips publish and resolves the latest published npm version.
4. Updates all consumer services to the resolved `@skillstew/common` version:
   - `user`, `es-proxy`, `payments` via `pnpm add`
   - `skill`, `notification-service`, `outbox-workers/user-outbox-worker` via `bun add`
5. Stages dependency/version files and creates a local commit (no push).

### Usage

```bash
# default: patch
./scripts/publish-common-and-sync.sh

# explicit bump level
./scripts/publish-common-and-sync.sh patch
./scripts/publish-common-and-sync.sh minor
./scripts/publish-common-and-sync.sh major
```

Or via npm script from repo root:

```bash
npm run common:publish-sync
```

### Notes

- If npm auth is missing, the script prompts `npm login` and continues.
- If publish fails with an auth-related error, it prompts login and retries once.
- No `git push` is performed automatically.

## Adding a New Consumer Service

When a new service starts depending on `@skillstew/common`, update this automation so it stays in sync.

1. Add `@skillstew/common` to the new service with that service's package manager (`pnpm` or `bun`).
2. Update `publish-common-and-sync.sh`:
   - Add a new dependency sync command for the service:
     - `run_in_dir "$ROOT_DIR/<service>" pnpm add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"`
     - or `run_in_dir "$ROOT_DIR/<service>" bun add "$COMMON_PACKAGE_NAME@$TARGET_VERSION"`
   - Add the service's `package.json` and lockfile to the `git add` list.
3. Update this README section that lists which services are synced.

This ensures the script updates and commits the new service alongside all existing consumers.
