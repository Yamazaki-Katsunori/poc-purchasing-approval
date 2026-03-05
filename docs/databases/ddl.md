-- =========================================================
-- Database Schema DDL (B案: subject_type/subject_id によるポリモーフィック参照)
-- RDBMS: PostgreSQL
-- ID: BIGSERIAL
-- Timestamp: TIMESTAMPTZ
-- Money: NUMERIC(12,2)
-- =========================================================

---

-- 1. user_positions

---

```sql
CREATE TABLE user_positions (
id BIGSERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

-- 2. roles

---

```sql
CREATE TABLE roles (
id BIGSERIAL PRIMARY KEY,
name VARCHAR(50) NOT NULL UNIQUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

-- 3. users

---

```sql
CREATE TABLE users (
id BIGSERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
position_id BIGINT,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
last_login_at TIMESTAMPTZ,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users_position
        FOREIGN KEY (position_id)
        REFERENCES user_positions(id)
        ON DELETE SET NULL

);

CREATE INDEX idx_users_position_id ON users(position_id);
```

---

-- 4. user_roles

---

```sql
CREATE TABLE user_roles (
user_id BIGINT NOT NULL,
role_id BIGINT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT

);

CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

```

---

-- 5. purchasing_approval_statuses

---

```sql
CREATE TABLE purchasing_approval_statuses (
id BIGSERIAL PRIMARY KEY,
code VARCHAR(30) NOT NULL UNIQUE,
name VARCHAR(50) NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

-- 6. purchasing_approvals (提出後の本申請)

---

-- NOTE:
-- - v1ではDRAFTは別テーブルで扱う想定（本テーブルは必須カラムNOT NULLのまま）
-- - current_event_id は events 作成後にFKを追加（循環参照回避）

```sql
CREATE TABLE purchasing_approvals (
id BIGSERIAL PRIMARY KEY,
user_id BIGINT NOT NULL,
title VARCHAR(200) NOT NULL,
purchase_type VARCHAR(100) NOT NULL,
amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
reason TEXT NOT NULL,

    current_status_id BIGINT NOT NULL,
    current_event_id  BIGINT,

    requested_at      TIMESTAMPTZ,
    approved_at       TIMESTAMPTZ,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_approvals_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_approvals_current_status
        FOREIGN KEY (current_status_id)
        REFERENCES purchasing_approval_statuses(id)
        ON DELETE RESTRICT

);

CREATE INDEX idx_approvals_user_id ON purchasing_approvals(user_id);
CREATE INDEX idx_approvals_current_status_id ON purchasing_approvals(current_status_id);
CREATE INDEX idx_approvals_amount ON purchasing_approvals(amount);
```

---

-- 7. draft_purchasing_approvals (未提出の下書き)

---

-- NOTE:
-- - DRAFT段階のため、入力項目はNULL許容
-- - last_touched_at は一覧の並びやGC（掃除）で利用する想定
-- - current_event_id は events 作成後にFKを追加（循環参照回避）

```sql
CREATE TABLE draft_purchasing_approvals (
id BIGSERIAL PRIMARY KEY,
user_id BIGINT NOT NULL,

    title             VARCHAR(200),
    purchase_type     VARCHAR(100),
    amount            NUMERIC(12,2) CHECK (amount >= 0),
    reason            TEXT,

    current_status_id BIGINT NOT NULL,
    current_event_id  BIGINT,

    last_touched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_drafts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_drafts_current_status
        FOREIGN KEY (current_status_id)
        REFERENCES purchasing_approval_statuses(id)
        ON DELETE RESTRICT

);

CREATE INDEX idx_drafts_user_id ON draft_purchasing_approvals(user_id);
CREATE INDEX idx_drafts_current_status_id ON draft_purchasing_approvals(current_status_id);
CREATE INDEX idx_drafts_last_touched_at ON draft_purchasing_approvals(last_touched_at);
```

---

-- 8. purchasing_approval_events (ポリモーフィック参照)

---

-- subject_type: 'approval' | 'draft'
-- subject_id:
-- - subject_type='approval' -> purchasing_approvals.id
-- - subject_type='draft' -> draft_purchasing_approvals.id
--

-- IMPORTANT:
-- - subject_id はDBのFK制約を張れない（ポリモーフィックのため）
-- - アプリ層で存在チェック・整合性担保を行う

```sql
CREATE TABLE purchasing_approval_events (
id BIGSERIAL PRIMARY KEY,

    subject_type  VARCHAR(30) NOT NULL,
    subject_id    BIGINT NOT NULL,

    performed_by  BIGINT NOT NULL,
    status_id     BIGINT NOT NULL,

    action        VARCHAR(30) NOT NULL,
    comment       TEXT,

    event_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_event_user
        FOREIGN KEY (performed_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_event_status
        FOREIGN KEY (status_id)
        REFERENCES purchasing_approval_statuses(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_event_subject_type
        CHECK (subject_type IN ('approval', 'draft'))

);

-- 最新イベント取得（対象ごと）
CREATE INDEX idx_events_subject_id_id_desc
ON purchasing_approval_events(subject_type, subject_id, id DESC);

CREATE INDEX idx_events_status_id ON purchasing_approval_events(status_id);
CREATE INDEX idx_events_action ON purchasing_approval_events(action);
CREATE INDEX idx_events_event_at ON purchasing_approval_events(event_at);
```

---

-- 9. purchasing_approvals.current_event_id FK（後付け）

---

```sql
ALTER TABLE purchasing_approvals
ADD CONSTRAINT fk_approvals_current_event
FOREIGN KEY (current_event_id)
REFERENCES purchasing_approval_events(id)
ON DELETE SET NULL;
```

---

-- 10. draft_purchasing_approvals.current_event_id FK（後付け）

---

```sql
ALTER TABLE draft_purchasing_approvals
ADD CONSTRAINT fk_drafts_current_event
FOREIGN KEY (current_event_id)
REFERENCES purchasing_approval_events(id)
ON DELETE SET NULL;
```

---

-- 11. purchasing_approval_comments

---

```sql
CREATE TABLE purchasing_approval_comments (
id BIGSERIAL PRIMARY KEY,
event_id BIGINT NOT NULL,
commented_by BIGINT NOT NULL,
comment_text TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_event
        FOREIGN KEY (event_id)
        REFERENCES purchasing_approval_events(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (commented_by)
        REFERENCES users(id)
        ON DELETE RESTRICT

);

CREATE INDEX idx_comments_event_id ON purchasing_approval_comments(event_id);
CREATE INDEX idx_comments_created_at ON purchasing_approval_comments(created_at);
```

---

-- 12. purchasing_approval_ai_summaries

---

```sql
CREATE TABLE purchasing_approval_ai_summaries (
id BIGSERIAL PRIMARY KEY,
event_id BIGINT NOT NULL,
summary_text TEXT NOT NULL,
summary_type VARCHAR(50) NOT NULL,
generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_summary_event
        FOREIGN KEY (event_id)
        REFERENCES purchasing_approval_events(id)
        ON DELETE CASCADE

);

CREATE INDEX idx_summaries_event_id ON purchasing_approval_ai_summaries(event_id);
CREATE INDEX idx_summaries_type ON purchasing_approval_ai_summaries(summary_type);
```

-- =========================================================
-- Seeds (参考)
-- =========================================================
-- purchasing_approval_statuses.code:
-- DRAFT, PENDING, RETURNED, APPROVED など
-- roles.name:
-- applicant, approver, admin
