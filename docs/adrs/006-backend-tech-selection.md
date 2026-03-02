# ADR-006: Backend 技術選定（poc-purchasing-approval）

## Status

Accepted

## Context

poc-purchasing-approval の backend を **Python / FastAPI** で実装することは確定している。

PoC として最小コストで動く構成を作りつつ、以下を満たす技術選定を行いたい。

- DBスキーマとModelをコードで管理し、変更に追従しやすいこと
- UseCase / Service / Repository を増やしても依存関係が破綻しないこと
- JWT認証（ログイン）を実装し、HTTPレイヤの自動テストで品質担保できること
- ruff / mypy による品質・開発体験（LSP）を確保すること
- logging はまず標準で開始し、必要に応じて拡張できること

## Decision

以下のライブラリを採用する。

- **ORM / Migration**
  - SQLAlchemy（ORM）
  - Alembic（migration）
- **DI**
  - Wireup（DIコンテナ）
- **Auth**
  - passlib[bcrypt]（パスワードハッシュ）
  - python-jose（JWT発行・検証）
- **Testing**
  - pytest / pytest-asyncio（テスト）
  - httpx（HTTPレイヤの自動テスト）
- **Quality / Tooling**
  - ruff（lint/format）
  - mypy（型チェック / LSP）
- **Runtime**
  - uvicorn（ASGIサーバ）
- **Logging**
  - 標準 logging（当面）
  - structlog は v2候補（必要になった段階で検討）

また、JWTの安全性担保のため、実装ルールを以下に定める。

- JWT の `alg` をサーバ側で固定し、想定外アルゴリズムを拒否する
- `exp` を必須とし、有効期限を必ず検証する
- `iss` / `aud` を固定値で検証する（PoCでも可能な範囲で実施）
- 秘密鍵（HS系の場合）は十分に長いランダム値を使用し、環境変数で管理する

## Alternatives Considered

- **DIを採用しない（FastAPI Depends のみ）**
  - 不採用理由：PoCでも UseCase/Service/Repository の分割を進めたい。依存関係の配線を一箇所に集約できる Wireup の方がスケールしやすい。
- **JWTライブラリを PyJWT にする**
  - 不採用理由：JWTのみなら十分だが、学習・拡張（JOSE周辺）も考え python-jose を採用する。
- **structlog を最初から採用する**
  - 不採用理由：PoCの初期段階では設定コストが増える。まず標準 logging で開始し、構造化ログが必要になったタイミングで導入する。
- **SQLModel を採用する**
  - 不採用理由：Pydantic統合は魅力だが、SQLAlchemyの理解を優先し、標準構成（SQLAlchemy + Alembic）を採用する。

## Consequences

### Positive

- SQLAlchemy + Alembic により、DBスキーマとModelをコードで一貫管理できる
- Wireup により依存関係が整理され、UseCase/Repository の差し替え・テストが容易になる
- pytest + httpx により、JWT認証を含むHTTPレイヤの回帰テストを自動化できる
- ruff / mypy により、開発速度を維持しつつ品質と開発体験（LSP）を確保できる
- logging を標準から開始し、必要に応じて structlog へ段階的に移行できる

### Negative

- Wireup / Alembic / JWT周りの導入により、初期学習コストと初期設定が増える
- JWTの安全性は実装ルールに依存し、検証項目漏れ等があると脆弱性につながる
- httpx を使ったHTTPテストは便利だが、テスト実行時間が増える可能性がある（E2E寄りになるほど顕著）

## Notes (Optional)

- 採用ライブラリ一覧（暫定）
  - fastapi, uvicorn
  - sqlalchemy, alembic
  - wireup
  - passlib[bcrypt]
  - python-jose
  - pytest, pytest-asyncio, httpx
  - ruff, mypy
- structlog は「JSONログが必要」「request_id 等を全ログに載せたい」など要件が固まった段階で ADR を追加して再検討する。
