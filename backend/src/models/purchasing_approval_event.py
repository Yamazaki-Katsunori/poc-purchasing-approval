# backend/src/models/purchasing_approval_event.py
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.purchasing_approval_ai_summary import PurchasingApprovalAiSummary
    from src.models.purchasing_approval_comment import PurchasingApprovalComment
    from src.models.purchasing_approval_status import PurchasingApprovalStatus
    from src.models.user import User


class PurchasingApprovalEvent(Base):
    """purchasing_approval_eventテーブルのモデルクラス"""

    __tablename__ = "purchasing_approval_events"
    __table_args__ = (CheckConstraint("subject_type IN ('approval', 'draft')", name="chk_event_subject_type"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    subject_type: Mapped[str] = mapped_column(String(30), nullable=False)
    subject_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    performed_by: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    status_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("purchasing_approval_statuses.id", ondelete="RESTRICT"),
        nullable=False,
    )
    action: Mapped[str] = mapped_column(String(30), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
    )

    performer: Mapped[User] = relationship(lazy="joined")
    status: Mapped[PurchasingApprovalStatus] = relationship(lazy="joined")
    comments: Mapped[list[PurchasingApprovalComment]] = relationship(
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    ai_summaries: Mapped[list[PurchasingApprovalAiSummary]] = relationship(
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
