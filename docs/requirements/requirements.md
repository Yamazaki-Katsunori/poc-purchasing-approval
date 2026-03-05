# poc-purchasing-approval Requirements

## 1. 概要

本アプリケーションは、社内における物品購入およびSaaS契約等の申請を行うための
購買承認PoCアプリケーションである。

申請内容（特に購入検討理由）の要点をAIにより自動要約し、**承認者の意思決定を支援する**ことを目的とする。 :contentReference[oaicite:5]{index=5}

本PoCでは以下を重視する。

- フロントエンド / バックエンド分離構成（Next.js + FastAPI） :contentReference[oaicite:6]{index=6}
- 承認フロー（最小ステータス）と監査ログ（イベント履歴） :contentReference[oaicite:7]{index=7}
- AI要約の保存と参照（イベントに紐付け） :contentReference[oaicite:8]{index=8}

---

## 2. スコープ（v1 / PoC）

### 2.1 対象（v1）

- 認証（JWT：Accessはメモリ、RefreshはHttpOnly Cookie） :contentReference[oaicite:9]{index=9}
- 申請の作成（作成＝提出）→ 差し戻し → 修正 → 再提出 → 承認 :contentReference[oaicite:10]{index=10}
- 申請一覧 / 詳細（タイムライン） :contentReference[oaicite:11]{index=11}
- コメント（タイムラインに記録） :contentReference[oaicite:12]{index=12}
- AI要約（提出系イベントに紐付けて保存し、承認者が参照） :contentReference[oaicite:13]{index=13} :contentReference[oaicite:14]{index=14}

### 2.2 対象外（v1ではやらない）

- 集計（合計金額、グラフ等）は v2候補 :contentReference[oaicite:15]{index=15}
- 多段階承認、金額閾値、担当購買種別などの拡張
- AI要約の非同期化（ジョブ化）、再生成、品質評価
- 取消 / 却下 / 取り下げ 等の追加ステータス（v2候補）
- 下書き（DRAFT）のUI提供（DB上の拡張余地は残すが v1の画面要件には含めない） :contentReference[oaicite:16]{index=16}

---

## 3. ユーザー定義

### 3.1 ユーザー種別 / ロール

ユーザーは1種類とし、以下のロールを付与できる（多対多も許容）。

- applicant（申請者）
- approver（承認者）
- admin（管理者：PoCでは任意）

※ approver も申請可能とする（approver + applicant を同一ユーザーに付与可能）。 :contentReference[oaicite:17]{index=17}

### 3.2 権限制御（PoC最小）

| 操作                       | applicant | approver | admin |
| -------------------------- | --------: | -------: | ----: |
| 申請作成（作成＝提出）     |         ◯ |        ◯ |     ◯ |
| 申請詳細閲覧               |         ◯ |        ◯ |     ◯ |
| 申請一覧閲覧               |         ◯ |        ◯ |     ◯ |
| 申請編集（差し戻し時のみ） |  本人のみ |        × |  任意 |
| 再提出（差し戻し時のみ）   |  本人のみ |        × |  任意 |
| 承認                       |         × |        ◯ |  任意 |
| 差し戻し                   |         × |        ◯ |  任意 |

:contentReference[oaicite:18]{index=18}

---

## 4. 画面要件（v1）

ADR-008 に従い、v1 の画面構成は **5画面** とする。  
承認アクション・AI要約・コメントは **申請詳細画面に集約**する。 :contentReference[oaicite:19]{index=19}

### 4.1 画面一覧

1. Login（/login）
2. Home（申請一覧）（/）
3. 新規申請作成（/approvals/new）
4. 新規申請確認（/approvals/new/confirm）
5. 申請詳細（/approvals/{id}）

### 4.2 申請詳細での表示/操作（重要）

- 共通：申請内容 / current_status / requested_at / approved_at / タイムライン（events）/ コメント投稿
- 承認者のみ：AI要約表示、承認/差し戻しボタン表示（PENDING時） :contentReference[oaicite:20]{index=20} :contentReference[oaicite:21]{index=21}

---

## 5. 認証（PoC）

### 5.1 方式

JWT を用いた認証を採用する。

- Access Token（短命）はメモリ保持（localStorage等へ保存しない）
- Refresh Token（長命）は HttpOnly Cookie に保持
- API呼び出しは `Authorization: Bearer <access_token>` を利用する :contentReference[oaicite:22]{index=22}

