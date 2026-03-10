"""create initial tables

Revision ID: 088311b066bd
Revises:
Create Date: 2026-03-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "088311b066bd"
down_revision: Union[str, Sequence[str], None] = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. user_positions
    op.create_table(
        "user_positions",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="役職ID"),
        sa.Column("name", sa.String(length=100), nullable=False, comment="役職名"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.UniqueConstraint("name", name="uq_user_positions_name"),
        comment="役職マスタ",
    )

    # 2. roles
    op.create_table(
        "roles",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="ロールID"),
        sa.Column("name", sa.String(length=50), nullable=False, comment="ロール名"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.UniqueConstraint("name", name="uq_roles_name"),
        comment="ロールマスタ",
    )

    # 3. users
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="ユーザーID"),
        sa.Column("name", sa.String(length=100), nullable=False, comment="氏名"),
        sa.Column("email", sa.String(length=255), nullable=False, comment="メールアドレス"),
        sa.Column("password_hash", sa.String(length=255), nullable=False, comment="パスワードハッシュ"),
        sa.Column("position_id", sa.BigInteger(), nullable=True, comment="役職ID"),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("TRUE"),
            comment="有効フラグ",
        ),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True, comment="最終ログイン日時"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.ForeignKeyConstraint(
            ["position_id"],
            ["user_positions.id"],
            name="fk_users_position",
            ondelete="SET NULL",
        ),
        comment="ユーザー",
    )
    op.create_index("idx_users_position_id", "users", ["position_id"])

    # 4. user_roles
    op.create_table(
        "user_roles",
        sa.Column("user_id", sa.BigInteger(), nullable=False, comment="ユーザーID"),
        sa.Column("role_id", sa.BigInteger(), nullable=False, comment="ロールID"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.PrimaryKeyConstraint("user_id", "role_id", name="pk_user_roles"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_user_roles_user",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["role_id"],
            ["roles.id"],
            name="fk_user_roles_role",
            ondelete="RESTRICT",
        ),
        comment="ユーザー・ロール紐付け",
    )
    op.create_index("idx_user_roles_role_id", "user_roles", ["role_id"])

    # 5. purchasing_approval_statuses
    op.create_table(
        "purchasing_approval_statuses",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="申請ステータスID"),
        sa.Column("code", sa.String(length=30), nullable=False, comment="ステータスコード"),
        sa.Column("name", sa.String(length=50), nullable=False, comment="ステータス名"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.UniqueConstraint("code", name="uq_purchasing_approval_statuses_code"),
        comment="購買申請ステータスマスタ",
    )

    # 6. purchasing_approvals
    op.create_table(
        "purchasing_approvals",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="購買申請ID"),
        sa.Column("user_id", sa.BigInteger(), nullable=False, comment="申請者ユーザーID"),
        sa.Column("title", sa.String(length=200), nullable=False, comment="件名"),
        sa.Column("purchase_type", sa.String(length=100), nullable=False, comment="購入種別"),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False, comment="金額"),
        sa.Column("reason", sa.Text(), nullable=False, comment="申請理由"),
        sa.Column("current_status_id", sa.BigInteger(), nullable=False, comment="現在ステータスID"),
        sa.Column("current_event_id", sa.BigInteger(), nullable=True, comment="現在イベントID"),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=True, comment="申請日時"),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True, comment="承認日時"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.CheckConstraint("amount >= 0", name="chk_approvals_amount_non_negative"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_approvals_user",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["current_status_id"],
            ["purchasing_approval_statuses.id"],
            name="fk_approvals_current_status",
            ondelete="RESTRICT",
        ),
        comment="購買申請",
    )
    op.create_index("idx_approvals_user_id", "purchasing_approvals", ["user_id"])
    op.create_index("idx_approvals_current_status_id", "purchasing_approvals", ["current_status_id"])
    op.create_index("idx_approvals_amount", "purchasing_approvals", ["amount"])

    # 7. draft_purchasing_approvals
    op.create_table(
        "draft_purchasing_approvals",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="購買申請下書きID"),
        sa.Column("user_id", sa.BigInteger(), nullable=False, comment="作成者ユーザーID"),
        sa.Column("title", sa.String(length=200), nullable=True, comment="件名"),
        sa.Column("purchase_type", sa.String(length=100), nullable=True, comment="購入種別"),
        sa.Column("amount", sa.Numeric(12, 2), nullable=True, comment="金額"),
        sa.Column("reason", sa.Text(), nullable=True, comment="申請理由"),
        sa.Column("current_status_id", sa.BigInteger(), nullable=False, comment="現在ステータスID"),
        sa.Column("current_event_id", sa.BigInteger(), nullable=True, comment="現在イベントID"),
        sa.Column(
            "last_touched_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="最終更新操作日時",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.CheckConstraint("amount >= 0", name="chk_drafts_amount_non_negative"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_drafts_user",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["current_status_id"],
            ["purchasing_approval_statuses.id"],
            name="fk_drafts_current_status",
            ondelete="RESTRICT",
        ),
        comment="購買申請下書き",
    )
    op.create_index("idx_drafts_user_id", "draft_purchasing_approvals", ["user_id"])
    op.create_index("idx_drafts_current_status_id", "draft_purchasing_approvals", ["current_status_id"])
    op.create_index("idx_drafts_last_touched_at", "draft_purchasing_approvals", ["last_touched_at"])

    # 8. purchasing_approval_events
    op.create_table(
        "purchasing_approval_events",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="申請イベントID"),
        sa.Column("subject_type", sa.String(length=30), nullable=False, comment="対象種別"),
        sa.Column("subject_id", sa.BigInteger(), nullable=False, comment="対象ID"),
        sa.Column("performed_by", sa.BigInteger(), nullable=False, comment="実行者ユーザーID"),
        sa.Column("status_id", sa.BigInteger(), nullable=False, comment="イベント時ステータスID"),
        sa.Column("action", sa.String(length=30), nullable=False, comment="操作種別"),
        sa.Column("comment", sa.Text(), nullable=True, comment="イベントコメント"),
        sa.Column(
            "event_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="イベント発生日時",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.CheckConstraint(
            "subject_type IN ('approval', 'draft')",
            name="chk_event_subject_type",
        ),
        sa.ForeignKeyConstraint(
            ["performed_by"],
            ["users.id"],
            name="fk_event_user",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["status_id"],
            ["purchasing_approval_statuses.id"],
            name="fk_event_status",
            ondelete="RESTRICT",
        ),
        comment="購買申請イベント履歴",
    )
    op.create_index(
        "idx_events_subject_type_subject_id_id",
        "purchasing_approval_events",
        ["subject_type", "subject_id", "id"],
    )
    op.create_index("idx_events_status_id", "purchasing_approval_events", ["status_id"])
    op.create_index("idx_events_action", "purchasing_approval_events", ["action"])
    op.create_index("idx_events_event_at", "purchasing_approval_events", ["event_at"])

    # 後付け FK
    op.create_foreign_key(
        "fk_approvals_current_event",
        "purchasing_approvals",
        "purchasing_approval_events",
        ["current_event_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_drafts_current_event",
        "draft_purchasing_approvals",
        "purchasing_approval_events",
        ["current_event_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # 9. purchasing_approval_comments
    op.create_table(
        "purchasing_approval_comments",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="申請コメントID"),
        sa.Column("event_id", sa.BigInteger(), nullable=False, comment="申請イベントID"),
        sa.Column("commented_by", sa.BigInteger(), nullable=False, comment="コメント投稿者ユーザーID"),
        sa.Column("comment_text", sa.Text(), nullable=False, comment="コメント内容"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="更新日時",
        ),
        sa.ForeignKeyConstraint(
            ["event_id"],
            ["purchasing_approval_events.id"],
            name="fk_comment_event",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["commented_by"],
            ["users.id"],
            name="fk_comment_user",
            ondelete="RESTRICT",
        ),
        comment="購買申請コメント",
    )
    op.create_index("idx_comments_event_id", "purchasing_approval_comments", ["event_id"])
    op.create_index("idx_comments_created_at", "purchasing_approval_comments", ["created_at"])

    # 10. purchasing_approval_ai_summaries
    op.create_table(
        "purchasing_approval_ai_summaries",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="AI要約ID"),
        sa.Column("event_id", sa.BigInteger(), nullable=False, comment="申請イベントID"),
        sa.Column("summary_text", sa.Text(), nullable=False, comment="要約本文"),
        sa.Column("summary_type", sa.String(length=50), nullable=False, comment="要約種別"),
        sa.Column(
            "generated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="要約生成日時",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
            comment="作成日時",
        ),
        sa.ForeignKeyConstraint(
            ["event_id"],
            ["purchasing_approval_events.id"],
            name="fk_summary_event",
            ondelete="CASCADE",
        ),
        comment="購買申請AI要約",
    )
    op.create_index("idx_summaries_event_id", "purchasing_approval_ai_summaries", ["event_id"])
    op.create_index("idx_summaries_type", "purchasing_approval_ai_summaries", ["summary_type"])


def downgrade() -> None:
    op.drop_index("idx_summaries_type", table_name="purchasing_approval_ai_summaries")
    op.drop_index("idx_summaries_event_id", table_name="purchasing_approval_ai_summaries")
    op.drop_table("purchasing_approval_ai_summaries")

    op.drop_index("idx_comments_created_at", table_name="purchasing_approval_comments")
    op.drop_index("idx_comments_event_id", table_name="purchasing_approval_comments")
    op.drop_table("purchasing_approval_comments")

    op.drop_constraint("fk_drafts_current_event", "draft_purchasing_approvals", type_="foreignkey")
    op.drop_constraint("fk_approvals_current_event", "purchasing_approvals", type_="foreignkey")

    op.drop_index("idx_events_event_at", table_name="purchasing_approval_events")
    op.drop_index("idx_events_action", table_name="purchasing_approval_events")
    op.drop_index("idx_events_status_id", table_name="purchasing_approval_events")
    op.drop_index("idx_events_subject_type_subject_id_id", table_name="purchasing_approval_events")
    op.drop_table("purchasing_approval_events")

    op.drop_index("idx_drafts_last_touched_at", table_name="draft_purchasing_approvals")
    op.drop_index("idx_drafts_current_status_id", table_name="draft_purchasing_approvals")
    op.drop_index("idx_drafts_user_id", table_name="draft_purchasing_approvals")
    op.drop_table("draft_purchasing_approvals")

    op.drop_index("idx_approvals_amount", table_name="purchasing_approvals")
    op.drop_index("idx_approvals_current_status_id", table_name="purchasing_approvals")
    op.drop_index("idx_approvals_user_id", table_name="purchasing_approvals")
    op.drop_table("purchasing_approvals")

    op.drop_table("purchasing_approval_statuses")

    op.drop_index("idx_user_roles_role_id", table_name="user_roles")
    op.drop_table("user_roles")

    op.drop_index("idx_users_position_id", table_name="users")
    op.drop_table("users")

    op.drop_table("roles")
    op.drop_table("user_positions")
