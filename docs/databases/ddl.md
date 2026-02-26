# Database Schema DDL

## Overview

- RDBMS: PostgreSQL
- ID: BIGSERIAL
- Timestamp: TIMESTAMPTZ
- Monetary value: NUMERIC(12,2)
- All tables use created_at, updated_at (except mapping tables where updated_at is optional)
- Foreign key constraints and indexes are explicitly defined

---

### 1. user_positions

```sql
CREATE TABLE user_positions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2. roles

```sql
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3. users

※ role_id は users に持たず、user_roles（多対多）で付与する

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    position_id     BIGINT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users_position
        FOREIGN KEY (position_id)
        REFERENCES user_positions(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_users_position_id ON users(position_id);
```

---

### 4. user_roles

```sql
CREATE TABLE user_roles (
    user_id     BIGINT NOT NULL,
    role_id     BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

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

### 5. purchasing_approval_statuses

- code: システム識別子（例: PENDING/RETURNED/APPROVED）
- name: 表示名（日本語でもOK）

```sql
CREATE TABLE purchasing_approval_statuses (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 6. purchasing_approvals

- current_status_id / current_event_id を追加（高速参照用スナップショット）
- requested_at / approved_at はスナップショット（イベントから導出可能だが一覧最適化で保持）

※ current_event_id の FK は events 作成後に ALTER で追加する（循環参照回避）

```sql
CREATE TABLE purchasing_approvals (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    purchase_type       VARCHAR(100) NOT NULL,
    amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    reason              TEXT NOT NULL,

    current_status_id   BIGINT NOT NULL,
    current_event_id    BIGINT,

    requested_at        TIMESTAMPTZ,
    approved_at         TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

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

### 7. purchasing_approval_events

- action: submit/approve/return/resubmit/comment など
- comment: 任意コメント（差し戻し理由等）
- 最新イベント取得を意識して (purchasing_approval_id, id DESC) を推奨

```sql
CREATE TABLE purchasing_approval_events (
    id                      BIGSERIAL PRIMARY KEY,
    purchasing_approval_id  BIGINT NOT NULL,
    performed_by            BIGINT NOT NULL,
    status_id               BIGINT NOT NULL,
    action                  VARCHAR(30) NOT NULL,
    comment                 TEXT,
    event_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_event_approval
        FOREIGN KEY (purchasing_approval_id)
        REFERENCES purchasing_approvals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_event_user
        FOREIGN KEY (performed_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_event_status
        FOREIGN KEY (status_id)
        REFERENCES purchasing_approval_statuses(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_events_approval_id_id_desc
ON purchasing_approval_events(purchasing_approval_id, id DESC);

CREATE INDEX idx_events_status_id ON purchasing_approval_events(status_id);
CREATE INDEX idx_events_action ON purchasing_approval_events(action);
```

---

### 8. purchasing_approvals.current_event_id FK（後付け）

※ events 作成後に実行

```sql
ALTER TABLE purchasing_approvals
ADD CONSTRAINT fk_approvals_current_event
FOREIGN KEY (current_event_id)
REFERENCES purchasing_approval_events(id)
ON DELETE SET NULL;
```

---

### 9. purchasing_approval_comments

- commented_by: コメント投稿者

```sql
CREATE TABLE purchasing_approval_comments (
    id            BIGSERIAL PRIMARY KEY,
    event_id      BIGINT NOT NULL,
    commented_by  BIGINT NOT NULL,
    comment_text  TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

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
```

---

### 10. purchasing_approval_ai_summaries

```sql
CREATE TABLE purchasing_approval_ai_summaries (
    id           BIGSERIAL PRIMARY KEY,
    event_id     BIGINT NOT NULL,
    summary_text TEXT NOT NULL,
    summary_type VARCHAR(50) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_summary_event
        FOREIGN KEY (event_id)
        REFERENCES purchasing_approval_events(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_summaries_event_id ON purchasing_approval_ai_summaries(event_id);
CREATE INDEX idx_summaries_type ON purchasing_approval_ai_summaries(summary_type);
```

---

## Seed（参考）

- purchasing_approval_statuses.code:
  - PENDING, RETURNED, APPROVED（PoC最小）
  - （必要なら DRAFT/CANCELLED/REJECTED を追加）
- roles.name:
  - applicant, approver, admin
