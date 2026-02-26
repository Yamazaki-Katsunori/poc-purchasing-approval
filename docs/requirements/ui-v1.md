# UI Requirements（PoC / v1）

> 目的：画面要件を ADR / ER / API と整合させる  
> 前提：PoC v1 は最小機能（PENDING / RETURNED / APPROVED、JWT: Accessメモリ + Refresh HttpOnly Cookie）

---

## 1. 画面一覧（サマリ）

| 画面                          | 目的               | 対象ロール           | 主な表示                       | 主な操作                             |
| ----------------------------- | ------------------ | -------------------- | ------------------------------ | ------------------------------------ |
| Login                         | 認証（JWT取得）    | 未ログイン           | email / password               | ログイン                             |
| Home（申請一覧）              | 検索・俯瞰         | applicant / approver | 申請一覧・検索UI               | 詳細遷移                             |
| New Request（申請作成＝提出） | 申請作成           | applicant / approver | 入力フォーム                   | submit                               |
| Request Detail（申請詳細）    | 詳細・タイムライン | applicant / approver | 申請本文、AI要約、イベント履歴 | コメント、（条件で）編集/再提出/承認 |

※「承認画面」は独立画面を作らず、**申請詳細画面でロール/状態に応じてボタンを出し分ける**。

---

## 2. 画面別要件（API / 状態 / イベント整合）

### 2.1 Login

| 項目   | 内容                                                                       |
| ------ | -------------------------------------------------------------------------- |
| URL    | `/login`                                                                   |
| 目的   | 認証（JWT取得）                                                            |
| 入力   | `email`, `password`                                                        |
| 成功時 | Access Token をメモリ保持 / Refresh Token を HttpOnly Cookie（Set-Cookie） |
| API    | `POST /auth/login`                                                         |
| 備考   | Access期限切れ時は `POST /auth/refresh` で再発行（実装方針に従う）         |

---

### 2.2 Home（申請一覧）

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| URL          | `/`（ログイン後）                                                                                   |
| 対象ロール   | applicant / approver                                                                                |
| 目的         | 申請一覧の閲覧・検索・詳細への導線                                                                  |
| 表示（最小） | `title` / `purchase_type` / `amount` / `current_status` / `requested_at` / `requester`              |
| 検索条件     | `status`（PENDING/RETURNED/APPROVED） / `q`（title, reason 部分一致） / `min_amount` / `max_amount` |
| 操作         | 行クリックで詳細へ遷移                                                                              |
| API          | `GET /purchasing-approvals`                                                                         |
| 整合         | 一覧の状態参照は `approvals.current_status_id`（ADR-004）                                           |
| v1方針       | **v1では集計（合計金額・グラフ等）を実装しない（v2候補）**                                          |

---

### 2.3 New Request（申請作成＝提出）

| 項目         | 内容                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| URL          | `/approvals/new`                                                                                      |
| 対象ロール   | applicant / approver                                                                                  |
| 目的         | 申請を作成し、PENDING（承認待ち）として提出する                                                       |
| 入力         | `title`, `purchase_type`, `amount`, `reason`, `reference_url?`, `comment?`                            |
| 操作         | 「申請（提出）」ボタン                                                                                |
| 生成イベント | `submit`（PENDING開始）                                                                               |
| AI要約       | `submit` イベントに紐付けて生成を試みる（ADR-002）                                                    |
| API          | `POST /purchasing-approvals`                                                                          |
| 整合         | `approvals.current_status=PENDING` / `events.action=submit` / `ai_summaries.event_id=submit_event_id` |

※ 初期コメントを付けたい場合は、**submit イベントの `comment` に格納**する（v1最小）。

---

### 2.4 Request Detail（申請詳細）

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| URL        | `/approvals/{id}`                                                                     |
| 対象ロール | applicant / approver                                                                  |
| 目的       | 申請内容・AI要約・イベント履歴（監査ログ）の確認                                      |
| 表示       | 申請本文 / `current_status` / `requested_at` / `approved_at` / タイムライン（events） |
| AI要約表示 | 「最新の提出系イベント（submit/resubmit）」に紐付く要約を表示（ADR-002）              |
| コメント   | 任意でコメント追加（commentイベント + comments）                                      |
| API        | `GET /purchasing-approvals/{id}` / `POST /purchasing-approvals/{id}/comments`         |
| 整合       | eventsが監査ログ、current_statusが高速参照（ADR-004）                                 |

#### 2.4.1 条件付きUI（申請者向け：編集・再提出）

| 条件                                  | 表示する操作       | API                                        |
| ------------------------------------- | ------------------ | ------------------------------------------ |
| `current_status == RETURNED` かつ本人 | 編集（PATCH）      | `PATCH /purchasing-approvals/{id}`         |
| `current_status == RETURNED` かつ本人 | 再提出（resubmit） | `POST /purchasing-approvals/{id}/resubmit` |
| 上記以外                              | 編集不可           | -                                          |

#### 2.4.2 条件付きUI（承認者向け：承認・差し戻し）

| 条件                                          | 表示する操作       | API                                       |
| --------------------------------------------- | ------------------ | ----------------------------------------- |
| approver ロール & `current_status == PENDING` | 承認（approve）    | `POST /purchasing-approvals/{id}/approve` |
| approver ロール & `current_status == PENDING` | 差し戻し（return） | `POST /purchasing-approvals/{id}/return`  |

- 承認/差し戻し時にコメント入力欄を表示（events.comment に保存）
- 申請本文は承認者が編集不可

---

## 3. 画面操作 × イベント（監査ログ）対応

| 画面操作     | event.action | status遷移          | 備考                              |
| ------------ | ------------ | ------------------- | --------------------------------- |
| 申請（提出） | `submit`     | (none) -> PENDING   | `requested_at` 記録、要約生成対象 |
| 差し戻し     | `return`     | PENDING -> RETURNED | comment必須推奨                   |
| 再提出       | `resubmit`   | RETURNED -> PENDING | 要約生成対象                      |
| 承認         | `approve`    | PENDING -> APPROVED | `approved_at` 記録                |
| コメント追加 | `comment`    | 状態維持            | タイムライン用途                  |

---

## 4. UI方針（PoC v1）

- Homeは「一覧＋検索」を最小とし、ダッシュボード化（集計・グラフ）は v2 へ
- 詳細画面は1つに統合し、ロール/状態で操作ボタンを出し分ける
- 初期申請コメントは submit の `comment` を利用（独立したコメント設計は後で拡張）
- 状態参照は `approvals.current_status` を基本とし、履歴は events を参照する（ADR-004）
- AI要約は提出系イベントに紐付けて保存し、詳細画面に表示する（ADR-002）
