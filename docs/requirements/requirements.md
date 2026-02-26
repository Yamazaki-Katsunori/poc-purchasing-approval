# poc-purchasing-approval Requirements

## 1. 概要

本アプリケーションは、社内における物品購入およびSaaS契約等の申請を行うための
購買承認PoCアプリケーションである。

申請内容（特に購入検討理由）の要点をAIにより自動要約し、承認者の意思決定を支援することを目的とする。

本PoCでは、以下を重視する。

- フロントエンド / バックエンド分離構成（Next.js + FastAPI）
- 承認フロー（最小ステータス）と監査ログ（イベント履歴）
- AI要約の保存と参照（イベントに紐付け）

---

## 2. ユーザー定義

### 2.1 ユーザー種別 / ロール

ユーザーは1種類とし、以下のロールを付与できる（多対多も許容）。

- applicant（申請者）
- approver（承認者）
- admin（管理者：PoCでは任意）

※ approver も申請可能とする（approver + applicant を同一ユーザーに付与可能）。

### 2.2 権限制御（PoC最小）

| 操作                       |     applicant | approver |     admin |
| -------------------------- | ------------: | -------: | --------: |
| 申請作成（作成＝提出）     |             ◯ |        ◯ |         ◯ |
| 申請詳細閲覧               |             ◯ |        ◯ |         ◯ |
| 申請一覧閲覧               |             ◯ |        ◯ |         ◯ |
| 申請編集（差し戻し時のみ） | ◯（本人のみ） |        × | ◯（任意） |
| 再提出（差し戻し時のみ）   | ◯（本人のみ） |        × | ◯（任意） |
| 承認                       |             × |        ◯ | ◯（任意） |
| 差し戻し                   |             × |        ◯ | ◯（任意） |

---

## 3. 認証（PoC）

### 3.1 方式

JWT を用いた認証を採用する（ADR-003）。

- Access Token（短命）はメモリ保持（localStorage等へ保存しない）
- Refresh Token（長命）は HttpOnly Cookie に保持
- API呼び出しは `Authorization: Bearer <access_token>` を利用する

### 3.2 有効期限（例）

- Access Token: 15分
- Refresh Token: 14日

---

## 4. 申請データ定義

申請（Purchasing Approval）は以下の情報を持つ。

### 4.1 基本項目

- タイトル
- 購入種別（例: 備品 / SaaS / ライセンス追加）
- 金額
- 購入検討理由（自由記述）
- 参考URL（任意） ※PoCでは 1件 で良い（将来は複数URLも可）
- 申請者（作成者）

### 4.2 日時項目（スナップショット）

- 申請日（requested_at）
  - submit イベント発生時刻を記録（一覧最適化用途）
- 承認日（approved_at）
  - approve イベント発生時刻を記録（一覧最適化用途）

### 4.3 ステータス（スナップショット）

- 現在ステータス（current_status）
  - `purchasing_approvals.current_status_id` に保持（ADR-004）
- 現在イベント（current_event）
  - `purchasing_approvals.current_event_id` に保持（ADR-004）
  - ※状態遷移イベント（submit/resubmit/return/approve）の最新を指す

---

## 5. ステータス定義（PoC最小）

申請のステータスは以下の3種類とする（ADR-004）。

- PENDING（承認待ち）
- RETURNED（差し戻し）
- APPROVED（承認済み）

※ DRAFT / REJECTED / CANCELLED は PoCでは扱わない（将来拡張）。

---

## 6. 申請フロー（PoC最小）

### 6.1 作成（作成＝提出）

- applicant は申請を作成できる
- PoCでは「作成」時点で PENDING とする（submit イベントを発生させる）
- submit 時に申請日（requested_at）を記録する

### 6.2 差し戻し

- approver は PENDING の申請を RETURNED にできる（return）
- 差し戻し時にはコメント（差し戻し理由）を記録する

### 6.3 修正・再提出

- applicant は RETURNED の申請を編集できる（本人のみ）
- applicant は RETURNED の申請を PENDING に再提出できる（resubmit）
- resubmit 時に AI要約を再生成する（ADR-002）

### 6.4 承認

- approver は PENDING の申請を APPROVED にできる（approve）
- 承認時にコメントを記録できる（任意）
- 承認日（approved_at）を記録する

---

## 7. AI要約機能（ADR-002）

### 7.1 要約対象

- 申請理由（購入検討理由）を主対象とする
- 要約は「提出系イベント」に紐付ける
  - action: submit / resubmit

### 7.2 要約生成タイミング

- submit（PENDING開始）時に生成を試みる
- resubmit（再提出）時に生成を試みる
- 要約は RDB に保存する（オンデマンド生成はしない）

### 7.3 保存方針（重要）

- AI要約は申請（approval）に直接保存しない
- `purchasing_approval_ai_summaries` に保存し、`event_id` に紐付ける
  - 「どの時点の申請内容を要約したか」を明確にするため

### 7.4 表示

- 承認画面では「最新の提出系イベント（submit/resubmit）」に紐付く要約を表示する
- 申請本文とは別セクションに表示し、編集不可とする

### 7.5 失敗時の扱い

- 要約生成に失敗しても申請処理（submit/resubmit）は継続可能とする
- 失敗時は要約レコードを作成しない（PoCでは簡潔化）
  - 将来的に再生成API/ボタンを追加可能

---

## 8. 監査ログ（イベント履歴）

### 8.1 保存対象イベント（PoC最小）

以下の操作をイベントとして保存する。

- submit（PENDING開始）
- return（RETURNED）
- resubmit（PENDING再開）
- approve（APPROVED）
- comment（任意：状態は変えない）

### 8.2 イベントが持つ情報

- 対象申請ID（purchasing_approval_id）
- アクション（action）
- 遷移先ステータス（status_id）
- 実行者（performed_by）
- コメント（comment：任意）
- 実行日時（event_at）

※ 現在ステータスは approvals.current_status としても保持する（ADR-004）。

---

## 9. 非機能要件（PoC範囲）

- 永続データはRDB（PostgreSQL）で管理する
- Redis / Valkey 等のインメモリDBは PoCでは採用しない
- AIは外部APIを利用する（LLM Providerは差し替え可能な設計）
- 認証は JWT（Accessメモリ + Refresh HttpOnly Cookie）とする（ADR-003）
- 状態遷移操作は同一トランザクションで処理し、整合性を担保する（ADR-004）

---

## 10. 今後の拡張予定（本PoC範囲外）

- DRAFT / CANCELLED / REJECTED の追加
- 市場価格比較機能
- 重複購入検知機能
- 多段階承認フロー（役職/金額閾値）
- AI要約の非同期化（ジョブ化）、再生成、要約種別の追加（risk/decision等）
- 申請バージョン管理（差分・履歴の明示）
