#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_ROOT="$REPO_ROOT/backend"
FRONTEND_ROOT="$REPO_ROOT/frontend"

: "${LOG_FILE:=/tmp/post_create_command.log}"

log() { echo "[post_create] $*" | tee -a "$LOG_FILE"; }

# ----------------------------
# NVM bootstrap
# - post_create は非対話でPATHが素になりがちなので、明示的にNVMを読み込む
# ----------------------------
nvm_bootstrap() {
  # feature(node) が nvm を /usr/local/share/nvm に置くケースが多い
  export NVM_DIR="${NVM_DIR:-/usr/local/share/nvm}"

  # nvm.sh があれば読み込む（無ければ何もしない）
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
    # .nvmrc があればそれ、なければデフォルトを使用
    nvm use --silent >/dev/null 2>&1 || true
  fi
}

run_shell() {
  local cmd="$1"
  log "+ $cmd"

  # bash -lc の中で NVM をロードしてから実行する
  bash -lc "
    set -e
    export NVM_DIR='${NVM_DIR:-/usr/local/share/nvm}'
    if [[ -s \"\$NVM_DIR/nvm.sh\" ]]; then
      # shellcheck disable=SC1090
      . \"\$NVM_DIR/nvm.sh\"
      nvm use --silent >/dev/null 2>&1 || true
    fi
    $cmd
  " 2>&1 | tee -a "$LOG_FILE"
}

# has_cmd も run_shell と同じ解決方法（bash -lc + NVM）に揃える
has_cmd() {
  local bin="$1"
  bash -lc "
    export NVM_DIR='${NVM_DIR:-/usr/local/share/nvm}'
    if [[ -s \"\$NVM_DIR/nvm.sh\" ]]; then
      # shellcheck disable=SC1090
      . \"\$NVM_DIR/nvm.sh\"
      nvm use --silent >/dev/null 2>&1 || true
    fi
    command -v $bin >/dev/null 2>&1
  "
}

sha256() {
  # Linux: sha256sum, macOS: shasum -a 256 (念のため両対応)
  if has_cmd sha256sum; then
    sha256sum | awk '{print $1}'
  else
    shasum -a 256 | awk '{print $1}'
  fi
}

# migration 実行前に DB が接続可能かチェック
wait_for_db() {
  local max_retry=30
  local retry=0

  until uv run python -c 'from sqlalchemy import create_engine; import os; engine=create_engine(os.environ["DATABASE_URL"]); conn=engine.connect(); conn.close()' >/dev/null 2>&1; do
    retry=$((retry + 1))
    if [[ "$retry" -ge "$max_retry" ]]; then
      log "database is not ready"
      return 1
    fi
    log "waiting for database... ($retry/$max_retry)"
    sleep 2
  done
}

log "=== post_create_command start ==="
log "repo: $REPO_ROOT"
log "log file: $LOG_FILE"

# デバッグ（必要なら後で消してOK）
log "whoami: $(whoami)"
log "id: $(id)"
log "shell: ${SHELL:-N/A}"
log "pwd: $(pwd)"
log "PATH: $PATH"
log "command -v pnpm (current shell): $(command -v pnpm || echo 'NOT_FOUND')"
log "command -v corepack (current shell): $(command -v corepack || echo 'NOT_FOUND')"
log "bash -lc pnpm: $(bash -lc 'command -v pnpm || echo NOT_FOUND' || true)"
log "bash -lc PATH: $(bash -lc 'echo $PATH' || true)"

# ----------------------------
# deps list
# ----------------------------
UV_DEPS=(
  "fastapi[standard]"
  "wireup"
  "SQLAlchemy"
  "alembic"
  "passlib[bcrypt]"
  "python-jose[cryptography]"
)

UV_DEV_DEPS=(
  "ruff"
  "mypy"
  "pyright"
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
  "vitest"
  "jsdom"
  "@vitejs/plugin-react"
  "@testing-library/react"
  "@testing-library/jest-dom"
  "@testing-library/user-event"
  "@vitest/coverage-v8"
  "@playwright/test"
)

PLAYWRIGHT_BROWSERS=(
  "chromium"
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
    printf "playwright-browser:%s\n" "${PLAYWRIGHT_BROWSERS[@]}"
  } | sha256
)"

PLAYWRIGHT_FINGERPRINT="$(
  {
    printf "playwright-browser:%s\n" "${PLAYWRIGHT_BROWSERS[@]}"
  } | sha256
)"

MARKER_DIR="/var/tmp"
MARKER_NAME="devcontainer-postcreate.${DEPS_FINGERPRINT}.done"
POSTCREATE_MARKER="${MARKER_DIR}/${MARKER_NAME}"
PLAYWRIGHT_MARKER="${MARKER_DIR}/playwright.${PLAYWRIGHT_FINGERPRINT}.done"

log "deps fingerprint: $DEPS_FINGERPRINT"
log "marker: $POSTCREATE_MARKER"
log "playwright fingerprint: $PLAYWRIGHT_FINGERPRINT"
log "playwright marker: $PLAYWRIGHT_MARKER"

mkdir -p "$MARKER_DIR"

# ★古いplaywright marker掃除（最新fingerprint以外は削除）
find "$MARKER_DIR" -maxdepth 1 -type f -name 'playwright.*.done' ! -name "$(basename "$PLAYWRIGHT_MARKER")" -delete || true

# ★古いmarker掃除（最新fingerprint以外は削除）
find "$MARKER_DIR" -maxdepth 1 -type f -name 'devcontainer-postcreate.*.done' ! -name "$MARKER_NAME" -delete || true

# 「依存追加（add）」は fingerprint が未実行のときだけ
NEED_ADD=0
if [[ ! -f "$POSTCREATE_MARKER" ]]; then
  NEED_ADD=1
  log "marker not found => will run dependency add step"
else
  log "marker found => skip dependency add step"
fi

# marker を作って良いか？（最後に判定）
CAN_CREATE_MARKER=1

# ----------------------------
# Backend (uv)
# ----------------------------
if [[ -d "$BACKEND_ROOT" && -f "$BACKEND_ROOT/pyproject.toml" ]]; then
  pushd "$BACKEND_ROOT" >/dev/null

  if ! has_cmd uv; then
    log "skip backend: uv not found"
    # backend が対象なのにuvが無いのは異常寄りなので marker作らない
    CAN_CREATE_MARKER=0
  else
    if [[ "$NEED_ADD" -eq 1 ]]; then
      if [[ "${#UV_DEPS[@]}" -gt 0 ]]; then
        run_shell "uv add ${UV_DEPS[*]}"
      fi
      if [[ "${#UV_DEV_DEPS[@]}" -gt 0 ]]; then
        run_shell "uv add --dev ${UV_DEV_DEPS[*]}"
      fi
    fi

    run_shell "uv sync"

    # DB 接続チェック
    wait_for_db

    # DB migration
    run_shell "uv run alembic upgrade head"

    # seed
    run_shell "uv run python -m src.scripts.seeds.run_all_seeds"
  fi

  popd >/dev/null
else
  log "skip backend: not found pyproject.toml at $BACKEND_ROOT"
fi

# ----------------------------
# Frontend (pnpm)
# ----------------------------
FRONTEND_TARGET=0
if [[ -d "$FRONTEND_ROOT" && -f "$FRONTEND_ROOT/package.json" ]]; then
  FRONTEND_TARGET=1
  pushd "$FRONTEND_ROOT" >/dev/null

  if ! has_cmd pnpm; then
    log "skip frontend: pnpm not found"

    # ★最小対応：frontend が対象なのに pnpm が無い場合は marker を作らない
    # （次回以降に pnpm が入ったタイミングで NEED_ADD を再実行できるようにする）
    CAN_CREATE_MARKER=0
  else
    if [[ "$NEED_ADD" -eq 1 ]]; then
      if [[ "${#PNPM_DEPS[@]}" -gt 0 ]]; then
        run_shell "pnpm add ${PNPM_DEPS[*]}"
      fi

      if [[ "${#PNPM_DEV_DEPS[@]}" -gt 0 ]]; then
        run_shell "pnpm add -D ${PNPM_DEV_DEPS[*]}"
      fi
    fi

    if [[ -f "pnpm-lock.yaml" ]]; then
      run_shell "pnpm install --frozen-lockfile"
    else
      run_shell "pnpm install"
    fi

    # Playwright: OS dependencies + browser install
    if grep -q '"@playwright/test"' package.json; then
      if [[ ! -f "$PLAYWRIGHT_MARKER" ]]; then
        run_shell "pnpm exec playwright install-deps ${PLAYWRIGHT_BROWSERS[*]}"
        run_shell "pnpm exec playwright install ${PLAYWRIGHT_BROWSERS[*]}"
        touch "$PLAYWRIGHT_MARKER"
        log "playwright marker created: $PLAYWRIGHT_MARKER"
      else
        log "playwright marker found => skip playwright install step"
      fi
    fi
  fi

  popd >/dev/null
else
  log "skip frontend: not found package.json at $FRONTEND_ROOT"
fi

# 初回のみ marker 作成（ただし作って良い状態のときだけ）
if [[ "$NEED_ADD" -eq 1 ]]; then
  if [[ "$CAN_CREATE_MARKER" -eq 1 ]]; then
    touch "$POSTCREATE_MARKER"
    log "marker created: $POSTCREATE_MARKER"
  else
    log "marker NOT created (some required tools were missing)"
  fi
fi

log "=== post_create_command done ==="
