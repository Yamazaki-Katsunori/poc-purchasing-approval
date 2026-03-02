#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_ROOT="$REPO_ROOT/backend"
FRONTEND_ROOT="$REPO_ROOT/frontend"

: "${LOG_FILE:=/tmp/post_create_command.log}"

log() { echo "[post_create] $*" | tee -a "$LOG_FILE"; }

run_shell() {
  local cmd="$1"
  log "+ $cmd"
  bash -lc "$cmd" 2>&1 | tee -a "$LOG_FILE"
}

has_cmd() { command -v "$1" >/dev/null 2>&1; }

sha256() {
  # Linux: sha256sum, macOS: shasum -a 256 (念のため両対応)
  if has_cmd sha256sum; then
    sha256sum | awk '{print $1}'
  else
    shasum -a 256 | awk '{print $1}'
  fi
}

log "=== start ==="
log "repo: $REPO_ROOT"
log "log file: $LOG_FILE"

# ----------------------------
# deps list
# ----------------------------
UV_DEPS=(
  "fastapi"
  "wireup"
  "sqlalchemy"
  "alembic"
  "passlib[bcrypt]"
  "python-jose[cryptography]"
)

UV_DEV_DEPS=(
  "pytest"
  "pytest-asyncio"
  "httpx"
)

PNPM_DEPS=(
  "zod"
  "react-hook-form"
  "@hookform/resolvers"
  "@tanstack/react-query"
  "jotai"
  "clsx"
  "tailwind-merge"
)

PNPM_DEV_DEPS=(
  "eslint"
  "prettier"
)

# ----------------------------
# marker (deps fingerprint)
# ----------------------------
DEPS_FINGERPRINT="$(
  {
    echo "backend:$BACKEND_ROOT"
    printf "uv:%s\n" "${UV_DEPS[@]}"
    printf "uv-dev:%s\n" "${UV_DEV_DEPS[@]}"
    echo "frontend:$FRONTEND_ROOT"
    printf "pnpm:%s\n" "${PNPM_DEPS[@]}"
    printf "pnpm-dev:%s\n" "${PNPM_DEV_DEPS[@]}"
  } | sha256
)"

MARKER_DIR="/var/tmp"
MARKER_NAME="devcontainer-postcreate.${DEPS_FINGERPRINT}.done"
POSTCREATE_MARKER="${MARKER_DIR}/${MARKER_NAME}"

log "deps fingerprint: $DEPS_FINGERPRINT"
log "marker: $POSTCREATE_MARKER"

mkdir -p "$MARKER_DIR"

# ★古いmarker掃除（最新fingerprint以外は削除）
# 依存が変わってfingerprintが変わったら、古いmarkerは不要になるため整理する
find "$MARKER_DIR" -maxdepth 1 -type f -name 'devcontainer-postcreate.*.done' ! -name "$MARKER_NAME" -delete || true

# 「依存追加（add）」は fingerprint が未実行のときだけ
NEED_ADD=0
if [[ ! -f "$POSTCREATE_MARKER" ]]; then
  NEED_ADD=1
  log "marker not found => will run dependency add step"
else
  log "marker found => skip dependency add step"
fi

# ----------------------------
# Backend (uv)
# - uv add は初回のみ
# - uv sync は毎回
# ----------------------------
if [[ -d "$BACKEND_ROOT" && -f "$BACKEND_ROOT/pyproject.toml" ]]; then
  pushd "$BACKEND_ROOT" >/dev/null

  if ! has_cmd uv; then
    log "skip backend: uv not found"
  else
    if [[ "$NEED_ADD" -eq 1 ]]; then
      if [[ "${#UV_DEPS[@]}" -gt 0 ]]; then
        run_shell "uv add ${UV_DEPS[*]}"
      fi
      if [[ "${#UV_DEV_DEPS[@]}" -gt 0 ]]; then
        run_shell "uv add --dev ${UV_DEV_DEPS[*]}"
      fi
    fi

    # ★同期は毎回
    run_shell "uv sync"
  fi

  popd >/dev/null
else
  log "skip backend: not found pyproject.toml at $BACKEND_ROOT"
fi

# ----------------------------
# Frontend (pnpm)
# - pnpm add は初回のみ
# - pnpm install は毎回
#   - lockがあれば frozen（再現性チェック）
#   - lockが無ければ通常 install（lock生成）
# ----------------------------
if [[ -d "$FRONTEND_ROOT" && -f "$FRONTEND_ROOT/package.json" ]]; then
  pushd "$FRONTEND_ROOT" >/dev/null

  if ! has_cmd pnpm; then
    log "skip frontend: pnpm not found"
  else
    if [[ "$NEED_ADD" -eq 1 ]]; then
      if [[ "${#PNPM_DEPS[@]}" -gt 0 ]]; then
        run_shell "pnpm add ${PNPM_DEPS[*]}"
      fi
      if [[ "${#PNPM_DEV_DEPS[@]}" -gt 0 ]]; then
        run_shell "pnpm add -D ${PNPM_DEV_DEPS[*]}"
      fi
    fi

    # ★同期は毎回
    if [[ -f "pnpm-lock.yaml" ]]; then
      run_shell "pnpm install --frozen-lockfile"
    else
      run_shell "pnpm install"
    fi
  fi

  popd >/dev/null
else
  log "skip frontend: not found package.json at $FRONTEND_ROOT"
fi

# 初回のみ marker 作成
if [[ "$NEED_ADD" -eq 1 ]]; then
  touch "$POSTCREATE_MARKER"
  log "marker created: $POSTCREATE_MARKER"
fi

log "=== done ==="