### 5.2 想定API

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /users/me` :contentReference[oaicite:23]{index=23}

---

## 6. 申請データ定義（approval）

申請（Purchasing Approval）は以下を持つ。 :contentReference[oaicite:24]{index=24}

### 6.1 基本項目

- タイトル
- 購入種別（例: 備品 / SaaS / ライセンス追加）
- 金額
- 購入検討理由（自由記述）
- 参考URL（任意）※PoCでは 1件で良い
- 申請者（作成者）

### 6.2 日時項目（スナップショット）

- requested_at：submit イベント発生時刻
- approved_at：approve イベント発生時刻

### 6.3 現在状態の保持（スナップショット）

- current_status_id（現在ステータス）
- current_event_id（状態遷移を発生させた最新イベント）
  - 対象 action: submit / resubmit / return / approve
  - comment 等の「状態を変えないイベント」は current_event_id 更新対象外 :contentReference[oaicite:25]{index=25}

---

## 7. ステータス定義（PoC最小）

申請のステータスは以下の3種類とする。

- PENDING（承認待ち）
- RETURNED（差し戻し）
- APPROVED（承認済み）

※ DRAFT / REJECTED / CANCELLED は v1では扱わない（将来拡張）。  
※ DB設計上、拡張余地として DRAFT を扱える構造は残すが、v1要件の対象外。 :contentReference[oaicite:26]{index=26} :contentReference[oaicite:27]{index=27}

---

## 8. イベント（監査ログ）と状態遷移

### 8.1 イベント定義（PoC最小）

以下の操作をイベントとして保存する。

- submit（PENDING開始）
- return（RETURNED）
- resubmit（PENDING再開）
- approve（APPROVED）
- comment（任意：状態は変えない） :contentReference[oaicite:28]{index=28} :contentReference[oaicite:29]{index=29}

### 8.2 状態遷移表（v1）

| from_status | action   | actor     | to_status | guard                          |
| ----------- | -------- | --------- | --------- | ------------------------------ |
| (none)      | submit   | applicant | PENDING   | 新規作成（作成＝提出）         |
| PENDING     | approve  | approver  | APPROVED  | current_status == PENDING      |
| PENDING     | return   | approver  | RETURNED  | current_status == PENDING      |
| RETURNED    | resubmit | applicant | PENDING   | current_status == RETURNED     |
| \*          | comment  | both      | \*        | 状態維持（current_status不変） |

※ submit は「初期遷移」として明示し、他遷移は state-transitions の方針に従う。 :contentReference[oaicite:30]{index=30} :contentReference[oaicite:31]{index=31}

### 8.3 不変条件（整合性）

- status 更新と event 追加は同一トランザクションで実施する
- approval 行をロックして並行更新を防止する（SELECT ... FOR UPDATE）
- events は append-only（更新しない） :contentReference[oaicite:32]{index=32} :contentReference[oaicite:33]{index=33}

---

## 9. AI要約（ADR-002）

### 9.1 保存方針（重要）

- AI要約は申請（approval）に直接保存しない
- `purchasing_approval_ai_summaries` に保存し、**event_id（submit/resubmit）に紐付ける**  
  「どの時点の申請内容を要約したか」を明確にするため :contentReference[oaicite:34]{index=34}

### 9.2 生成タイミング

- submit 時に生成を試みる
- resubmit 時に生成を試みる :contentReference[oaicite:35]{index=35}

### 9.3 表示（v1）

- **承認者が申請詳細を閲覧した場合のみ**、
  「最新の提出系イベント（submit/resubmit）」に紐付く要約を表示する。 :contentReference[oaicite:36]{index=36} :contentReference[oaicite:37]{index=37}

### 9.4 失敗時の扱い（PoC）

- 要約生成に失敗しても submit/resubmit は継続可能
- 失敗時は要約レコードを作成しない（v1簡潔化） :contentReference[oaicite:38]{index=38}

---

## 10. API要件（PoC / v1）

- `GET /purchasing-approvals`（一覧・検索）
- `POST /purchasing-approvals`（作成＝提出）
- `GET /purchasing-approvals/{id}`（詳細＋タイムライン）
- `PATCH /purchasing-approvals/{id}`（RETURNED時のみ更新）
- `POST /purchasing-approvals/{id}/approve`
- `POST /purchasing-approvals/{id}/return`
- `POST /purchasing-approvals/{id}/resubmit`
- `POST /purchasing-approvals/{id}/comments` :contentReference[oaicite:39]{index=39}

---

## 11. 非機能要件（PoC範囲）

- 永続データはRDB（PostgreSQL）で管理する（Redis等は採用しない） :contentReference[oaicite:40]{index=40}
- 状態遷移操作は同一トランザクション + ロックで整合性を担保する :contentReference[oaicite:41]{index=41}
- AIは外部APIを利用する（LLM Providerは差し替え可能な設計） :contentReference[oaicite:42]{index=42}
