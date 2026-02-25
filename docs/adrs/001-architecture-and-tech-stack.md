# ADR-001: Architecture and Tech Stack Selection

## Status

Accepted

## Context

本プロジェクトは「poc-purchasing-approval」として開発する購買承認PoCアプリケーションである。

本アプリは以下を満たす必要がある。

- フロントエンドとバックエンドの責務分離
- AI外部APIとの連携
- RDBによる永続化
- 個人開発で実装可能なシンプル構成
- 将来的な機能拡張（市場価格比較・重複購入検知）
- ポートフォリオとして設計意図を説明可能であること
- 未経験領域（Python / モダン構成）への挑戦

既存経験（Laravel + React）を基盤としつつ、
AI連携およびモダン構成への拡張を目的とする。

---

## Decision

以下の技術構成を採用する。

- Frontend: Next.js
- Backend: FastAPI
- Database: PostgreSQL
- AI: Gemini API（無料枠利用）
- Redisは採用しない
- フロントエンドとバックエンドは分離構成とする

---

## 技術選定理由

### 1. Frontend: Next.js

- Reactの知識を活かしつつモダン構成を学習できる
- 実務採用率が高い
- App Routerによる構造整理が可能
- 将来的なSSRや認証統合にも対応可能

### 2. Backend: FastAPI

- PythonベースでAI連携が容易
- 型ヒントによる明確なAPI設計が可能
- 自動生成ドキュメント（Swagger UI）
- 非同期処理に対応可能

### 3. Database: PostgreSQL

- 実務採用率が高い
- 拡張性が高い（JSON型など）
- 将来的なAI関連データ拡張に適している
- RDB設計の汎用性を高めるため

### 4. AI: Gemini API

- 無料枠でPoC検証が可能
- 要約用途として十分な性能
- 外部LLM統合設計を学習するため

### 5. Redis不採用理由

- 本PoCでは永続データのみを扱う
- キャッシュ戦略が必須ではない
- システム構成の複雑化を避けるため

---

## Alternatives Considered

### Vite + React Router

- 既存経験があり開発効率は高い
- しかし新規性・モダン構成学習の観点からNext.jsを採用

### MariaDB / MySQL

- Web系での採用率は高い
- ただし将来拡張性およびAI関連構成を考慮しPostgreSQLを採用

### モノリシック構成

- 実装が簡易
- しかし責務分離の設計思想が弱くなるため不採用

### Redis採用

- 一時保存やキャッシュ用途として検討
- 本PoCでは不要と判断

---

## Consequences

### Positive

- 実務に近い分離構成
- AI連携が容易
- フルスタック構成の理解を示せる
- 未経験領域への挑戦を示せる
- 将来的な機能拡張に対応可能

### Negative

- 初期セットアップがやや複雑
- 学習コストが発生する
- ローカル開発環境構築の手間が増える

---

## Review Policy

- Redisやキャッシュ戦略が必要になった場合は再検討する
- 認証方式の高度化が必要になった場合は別ADRで定義する
