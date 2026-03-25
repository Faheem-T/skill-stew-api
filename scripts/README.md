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
   - waits for the exact published version and tarball to become available on npm registry.
   - creates the `common/` commit before updating consumer services.
3. If no changes exist:
   - skips publish and resolves the latest published npm version.
4. Updates all consumer services to the resolved `@skillstew/common` version:
   - `user`, `es-proxy`, `payments` via `pnpm add`
   - `skill`, `notification-service`, `outbox-workers/user-outbox-worker` via `bun add`
   - retries automatically when npm registry propagation causes version-not-found errors.
5. Creates local commits (no push):
   - publish mode: two commits
     - one commit for `common/` changes (uses your entered message, or defaults to `chore(common): publish <version>`)
     - one commit for consumer dependency updates (`chore(common): sync consumers to <version>`)
   - sync-only mode: one commit for consumer dependency updates.

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
- After publish, the script polls npm until the exact version and tarball are available (up to 5 minutes).
- Consumer updates retry automatically on transient registry propagation errors.
- No `git push` is performed automatically.

## `setup-k3s.sh`

Automates the local K3s setup flow documented in `infra/docs/k3s-setup-notes.md`.

### What it does

1. Validates required commands are already installed: `curl`, `sudo`, `docker`, `helm`.
2. Installs K3s with Docker runtime enabled and Traefik disabled.
3. Changes `/etc/rancher/k3s/` ownership to the current invoking user.
4. Adds `export KUBECONFIG=/etc/rancher/k3s/k3s.yaml` to `~/.bashrc` only if it is not already present.
5. Installs or upgrades `ingress-nginx` via Helm.
6. Exports `KUBECONFIG` for the current script process and runs `kubectl get nodes`.
7. Prints the remaining manual follow-up steps for `/etc/hosts`, shell reload, and optional `socat`.

### Usage

```bash
./scripts/setup-k3s.sh
```

### Notes

- The script assumes Docker and Helm are already installed.
- `/etc/hosts` is not edited automatically; the script prints the required change.
- Re-running the script does not duplicate the `KUBECONFIG` export line in `~/.bashrc`.

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
