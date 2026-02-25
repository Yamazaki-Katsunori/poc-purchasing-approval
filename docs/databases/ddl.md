# Database Schema DDL

## Overview

- RDBMS: PostgreSQL
- ID: BIGSERIAL
- Timestamp: TIMESTAMPTZ
- Monetary value: NUMERIC(12,2)
- All tables use created_at, updated_at
- Foreign key constraints and indexes are explicitly defined

---

# 1. user_positions

```sql
CREATE TABLE user_positions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 2. roles

```sql
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 3. users

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role_id         BIGINT NOT NULL,
    position_id     BIGINT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_users_position
        FOREIGN KEY (position_id)
        REFERENCES user_positions(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_position_id ON users(position_id);
```

---

# 4. purchasing_approvals

```sql
CREATE TABLE purchasing_approvals (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    purchase_type   VARCHAR(100) NOT NULL,
    amount          NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    reason          TEXT NOT NULL,
    requested_at    TIMESTAMPTZ,
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_approvals_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_approvals_user_id ON purchasing_approvals(user_id);
```

---

# 5. purchasing_approval_statuses

```sql
CREATE TABLE purchasing_approval_statuses (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 6. purchasing_approval_events

```sql
CREATE TABLE purchasing_approval_events (
    id                      BIGSERIAL PRIMARY KEY,
    purchasing_approval_id  BIGINT NOT NULL,
    performed_by            BIGINT NOT NULL,
    status_id               BIGINT NOT NULL,
    event_comment           TEXT,
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

CREATE INDEX idx_events_approval_id ON purchasing_approval_events(purchasing_approval_id);
CREATE INDEX idx_events_status_id ON purchasing_approval_events(status_id);
```

---

# 7. purchasing_approval_comments

```sql
CREATE TABLE purchasing_approval_comments (
    id           BIGSERIAL PRIMARY KEY,
    event_id     BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_event
        FOREIGN KEY (event_id)
        REFERENCES purchasing_approval_events(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_comments_event_id ON purchasing_approval_comments(event_id);
```

---

# 8. purchasing_approval_ai_summaries

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
```
