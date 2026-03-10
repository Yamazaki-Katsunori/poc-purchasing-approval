# backend/src/models/purchasing_approval_comment.py
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, ForeignKey, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.purchasing_approval_event import PurchasingApprovalEvent
    from src.models.user import User


class PurchasingApprovalComment(Base):
    __tablename__ = "purchasing_approval_comments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, comment="申請コメントID")
    event_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("purchasing_approval_events.id", ondelete="CASCADE"),
        nullable=False,
        comment="申請イベントID",
    )
    commented_by: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="コメント投稿者ユーザーID",
    )
    comment_text: Mapped[str] = mapped_column(Text, nullable=False, comment="コメント内容")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        comment="作成日時",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        comment="更新日時",
    )

    event: Mapped[PurchasingApprovalEvent] = relationship(
        back_populates="comments",
        lazy="joined",
    )
    commenter: Mapped[User] = relationship(
        lazy="joined",
    )
