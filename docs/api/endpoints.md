# Purchasing Approval API（FastAPI想定 / PoC）

## 認証（JWT Bearer）

- Header: Authorization: Bearer <access_token>
- 役割（roles）
  - applicant: 申請者
  - approver: 承認者
  - admin: 管理者（今回は任意）

### 想定するJWT Claim（例）

- sub: user_id
- roles: ["applicant", "approver"]
- exp, iat

---

## Auth

### POST /auth/login

JWT発行（PoC用）

- Body: { email, password }
- Returns: { access_token, token_type: "bearer" }

### GET /users/me

自分のユーザー情報（役職/ロール含む）

- Returns:
  - { id, name, email, position: {id,name}?, roles: [{id,name}] }

---

## Purchasing Approvals（申請）

### GET /purchasing-approvals

申請一覧（検索・ページング）

- Query:
  - status: string?（PENDING/RETURNED/APPROVED）
  - q: string?（title/reason 部分一致）
  - min_amount: number?
  - max_amount: number?
  - requester_user_id: int?
  - page: int = 1
  - per_page: int = 20
- Returns:
  - items: [{ id, title, purchase_type, amount, current_status, requested_at, updated_at, requester }]
  - meta: { page, per_page, total }

### POST /purchasing-approvals

申請作成（PoCでは作成=提出にして PENDING 開始）

- Actor: applicant
- Body:
  - title, purchase_type, amount, reason
  - comment?（任意：提出コメント）
- Side effects（必須）:
  - approvals.current_status = PENDING
  - events: action=submit, status=PENDING を追加
  - approvals.current_event_id = event.id
  - approvals.requested_at = event.event_at
- Returns:
  - { id, current_status: "PENDING", ... }

### GET /purchasing-approvals/{id}

申請詳細（現在状態 + タイムライン）

- Returns:
  - approval: { ... , current_status, current_event_id }
  - timeline: [{ event_id, action, status, performed_by, event_at, comment, ai_summaries?, comments? }]

### PATCH /purchasing-approvals/{id}

申請内容更新（差し戻し時のみ）

- Actor: applicant（本人のみ）
- Guard:
  - current_status == RETURNED
- Body（部分更新）:
  - title?, purchase_type?, amount?, reason?
- Side effects:
  - approvals.updated_at 更新
- Returns:
  - approval

---

## 状態遷移（イベント駆動 / PoC最小）

※ すべて「イベント追加 + approvals.current_status 更新」を同一トランザクションで実施  
※ approval行を SELECT ... FOR UPDATE でロックして競合更新を防ぐ

### POST /purchasing-approvals/{id}/approve

PENDING -> APPROVED

- Actor: approver
- Body: { comment? }
- Side effects:
  - events: action=approve, status=APPROVED
  - approvals.current_status = APPROVED
  - approvals.current_event_id = event.id
  - approvals.approved_at = event.event_at

### POST /purchasing-approvals/{id}/return

PENDING -> RETURNED

- Actor: approver
- Body: { comment } // 差し戻し理由（必須推奨）
- Side effects:
  - events: action=return, status=RETURNED
  - approvals.current_status = RETURNED
  - approvals.current_event_id = event.id

### POST /purchasing-approvals/{id}/resubmit

RETURNED -> PENDING

- Actor: applicant（本人のみ）
- Body: { comment? }
- Side effects:
  - events: action=resubmit, status=PENDING
  - approvals.current_status = PENDING
  - approvals.current_event_id = event.id

---

## コメント / AI要約

### POST /purchasing-approvals/{id}/comments

申請にコメント追加（PoC）

- Actor: applicant/approver（認可は任意）
- 方針:
  - 推奨: 「commentイベント」を追加し、commentsにも保存する（監査ログとUI両立）
- Body: { comment_text }
- Side effects:
  - events: action=comment, status=現状維持（= approvals.current_status_id を入れる）
  - comments: event_id に紐付けて保存
- Returns:
  - { event_id, comment_id }

### POST /purchasing-approvals/events/{event_id}/ai-summaries

特定イベントに対してAI要約生成

- Actor: applicant/approver（任意）
- Body:
  - summary_type: "short" | "decision" | "risk"
- Returns:
  - { id, event_id, summary_text, summary_type, generated_at }

### GET /purchasing-approvals/{id}/events

イベント一覧（監査ログ）

- Returns:
  - [{ id, action, status, performed_by, event_at, created_at }]

---

## Master

### GET /purchasing-approval-statuses

ステータス一覧

- Returns: [{ id, code, name }]

### GET /roles

ロール一覧

- Returns: [{ id, name }]
