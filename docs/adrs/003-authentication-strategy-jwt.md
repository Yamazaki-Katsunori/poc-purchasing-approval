# ADR-003: Authentication Strategy (JWT) — Access in Memory + Refresh in HttpOnly Cookie

## Status

Accepted

## Context

本プロジェクトでは、フロントエンド（Next.js）とバックエンド（FastAPI）を分離して開発する。
そのため、サーバ側でセッションステートを保持する Cookie + Session 方式よりも、API間でトークンをやり取りする JWT 認証が適している。

また、本PoCは学習目的も兼ねており、モダンな SPA + API 構成で採用されやすい
「短命な Access Token + Refresh Token（ローテーション可能）」の認証フローを経験する価値がある。

要件/前提：

- フロントは API 呼び出し時に `Authorization: Bearer <access_token>` を付与できる
- XSS 等のリスクを考慮し、トークンの保存方法は安全寄りにしたい
- 現時点では Redis/Valkey は利用しないが、将来的にセッション管理強化（失効/ローテーション/盗難検知）を行える余地を残したい

## Decision

以下の方式（B案）を採用する。

### トークン構成

- Access Token: JWT（短命）
- Refresh Token: JWT またはランダムトークン（長命）

### クライアント側の保存方針

- Access Token は **メモリ保持**（localStorage / sessionStorage には保存しない）
  - 画面リロードで失われる点は許容（PoC範囲）
- Refresh Token は **HttpOnly Cookie** に保存する
  - JS から参照できないことで、XSS による窃取リスクを低減する

### 送信方法

- Access Token は API 呼び出し時に `Authorization` ヘッダへ付与する
  - `Authorization: Bearer <access_token>`
- Refresh Token は Cookie 自動送信（`/auth/refresh` 等）で利用する

### 有効期限（例）

- Access Token: 15分（短命）
- Refresh Token: 14日（長命）
  - 実装上の簡便さを優先しつつ、学習目的として短命Accessを採用する

### Refresh の運用方針

- `/auth/refresh` により Access Token を再発行する
- 将来の安全性向上を見据え、Refresh Token は **ローテーション可能**な設計にする
  - v1では「ローテーションなし」でも可だが、設計上は後から追加できる構造にする

### パスワード管理

- パスワードは bcrypt（例：passlib + bcrypt）等でハッシュ化して保存する

### 将来拡張

- Refresh Token の失効管理（denylist/rotation/盗難検知）を強化する場合、
  当初はDBで管理し、必要に応じて Redis/Valkey へ移行できる構造（インターフェース分離）を想定する
- OAuth / OpenID Connect は発展機能として将来追加可能

## Alternatives Considered

### A案: HttpOnly Cookie 方式（Access/Refresh を Cookie に保持）

- メリット
  - XSS耐性が高い（特にAccess TokenをJSから触らない運用が可能）
  - 実装が整理しやすい（Cookie中心）
- デメリット
  - CORS / SameSite / CSRF 対策の設計比重が増えやすい
  - Bearerヘッダ中心のAPI設計との整合を取る際に工夫が要る（BFF化など）
- 不採用理由
  - 本PoCでは「Authorization: Bearer」を明示的に扱う学習価値を取りたい
  - 将来のセッション管理強化（Refresh中心の追跡）を意識すると、B案が拡張しやすい

### Session + Cookie

- メリット
  - 実装が比較的簡単
  - Cookie のセキュリティ設定も明確
- デメリット
  - フロント/バック分離だと管理が煩雑になりやすい
  - ステートレス構成の学習価値が下がる
- 不採用理由
  - 今回は SPA + API を主体とするため

### OAuth / OpenID Connect

- メリット
  - 外部ログイン対応が容易
  - 実務でよく使われる
- デメリット
  - 実装が複雑
  - 学習コストが高い
- 不採用理由
  - まずは自前認証（JWT）を学ぶことを優先

## Consequences

### Positive

- Access Token をメモリ保持し、Refresh Token を HttpOnly Cookie にすることで、
  「Bearer認証の学習」と「XSS耐性」のバランスが良い
- バックエンドはステートレス寄りに保ちつつ、Refresh運用で拡張余地を残せる
- 将来的に失効管理やローテーションをDB→Redis/Valkeyへ移行しやすい

### Negative

- 画面リロード等で Access Token が失われるため、適切に refresh を挟む実装が必要
- Refresh Token をCookie運用するため、CORS / SameSite 等の環境設定が必要になる場合がある
- リフレッシュや期限管理などの実装が増え、学習コストが上がる

## Notes (Optional)

- JWT の最低限の claim 例：
  - `sub`（user_id）, `roles`（例: ["applicant","approver"]）, `exp`, `iat`, `jti`（任意）
- Refresh の失効管理は v1 では最小実装（未実装/DB管理）でも良いが、
  後からローテーションや盗難検知を入れられるように構造を分離する
