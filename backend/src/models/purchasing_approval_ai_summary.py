# backend/src/models/purchasing_approval_ai_summary.py
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.purchasing_approval_event import PurchasingApprovalEvent


class PurchasingApprovalAiSummary(Base):
    __tablename__ = "purchasing_approval_ai_summaries"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, comment="AI要約ID")
    event_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("purchasing_approval_events.id", ondelete="CASCADE"),
        nullable=False,
        comment="申請イベントID",
    )
    summary_text: Mapped[str] = mapped_column(Text, nullable=False, comment="要約本文")
    summary_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="要約種別")
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        comment="要約生成日時",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        comment="作成日時",
    )

    event: Mapped[PurchasingApprovalEvent] = relationship(
        back_populates="ai_summaries",
        lazy="joined",
    )
