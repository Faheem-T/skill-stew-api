#!/usr/bin/env bash

set -euo pipefail

K3S_CONFIG_DIR="/etc/rancher/k3s"
K3S_CONFIG_FILE="$K3S_CONFIG_DIR/k3s.yaml"
BASHRC_FILE="${HOME}/.bashrc"
KUBECONFIG_COMMENT="# kubectl context"
KUBECONFIG_EXPORT="export KUBECONFIG=${K3S_CONFIG_FILE}"

log() {
  echo "[setup-k3s] $*"
}

fail() {
  echo "[setup-k3s] Error: $*" >&2
  exit 1
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
  fi
}

resolve_target_user() {
  local candidate="${SUDO_USER:-${USER:-}}"

  if [[ -z "$candidate" ]]; then
    fail "Unable to determine the target user for K3s config ownership."
  fi

  if ! id "$candidate" >/dev/null 2>&1; then
    fail "Resolved target user '$candidate' does not exist on this system."
  fi

  printf '%s\n' "$candidate"
}

append_kubeconfig_to_bashrc() {
  if [[ ! -f "$BASHRC_FILE" ]]; then
    touch "$BASHRC_FILE"
  fi

  if grep -Fqx "$KUBECONFIG_EXPORT" "$BASHRC_FILE"; then
    log "KUBECONFIG export already present in ${BASHRC_FILE}."
    return
  fi

  {
    printf '\n%s\n' "$KUBECONFIG_COMMENT"
    printf '%s\n' "$KUBECONFIG_EXPORT"
  } >>"$BASHRC_FILE"

  log "Added KUBECONFIG export to ${BASHRC_FILE}."
}

main() {
  local target_user
  target_user="$(resolve_target_user)"

  require_cmd curl
  require_cmd sudo
  require_cmd docker
  require_cmd helm

  log "Installing K3s with Docker runtime and Traefik disabled."
  curl -sfL https://get.k3s.io | sh -s - --docker --disable=traefik

  if [[ ! -f "$K3S_CONFIG_FILE" ]]; then
    fail "Expected K3s config file not found at ${K3S_CONFIG_FILE}."
  fi

  log "Granting ${target_user} ownership of ${K3S_CONFIG_DIR}."
  sudo chown -R "$target_user" "$K3S_CONFIG_DIR/"

  append_kubeconfig_to_bashrc

  log "Installing or upgrading ingress-nginx via Helm."
  helm upgrade --install ingress-nginx ingress-nginx \
    --repo https://kubernetes.github.io/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace

  export KUBECONFIG="$K3S_CONFIG_FILE"

  log "KUBECONFIG is set to ${KUBECONFIG} for this session."
  log "Verifying cluster connectivity."
  kubectl get nodes

  cat <<EOF

Manual follow-up:
- Update /etc/hosts so stew.stew points to 127.0.0.1 instead of any old Minikube IP.
- Open a new shell or run: source ~/.bashrc
- If kubectl port-forward fails on Arch Linux, install socat manually.

EOF
}

main "$@"
