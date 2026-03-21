# =============================================================================
# base: ci / prod で共通利用したい土台
# =============================================================================
FROM mcr.microsoft.com/devcontainers/base:ubuntu AS base

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

RUN set -e; \
  apt-get update; \
  apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  git \
  unzip \
  jq \
  vim \
  less \
  build-essential \
  pkg-config \
  libpq-dev \
  tzdata \
  openssh-client \
  sudo \
  ripgrep \
  fd-find \
  locales; \
  rm -rf /var/lib/apt/lists/*; \
  ln -sf "$(command -v fdfind)" /usr/local/bin/fd || true; \
  if ! id -u "$USERNAME" >/dev/null 2>&1; then \
  groupadd --gid "$USER_GID" "$USERNAME"; \
  useradd --uid "$USER_UID" --gid "$USER_GID" -m "$USERNAME"; \
  fi; \
  echo "$USERNAME ALL=(root) NOPASSWD:ALL" > "/etc/sudoers.d/$USERNAME"; \
  chmod 0440 "/etc/sudoers.d/$USERNAME"

WORKDIR /workspaces/app


# =============================================================================
# ci-base: GitHub Actions / compose.ci.yaml の共通土台
# =============================================================================
FROM base AS ci-base

RUN set -e; \
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -; \
  apt-get update; \
  apt-get install -y --no-install-recommends nodejs; \
  npm install -g pnpm; \
  rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

USER $USERNAME


# =============================================================================
# ci-backend: backend test / app 起動用
# =============================================================================
FROM ci-base AS ci-backend

WORKDIR /workspaces/app/backend

COPY backend/pyproject.toml backend/uv.lock backend/alembic.ini ./
RUN uv sync --dev

COPY backend /workspaces/app/backend

CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]


# =============================================================================
# ci-frontend: frontend app 起動用
# =============================================================================
FROM ci-base AS ci-frontend

WORKDIR /workspaces/app/frontend

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend /workspaces/app/frontend

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "3000"]


# =============================================================================
# prod: 本番用の最小構成例
# =============================================================================
FROM base AS prod

USER $USERNAME

CMD ["sleep", "infinity"]
